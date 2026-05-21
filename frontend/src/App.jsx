import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public
import Home from "./pages/Home";
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
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}