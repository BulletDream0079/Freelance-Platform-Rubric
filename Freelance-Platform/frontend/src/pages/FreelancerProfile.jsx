import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function FreelancerProfile() {
  const { id } = useParams()
  const { user, refresh } = useAuth()
  const isEditMode = !id
  const profileId = id || user?.id

  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!profileId) return
    api.get(`/users/${profileId}`).then(r => {
      setProfile(r.data)
      setForm({
        name: r.data.name || '',
        title: r.data.title || '',
        bio: r.data.bio || '',
        skills: (r.data.skills || []).join(', '),
        experience: r.data.experience || '',
        avatar: r.data.avatar || '',
        portfolio: (r.data.portfolio || []).map(p => `${p.title}|${p.image}`).join('\n'),
      })
    })
  }, [profileId])

  const save = async () => {
    setSaving(true)
    setMsg('')
    try {
      const payload = {
        name: form.name,
        title: form.title,
        bio: form.bio,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience: form.experience,
        avatar: form.avatar,
        portfolio: form.portfolio.split('\n').filter(Boolean).map(line => {
          const [title, image] = line.split('|').map(s => s.trim())
          return { title: title || 'Project', image: image || '' }
        }),
      }
      const { data } = await api.put('/users/me/update', payload)
      setProfile(data)
      setEditing(false)
      setMsg('Profile updated successfully')
      refresh && refresh()
      setTimeout(() => setMsg(''), 3000)
    } catch (e) {
      setMsg(e.response?.data?.error || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) return <div className="dashboard"><div className="container"><p>Loading…</p></div></div>

  const isOwn = user?.id === profile.id
  const showEditUI = isEditMode && isOwn

  return (
    <div className="dashboard">
      <div className="container">
        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="profile-head">
          <div className="profile-avatar">
            {profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : <div className="avatar-fallback">{profile.name?.[0]}</div>}
          </div>
          <div className="profile-head-info">
            {editing ? (
              <>
                <input className="input input-lg" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Professional title (e.g. Full-Stack Developer)" />
              </>
            ) : (
              <>
                <h1 className="profile-name">{profile.name}</h1>
                <p className="profile-title">{profile.title || 'Freelancer'}</p>
                <div className="profile-meta">
                  <span>⭐ {profile.rating || '5.0'} ({profile.reviews || 0} reviews)</span>
                  <span>📍 {profile.location || 'Remote'}</span>
                </div>
              </>
            )}
          </div>
          {showEditUI && (
            <div className="profile-actions">
              {editing ? (
                <>
                  <button className="btn btn-light" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn btn-dark" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </>
              ) : (
                <button className="btn btn-dark" onClick={() => setEditing(true)}>Edit Profile</button>
              )}
            </div>
          )}
        </div>

        <div className="profile-grid">
          <div className="profile-main">
            <div className="profile-section">
              <h2>About</h2>
              {editing ? (
                <textarea className="input textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={5} placeholder="Tell clients about yourself…" />
              ) : (
                <p className="profile-bio">{profile.bio || 'No bio yet.'}</p>
              )}
            </div>

            <div className="profile-section">
              <h2>Skills</h2>
              {editing ? (
                <input className="input" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, Figma (comma separated)" />
              ) : (
                <div className="skill-pills">
                  {(profile.skills || []).length === 0 ? <span className="muted">No skills added</span> :
                    profile.skills.map(s => <span key={s} className="skill-pill">{s}</span>)}
                </div>
              )}
            </div>

            <div className="profile-section">
              <h2>Portfolio</h2>
              {editing ? (
                <textarea className="input textarea" value={form.portfolio} onChange={e => setForm({ ...form, portfolio: e.target.value })} rows={4}
                  placeholder="One per line: Title | image-url" />
              ) : (
                <div className="portfolio-grid">
                  {(profile.portfolio || []).length === 0 ? <span className="muted">No portfolio items</span> :
                    profile.portfolio.map((p, i) => (
                      <div key={i} className="portfolio-item">
                        {p.image && <img src={p.image} alt={p.title} />}
                        <div className="portfolio-title">{p.title}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="profile-section">
              <h2>Experience</h2>
              {editing ? (
                <textarea className="input textarea" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} rows={4} placeholder="Your professional experience…" />
              ) : (
                <p className="profile-bio">{profile.experience || 'No experience listed.'}</p>
              )}
            </div>

            {editing && (
              <div className="profile-section">
                <h2>Avatar URL</h2>
                <input className="input" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} placeholder="https://…" />
              </div>
            )}
          </div>

          <aside className="profile-aside">
            <div className="card">
              <h3 className="card-title">Quick Stats</h3>
              <div className="stat-row"><span>Member since</span><strong>{new Date(profile.createdAt || Date.now()).toLocaleDateString()}</strong></div>
              <div className="stat-row"><span>Rating</span><strong>⭐ {profile.rating || '5.0'}</strong></div>
              <div className="stat-row"><span>Role</span><strong style={{ textTransform: 'capitalize' }}>{profile.role}</strong></div>
            </div>
            {!isOwn && (
              <Link to="/jobs" className="btn btn-dark btn-block">Browse Jobs</Link>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
