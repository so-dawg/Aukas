import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import { FiBriefcase, FiUsers, FiCheck, FiX, FiLogOut } from "react-icons/fi";
import "./Admin.css";

export default function Admin() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState("opportunities");

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/opportunities" replace />;

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-head">
          <div className="sidebar-logo">A</div>
          <span className="sidebar-title">Admin</span>
        </div>
        <nav className="sidebar-nav">
          {[
            { key: "opportunities", label: "Opportunities", icon: <FiBriefcase size={16} /> },
            { key: "users", label: "Users", icon: <FiUsers size={16} /> },
          ].map((item) => (
            <button
              key={item.key}
              className={`side-link${tab === item.key ? " active" : ""}`}
              onClick={() => setTab(item.key)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button className="side-link side-link--logout" onClick={logout}>
          <FiLogOut size={16} />
          <span>Log out</span>
        </button>
      </aside>

      <main className="admin-main">
        <div className="page page-wide">
          {tab === "opportunities" && <OpportunityManager />}
          {tab === "users" && <UserManager />}
        </div>
      </main>
    </div>
  );
}

const OPP_STATUSES = ["all", "pending", "approved", "rejected", "draft", "expired"];

function OpportunityManager() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const handleFilter = (status) => {
    setStatusFilter(status);
    setLoading(true);
    setError("");
  };

  useEffect(() => {
    let cancelled = false;
    const params = { limit: 200 };
    if (statusFilter !== "all") params.status = statusFilter;
    client.get("/admin/opportunities", { params })
      .then((res) => { if (!cancelled) setOpportunities(res.data.data || []); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.error?.message || "Failed to load opportunities"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [statusFilter]);

  const handleStatus = async (id, newStatus) => {
    setUpdatingId(id);
    setError("");
    try {
      await client.patch(`/opportunities/${id}/status`, { status: newStatus });
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const countFor = (s) =>
    s === "all" ? opportunities.length : opportunities.filter((o) => o.status === s).length;

  return (
    <section>
      <h1 className="page-title">Opportunities</h1>

      <div className="tabs">
        {OPP_STATUSES.map((s) => (
          <button
            key={s}
            className={`tab${statusFilter === s ? " active" : ""}`}
            onClick={() => handleFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="tab-count">{countFor(s)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="admin-state">Loading opportunities...</p>
      ) : error ? (
        <p className="admin-state admin-state--error">{error}</p>
      ) : opportunities.length === 0 ? (
        <p className="admin-state">No opportunities found.</p>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Organization</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr key={opp.id}>
                  <td className="tbl-primary">{opp.title}</td>
                  <td className="tbl-secondary">{opp.Organization?.org_name || "-"}</td>
                  <td><span className="badge badge-type">{opp.type || "-"}</span></td>
                  <td><span className={`badge badge-${opp.status}`}>{opp.status}</span></td>
                  <td className="tbl-actions">
                    {opp.status === "pending" ? (
                      <>
                        <button
                          className="btn-action btn-approve"
                          onClick={() => handleStatus(opp.id, "approved")}
                          disabled={updatingId === opp.id}
                        >
                          <FiCheck size={14} /> Approve
                        </button>
                        <button
                          className="btn-action btn-reject"
                          onClick={() => handleStatus(opp.id, "rejected")}
                          disabled={updatingId === opp.id}
                        >
                          <FiX size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="tbl-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const ROLE_OPTIONS = ["all", "student", "organization", "admin"];
const ROLE_LABELS = { all: "All", student: "Student", organization: "Organization", admin: "Admin" };

function UserManager() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const fetchUsers = () => {
    setLoading(true);
    setError("");
    client.get("/admin/users", { params: { limit: 200 } })
      .then((res) => setAllUsers(res.data.data || []))
      .catch((err) => setError(err.response?.data?.error?.message || "Failed to load users"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = roleFilter === "all"
    ? allUsers
    : allUsers.filter((u) => u.role === roleFilter);

  const toggleVerify = async (userId, currentVerified) => {
    setError("");
    try {
      await client.patch(`/admin/organizations/${userId}/verify`, { verified: !currentVerified });
      setAllUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId && u.profile) {
            return { ...u, profile: { ...u.profile, verified: !currentVerified } };
          }
          return u;
        })
      );
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to update verification");
    }
  };

  const toggleBan = async (userId, isBanned) => {
    setError("");
    try {
      await client.patch(`/admin/users/${userId}/ban`, { banned: !isBanned });
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, deleted_at: isBanned ? null : new Date().toISOString() } : u,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to update ban status");
    }
  };

  const countFor = (r) =>
    r === "all" ? allUsers.length : allUsers.filter((u) => u.role === r).length;

  return (
    <section>
      <h1 className="page-title">Users</h1>

      <div className="tabs">
        {ROLE_OPTIONS.map((r) => (
          <button
            key={r}
            className={`tab${roleFilter === r ? " active" : ""}`}
            onClick={() => setRoleFilter(r)}
          >
            {ROLE_LABELS[r]}
            <span className="tab-count">{countFor(r)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="admin-state">Loading users...</p>
      ) : error ? (
        <p className="admin-state admin-state--error">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="admin-state">No users found.</p>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isBanned = !!u.deleted_at;
                return (
                <tr key={u.id}>
                  <td className="tbl-primary">{u.full_name || "-"}</td>
                  <td className="tbl-secondary">{u.email}</td>
                  <td><span className="badge badge-role">{u.role}</span></td>
                  <td>
                    {isBanned ? (
                      <span className="badge badge-rejected">Banned</span>
                    ) : u.role === "organization" ? (
                      <span className={`badge ${u.profile?.verified ? "badge-approved" : "badge-rejected"}`}>
                        {u.profile?.verified ? "Verified" : "Unverified"}
                      </span>
                    ) : (
                      <span className="badge badge-approved">Active</span>
                    )}
                  </td>
                  <td className="tbl-actions">
                    {u.role === "organization" && !isBanned && (
                      <button
                        className={`btn-action ${u.profile?.verified ? "btn-reject" : "btn-approve"}`}
                        onClick={() => toggleVerify(u.id, u.profile?.verified)}
                      >
                        {u.profile?.verified ? "Unverify" : "Verify"}
                      </button>
                    )}
                    {u.role !== "admin" && (
                      <button
                        className={`btn-action ${isBanned ? "btn-approve" : "btn-reject"}`}
                        onClick={() => toggleBan(u.id, isBanned)}
                      >
                        {isBanned ? "Unban" : "Ban"}
                      </button>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
