import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function ProposalReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get(`/jobs/${id}`).then(r => r.data),
      api.get(`/proposals/job/${id}`).then(r => r.data),
    ]).then(([j, p]) => {
      setJob(j)
      setProposals(p)
      setLoading(false)
    }).catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])
  const decide = async (proposalId, status) => {
    setBusy(proposalId)
    try {
      await api.put(`/proposals/${proposalId}/status`, { status })
      load()
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <div className="dashboard"><div className="container"><p>Loading…</p></div></div>
  if (!job) return <div className="dashboard"><div className="container"><p>Job not found.</p></div></div>
  const accepted = proposals.find(p => p.status === 'accepted')
  return (
    <div className="dashboard">
      <div className="container">
        <button onClick={() => navigate('/client/manage')} className="link-back">← Back to Manage Jobs</button>

        <div className="page-head">
          <h1>Proposals for "{job.title}"</h1>
          <div className="page-head-meta">
            <span>💰 Budget ${job.budget}</span>
            <span>📅 Deadline {new Date(job.deadline).toLocaleDateString()}</span>
            <span className={`status-badge status-${job.status}`}>{job.status}</span>
            <span>{proposals.length} {proposals.length === 1 ? 'proposal' : 'proposals'}</span>
          </div>
        </div>

        {accepted && (
          <div className="alert alert-success">
            You accepted <strong>{accepted.freelancer?.name}</strong>'s proposal. The job is now in progress.
          </div>
        )}

        {proposals.length === 0 ? (
          <div className="empty-state">
            <p>No proposals received yet. Share your job to attract freelancers!</p>
          </div>
        ) : (
          <div className="proposal-list">
            {proposals.map(p => (
              <div key={p.id} className="card proposal-card">
                <div className="proposal-card-head">
                  <Link to={`/freelancers/${p.freelancerId}`} className="proposal-freelancer">
                    <div className="avatar-sm">
                      {p.freelancer?.avatar ? <img src={p.freelancer.avatar} alt="" /> : <div className="avatar-fallback">{p.freelancer?.name?.[0]}</div>}
                    </div>
                    <div>
                      <div className="proposal-freelancer-name">{p.freelancer?.name}</div>
                      <div className="muted small">{p.freelancer?.title || 'Freelancer'} · ⭐ {p.freelancer?.rating || '5.0'}</div>
                    </div>
                  </Link>
                  <span className={`status-badge status-${p.status}`}>{p.status}</span>
                </div>

                <p className="proposal-cover">{p.coverLetter}</p>

                <div className="proposal-card-meta">
                  <div className="proposal-meta-item"><span className="muted small">Bid</span><strong>${p.bid}</strong></div>
                  <div className="proposal-meta-item"><span className="muted small">Delivery</span><strong>{p.deliveryDays} days</strong></div>
                  <div className="proposal-meta-item"><span className="muted small">Submitted</span><strong>{new Date(p.createdAt).toLocaleDateString()}</strong></div>
                </div>

                {p.status === 'pending' && job.status === 'open' && (
                  <div className="proposal-card-actions">
                    <button className="btn btn-light" onClick={() => decide(p.id, 'rejected')} disabled={busy === p.id}>Reject</button>
                    <button className="btn btn-dark" onClick={() => decide(p.id, 'accepted')} disabled={busy === p.id}>
                      {busy === p.id ? 'Working…' : 'Accept Proposal'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
