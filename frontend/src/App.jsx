import "./App.css";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import Opportunities from "./pages/Opportunities";
import ProfileJobSeeker from "./pages/ProfileJobSeeker";
import ProfileOrg from "./pages/ProfileOrg";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import MyApplications from "./pages/MyApplications";
import MyPost from "./pages/MyPost";
import ApplicationsOrg from "./pages/ApplicationsOrg";
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

function OpportunitiesRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user?.role === "organization") return <Navigate to="/profile" replace />;

  return (
    <>
      <Opportunities />
      <Footer />
    </>
  );
}

function OrgApplicationsRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "organization") return <Navigate to="/opportunities" replace />;

  return <ApplicationsOrg />;
}

function StudentApplicationsRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "organization") return <Navigate to="/applications" replace />;
  if (user.role !== "student") return <Navigate to="/opportunities" replace />;

  return (
    <>
      <MyApplications />
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
            <Route path="/opportunities" element={<OpportunitiesRoute />} />
            {/* Opportunity detail route removed */}
            <Route path="/my-applications" element={<StudentApplicationsRoute />} />
            <Route path="/applications" element={<OrgApplicationsRoute />} />
            <Route path="/profile" element={<ProfileRoute />} />
            <Route path="/my-post" element={<MyPost />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
