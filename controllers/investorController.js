const Investor = require('../models/Investor');
const { canAccessCompany } = require('../middleware/companyAccess');
const sendEmail = require('../utils/investorEmail');
const Company = require('../models/Company'); // ADD

const getInvestors = async (req, res) => {
  try {
    const { company_id } = req.query;

    if (company_id && !await canAccessCompany(req.user.email, company_id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filter = {};

    if (company_id) filter.company_id = company_id;
    if (req.query.user_email) filter.user_email = req.query.user_email.toLowerCase().trim();
    if (req.query.role) filter.role = req.query.role;

    const investors = await Investor.find(filter).sort({ createdAt: -1 });

    res.json(investors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInvestor = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.user_email) {
      data.user_email = data.user_email.toLowerCase().trim();
    }

    if (
      data.company_id &&
      !(await canAccessCompany(req.user.email, data.company_id))
    ) {
      return res.status(403).json({
        message: 'Access denied',
      });
    }

    if (data.agreements && data.agreements.length > 4) {
      return res.status(400).json({
        message: 'Maximum 4 agreements are allowed',
      });
    }

    // Create Investor
    const investor = await Investor.create({
      ...data,
      status: 'pending',
      invitation_status: 'pending',
      created_by: req.user.email,
    })
    console.log('CREATED INVESTOR:', investor);;

    // Get company details
    const company = await Company.findById(data.company_id);

    // Send invitation email
    if (investor.user_email && company) {
      const encodedEmail = encodeURIComponent(investor.user_email);
      const inviteLink =
        `${process.env.FRONTEND_URL}/login?mode=register&email=${encodedEmail}`;

      await sendEmail({
        to: investor.user_email,
        subject: `Investment Invitation - ${company.name}`,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Investor Invitation</h2>

            <p>Hello ${investor.name},</p>

            <p>
              You have been invited as an investor for
              <strong>${company.name}</strong>.
            </p>

            <p>
              Please create your account and accept the invitation.
            </p>

            <p>
              <a
                href="${inviteLink}"
                style="
                  background:#2563eb;
                  color:white;
                  padding:12px 20px;
                  text-decoration:none;
                  border-radius:6px;
                  display:inline-block;
                "
              >
                Sign Up & Accept Invitation
              </a>
            </p>

            <p>
              If the button does not work, copy and paste:
            </p>

            <p>${inviteLink}</p>
          </div>
        `,
      });
    }

    res.status(201).json(investor);
  } catch (error) {
    console.error('Create Investor Error:', error);

    res.status(400).json({
      message: error.message,
    });
  }
};

const updateInvestor = async (req, res) => {
  try {
    const investor = await Investor.findById(req.params.id);

    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }

    if (!await canAccessCompany(req.user.email, investor.company_id?.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const data = { ...req.body };

    if (data.user_email) {
      data.user_email = data.user_email.toLowerCase().trim();
    }

    if (data.agreements && data.agreements.length > 4) {
      return res.status(400).json({
        message: 'Maximum 4 agreements are allowed'
      });
    }

    // Optional safety: company_id update allow na karo
    delete data.company_id;
    delete data.created_by;

    const updated = await Investor.findByIdAndUpdate(
      req.params.id,
      data,
      {
        new: true,
        runValidators: true
      }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteInvestor = async (req, res) => {
  try {
    const investor = await Investor.findById(req.params.id);

    if (!investor) {
      return res.status(404).json({ message: 'Investor not found' });
    }

    if (!await canAccessCompany(req.user.email, investor.company_id?.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Investor.findByIdAndDelete(req.params.id);

    res.json({ message: 'Investor deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInvestors,
  createInvestor,
  updateInvestor,
  deleteInvestor,
};