import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function ListingsManagement() {
  const [tab, setTab] = useState('jobs')
  const [jobs, setJobs] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/jobs').then(r => r.data).catch(() => []),
      api.get('/admin/proposals').then(r => r.data).catch(() => []),
    ]).then(([j, p]) => {
      setJobs(j)
      setProposals(p)
      setLoading(false)
    })
  }
  useEffect(load, [])

  const delJob = async (id) => {
    if (!confirm('Remove this job and all its proposals?')) return
    await api.delete(`/jobs/${id}`)
    load()
  }

  const delProposal = async (id) => {
    if (!confirm('Remove this proposal?')) return
    await api.delete(`/proposals/${id}`)
    load()
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dash-head">
          <div>
            <h1 className="dash-title">Listings Management</h1>
            <p className="dash-sub">Moderate jobs and proposals across the platform</p>
          </div>
          <Link to="/admin" className="btn btn-light">← Dashboard</Link>
        </div>

        <div className="dash-tabs">
          <button className={`dash-tab ${tab === 'jobs' ? 'active' : ''}`} onClick={() => setTab('jobs')}>
            Jobs ({jobs.length})
          </button>
          <button className={`dash-tab ${tab === 'proposals' ? 'active' : ''}`} onClick={() => setTab('proposals')}>
            Proposals ({proposals.length})
          </button>
        </div>

        {loading ? <p className="muted">Loading…</p> : tab === 'jobs' ? (
          jobs.length === 0 ? <div className="empty-state"><p>No jobs on the platform.</p></div> : (
            <div className="card no-pad">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Posted by</th>
                    <th>Category</th>
                    <th>Budget</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(j => (
                    <tr key={j.id}>
                      <td>
                        <Link to={`/jobs/${j.id}`} className="table-link">{j.title}</Link>
                        <div className="muted small">{j.description.slice(0, 60)}…</div>
                      </td>
                      <td>{j.client?.name || '—'}</td>
                      <td>{j.category}</td>
                      <td>${j.budget}</td>
                      <td><span className={`status-badge status-${j.status}`}>{j.status}</span></td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/jobs/${j.id}`} className="btn-sm btn-sm-light">View</Link>
                          <button className="btn-sm btn-sm-danger" onClick={() => delJob(j.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          proposals.length === 0 ? <div className="empty-state"><p>No proposals on the platform.</p></div> : (
            <div className="card no-pad">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Freelancer</th>
                    <th>Bid</th>
                    <th>Delivery</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map(p => (
                    <tr key={p.id}>
                      <td>
                        <Link to={`/jobs/${p.jobId}`} className="table-link">{p.job?.title || '—'}</Link>
                        <div className="muted small">{p.coverLetter.slice(0, 60)}…</div>
                      </td>
                      <td>{p.freelancer?.name || '—'}</td>
                      <td>${p.bid}</td>
                      <td>{p.deliveryDays} days</td>
                      <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-sm btn-sm-danger" onClick={() => delProposal(p.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}