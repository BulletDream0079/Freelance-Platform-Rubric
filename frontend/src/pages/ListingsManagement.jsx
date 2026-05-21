import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function ListingsManagement() {
    const [tab, setTab] = useState('jobs')
    const [jobs, setJobs] = useState([])
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(true)
    return (<div className="dashboard"></div>)
}
