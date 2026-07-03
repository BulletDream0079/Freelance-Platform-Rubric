const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    platformName: { type: String, default: "FreeLancer" },
    allowRegistrations: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

settingSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: "global" });
  if (!doc) doc = await this.create({ key: "global" });
  return doc;
};

settingSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Setting", settingSchema);
