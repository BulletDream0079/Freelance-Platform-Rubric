const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    amountCents: { type: Number, required: true },
    platformFeeCents: { type: Number, required: true },
    freelancerPayoutCents: { type: Number, required: true },

    feePercent: { type: Number, required: true },

    type: {
      type: String,
      enum: ["escrow_funded", "released", "refunded"],
      required: true,
    },
    stripePaymentIntentId: { type: String, default: null },
  },
  { timestamps: true }
);

paymentSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
