import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBriefcase,
  FiCheck,
  FiEdit2,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUsers,
  FiX,
  FiLinkedin,
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
    </main>
  );
}
