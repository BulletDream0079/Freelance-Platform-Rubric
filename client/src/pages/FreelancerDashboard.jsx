import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import MessageThread from '../components/MessageThread'

export default function FreelancerDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('applied')
  const [openThread, setOpenThread] = useState(null)
  const [proposals, setProposals] = useState([])
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/proposals/mine').then(r => r.data).catch(() => []),
      api.get('/jobs/saved/me').then(r => r.data).catch(() => []),
    ]).then(([p, s]) => {
      setProposals(p)
      setSaved(s)
      setLoading(false)
    })
  }, [])

  const stats = {
    applied: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    saved: saved.length,
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dash-head">
          <div>
            <h1 className="dash-title">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="dash-sub">Track your proposals and discover new opportunities</p>
          </div>
          <Link to="/freelancer/profile" className="btn btn-dark">Edit Profile</Link>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><div className="stat-label">Applied Jobs</div><div className="stat-value">{stats.applied}</div></div>
          <div className="stat-card"><div className="stat-label">Pending</div><div className="stat-value">{stats.pending}</div></div>
          <div className="stat-card"><div className="stat-label">Accepted</div><div className="stat-value stat-accent">{stats.accepted}</div></div>
          <div className="stat-card"><div className="stat-label">Saved Jobs</div><div className="stat-value">{stats.saved}</div></div>
        </div>

        <div className="dash-tabs">
          <button className={`dash-tab ${tab === 'applied' ? 'active' : ''}`} onClick={() => setTab('applied')}>Applied Jobs</button>
          <button className={`dash-tab ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>Saved Jobs</button>
        </div>

        {loading ? (
          <div className="card"><p className="muted">Loading…</p></div>
        ) : tab === 'applied' ? (
          proposals.length === 0 ? (
            <div className="empty-state">
              <p>You haven't applied to any jobs yet.</p>
              <Link to="/jobs" className="btn btn-dark">Browse Jobs</Link>
            </div>
          ) : (
            <div className="card-list">
              {proposals.map(p => (
                <div key={p.id} className="card proposal-row">
                  <div className="proposal-row-main">
                    <div className="proposal-row-head">
                      <Link to={`/jobs/${p.job?.id}`} className="proposal-row-title">{p.job?.title || 'Job'}</Link>
                      <span className={`status-badge status-${p.status}`}>{p.status}</span>
                    </div>
                    <p className="muted small">{p.coverLetter.slice(0, 140)}{p.coverLetter.length > 140 ? '…' : ''}</p>
                    <div className="proposal-row-meta">
                      <span>💰 ${p.bid}</span>
                      <span>⏱ {p.deliveryDays} days delivery</span>
                      <span>📅 Applied {new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    {p.status === 'accepted' && (
                      <div style={{ marginTop: 12 }}>
                        <button
                          className="btn-sm btn-sm-light"
                          onClick={() => setOpenThread(openThread === p.id ? null : p.id)}
                        >
                          {openThread === p.id ? 'Hide messages' : '💬 Message client'}
                        </button>
                        {openThread === p.id && (
                          <div style={{ marginTop: 12 }}>
                            <MessageThread jobId={p.job?.id} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          saved.length === 0 ? (
            <div className="empty-state">
              <p>You haven't saved any jobs yet.</p>
              <Link to="/jobs" className="btn btn-dark">Browse Jobs</Link>
            </div>
          ) : (
            <div className="card-list">
              {saved.map(j => (
                <div key={j.id} className="card proposal-row">
                  <div className="proposal-row-main">
                    <div className="proposal-row-head">
                      <Link to={`/jobs/${j.id}`} className="proposal-row-title">{j.title}</Link>
                      <span className={`status-badge status-${j.status}`}>{j.status}</span>
                    </div>
                    <p className="muted small">{j.description.slice(0, 140)}…</p>
                    <div className="proposal-row-meta">
                      <span>💰 ${j.budget}</span>
                      <span>📂 {j.category}</span>
                      <span>📅 Due {new Date(j.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
