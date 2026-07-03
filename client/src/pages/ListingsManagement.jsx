import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const money = (cents) => `$${((cents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ListingsManagement() {
  const [tab, setTab] = useState('jobs')
  const [jobs, setJobs] = useState([])
  const [proposals, setProposals] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get('/admin/jobs').then(r => r.data).catch(() => []),
      api.get('/admin/proposals').then(r => r.data).catch(() => []),
      api.get('/admin/payments').then(r => r.data).catch(() => []),
    ]).then(([j, p, pay]) => {
      setJobs(j)
      setProposals(p)
      setPayments(pay)
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
          <button className={`dash-tab ${tab === 'payments' ? 'active' : ''}`} onClick={() => setTab('payments')}>
            Transactions ({payments.length})
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
        ) : tab === 'proposals' ? (
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
                        <Link to={`/jobs/${p.job?.id}`} className="table-link">{p.job?.title || '—'}</Link>
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
        ) : (
          payments.length === 0 ? <div className="empty-state"><p>No transactions yet. They appear once clients fund and release jobs.</p></div> : (
            <div className="card no-pad">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Job</th>
                    <th>Client → Freelancer</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Platform fee</th>
                    <th>Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="muted small">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="table-link">{p.job?.title || '—'}</td>
                      <td className="small">{p.client?.name || '—'} → {p.freelancer?.name || '—'}</td>
                      <td><span className={`status-badge pay-${p.type === 'released' ? 'released' : p.type === 'refunded' ? 'refunded' : 'funded'}`}>{p.type.replace('_', ' ')}</span></td>
                      <td>{money(p.amountCents)}</td>
                      <td className="stat-accent">{money(p.platformFeeCents)}</td>
                      <td>{money(p.freelancerPayoutCents)}</td>
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
