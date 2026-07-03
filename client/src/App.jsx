import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import FreelancerProfile from "./pages/FreelancerProfile";
import ClientDashboard from "./pages/ClientDashboard";
import PostJob from "./pages/PostJob";
import ManageJobs from "./pages/ManageJobs";
import ProposalReview from "./pages/ProposalReview";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import ListingsManagement from "./pages/ListingsManagement";
import AdminActivity from "./pages/AdminActivity";

export default function App() {
  const location = useLocation();
  const hideFooterRoutes = ["/login", "/register"];
  const hideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/freelancers/:id" element={<FreelancerProfile />} />
        <Route
          path="/freelancer"
          element={
            <ProtectedRoute roles={["freelancer"]}>
              <FreelancerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer/profile"
          element={
            <ProtectedRoute roles={["freelancer"]}>
              <FreelancerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client"
          element={
            <ProtectedRoute roles={["client"]}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/post-job"
          element={
            <ProtectedRoute roles={["client"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/manage"
          element={
            <ProtectedRoute roles={["client"]}>
              <ManageJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/client/jobs/:id/proposals"
          element={
            <ProtectedRoute roles={["client"]}>
              <ProposalReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/listings"
          element={
            <ProtectedRoute roles={["admin"]}>
              <ListingsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminActivity />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
              <h1>404 — page not found</h1>
              <p className="text-muted">The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}
