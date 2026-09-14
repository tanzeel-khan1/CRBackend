const User = require('../models/User');
const stripe = require('../config/stripe');
const sendSubscriptionExpiryReminder = require('../utils/sendSubscriptionExpiryReminder');

const REMINDER_DAYS_BEFORE = 2;
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

const getDayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const syncSubscriptionDates = async (user) => {
  const subscriptionId = user.subscription?.stripeSubscriptionId;
  if (!subscriptionId) return user;

  try {
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
    const periodStart = stripeSub.current_period_start
      ? new Date(stripeSub.current_period_start * 1000)
      : null;
    const periodEnd = stripeSub.current_period_end
      ? new Date(stripeSub.current_period_end * 1000)
      : null;

    if (periodStart) user.subscription.currentPeriodStart = periodStart;
    if (periodEnd) user.subscription.currentPeriodEnd = periodEnd;
    user.subscription.status = stripeSub.status === 'active' ? 'active' : stripeSub.status;

    await user.save();
  } catch (err) {
    console.error(`Subscription sync failed for ${user.email}:`, err.message);
  }

  return user;
};

const shouldSendReminder = (user) => {
  const periodEnd = user.subscription?.currentPeriodEnd;
  if (!periodEnd) return false;

  const sentFor = user.subscription?.expiryReminderSentFor;
  if (sentFor && new Date(sentFor).getTime() === new Date(periodEnd).getTime()) {
    return false;
  }

  return true;
};

const runSubscriptionReminderCheck = async () => {
  try {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + REMINDER_DAYS_BEFORE);
    const { start, end } = getDayBounds(reminderDate);

    const users = await User.find({
      'subscription.status': { $in: ['active', 'trialing'] },
      'subscription.stripeSubscriptionId': { $ne: null },
      'subscription.currentPeriodEnd': { $gte: start, $lte: end },
    }).select('full_name email subscription');

    for (const user of users) {
      if (!shouldSendReminder(user)) continue;

      await syncSubscriptionDates(user);

      const periodEnd = user.subscription?.currentPeriodEnd;
      if (!periodEnd) continue;

      const endTime = new Date(periodEnd).getTime();
      if (endTime < start.getTime() || endTime > end.getTime()) continue;

      try {
        await sendSubscriptionExpiryReminder({
          email: user.email,
          fullName: user.full_name,
          endDate: periodEnd,
          plan: user.subscription?.plan,
        });

        user.subscription.expiryReminderSentFor = periodEnd;
        await user.save();

        console.log(`Subscription reminder sent to ${user.email}`);
      } catch (err) {
        console.error(`Reminder email failed for ${user.email}:`, err.message);
      }
    }
  } catch (err) {
    console.error('Subscription reminder job error:', err.message);
  }
};

const startSubscriptionReminderJob = () => {
  runSubscriptionReminderCheck();
  setInterval(runSubscriptionReminderCheck, CHECK_INTERVAL_MS);
  console.log('Subscription reminder job started');
};

module.exports = { startSubscriptionReminderJob, runSubscriptionReminderCheck };
