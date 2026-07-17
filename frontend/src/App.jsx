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
import MyApplications from "./pages/MyApplications";
import MyPost from "./pages/MyPost";
import ApplicationsOrg from "./pages/ApplicationsOrg";
import Saved from "./pages/Saved";
import Admin from "./pages/Admin";
import "./components/layout/Navbar.css";

function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/opportunities" replace />;

  return <Admin />;
}

function ProfileRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const isStudent = user.role === "student";
  const isOrganization = user.role === "organization";
  const isAdmin = user.role === "admin";

  return (
    <div className="route-page">
      <Navbar />
      <div className="route-content">
        {isAdmin ? (
          <main className="org-profile-page" style={{ flex: 1 }}>
            <section className="org-profile-card">
              <div className="org-profile-banner" />
              <div className="org-profile-body">
                <div className="org-profile-top">
                  <div className="org-profile-avatar">
                    {(user.full_name || "A").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <h1>{user.full_name || "Admin"}</h1>
                <div className="org-profile-meta">
                  <span>{user.email}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>ADMIN</span>
                </div>
              </div>
            </section>
          </main>
        ) : isStudent ? (
          <ProfileJobSeeker />
        ) : (
          <ProfileOrg />
        )}
      </div>
      <Footer />
    </div>
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

function OpportunityDetailRoute() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <>
      <OpportunityDetail />
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

function StudentSavedRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "organization") return <Navigate to="/applications" replace />;
  if (user.role !== "student") return <Navigate to="/opportunities" replace />;

  return (
    <>
      <Saved />
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
            <Route path="/opportunities/:id" element={<OpportunityDetailRoute />} />
            <Route path="/my-applications" element={<StudentApplicationsRoute />} />
            <Route path="/saved" element={<StudentSavedRoute />} />
            <Route path="/applications" element={<OrgApplicationsRoute />} />
            <Route path="/profile" element={<ProfileRoute />} />
            <Route path="/my-post" element={<MyPost />} />
            <Route path="/admin" element={<AdminRoute />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
