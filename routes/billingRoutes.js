const express = require("express");

const {
  createCheckoutSession,
  verifyCheckoutSession,
  getUserSubscriptionById,
  getBillingOverview,
  createPortalSession,
  cancelSubscription,
} = require("../controllers/billingController");

const router = express.Router();

router.post("/checkout", createCheckoutSession);
router.post("/verify-session", verifyCheckoutSession);
router.get("/subscription/:userId", getUserSubscriptionById);
router.get("/overview", getBillingOverview);
router.post("/portal", createPortalSession);
router.post("/cancel", cancelSubscription);

router.get("/test", (req, res) => {
  res.json({ message: "Billing route working" });
});

module.exports = router;