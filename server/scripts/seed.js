require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../models/User");
const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const SavedJob = require("../models/SavedJob");
const Payment = require("../models/Payment");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const ActivityLog = require("../models/ActivityLog");
const Setting = require("../models/Setting");

async function run() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set in .env");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Clearing existing data…");

  await Promise.all([
    User.deleteMany({}),
    Job.deleteMany({}),
    Proposal.deleteMany({}),
    SavedJob.deleteMany({}),
    Payment.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    ActivityLog.deleteMany({}),
    Setting.deleteMany({}),
  ]);

  const admin = await User.create({
    name: "Site Admin", email: "admin@demo.io", password: "password123", role: "admin",
  });

  const [sarah, tom] = await User.create([
    { name: "Sarah Chen", email: "sarah@demo.io", password: "password123", role: "client",
      bio: "Startup founder hiring for a new product launch." },
    { name: "Tom Baker", email: "tom@demo.io", password: "password123", role: "client",
      bio: "Agency owner outsourcing overflow work." },
  ]);

  const [mike, emma, david] = await User.create([
    { name: "Mike Rodriguez", email: "mike@demo.io", password: "password123", role: "freelancer",
      title: "Full-Stack Developer", level: "Top Rated", rating: 4.9, reviewCount: 120,
      skills: ["React", "Node.js", "MongoDB"], experience: "6 years building web apps.",
      bio: "I build fast, clean web applications end to end." },
    { name: "Emma Johnson", email: "emma@demo.io", password: "password123", role: "freelancer",
      title: "Content Creator", level: "Level 2", rating: 4.8, reviewCount: 64,
      skills: ["Copywriting", "SEO", "Social Media"], bio: "Words that convert." },
    { name: "David Kim", email: "david@demo.io", password: "password123", role: "freelancer",
      title: "Brand Designer", level: "Level 2", rating: 4.7, reviewCount: 41,
      skills: ["Logo Design", "Figma", "Branding"], bio: "Clean, memorable brand identities." },
  ]);

  const jobs = await Job.create([
    { client: sarah._id, title: "Build a responsive SaaS landing page",
      description: "Need a modern, mobile-friendly landing page in React with hero, pricing, and testimonials sections.",
      category: "Programming & Tech", budget: 1200, deadline: "2026-09-15", skillsRequired: ["React", "CSS"] },
    { client: sarah._id, title: "Write 10 SEO blog posts on personal finance",
      description: "Looking for a strong writer to produce 10 well-researched, SEO-optimized blog posts of 1200+ words each.",
      category: "Writing & Translation", budget: 800, deadline: "2026-09-30", skillsRequired: ["SEO", "Copywriting"] },
    { client: tom._id, title: "Design a logo for a coffee brand",
      description: "Modern, minimal logo for a specialty coffee startup. Vector deliverables and a small brand guide.",
      category: "Graphics & Design", budget: 400, deadline: "2026-09-10", skillsRequired: ["Logo Design", "Figma"] },
    { client: tom._id, title: "Edit a 60-second product video for Instagram",
      description: "Punchy edit with captions and licensed music from provided raw footage.",
      category: "Video & Animation", budget: 250, deadline: "2026-09-05" },
  ]);

  await Proposal.create([
    { job: jobs[0]._id, freelancer: mike._id, coverLetter: "I've shipped a dozen SaaS landing pages in React — happy to share examples.", bid: 1100, deliveryDays: 7 },
    { job: jobs[1]._id, freelancer: emma._id, coverLetter: "Finance is one of my core niches; I can deliver 2-3 posts a week.", bid: 750, deliveryDays: 21 },
    { job: jobs[2]._id, freelancer: david._id, coverLetter: "Minimal coffee branding is right in my wheelhouse.", bid: 380, deliveryDays: 5 },
  ]);

  await SavedJob.create([{ user: mike._id, job: jobs[1]._id }]);
  await Setting.getSingleton();

  console.log("\n✓ Seed complete. Sample logins (all password: password123):");
  console.log("  admin@demo.io      (admin)");
  console.log("  sarah@demo.io      (client)");
  console.log("  mike@demo.io       (freelancer)");
  console.log("\n⚠ These are SAMPLE accounts for local testing. Change or remove before production.");

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
