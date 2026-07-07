import "./App.css";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import ProfileJobSeeker from "./pages/ProfileJobSeeker";
import ProfileOrg from "./pages/ProfileOrg";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import "./components/layout/Navbar.css";

function ProfileRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const isStudent = user.role === "student";
  const isOrganization = user.role === "organization";
  if (!isStudent && !isOrganization) return <Navigate to="/opportunities" replace />;

  return (
    <>
      <Navbar />
      {isStudent ? <ProfileJobSeeker /> : <ProfileOrg />}
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
              element={<ProfileRoute />}
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
