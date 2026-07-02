const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Project" },
    image: { type: String, default: "" }, // base64 or URL
    url: { type: String, default: "" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["client", "freelancer", "admin"], required: true },

    // avatar as a base64 data URL (data:image/...;base64,....).
    avatar: { type: String, default: null },

    title: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: { type: [String], default: [] },
    portfolio: { type: [portfolioItemSchema], default: [] },
    experience: { type: String, default: "" },

    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    level: { type: String, default: null },

    banned: { type: Boolean, default: false },

    // stripe account for freelancers
    stripeAccountId: { type: String, default: null },
    // available balance released from completed jobs
    earningsCents: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// hash password on save when modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// strip sensitive/internal fields
userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj._id;
  delete obj.__v;
  return obj;
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
