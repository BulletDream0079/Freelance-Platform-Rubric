import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function ManageJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // job object
  const [busy, setBusy] = useState(false)
  return (<div className="dashboard"></div>)
}
