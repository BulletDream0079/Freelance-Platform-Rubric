const bcrypt = require("bcryptjs");
const hash = (pwd) => bcrypt.hashSync(pwd, 8);

const store = {
  users: [
    {
      id: "u1",
      name: "Admin User",
      email: "admin@demo.com",
      password: hash("admin123"),
      role: "admin",
      avatar: "https://i.pravatar.cc/120?img=15",
      createdAt: new Date("2025-01-01").toISOString(),
      banned: false,
    },
    {
      id: "u2",
      name: "Jane Doe",
      email: "client@demo.com",
      password: hash("client123"),
      role: "client",
      avatar: "https://i.pravatar.cc/120?img=47",
      bio: "Startup founder looking for great talent.",
      createdAt: new Date("2025-02-10").toISOString(),
      banned: false,
    },
    {
      id: "u3",
      name: "John Doe",
      email: "free@demo.com",
      password: hash("free123"),
      role: "freelancer",
      avatar: "https://i.pravatar.cc/120?img=12",
      title: "Full-stack Web Developer",
      bio: "5+ years building responsive WordPress and React websites for SMBs.",
      skills: ["React", "WordPress", "Node.js", "MongoDB", "Tailwind"],
      portfolio: [
        { title: "E-commerce Site", url: "https://example.com/p1" },
        { title: "SaaS Dashboard", url: "https://example.com/p2" },
      ],
      experience: "Senior developer at WebForge (2021–2024). Freelance since 2024.",
      rating: 4.9,
      reviewCount: 892,
      level: "Top Rated",
      createdAt: new Date("2025-03-15").toISOString(),
      banned: false,
    },
    {
      id: "u4",
      name: "Emma Johnson",
      email: "emma@demo.com",
      password: hash("free123"),
      role: "freelancer",
      avatar: "https://i.pravatar.cc/120?img=45",
      title: "Social Media Content Creator",
      bio: "I craft scroll-stopping content for brands that want to grow.",
      skills: ["Content Strategy", "Instagram", "TikTok", "Copywriting"],
      portfolio: [{ title: "Brand Campaign", url: "https://example.com/p3" }],
      experience: "3 years in social media marketing for DTC brands.",
      rating: 4.8,
      reviewCount: 567,
      level: "Level 2",
      createdAt: new Date("2025-04-02").toISOString(),
      banned: false,
    },
    {
      id: "u5",
      name: "David Kim",
      email: "david@demo.com",
      password: hash("free123"),
      role: "freelancer",
      avatar: "https://i.pravatar.cc/120?img=33",
      title: "Business Strategy Consultant",
      bio: "Helping founders sharpen their strategy and unlock growth.",
      skills: ["Strategy", "Growth", "Financial Modeling", "Pitch Decks"],
      portfolio: [],
      experience: "Ex-McKinsey, now independent consultant.",
      rating: 4.9,
      reviewCount: 324,
      level: "Top Rated",
      createdAt: new Date("2025-04-20").toISOString(),
      banned: false,
    },
  ],

  jobs: [
    {
      id: "j1",
      clientId: "u2",
      title: "Build a responsive landing page for a SaaS product",
      description:
        "We are launching a new productivity SaaS and need a beautifully designed, fast, mobile-friendly landing page. Must include hero, features, pricing, testimonials, and a footer with a newsletter signup. Designs will be provided in Figma. Looking for someone who can deliver clean, semantic React code.",
      category: "Programming & Tech",
      budget: 1200,
      deadline: "2026-06-15",
      status: "open",
      createdAt: new Date("2026-05-10").toISOString(),
    },
    {
      id: "j2",
      clientId: "u2",
      title: "Design a modern logo for a coffee startup",
      description:
        "We're a specialty coffee brand launching in Q3 and need a memorable, modern logo. Looking for someone with strong typography skills and a portfolio of food & beverage brands.",
      category: "Graphics & Design",
      budget: 400,
      deadline: "2026-06-01",
      status: "open",
      createdAt: new Date("2026-05-12").toISOString(),
    },
    {
      id: "j3",
      clientId: "u2",
      title: "Write 10 blog posts about personal finance",
      description:
        "Need a writer with a clean, friendly voice to produce 10 SEO-optimized blog posts (1,200–1,500 words each) on personal finance topics. Topics will be provided. Must include sources.",
      category: "Writing & Translation",
      budget: 800,
      deadline: "2026-06-30",
      status: "open",
      createdAt: new Date("2026-05-14").toISOString(),
    },
    {
      id: "j4",
      clientId: "u2",
      title: "Edit a 60-second product video for Instagram",
      description:
        "We have raw footage of our new product and need a punchy, modern 60-second cut for Instagram Reels with captions and royalty-free music.",
      category: "Video & Animation",
      budget: 250,
      deadline: "2026-05-28",
      status: "open",
      createdAt: new Date("2026-05-15").toISOString(),
    },
    {
      id: "j5",
      clientId: "u2",
      title: "Manage Instagram & TikTok for a wellness brand",
      description:
        "Looking for a social media manager to run our IG and TikTok for 3 months. 4 posts/week + 2 reels/week. Bring your own strategy.",
      category: "Digital Marketing",
      budget: 2400,
      deadline: "2026-08-15",
      status: "open",
      createdAt: new Date("2026-05-16").toISOString(),
    },
    {
      id: "j6",
      clientId: "u2",
      title: "Voiceover for explainer video (90 seconds)",
      description:
        "Need a warm, conversational male or female voiceover for a 90-second product explainer. Script provided.",
      category: "Music & Audio",
      budget: 150,
      deadline: "2026-05-25",
      status: "in-progress",
      createdAt: new Date("2026-05-08").toISOString(),
    },
  ],

  proposals: [
    {
      id: "p1",
      jobId: "j1",
      freelancerId: "u3",
      coverLetter:
        "Hi! I've built 12+ SaaS landing pages in the last year, most recently for a YC-backed startup. I can deliver clean React + Tailwind code in 7 days. Happy to share live examples on a call.",
      bid: 1100,
      deliveryDays: 7,
      status: "pending",
      createdAt: new Date("2026-05-11").toISOString(),
    },
    {
      id: "p2",
      jobId: "j3",
      freelancerId: "u4",
      coverLetter:
        "I'd love to write your finance posts. My recent client (a fintech app) saw a 3x increase in organic traffic from posts I wrote. I can deliver 2–3 posts per week.",
      bid: 750,
      deliveryDays: 21,
      status: "pending",
      createdAt: new Date("2026-05-15").toISOString(),
    },
    {
      id: "p3",
      jobId: "j6",
      freelancerId: "u5",
      coverLetter:
        "Available immediately. Industry-standard mic, sound-treated room, fast turnaround (24h).",
      bid: 140,
      deliveryDays: 2,
      status: "accepted",
      createdAt: new Date("2026-05-09").toISOString(),
    },
  ],

  savedJobs: [
    { userId: "u3", jobId: "j2" },
    { userId: "u3", jobId: "j5" },
  ],
};

// ID helpers
let userCounter = store.users.length + 1;
let jobCounter = store.jobs.length + 1;
let proposalCounter = store.proposals.length + 1;

const nextUserId = () => `u${userCounter++}`;
const nextJobId = () => `j${jobCounter++}`;
const nextProposalId = () => `p${proposalCounter++}`;

module.exports = { store, nextUserId, nextJobId, nextProposalId };