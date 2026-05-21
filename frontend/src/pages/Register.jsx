import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
      const { register, loading } = useAuth();
      const navigate = useNavigate();
      const [name, setName] = useState("");
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [role, setRole] = useState("freelancer");
      const [error, setError] = useState("");
    return (<div className="dashboard"></div>)
}
