import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function ClientDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    Promise.all([
      api.get('/jobs/client/me').then(r => r.data).catch(() => []),
      api.get('/proposals/client/me').then(r => r.data).catch(() => []),
    ]).then(([j, p]) => {
      setJobs(j)
      setProposals(p)
      setLoading(false)
    })
  }, [])

  const stats = {
    posted: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    active: jobs.filter(j => j.status === 'in-progress').length,
    pending: proposals.filter(p => p.status === 'pending').length,
  }
  return (<div className="dashboard"></div>)
}
