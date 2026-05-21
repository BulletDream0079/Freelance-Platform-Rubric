import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function PostJob() {
  const navigate = useNavigate()
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
    return (<div className="dashboard"></div>)
}
