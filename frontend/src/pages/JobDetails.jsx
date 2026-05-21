import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import ProposalModal from "../components/ProposalModal";

export default function JobDetails() {
   const { id } = useParams();
   const { user } = useAuth();
   const navigate = useNavigate();
   const [job, setJob] = useState(null);
   const [loading, setLoading] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [savedIds, setSavedIds] = useState([]);
   const [hasApplied, setHasApplied] = useState(false);
   const [flash, setFlash] = useState("");

   return (<div className="dashboard"></div>)
}
