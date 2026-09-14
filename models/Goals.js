const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    targetAmount: {
      type: Number,
      required: true,
    },

    currentAmount: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "USD",
    },

    targetDate: {
      type: Date,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["Active", "Paused", "Completed"],
      default: "Active",
    },

    category: {
      type: String,
      enum: [
        "Retirement",
        "House",
        "Car",
        "Education",
        "Travel",
        "Emergency",
        "Investment",
        "Other",
      ],
      default: "Other",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", goalSchema);