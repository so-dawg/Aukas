import { useMemo, useState } from "react";
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
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
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
  const { user } = useAuth();
  const profile = user?.organisation_profile || user?.profile || {};

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    orgName:     profile.org_name     || profile.orgName     || "",
    email:       user?.email          || profile.email       || "",
    industry:    profile.industry     || "",
    companySize: profile.company_size || profile.companySize || "",
    website:     profile.website      || "",
    phone:       profile.phone        || "",
    city:        profile.city         || "",
    linkedin:    profile.linkedin     || "",
    description: profile.description  || "",
  });
  const [draft, setDraft] = useState(profileData);

  const updateDraft = (key, value) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const saveProfile = () => {
    setProfileData(draft);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraft(profileData);
    setIsEditing(false);
  };

  const avatarText = initials(profileData.orgName);

  const metaItems = [
    profileData.industry    && { icon: <FiBriefcase size={12} />, label: profileData.industry },
    profileData.companySize && { icon: <FiUsers size={12} />,     label: `${profileData.companySize} employees` },
    profileData.city        && { icon: <FiMapPin size={12} />,    label: profileData.city },
    profileData.email       && { icon: <FiMail size={12} />,      label: profileData.email },
    profileData.phone       && { icon: <FiPhone size={12} />,     label: profileData.phone },
    profileData.website     && {
      icon: <FiGlobe size={12} />,
      label: profileData.website,
      href: profileData.website,
    },
    profileData.linkedin    && {
      icon: <FiLinkedin size={12} />,
      label: profileData.linkedin,
      href: profileData.linkedin,
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
                  Industry
                  <select value={draft.industry} onChange={(e) => updateDraft("industry", e.target.value)}>
                    <option value="">Select industry</option>
                    <option>Technology</option>
                    <option>Finance & Banking</option>
                    <option>Education</option>
                    <option>Healthcare</option>
                    <option>NGO / Non-profit</option>
                    <option>Retail & E-commerce</option>
                    <option>Media & Communications</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  Company size
                  <select value={draft.companySize} onChange={(e) => updateDraft("companySize", e.target.value)}>
                    <option value="">Number of employees</option>
                    <option>1 – 10</option>
                    <option>11 – 50</option>
                    <option>51 – 200</option>
                    <option>201 – 500</option>
                    <option>500+</option>
                  </select>
                </label>
                <label>
                  City
                  <input value={draft.city} placeholder="e.g. Phnom Penh" onChange={(e) => updateDraft("city", e.target.value)} />
                </label>
                <label>
                  Phone <span className="optional">(optional)</span>
                  <input type="tel" value={draft.phone} placeholder="+855 12 345 678" onChange={(e) => updateDraft("phone", e.target.value)} />
                </label>
                <label>
                  Website <span className="optional">(optional)</span>
                  <input value={draft.website} placeholder="https://yourcompany.com" onChange={(e) => updateDraft("website", e.target.value)} />
                </label>
                <label>
                  LinkedIn <span className="optional">(optional)</span>
                  <input value={draft.linkedin} placeholder="linkedin.com/company/you" onChange={(e) => updateDraft("linkedin", e.target.value)} />
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

              <div className="profile-form-actions">
                <button type="button" className="profile-action-btn" onClick={cancelEdit}>
                  <FiX size={12} /> Cancel
                </button>
                <button type="button" className="profile-action-btn primary" onClick={saveProfile}>
                  <FiCheck size={12} /> Save
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

              <p>
                {profileData.description ||
                  'No description yet. Click "Edit profile" to add information about your organisation.'}
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}