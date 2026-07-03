import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function AdminActivity() {
  const [tab, setTab] = useState('activity')
  const [logs, setLogs] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const [settings, setSettings] = useState(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState('')

  useEffect(() => {
    setLoading(true)
    api.get(`/admin/activity?page=${page}&limit=30`)
      .then(r => {
        setLogs(r.data.logs || [])
        setTotalPages(r.data.totalPages || 1)
      })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    api.get('/admin/settings').then(r => setSettings(r.data)).catch(() => {})
  }, [])

  const saveSettings = async () => {
    setSavingSettings(true)
    setSettingsMsg('')
    try {
      const { data } = await api.put('/admin/settings', {
        platformName: settings.platformName,
        allowRegistrations: settings.allowRegistrations,
        maintenanceMode: settings.maintenanceMode,
      })
      setSettings(data)
      setSettingsMsg('Settings saved')
      setTimeout(() => setSettingsMsg(''), 3000)
    } catch (e) {
      setSettingsMsg(e.response?.data?.error || 'Save failed')
    } finally {
      setSavingSettings(false)
    }
  }

  const labelFor = (action) => action.replace(/[._]/g, ' ')

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dash-head">
          <div>
            <h1 className="dash-title">Activity &amp; Settings</h1>
            <p className="dash-sub">Audit trail of platform actions and system configuration</p>
          </div>
          <Link to="/admin" className="btn btn-light">← Dashboard</Link>
        </div>

        <div className="dash-tabs">
          <button className={`dash-tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
            Activity Log
          </button>
          <button className={`dash-tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
            System Settings
          </button>
        </div>

        {tab === 'activity' ? (
          loading ? <p className="muted">Loading…</p> :
          logs.length === 0 ? <div className="empty-state"><p>No activity recorded yet.</p></div> : (
            <>
              <div className="card no-pad">
                <table className="table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Actor</th>
                      <th>Action</th>
                      <th>Entity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.id}>
                        <td className="muted small">{new Date(l.createdAt).toLocaleString()}</td>
                        <td>{l.actor?.name || 'System'} {l.actor?.role ? <span className="muted small">({l.actor.role})</span> : ''}</td>
                        <td style={{ textTransform: 'capitalize' }}>{labelFor(l.action)}</td>
                        <td className="muted small">{l.entityType || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="pager">
                  <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span className="pager-info">Page {page} of {totalPages}</span>
                  <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )
        ) : (
          !settings ? <p className="muted">Loading…</p> : (
            <div className="card form-card" style={{ maxWidth: 560 }}>
              {settingsMsg && <div className="alert alert-success">{settingsMsg}</div>}
              <div className="field">
                <label>Platform name</label>
                <input className="input" value={settings.platformName}
                  onChange={e => setSettings({ ...settings, platformName: e.target.value })} />
              </div>
              <label className="toggle-row">
                <input type="checkbox" checked={settings.allowRegistrations}
                  onChange={e => setSettings({ ...settings, allowRegistrations: e.target.checked })} />
                <span>Allow new user registrations</span>
              </label>
              <label className="toggle-row">
                <input type="checkbox" checked={settings.maintenanceMode}
                  onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
                <span>Maintenance mode</span>
              </label>
              <div className="form-actions">
                <button className="btn btn-dark" onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings ? 'Saving…' : 'Save settings'}
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
