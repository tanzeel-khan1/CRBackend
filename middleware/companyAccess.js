const Company = require('../models/Company');
const Investor = require('../models/Investor');

/**
 * Returns true if userEmail owns or is an investor in companyId.
 * Always returns true when no companyId is provided (let the caller decide).
 */
async function canAccessCompany(userEmail, companyId) {
  if (!companyId) return true;
  const email = userEmail.toLowerCase().trim();

  const owned = await Company.findOne({ _id: companyId, created_by: email });
  if (owned) return true;

  // const investor = await Investor.findOne({
  //   company_id: companyId,
  //   user_email: email,
  //   invitation_status: { $in: ['accepted', null] },
  // });
  const investor = await Investor.findOne({
    company_id: companyId,
    user_email: email,
    invitation_status: { $in: ['accepted', null] },
  });
  console.log('canAccessCompany check:', { email, companyId, found: !!investor, investor });

  return !!investor;
}

module.exports = { canAccessCompany };
