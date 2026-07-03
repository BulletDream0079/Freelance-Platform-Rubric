import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const money = (cents) => `$${((cents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => setStats({}))
  }, [])

  if (!stats) return <div className="dashboard"><div className="container"><p>Loading…</p></div></div>

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dash-head">
          <div>
            <h1 className="dash-title">Admin Dashboard</h1>
            <p className="dash-sub">Platform overview and key metrics</p>
          </div>
          <div className="dash-head-actions">
            <Link to="/admin/users" className="btn btn-light">Manage Users</Link>
            <Link to="/admin/activity" className="btn btn-light">Activity &amp; Settings</Link>
            <Link to="/admin/listings" className="btn btn-dark">Manage Listings</Link>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><div className="stat-label">Total Users</div><div className="stat-value">{stats.totalUsers || 0}</div></div>
          <div className="stat-card"><div className="stat-label">Total Jobs</div><div className="stat-value">{stats.totalJobs || 0}</div></div>
          <div className="stat-card"><div className="stat-label">Total Proposals</div><div className="stat-value">{stats.totalProposals || 0}</div></div>
          <div className="stat-card"><div className="stat-label">Banned Users</div><div className="stat-value stat-danger">{stats.bannedUsers || 0}</div></div>
        </div>

        <div className="stat-grid">
          <div className="stat-card stat-card-accent">
            <div className="stat-label">Platform Revenue (fees)</div>
            <div className="stat-value stat-accent">{money(stats.platformRevenueCents)}</div>
          </div>
          <div className="stat-card"><div className="stat-label">Gross Volume</div><div className="stat-value">{money(stats.grossVolumeCents)}</div></div>
          <div className="stat-card"><div className="stat-label">Paid to Freelancers</div><div className="stat-value">{money(stats.paidOutCents)}</div></div>
          <div className="stat-card"><div className="stat-label">Completed Transactions</div><div className="stat-value">{stats.completedTransactions || 0}</div></div>
        </div>

        <div className="dash-cols">
          <section className="card">
            <h2 className="card-title">Users by Role</h2>
            <div className="bar-list">
              <BarRow label="Freelancers" value={stats.usersByRole?.freelancer || 0} max={stats.totalUsers || 1} color="#1dbf73" />
              <BarRow label="Clients" value={stats.usersByRole?.client || 0} max={stats.totalUsers || 1} color="#5b6cff" />
              <BarRow label="Admins" value={stats.usersByRole?.admin || 0} max={stats.totalUsers || 1} color="#ffb33e" />
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Jobs by Status</h2>
            <div className="bar-list">
              <BarRow label="Open" value={stats.jobsByStatus?.open || 0} max={stats.totalJobs || 1} color="#1dbf73" />
              <BarRow label="In Progress" value={stats.jobsByStatus?.['in-progress'] || 0} max={stats.totalJobs || 1} color="#5b6cff" />
              <BarRow label="Completed" value={stats.jobsByStatus?.completed || 0} max={stats.totalJobs || 1} color="#9a86f3" />
              <BarRow label="Closed" value={stats.jobsByStatus?.closed || 0} max={stats.totalJobs || 1} color="#9aa0ab" />
            </div>
          </section>
        </div>

        <section className="card">
          <h2 className="card-title">Proposals by Status</h2>
          <div className="bar-list">
            <BarRow label="Pending" value={stats.proposalsByStatus?.pending || 0} max={stats.totalProposals || 1} color="#ffb33e" />
            <BarRow label="Accepted" value={stats.proposalsByStatus?.accepted || 0} max={stats.totalProposals || 1} color="#1dbf73" />
            <BarRow label="Rejected" value={stats.proposalsByStatus?.rejected || 0} max={stats.totalProposals || 1} color="#e85d6f" />
          </div>
        </section>
      </div>
    </div>
  )
}

function BarRow({ label, value, max, color }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="bar-row">
      <div className="bar-row-head">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
