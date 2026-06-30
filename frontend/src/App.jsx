import "./App.css";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import ProfileJobSeeker from "./pages/ProfileJobSeeker";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import "./components/layout/Navbar.css";

function JobSeekerProfileRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "student") return <Navigate to="/opportunities" replace />;

  return (
    <>
      <Navbar />
      <ProfileJobSeeker />
      <Footer />
    </>
  );
}

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Home />
                  <Footer />
                </>
              }
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/about"
              element={
                <>
                  <About />
                  <Footer />
                </>
              }
            />
            <Route
              path="/contact"
              element={
                <>
                  <Contact />
                  <Footer />
                </>
              }
            />
            <Route
              path="/opportunities"
              element={
                <>
                  <Opportunities />
                  <Footer />
                </>
              }
            />
            <Route
              path="/opportunities/:id"
              element={
                <>
                  <OpportunityDetail />
                  <Footer />
                </>
              }
            />
            <Route
              path="/profile"
              element={<JobSeekerProfileRoute />}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
