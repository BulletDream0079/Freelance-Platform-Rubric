import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api";

export default function Jobs() {
    const [params, setParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
    return (<div className="dashboard"></div>)
}
