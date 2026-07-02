import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const STATUSES = ['open', 'in-progress', 'completed', 'closed']
const CATEGORIES = [
  'Graphics & Design', 'Programming & Tech', 'Digital Marketing', 'Writing & Translation',
  'Video & Animation', 'Music & Audio', 'Business', 'Lifestyle',
]

export default function ManageJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/jobs/client/me').then(r => { setJobs(r.data); setLoading(false) })
  }
  useEffect(load, [])

  const del = async (id) => {
    if (!confirm('Delete this job and all its proposals?')) return
    await api.delete(`/jobs/${id}`)
    load()
  }

  const saveEdit = async () => {
    setBusy(true)
    try {
      await api.put(`/jobs/${editing.id}`, {
        title: editing.title,
        description: editing.description,
        category: editing.category,
        budget: Number(editing.budget),
        deadline: editing.deadline,
        status: editing.status,
      })
      setEditing(null)
      load()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dash-head">
          <div>
            <h1 className="dash-title">Manage Jobs</h1>
            <p className="dash-sub">Edit, delete, or review proposals for your job posts</p>
          </div>
          <Link to="/client/post-job" className="btn btn-dark">+ Post a Job</Link>
        </div>

        {loading ? <p className="muted">Loading…</p> :
          jobs.length === 0 ? (
            <div className="empty-state">
              <p>No jobs posted yet.</p>
              <Link to="/client/post-job" className="btn btn-dark">Post your first job</Link>
            </div>
          ) : (
            <div className="card no-pad">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Category</th>
                    <th>Budget</th>
                    <th>Deadline</th>
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
                      <td>{j.category}</td>
                      <td>${j.budget}</td>
                      <td>{new Date(j.deadline).toLocaleDateString()}</td>
                      <td><span className={`status-badge status-${j.status}`}>{j.status}</span></td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/client/jobs/${j.id}/proposals`} className="btn-sm btn-sm-light">Proposals</Link>
                          <button className="btn-sm btn-sm-light" onClick={() => setEditing({ ...j, deadline: j.deadline.slice(0, 10) })}>Edit</button>
                          <button className="btn-sm btn-sm-danger" onClick={() => del(j.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Edit Job</h2>
              <button className="modal-close" onClick={() => setEditing(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="field"><label>Title</label>
                <input className="input" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="field"><label>Description</label>
                <textarea className="input textarea" rows={4} value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="form-row">
                <div className="field"><label>Category</label>
                  <select className="input" value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field"><label>Budget</label>
                  <input className="input" type="number" value={editing.budget} onChange={e => setEditing({ ...editing, budget: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="field"><label>Deadline</label>
                  <input className="input" type="date" value={editing.deadline} onChange={e => setEditing({ ...editing, deadline: e.target.value })} /></div>
                <div className="field"><label>Status</label>
                  <select className="input" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-light" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-dark" onClick={saveEdit} disabled={busy}>{busy ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
