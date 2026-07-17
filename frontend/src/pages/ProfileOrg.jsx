import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiClock,
  FiEdit2,
  FiGlobe,
  FiMail,
  FiPhone,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import "./ProfileOrg.css";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "OR";

export default function ProfileOrganisation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profile = user?.organisation_profile || user?.profile || {};
  const initialOrg = useMemo(() => ({ orgName: profile.org_name || "", website: profile.website || "", description: profile.description || "" }), []);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    orgName:     profile.org_name     || "",
    email:       user?.email          || "",
    website:     profile.website      || "",
    description: profile.description  || "",
  });
  const [draft, setDraft] = useState(profileData);

  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [appsError, setAppsError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const STATUS_TABS = ["all", "new", "interviewed", "hired", "rejected"];
  const tabLabel = { all: "All", new: "New", interviewed: "Interviewed", hired: "Hired", rejected: "Rejected" };

  function normalizeStatus(s) {
    const v = String(s || "").toLowerCase();
    if (v === "clicked" || v === "new") return "new";
    if (v === "in_review" || v === "interviewed" || v === "shortlisted") return "interviewed";
    if (v === "accepted" || v === "hired") return "hired";
    if (v === "rejected") return "rejected";
    return "new";
  }

  useEffect(() => {
    if (user?.role !== "organization") return;
    setAppsLoading(true);
    client.get("/applications/received")
      .then((res) => setApplications(res.data?.data || []))
      .catch((err) => setAppsError(err.response?.data?.error?.message || "Failed to load applications"))
      .finally(() => setAppsLoading(false));
  }, [user]);

  const updateDraft = (key, value) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {};
      if (draft.orgName !== profile.org_name) payload.org_name = draft.orgName;
      if (draft.website !== profile.website) payload.website = draft.website;
      if (draft.description !== profile.description) payload.description = draft.description;
      if (Object.keys(payload).length > 0)
        await client.patch("/organization/me", payload);
      setProfileData(draft);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setDraft(profileData);
    setIsEditing(false);
  };

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    setAppsError("");
    try {
      await client.patch(`/applications/${applicationId}/status`, { status });
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status } : a)),
      );
    } catch (err) {
      setAppsError(err.response?.data?.error?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const avatarText = initials(profileData.orgName);

  const metaItems = [
    profileData.email   && { icon: <FiMail size={12} />,      label: profileData.email },
    profileData.website && {
      icon: <FiGlobe size={12} />,
      label: profileData.website,
      href: profileData.website,
    },
  ].filter(Boolean);

  return (
    <main className="org-profile-page">
      <section className="org-profile-card">
        <div className="org-profile-banner" />

        <div className="org-profile-body">
          {/* Top row: avatar + actions */}
          <div className="org-profile-top">
            <div className="org-profile-avatar">{avatarText}</div>

            <div className="org-profile-actions">
              <button
                type="button"
                className="profile-action-btn primary"
                onClick={() => { setDraft(profileData); setIsEditing(true); }}
              >
                <FiEdit2 size={12} />
                Edit profile
              </button>
              <button
                type="button"
                className="profile-action-btn secondary"
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                <FiLogOut size={12} />
                Log out
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="org-profile-form">
              <div className="profile-form-grid">
                <label>
                  Organisation name
                  <input value={draft.orgName} onChange={(e) => updateDraft("orgName", e.target.value)} />
                </label>
                <label>
                  Work email
                  <input type="email" value={draft.email} onChange={(e) => updateDraft("email", e.target.value)} />
                </label>
                <label>
                  Website <span className="optional">(optional)</span>
                  <input value={draft.website} placeholder="https://yourcompany.com" onChange={(e) => updateDraft("website", e.target.value)} />
                </label>
              </div>

              <label className="profile-bio-field">
                About the organisation
                <textarea
                  value={draft.description}
                  onChange={(e) => updateDraft("description", e.target.value)}
                  placeholder="Describe what your organisation does, your mission, and what makes you a great place to work…"
                />
              </label>

              {error && <p className="profile-error">{error}</p>}

              <div className="profile-form-actions">
                <button type="button" className="profile-action-btn" onClick={cancelEdit} disabled={saving}>
                  <FiX size={12} /> Cancel
                </button>
                <button type="button" className="profile-action-btn primary" onClick={saveProfile} disabled={saving}>
                  <FiCheck size={12} /> {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

          ) : (
            <>
              <h1>{profileData.orgName || "Organisation Name"}</h1>

              <div className="org-profile-meta">
                {metaItems.map((item) =>
                  item.href ? (
                    <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="org-meta-link">
                      {item.icon}{item.label}
                    </a>
                  ) : (
                    <span key={item.label}>
                      {item.icon}{item.label}
                    </span>
                  )
                )}
              </div>

              {profileData.description ? <p>{profileData.description}</p> : null}
            </>
          )}
        </div>
      </section>

      <section className="org-applicants-section">
        <h2 className="org-applicants-heading">Applicants</h2>

        <nav className="org-app-status-tabs" aria-label="Status tabs">
          {STATUS_TABS.map((tab) => {
            const count = tab === "all"
              ? applications.length
              : applications.filter((a) => normalizeStatus(a.status) === tab).length;
            return (
              <button
                key={tab}
                type="button"
                className={`org-app-tab ${activeTab === tab ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tabLabel[tab]} ({count})
              </button>
            );
          })}
        </nav>

        {appsLoading ? (
          <p className="org-app-state">Loading applications...</p>
        ) : appsError ? (
          <p className="org-app-state org-app-error">{appsError}</p>
        ) : applications.length === 0 ? (
          <p className="org-app-state">No applications received yet.</p>
        ) : (
          <div className="org-app-table">
            <div className="org-app-head">
              <span>Applicant</span>
              <span>Job</span>
              <span>Date</span>
              <span>Status</span>
            </div>
            {applications
              .filter((a) => activeTab === "all" || normalizeStatus(a.status) === activeTab)
              .map((application) => {
                const applicant = application.Student?.User || {};
                const opportunity = application.Opportunity || {};
                const appliedAt = new Date(application.applied_at);
                const dateStr = Number.isNaN(appliedAt.getTime())
                  ? "-"
                  : appliedAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
                const timeStr = Number.isNaN(appliedAt.getTime())
                  ? ""
                  : appliedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                const uiStatus = normalizeStatus(application.status);

                return (
                  <div key={application.id} className="org-app-row">
                    <div className="org-app-cell">
                      <p className="org-primary">{applicant.full_name || "Unknown"}</p>
                      <p className="org-secondary">{applicant.email || ""}</p>
                    </div>
                    <div className="org-app-cell">
                      <p className="org-primary">{opportunity.title || "Untitled"}</p>
                    </div>
                    <div className="org-app-cell">
                      <p className="org-primary"><FiCalendar size={13} /> {dateStr}</p>
                      {timeStr && <p className="org-secondary"><FiClock size={13} /> {timeStr}</p>}
                    </div>
                    <div className="org-app-cell">
                      <div className={`org-status-control status-${uiStatus}`}>
                        <select
                          className="org-status-select"
                          value={uiStatus}
                          onChange={(e) => handleStatusChange(application.id, e.target.value)}
                          disabled={updatingId === application.id}
                        >
                          <option value="new">New</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>
    </main>
  );
}
