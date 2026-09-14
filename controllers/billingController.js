const jwt = require("jsonwebtoken");
const stripe = require("../config/stripe");
const User = require("../models/User");

const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return decoded.id || decoded._id || decoded.userId;
};

const createCheckoutSession = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({
        message: "Token missing or invalid",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          userId: user._id.toString(),
        },
      });

      customerId = customer.id;
      user.stripeCustomerId = customerId;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
          quantity: 1,
        },

      ],

      success_url: `${process.env.CLIENT_URL || "https://main.dsoa1hgcxw1e5.amplifyapp.com"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || "https://main.dsoa1hgcxw1e5.amplifyapp.com"}/pricing`,
      metadata: {
        userId: user._id.toString(),
        plan: "enterprise",
        billingCycle: "monthly",
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          plan: "enterprise",
          billingCycle: "monthly",
        },
      },
    });

    user.subscription = {
      plan: "enterprise",
      status: "pending",
      billingCycle: "monthly",
      stripeSubscriptionId: null,
      stripePriceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
      stripeCheckoutSessionId: session.id,
      currentPeriodEnd: null,
    };

    await user.save();

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error("Create checkout error:", error);

    return res.status(500).json({
      message: "Checkout create nahi hua",
    });
  }
};

const verifyCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        message: "sessionId missing",
      });
    }

    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({
        message: "Token missing or invalid",
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "subscription"],
    });
    console.log("SESSION SUBSCRIPTION TYPE:", typeof session.subscription);
    console.log("SESSION SUBSCRIPTION:", JSON.stringify(session.subscription, null, 2));
    if (!session) {
      return res.status(404).json({
        message: "Stripe session not found",
      });
    }

    if (session.metadata?.userId !== userId.toString()) {
      return res.status(403).json({
        message: "This payment session does not belong to this user",
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        message: "Payment abhi complete nahi hui",
        paymentStatus: session.payment_status,
      });
    }

    let subscriptionId = null;
    let stripePriceId = process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID;
    let currentPeriodStart = null;
    let currentPeriodEnd = null;
    let amountTotal = 0;
    let currency = "USD";

    let subscription = session.subscription;

    // Agar sirf ID mili hai object nahi, toh manually retrieve karo
    if (subscription && typeof subscription === "string") {
      subscription = await stripe.subscriptions.retrieve(subscription);
    }
    
    if (subscription && typeof subscription === "object") {
      subscriptionId = subscription.id;
    
      const subscriptionItem = subscription.items?.data?.[0];
      const price = subscriptionItem?.price;
    
      if (price?.id) stripePriceId = price.id;
      if (price?.unit_amount) amountTotal = price.unit_amount / 100;
      if (price?.currency) currency = price.currency.toUpperCase();
    
      // Pehle subscription item se try karo (naya Stripe format)
const subItem = subscription.items?.data?.[0];

if (subItem?.current_period_start) {
  currentPeriodStart = new Date(subItem.current_period_start * 1000);
} else if (subscription.current_period_start) {
  currentPeriodStart = new Date(subscription.current_period_start * 1000);
}

if (subItem?.current_period_end) {
  currentPeriodEnd = new Date(subItem.current_period_end * 1000);
} else if (subscription.current_period_end) {
  currentPeriodEnd = new Date(subscription.current_period_end * 1000);
}
    }

    const lineItem = session.line_items?.data?.[0];

    if (session.amount_total !== null && session.amount_total !== undefined) {
      amountTotal = session.amount_total / 100;
    } else if (
      lineItem?.amount_total !== null &&
      lineItem?.amount_total !== undefined
    ) {
      amountTotal = lineItem.amount_total / 100;
    }

    if (session.currency) {
      currency = session.currency.toUpperCase();
    } else if (lineItem?.currency) {
      currency = lineItem.currency.toUpperCase();
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        stripeCustomerId: session.customer,
        subscription: {
          plan: session.metadata?.plan || "enterprise",
          status: "active",
          billingCycle: session.metadata?.billingCycle || "monthly",
          stripeSubscriptionId: subscriptionId,
          stripePriceId,
          stripeCheckoutSessionId: session.id,
          currentPeriodStart,
          currentPeriodEnd,
          expiryReminderSentFor: null,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Subscription active ho gayi",
      subscription: user.subscription,
      orderSummary: {
        plan: session.metadata?.plan || "enterprise",
        status: "active",
        billingCycle: session.metadata?.billingCycle || "monthly",
        amount: amountTotal,
        currency,
        customerEmail: session.customer_details?.email || user.email,
        checkoutSessionId: session.id,
        stripeSubscriptionId: subscriptionId,
        stripePriceId,
        currentPeriodStart,   // ❌ MISSING
        currentPeriodEnd,   
      },
    });
  } catch (error) {
    console.error("Verify checkout error:", error);

    return res.status(500).json({
      message: "Subscription verify nahi hui",
      error: error.message,
    });
  }
};

const getUserSubscriptionById = async (req, res) => {
  try {
    const loggedInUserId = getUserIdFromToken(req);
    const { userId } = req.params;

    if (!loggedInUserId) {
      return res.status(401).json({
        message: "Token missing or invalid",
      });
    }

    if (!userId) {
      return res.status(400).json({
        message: "userId missing",
      });
    }

    const loggedInUser = await User.findById(loggedInUserId).select("role");

    if (!loggedInUser) {
      return res.status(404).json({
        message: "Logged in user not found",
      });
    }

    // Admin can view any user.
    // Normal user can only view his own subscription.
    if (
      loggedInUser.role !== "admin" &&
      loggedInUserId.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this user's subscription",
      });
    }

    const user = await User.findById(userId).select(
      "full_name email role stripeCustomerId subscription createdAt updatedAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let stripeSubscriptionData = null;
    let stripePriceData = null;
    let amount = null;
    let currency = null;

    const subscriptionId = user.subscription?.stripeSubscriptionId;

    if (subscriptionId) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscriptionId
      );

      const price = stripeSubscription.items?.data?.[0]?.price;

      stripeSubscriptionData = {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        customer: stripeSubscription.customer,
        currentPeriodStart: stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : null,
        currentPeriodEnd: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000)
          : null,
        created: stripeSubscription.created
          ? new Date(stripeSubscription.created * 1000)
          : null,
      };

      if (price) {
        amount = price.unit_amount ? price.unit_amount / 100 : null;
        currency = price.currency ? price.currency.toUpperCase() : null;

        stripePriceData = {
          id: price.id,
          product: price.product,
          amount,
          currency,
          interval: price.recurring?.interval || null,
          intervalCount: price.recurring?.interval_count || null,
        };
      }
    }

    return res.status(200).json({
      message: "User subscription fetched successfully",
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      subscription: {
        plan: user.subscription?.plan || "free",
        status: user.subscription?.status || "inactive",
        billingCycle: user.subscription?.billingCycle || null,
        stripeCustomerId: user.stripeCustomerId || null,
        stripeSubscriptionId: user.subscription?.stripeSubscriptionId || null,
        stripePriceId: user.subscription?.stripePriceId || null,
        stripeCheckoutSessionId:
          user.subscription?.stripeCheckoutSessionId || null,
        currentPeriodStart:
          stripeSubscriptionData?.currentPeriodStart ||
          user.subscription?.currentPeriodStart ||
          null,
        currentPeriodEnd:
          stripeSubscriptionData?.currentPeriodEnd ||
          user.subscription?.currentPeriodEnd ||
          null,
        amount,
        currency,
      },
      stripe: {
        subscription: stripeSubscriptionData,
        price: stripePriceData,
      },
    });
  } catch (error) {
    console.error("Get user subscription error:", error);

    return res.status(500).json({
      message: "User subscription fetch nahi hui",
      error: error.message,
    });
  }
};

const getBillingOverview = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ message: "Token missing or invalid" });
    }

    const user = await User.findById(userId).select(
      "full_name email stripeCustomerId subscription"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let stripeSubscriptionData = null;
    let amount = null;
    let currency = null;
    let billingCycle = user.subscription?.billingCycle || null;
    let paymentMethod = null;
    let invoices = [];

    const subscriptionId = user.subscription?.stripeSubscriptionId;

    if (subscriptionId) {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscriptionId
      );

      const price = stripeSubscription.items?.data?.[0]?.price;

      stripeSubscriptionData = {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodStart: stripeSubscription.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : null,
        currentPeriodEnd: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.canceled_at
          ? new Date(stripeSubscription.canceled_at * 1000)
          : null,
      };

      if (price) {
        amount = price.unit_amount ? price.unit_amount / 100 : null;
        currency = price.currency ? price.currency.toUpperCase() : null;
        billingCycle = price.recurring?.interval || billingCycle;
      }

      const periodStart = stripeSubscription.current_period_start
        ? new Date(stripeSubscription.current_period_start * 1000)
        : null;
      const periodEnd = stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null;

      if (periodStart || periodEnd) {
        if (periodStart) user.subscription.currentPeriodStart = periodStart;
        if (periodEnd) user.subscription.currentPeriodEnd = periodEnd;
        await user.save();
      }
    }

    if (user.stripeCustomerId) {
      const customer = await stripe.customers.retrieve(user.stripeCustomerId, {
        expand: ["invoice_settings.default_payment_method"],
      });

      const pm = customer.invoice_settings?.default_payment_method;

      if (pm && typeof pm === "object" && pm.card) {
        paymentMethod = {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year,
        };
      }

      const invoiceList = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 12,
      });

      invoices = invoiceList.data.map((inv) => ({
        id: inv.id,
        date: inv.created ? new Date(inv.created * 1000) : null,
        total: inv.amount_paid ? inv.amount_paid / 100 : 0,
        currency: inv.currency ? inv.currency.toUpperCase() : "USD",
        status: inv.status,
        pdfUrl: inv.hosted_invoice_url || inv.invoice_pdf || null,
      }));
    }

    return res.status(200).json({
      plan: {
        name: user.subscription?.plan || "free",
        status: user.subscription?.status || "inactive",
        billingCycle,
        amount,
        currency,
        startsOn:
          stripeSubscriptionData?.currentPeriodStart ||
          user.subscription?.currentPeriodStart ||
          null,
        endsOn:
          stripeSubscriptionData?.currentPeriodEnd ||
          user.subscription?.currentPeriodEnd ||
          null,
        renewsOn:
          stripeSubscriptionData?.currentPeriodEnd ||
          user.subscription?.currentPeriodEnd ||
          null,
        cancelAtPeriodEnd: stripeSubscriptionData?.cancelAtPeriodEnd || false,
      },
      paymentMethod,
      invoices,
      stripeSubscription: stripeSubscriptionData,
    });
  } catch (error) {
    console.error("Get billing overview error:", error);
    return res.status(500).json({
      message: "Billing overview fetch nahi hui",
      error: error.message,
    });
  }
};

const createPortalSession = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ message: "Token missing or invalid" });
    }

    const user = await User.findById(userId);

    if (!user?.stripeCustomerId) {
      return res.status(400).json({ message: "No billing account found" });
    }

    const returnUrl = `${
      process.env.CLIENT_URL || "https://main.dsoa1hgcxw1e5.amplifyapp.com"
    }/dashboard/billing`;

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Create portal session error:", error);
    return res.status(500).json({
      message: "Billing portal session create nahi hui",
      error: error.message,
    });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);

    if (!userId) {
      return res.status(401).json({ message: "Token missing or invalid" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const subscriptionId = user.subscription?.stripeSubscriptionId;

    if (!subscriptionId) {
      return res.status(400).json({ message: "No active subscription found" });
    }

    const updated = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    user.subscription.status =
      updated.status === "active" ? "active" : updated.status;
    user.subscription.currentPeriodEnd = updated.current_period_end
      ? new Date(updated.current_period_end * 1000)
      : user.subscription.currentPeriodEnd;

    await user.save();

    return res.status(200).json({
      message: "Subscription will cancel at the end of the billing period",
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return res.status(500).json({
      message: "Subscription cancel nahi hui",
      error: error.message,
    });
  }
};

module.exports = {
  createCheckoutSession,
  verifyCheckoutSession,
  getUserSubscriptionById,
  getBillingOverview,
  createPortalSession,
  cancelSubscription,
};