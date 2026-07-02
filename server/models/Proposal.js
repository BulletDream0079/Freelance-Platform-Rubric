const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: { type: String, required: true },
    bid: { type: Number, required: true, min: 1 },
    deliveryDays: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });

proposalSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Proposal", proposalSchema);
