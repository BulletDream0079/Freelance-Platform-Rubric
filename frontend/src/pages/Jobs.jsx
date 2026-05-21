import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";

const CATEGORIES = [
  "Graphics & Design",
  "Programming & Tech",
  "Digital Marketing",
  "Writing & Translation",
  "Video & Animation",
  "Music & Audio",
  "Business",
  "Lifestyle",
];

export default function Jobs() {
  const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: params.get("q") || "",
    category: params.get("category") || "",
    status: params.get("status") || "",
    minBudget: params.get("minBudget") || "",
    maxBudget: params.get("maxBudget") || "",
  });
  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && q.set(k, v));
    api
      .get(`/jobs?${q.toString()}`)
      .then((r) => setJobs(r.data))
      .finally(() => setLoading(false));
    setParams(q, { replace: true });
  }, [filters]); // eslint-disable-line

  function update(k, v) {
    setFilters((f) => ({ ...f, [k]: v }));
  }

  return (
    <>
      <div className="page-head">
        <div className="container">
          <h1>Browse jobs</h1>
          <p className="page-sub">Find open jobs that match your skills.</p>
        </div>
      </div>
      <div className="container" style={{ padding: "24px 24px 70px" }}>
        <div className="filters">
          <input
            type="text"
            placeholder="Search job title or description"
            value={filters.q}
            onChange={(e) => update("q", e.target.value)}
          />
          <select value={filters.category} onChange={(e) => update("category", e.target.value)}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={filters.status} onChange={(e) => update("status", e.target.value)}>
            <option value="">Any status</option>
            <option value="open">Open</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="number"
            placeholder="Min $"
            value={filters.minBudget}
            onChange={(e) => update("minBudget", e.target.value)}
          />
          <input
            type="number"
            placeholder="Max $"
            value={filters.maxBudget}
            onChange={(e) => update("maxBudget", e.target.value)}
          />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setFilters({ q: "", category: "", status: "", minBudget: "", maxBudget: "" })
            }
          >
            Clear
          </button>
        </div>

        <div className="text-muted mb-16" style={{ fontSize: 14 }}>
          {loading ? "Loading..." : `${jobs.length} job${jobs.length === 1 ? "" : "s"} found`}
        </div>

        {!loading && jobs.length === 0 && (
          <div className="card empty-state">
            <div className="empty-state-icon">🔍</div>
            <h2>No jobs match your filters</h2>
            <p>Try clearing some filters or broadening your search.</p>
          </div>
        )}

        {jobs.map((j) => (
          <div key={j.id} className="job-row">
            <div className="job-row-top">
              <div>
                <h3>
                  <Link to={`/jobs/${j.id}`}>{j.title}</Link>
                </h3>
                <div className="job-row-meta">
                  <span>{j.category}</span>
                  <span>·</span>
                  <span>Budget <strong>${j.budget}</strong></span>
                  <span>·</span>
                  <span>Due {new Date(j.deadline).toLocaleDateString()}</span>
                  <span>·</span>
                  <span>Posted {new Date(j.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <span className={`status-badge status-${j.status}`}>{j.status}</span>
            </div>
            <p className="job-row-desc">{j.description}</p>
            <div className="job-row-foot">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img
                  src={j.client?.avatar}
                  alt=""
                  style={{ width: 28, height: 28, borderRadius: "50%" }}
                />
                <span style={{ fontSize: 14 }}>{j.client?.name}</span>
              </div>
              <Link to={`/jobs/${j.id}`} className="btn btn-outline btn-sm">
                View details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
