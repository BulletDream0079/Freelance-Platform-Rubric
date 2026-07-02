const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    budget: { type: Number, required: true, min: 1 },
    deadline: { type: String, required: true },
    skillsRequired: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "closed"],
      default: "open",
    },

    hiredFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    paymentStatus: {
      type: String,
      enum: ["unfunded", "funded", "released", "refunded"],
      default: "unfunded",
    },
    escrowAmountCents: { type: Number, default: 0 },
    platformFeeCents: { type: Number, default: 0 },
    freelancerPayoutCents: { type: Number, default: 0 },
    stripePaymentIntentId: { type: String, default: null },
  },
  { timestamps: true }
);

jobSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Job", jobSchema);
