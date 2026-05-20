import { Link } from "react-router-dom";

const COLS = [
  {
    title: "Categories",
    links: [
      "Graphics & Design",
      "Digital Marketing",
      "Writing & Translation",
      "Video & Animation",
      "Music & Audio",
      "Programming & Tech",
      "Business",
      "Lifestyle",
    ],
  },
  {
    title: "About",
    links: ["Careers", "Press & News", "Partnerships", "Privacy Policy", "Terms of Service", "Intellectual Property", "Investor Relations"],
  },
  {
    title: "Support",
    links: ["Help & Support", "Trust & Safety", "Selling on FreeLancer", "Buying on FreeLancer", "FreeLancer Guides", "FreeLancer Workspace"],
  },
  {
    title: "Community",
    links: ["Customer Success Stories", "Community Hub", "Forum", "Events", "Blog", "Influencers", "Affiliates", "Podcast"],
  },
  {
    title: "More",
    links: ["FreeLancer Enterprise", "FreeLancer Business", "FreeLancer Pro", "FreeLancer Logo Maker", "FreeLancer Guides", "Get Inspired", "FreeLancer Select", "ClearVoice", "Learn"],
  },
];

export default function Footer() {
  return (
    <>
      <section className="newsletter">
        <div className="container">
          <h2>Stay updated</h2>
          <p>Subscribe to our newsletter for the latest updates and offers</p>
          <form
            className="newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Subscribed (demo).");
            }}
          >
            <input type="email" placeholder="Enter your email" required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>
                <span className="logo-mark">F</span>FreeLancer
              </h3>
              <p>
                The world's largest marketplace for creative and professional services.
              </p>
              <div className="footer-socials">
                <a className="footer-social-icon" href="#" aria-label="Twitter">𝕏</a>
                <a className="footer-social-icon" href="#" aria-label="Facebook">f</a>
                <a className="footer-social-icon" href="#" aria-label="Instagram">◎</a>
                <a className="footer-social-icon" href="#" aria-label="LinkedIn">in</a>
              </div>
            </div>
            {COLS.map((col) => (
              <div key={col.title} className="footer-col">
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((l) => (
                    <li key={l}>
                      <Link to="/">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <div>© {new Date().getFullYear()} FreeLancer International Ltd.</div>
            <div className="footer-bottom-links">
              <Link to="/">Privacy Policy</Link>
              <Link to="/">Terms of Service</Link>
              <Link to="/">Cookies Settings</Link>
            </div>
            <div>🌐 English · USD</div>
          </div>
        </div>
      </footer>
    </>
  );
}
