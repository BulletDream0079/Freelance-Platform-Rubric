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
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}
