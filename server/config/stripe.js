const PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT || 10);

let stripe = null;
let mode = "mock";

if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
    mode = "live";
  } catch (e) {
    console.warn("⚠ stripe package not usable, falling back to mock payments:", e.message);
  }
} else {
  console.warn(
    "⚠ STRIPE_SECRET_KEY not set — running payments in MOCK mode. Add a test key to .env for real Stripe test flows."
  );
}

function splitAmount(amountCents) {
  const platformFeeCents = Math.round((amountCents * PLATFORM_FEE_PERCENT) / 100);
  const freelancerPayoutCents = amountCents - platformFeeCents;
  return { platformFeeCents, freelancerPayoutCents, feePercent: PLATFORM_FEE_PERCENT };
}

module.exports = { stripe, mode, PLATFORM_FEE_PERCENT, splitAmount };
