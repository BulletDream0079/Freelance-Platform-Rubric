import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [q, setQ] = useState('')
  return (<div className="dashboard"></div>)
}
