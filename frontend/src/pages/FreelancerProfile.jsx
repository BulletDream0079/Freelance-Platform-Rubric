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

    return (<div className="dashboard"></div>)
}
