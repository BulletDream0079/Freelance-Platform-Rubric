import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

const CATEGORIES = [
  {
    cls: "cat-graphics",
    name: "Graphics & Design",
    count: 156432,
    services: ["Brand Style Guides", "Illustration", "Logo Design", "+1 more"],
    icon: <PaletteIcon />,
  },
  {
    cls: "cat-programming",
    name: "Programming & Tech",
    count: 98765,
    services: ["Website Development", "Mobile Apps", "WordPress", "+1 more"],
    icon: <CodeIcon />,
  },
  {
    cls: "cat-marketing",
    name: "Digital Marketing",
    count: 87321,
    services: ["Social Media Marketing", "SEO", "Content Marketing", "+1 more"],
    icon: <MegaphoneIcon />,
  },
  {
    cls: "cat-writing",
    name: "Writing & Translation",
    count: 76543,
    services: ["Content Writing", "Copywriting", "Technical Writing", "+1 more"],
    icon: <PenIcon />,
  },
  {
    cls: "cat-video",
    name: "Video & Animation",
    count: 45678,
    services: ["Video Editing", "Animation", "Explainer Videos", "+1 more"],
    icon: <VideoIcon />,
  },
  {
    cls: "cat-music",
    name: "Music & Audio",
    count: 34567,
    services: ["Voice Over", "Music Production", "Audio Editing", "+1 more"],
    icon: <MusicIcon />,
  },
  {
    cls: "cat-business",
    name: "Business",
    count: 23456,
    services: ["Business Plans", "Legal Consulting", "Financial Consulting", "+1 more"],
    icon: <BriefcaseIcon />,
  },
  {
    cls: "cat-lifestyle",
    name: "Lifestyle",
    count: 12345,
    services: ["Gaming", "Travel", "Health & Fitness", "+1 more"],
    icon: <GlobeIcon />,
  },
];

const FEATURED_IMAGES = [
  "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80",
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api
      .get("/jobs")
      .then((r) => setFeatured(r.data.slice(0, 4)))
      .catch(() => {});
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/jobs${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ""}`);
  }

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              Find the right
              <br />
              freelance service
              <br />
              right away
            </h1>
            <p className="hero-sub">
              Work with talented people at the most affordable price to get the most done for your business
            </p>
            <form className="hero-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Try 'building mobile app'"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit">
                <SearchIcon /> Search
              </button>
            </form>
            <div className="hero-tags">
              <span className="hero-tags-label">Popular:</span>
              {["Logo Design", "WordPress", "Voice Over", "Video Editing", "AI Services", "Social Media", "SEO", "Translation"].map(
                (t) => (
                  <Link key={t} to={`/jobs?q=${encodeURIComponent(t)}`} className="hero-tag">
                    {t}
                  </Link>
                )
              )}
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">2M+</div>
                <div className="hero-stat-label">Active sellers</div>
              </div>
              <div>
                <div className="hero-stat-value">5M+</div>
                <div className="hero-stat-label">Orders completed</div>
              </div>
              <div>
                <div className="hero-stat-value">600M+</div>
                <div className="hero-stat-label">Total services</div>
              </div>
            </div>
          </div>

          <div className="hero-media">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80"
              alt="UX designer working"
            />
            <span className="hero-decor-circle tl"></span>
            <span className="hero-decor-circle bl"></span>
            <div className="hero-media-play" aria-label="Play video">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="hero-media-overlay">
              <div className="hero-media-overlay-info">
                <div className="hero-media-overlay-avatar">A</div>
                <div>
                  <div className="hero-media-overlay-name">Andrea, UX Designer</div>
                  <div className="hero-media-overlay-rating">
                    <span className="star">★★★★★</span>
                    <span>5.0 (612)</span>
                  </div>
                </div>
              </div>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ EXPLORE BY CATEGORY ============ */}
      <section className="section section-gray">
        <div className="container">
          <h2 className="section-title">Explore by category</h2>
          <p className="section-sub">
            Find the service you need from our wide range of categories
          </p>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <Link
                to={`/jobs?category=${encodeURIComponent(c.name)}`}
                key={c.name}
                className="cat-card"
              >
                <span className="cat-count">{c.count.toLocaleString()}</span>
                <div className={`cat-icon ${c.cls}`}>{c.icon}</div>
                <h3>{c.name}</h3>
                <div className="cat-services">
                  {c.services.map((s, i) => (
                    <div key={i} className={i === c.services.length - 1 ? "cat-services-more" : ""}>
                      {s}
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>

          <div className="cant-find">
            <span className="cant-find-label">Can't find what you're looking for?</span>
            <span className="cant-find-tags">
              {["AI Services", "Blockchain", "Data Science", "3D Design", "AR/VR"].map((t) => (
                <Link to={`/jobs?q=${encodeURIComponent(t)}`} key={t} className="tag-pill">
                  {t}
                </Link>
              ))}
            </span>
          </div>
        </div>
      </section>

      {/* ============ FEATURED SERVICES ============ */}
      <section className="section">
        <div className="container">
          <div className="featured-header">
            <div>
              <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Featured services</h2>
              <div className="sub">Handpicked by our team</div>
            </div>
            <Link to="/jobs" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          <div className="job-grid">
            {featured.map((j, i) => (
              <Link to={`/jobs/${j.id}`} key={j.id} className="job-card">
                <div className="job-card-media">
                  <img
                    src={FEATURED_IMAGES[i % FEATURED_IMAGES.length]}
                    alt={j.title}
                  />
                  <span className="job-card-badge">FreeLancer's Choice</span>
                </div>
                <div className="job-card-body">
                  <div className="seller-info">
                    <img
                      src={j.client?.avatar || "https://i.pravatar.cc/120"}
                      alt={j.client?.name}
                    />
                    <div>
                      <div className="seller-info-name">{j.client?.name || "Client"}</div>
                      <div className="seller-info-level">Verified Buyer</div>
                    </div>
                  </div>
                  <p className="job-card-title">{j.title}</p>
                  <div className="job-card-rating">
                    <span className="star">★</span>
                    <span>4.9</span>
                    <span className="count">({Math.floor(100 + Math.random() * 900)})</span>
                  </div>
                  <div className="job-card-footer">
                    <span className="job-card-deliver">{j.category}</span>
                    <div style={{ textAlign: "right" }}>
                      <div className="job-card-price-label">Budget</div>
                      <div className="job-card-price">${j.budget}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="browse-all">
            <Link to="/jobs" className="btn btn-primary">
              Browse All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section section-gray">
        <div className="container">
          <h2 className="section-title">How it works</h2>
          <p className="section-sub">Get your project done in four simple steps</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon step-1">
                <SearchIcon white />
              </div>
              <h3>Find the perfect freelancer</h3>
              <p>Browse through thousands of talented professionals and find the right fit for your project needs.</p>
            </div>
            <div className="step-card">
              <div className="step-icon step-2">
                <ChatIcon />
              </div>
              <h3>Communicate directly</h3>
              <p>Chat with freelancers, discuss project details, and get quotes before making your decision.</p>
            </div>
            <div className="step-card">
              <div className="step-icon step-3">
                <LockIcon />
              </div>
              <h3>Pay securely</h3>
              <p>Your payment is held securely until the work is completed to your satisfaction.</p>
            </div>
            <div className="step-card">
              <div className="step-icon step-4">
                <StarIcon />
              </div>
              <h3>Rate and review</h3>
              <p>Leave feedback to help other buyers and build a stronger freelance community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">What our customers say</h2>
          <p className="section-sub">Don't just take our word for it</p>
          <div className="testimonial-grid">
            {[
              {
                stars: 5,
                q: "FreeLancer helped me find the perfect developer for my app. The quality exceeded my expectations!",
                name: "Jennifer Martinez",
                title: "Startup Founder",
                img: "https://i.pravatar.cc/80?img=44",
              },
              {
                stars: 5,
                q: "The graphic designer I found created an amazing brand identity. Highly recommend this platform!",
                name: "Robert Chen",
                title: "Marketing Director",
                img: "https://i.pravatar.cc/80?img=11",
              },
              {
                stars: 5,
                q: "Fast delivery, professional work, and great communication. Everything you need in one place.",
                name: "Lisa Thompson",
                title: "E-commerce Owner",
                img: "https://i.pravatar.cc/80?img=20",
              },
            ].map((t, i) => (
              <div key={i} className="testimonial">
                <div className="testimonial-stars">{"★".repeat(t.stars)}</div>
                <p className="testimonial-quote">"{t.q}"</p>
                <div className="testimonial-person">
                  <img src={t.img} alt={t.name} />
                  <div>
                    <div className="testimonial-person-name">{t.name}</div>
                    <div className="testimonial-person-title">{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta">
            <h2>Ready to get started?</h2>
            <p>Join millions of people who use FreeLancer to turn their ideas into reality</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-lg" style={{ background: "white", color: "var(--text)" }}>
                Start as a Buyer
              </Link>
              <Link to="/register" className="btn btn-lg btn-outline-white">
                Become a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------- inline icons ---------- */
function SearchIcon({ white }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke={white ? "white" : "currentColor"} strokeWidth="2" />
      <path d="M21 21l-4-4" stroke={white ? "white" : "currentColor"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="white">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function PaletteIcon() {
  return <svg viewBox="0 0 24 24" fill="white"><path d="M12 22A10 10 0 1 1 22 12c0 2-1 3-2 3h-3a2 2 0 0 0 0 4 2 2 0 0 1-2 3h-3z"/></svg>;
}
function CodeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
}
function MegaphoneIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-8v18l-18-8z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
}
function PenIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>;
}
function VideoIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>;
}
function MusicIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;
}
function BriefcaseIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
}
function GlobeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
}