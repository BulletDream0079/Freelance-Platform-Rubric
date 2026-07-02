import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function ClientDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/jobs/client/me').then(r => r.data).catch(() => []),
      api.get('/proposals/client/me').then(r => r.data).catch(() => []),
    ]).then(([j, p]) => {
      setJobs(j)
      setProposals(p)
      setLoading(false)
    })
  }, [])

  const stats = {
    posted: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    active: jobs.filter(j => j.status === 'in-progress').length,
    pending: proposals.filter(p => p.status === 'pending').length,
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dash-head">
          <div>
            <h1 className="dash-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="dash-sub">Manage your projects and review proposals</p>
          </div>
          <Link to="/client/post-job" className="btn btn-dark">+ Post a Job</Link>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><div className="stat-label">Total Posted</div><div className="stat-value">{stats.posted}</div></div>
          <div className="stat-card"><div className="stat-label">Open Jobs</div><div className="stat-value">{stats.open}</div></div>
          <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value stat-accent">{stats.active}</div></div>
          <div className="stat-card"><div className="stat-label">Pending Proposals</div><div className="stat-value">{stats.pending}</div></div>
        </div>

        <div className="dash-cols">
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Your Recent Jobs</h2>
              <Link to="/client/manage" className="link">Manage all →</Link>
            </div>
            {loading ? <p className="muted">Loading…</p> :
              jobs.length === 0 ? (
                <div className="empty-state-sm">
                  <p>You haven't posted any jobs yet.</p>
                  <Link to="/client/post-job" className="btn btn-dark">Post your first job</Link>
                </div>
              ) : (
                <div className="card-list">
                  {jobs.slice(0, 4).map(j => (
                    <div key={j.id} className="mini-row">
                      <div>
                        <Link to={`/jobs/${j.id}`} className="mini-row-title">{j.title}</Link>
                        <div className="muted small">${j.budget} · {j.category}</div>
                      </div>
                      <span className={`status-badge status-${j.status}`}>{j.status}</span>
                    </div>
                  ))}
                </div>
              )}
          </section>

          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Recent Proposals</h2>
            </div>
            {loading ? <p className="muted">Loading…</p> :
              proposals.length === 0 ? (
                <div className="empty-state-sm"><p className="muted">No proposals yet.</p></div>
              ) : (
                <div className="card-list">
                  {proposals.slice(0, 5).map(p => (
                    <div key={p.id} className="mini-row">
                      <div>
                        <div className="mini-row-title">{p.freelancer?.name || 'Freelancer'}</div>
                        <div className="muted small">for {p.job?.title} · ${p.bid}</div>
                      </div>
                      <span className={`status-badge status-${p.status}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
          </section>
        </div>
      </div>
    </div>
  )
}
