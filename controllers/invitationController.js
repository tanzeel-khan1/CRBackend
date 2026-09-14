const Investor = require('../models/Investor');
const Contract = require('../models/Contract');

// Get pending invitations for the currently logged-in user
const getMyInvitations = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const invitations = await Investor.find({
      user_email: userEmail,
      invitation_status: 'pending',
    }).populate('contract_id').populate('company_id', 'name industry');
    res.json(invitations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const acceptInvitation = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();

    const investor = await Investor.findById(req.params.id);

    if (!investor) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (investor.user_email !== userEmail) {
      return res.status(403).json({ message: 'Not your invitation' });
    }

    if (investor.invitation_status !== 'pending') {
      return res.status(400).json({ message: 'Invitation is not pending' });
    }

    // contract check
    if (investor.contract_id && !req.body.contract_agreed) {
      return res.status(400).json({
        message: 'You must agree to the contract before accepting',
      });
    }

    const updated = await Investor.findByIdAndUpdate(
      req.params.id,
      {
        invitation_status: 'accepted',
        status: 'active',
        contract_agreed: !!req.body.contract_agreed,

        // 🔥 IMPORTANT: unlock financial fields ONLY after accept
        total_invested: investor.total_invested || 0,
        total_withdrawn: investor.total_withdrawn || 0,
        equity_percentage: investor.equity_percentage || 0,
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Reject an invitation
const rejectInvitation = async (req, res) => {
  try {
    const userEmail = req.user.email.toLowerCase().trim();
    const investor = await Investor.findById(req.params.id);
    if (!investor) return res.status(404).json({ message: 'Invitation not found' });
    if (investor.user_email !== userEmail)
      return res.status(403).json({ message: 'Not your invitation' });
    if (investor.invitation_status !== 'pending')
      return res.status(400).json({ message: 'Invitation is not pending' });
    const updated = await Investor.findByIdAndUpdate(
      req.params.id,
      { invitation_status: 'rejected' },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyInvitations, acceptInvitation, rejectInvitation };
