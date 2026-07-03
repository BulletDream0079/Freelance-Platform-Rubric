import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import Avatar from '../components/Avatar'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/admin/users').then(r => { setUsers(r.data); setLoading(false) })
  }
  useEffect(load, [])

  const toggleBan = async (u) => {
    await api.put(`/admin/users/${u.id}/ban`, { banned: !u.banned })
    load()
  }

  const del = async (id) => {
    if (!confirm('Permanently delete this user? This cannot be undone.')) return
    await api.delete(`/admin/users/${id}`)
    load()
  }

  const filtered = users
    .filter(u => filter === 'all' || u.role === filter)
    .filter(u => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dash-head">
          <div>
            <h1 className="dash-title">User Management</h1>
            <p className="dash-sub">View, ban, or remove platform users</p>
          </div>
          <Link to="/admin" className="btn btn-light">← Dashboard</Link>
        </div>

        <div className="filters">
          <input className="input" placeholder="Search by name or email…" value={q} onChange={e => setQ(e.target.value)} />
          <select className="input" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="freelancer">Freelancers</option>
            <option value="client">Clients</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? <p className="muted">Loading…</p> : (
          <div className="card no-pad">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="muted center">No users match your filters.</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="table-user">
                        <Avatar user={u} size={42} />
                        <div>
                          <div className="table-link">{u.name}</div>
                          {u.title && <div className="muted small">{u.title}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`role-pill role-${u.role}`}>{u.role}</span></td>
                    <td>{new Date(u.createdAt || Date.now()).toLocaleDateString()}</td>
                    <td>
                      {u.banned ? <span className="status-badge status-rejected">Banned</span>
                        : <span className="status-badge status-open">Active</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        {u.role === 'freelancer' && (
                          <Link to={`/freelancers/${u.id}`} className="btn-sm btn-sm-light">View</Link>
                        )}
                        <button className="btn-sm btn-sm-light" onClick={() => toggleBan(u)}>
                          {u.banned ? 'Unban' : 'Ban'}
                        </button>
                        {u.role !== 'admin' && (
                          <button className="btn-sm btn-sm-danger" onClick={() => del(u.id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
