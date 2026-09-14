const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "Investor Meeting",
        "Board Meeting",
        "Funding Deadline",
        "Demo Day",
        "Property Handover",
        "Rental Payout",
        "Dividend Distribution",
        "Financial Report",
        "Document Deadline",
        "Other",
      ],
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
    },

    endTime: {
      type: String,
    },

    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },

    meetingLink: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reminder: {
      enabled: {
        type: Boolean,
        default: false,
      },
      before: {
        type: String,
        enum: ["1 Hour", "6 Hours", "1 Day", "3 Days", "1 Week"],
      },
    },

    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);