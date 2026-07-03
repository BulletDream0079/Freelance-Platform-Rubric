const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "proposal_received",
        "proposal_accepted",
        "proposal_rejected",
        "job_funded",
        "payment_released",
        "message_received",
      ],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String, default: null }, // client-side route to open
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
