const express = require("express");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");

const {
  createCheckoutSession,
  verifyCheckoutSession,
  getUserSubscriptionById,
  getBillingOverview,
  createPortalSession,
  cancelSubscription,
} = require("../controllers/billingController");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Billing route working" });
});

router.use(protect);
router.post("/checkout", asyncHandler(createCheckoutSession));
router.post("/verify-session", asyncHandler(verifyCheckoutSession));
router.get("/subscription/:userId", asyncHandler(getUserSubscriptionById));
router.get("/overview", asyncHandler(getBillingOverview));
router.post("/portal", asyncHandler(createPortalSession));
router.post("/cancel", asyncHandler(cancelSubscription));

module.exports = router;