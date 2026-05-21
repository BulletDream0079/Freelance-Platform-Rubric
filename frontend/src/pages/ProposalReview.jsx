import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function ProposalReview() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [job, setJob] = useState(null)
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(null)
    return (<div className="dashboard"></div>)
}
