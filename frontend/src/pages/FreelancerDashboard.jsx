import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function FreelancerDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('applied')
  const [proposals, setProposals] = useState([])
  const [saved, setSaved] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/proposals/mine').then(r => r.data).catch(() => []),
      api.get('/jobs/saved/me').then(r => r.data).catch(() => []),
    ]).then(([p, s]) => {
      setProposals(p)
      setSaved(s)
      setLoading(false)
    })
  }, [])

  const stats = {
    applied: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    saved: saved.length,
  }

  return (<div className="dashboard"></div>)
}
