import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const CATEGORIES = [
  'Graphics & Design',
  'Programming & Tech',
  'Digital Marketing',
  'Writing & Translation',
  'Video & Animation',
  'Music & Audio',
  'Business',
  'Lifestyle',
]

export default function PostJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    budget: '',
    deadline: '',
    skillsRequired: '',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!form.title || !form.description || !form.budget || !form.deadline) {
      setErr('Please fill in all required fields.')
      return
    }
    setBusy(true)
    try {
      await api.post('/jobs', {
        ...form,
        budget: Number(form.budget),
        skillsRequired: form.skillsRequired.split(',').map(s => s.trim()).filter(Boolean),
      })
      navigate('/client/manage')
    } catch (e) {
      setErr(e.response?.data?.error || 'Failed to post job')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dashboard">
      <div className="container container-narrow">
        <div className="page-head">
          <h1>Post a New Job</h1>
          <p className="muted">Describe what you need and start receiving proposals from freelancers</p>
        </div>

        {err && <div className="alert alert-error">{err}</div>}

        <form className="card form-card" onSubmit={submit}>
          <div className="field">
            <label>Job Title *</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Design a modern logo for my startup" />
          </div>

          <div className="field">
            <label>Description *</label>
            <textarea className="input textarea" rows={6} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the project, scope, expectations and any required experience…" />
          </div>

          <div className="form-row">
            <div className="field">
              <label>Category *</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Budget (USD) *</label>
              <input className="input" type="number" min="1" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                placeholder="500" />
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label>Deadline *</label>
              <input className="input" type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="field">
              <label>Skills Required</label>
              <input className="input" value={form.skillsRequired} onChange={e => setForm({ ...form, skillsRequired: e.target.value })}
                placeholder="React, Node.js, Figma" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-light" onClick={() => navigate(-1)}>Cancel</button>
            <button className="btn btn-dark" disabled={busy}>{busy ? 'Posting…' : 'Post Job'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
