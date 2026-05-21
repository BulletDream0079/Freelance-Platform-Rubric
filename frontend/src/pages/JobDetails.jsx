import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import ProposalModal from "../components/ProposalModal";

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/jobs/${id}`)
      .then((r) => setJob(r.data))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);
  useEffect(() => {
    if (user?.role === "freelancer") {
      api.get("/jobs/saved/me").then((r) => setSavedIds(r.data.map((j) => j.id))).catch(() => {});
      api.get("/proposals/mine").then((r) => {
        setHasApplied(r.data.some((p) => p.jobId === id));
      }).catch(() => {});
    }
  }, [user, id]);
  
  const isSaved = savedIds.includes(id);
  async function toggleSave() {
    if (isSaved) {
      await api.delete(`/jobs/${id}/save`);
      setSavedIds((s) => s.filter((x) => x !== id));
    } else {
      await api.post(`/jobs/${id}/save`);
      setSavedIds((s) => [...s, id]);
    }
  }

  function handleApplyClick() {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    if (user.role !== "freelancer") {
      setFlash("Only freelancers can apply to jobs.");
      return;
    }
    setShowModal(true);
  }

  if (loading) return <div className="container" style={{ padding: 60 }}>Loading...</div>;
  if (!job)
    return (
      <div className="container" style={{ padding: 60, textAlign: "center" }}>
        <h1>Job not found</h1>
        <Link to="/jobs" className="btn btn-primary mt-16">Back to jobs</Link>
      </div>
    );

  return (
    <div className="container detail-layout">
      <div>
        <div className="detail-main">
          <div className="flex-between mb-16">
            <span className={`status-badge status-${job.status}`}>{job.status}</span>
            {user?.role === "freelancer" && (
              <button className="btn btn-ghost btn-sm" onClick={toggleSave}>
                {isSaved ? "♥ Saved" : "♡ Save for later"}
              </button>
            )}
          </div>
          <h1>{job.title}</h1>
          <div className="detail-meta">
            <span>📂 <strong>{job.category}</strong></span>
            <span>📅 Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            <span>⏰ Due {new Date(job.deadline).toLocaleDateString()}</span>
          </div>

          {flash && <div className="alert alert-error">{flash}</div>}

          <div className="detail-section">
            <h3>About this job</h3>
            <p>{job.description}</p>
          </div>

          <div className="detail-section">
            <h3>What we're looking for</h3>
            <p>
              A reliable freelancer who can deliver high quality work within the budget and
              timeline specified. Please share relevant portfolio samples in your proposal.
            </p>
          </div>
        </div>
      </div>

      <aside className="detail-aside">
        <div className="detail-aside-row">
          <span className="detail-aside-label">Budget</span>
          <span className="detail-aside-value">${job.budget}</span>
        </div>
        <div className="detail-aside-row">
          <span className="detail-aside-label">Deadline</span>
          <span className="detail-aside-value">
            {new Date(job.deadline).toLocaleDateString()}
          </span>
        </div>
        <div className="detail-aside-row">
          <span className="detail-aside-label">Category</span>
          <span className="detail-aside-value">{job.category}</span>
        </div>
        <div className="detail-aside-row">
          <span className="detail-aside-label">Status</span>
          <span className="detail-aside-value">{job.status}</span>
        </div>

        <h3 style={{ fontSize: 14, marginTop: 18, marginBottom: 8 }}>Posted by</h3>
        {job.client && (
          <div className="client-card">
            <img src={job.client.avatar} alt={job.client.name} />
            <div>
              <div className="client-card-name">{job.client.name}</div>
              <div className="client-card-meta">
                Member since {new Date(job.client.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}

        <button
          className="btn btn-green btn-lg"
          style={{ width: "100%" }}
          onClick={handleApplyClick}
          disabled={hasApplied || job.status !== "open"}
        >
          {hasApplied
            ? "✓ Already applied"
            : job.status !== "open"
            ? "Not accepting proposals"
            : "Apply now"}
        </button>
        {!user && (
          <p className="text-small text-muted text-center mt-12">
            <Link to="/login" style={{ color: "var(--text)", fontWeight: 600 }}>Sign in</Link> to apply.
          </p>
        )}
      </aside>

      {showModal && (
        <ProposalModal
          job={job}
          onClose={() => setShowModal(false)}
          onSubmitted={() => {
            setHasApplied(true);
            setFlash("");
          }}
        />
      )}
    </div>
  );
}
