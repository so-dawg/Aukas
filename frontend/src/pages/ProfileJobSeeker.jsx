import { useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiEdit2,
  FiMail,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./ProfileJobSeeker.css";

const splitName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

const fullNameFrom = ({ firstName, lastName }) =>
  [firstName, lastName].filter(Boolean).join(" ").trim() || "Student";

const yearFromDob = (dob) => {
  if (!dob) return "";
  const birthYear = new Date(dob).getFullYear();
  if (!Number.isFinite(birthYear)) return "";
  return `Year ${new Date().getFullYear() - birthYear - 17}`;
};

export default function ProfileJobSeeker() {
  const { user } = useAuth();
  const profile = user?.student_profile || user?.profile || {};
  const initialName = useMemo(() => splitName(user?.full_name), [user?.full_name]);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: initialName.firstName,
    lastName: initialName.lastName,
    dob: profile.date_of_birth || profile.dob || "",
    university: profile.university || "",
    major: profile.major || "",
    email: user?.email || "",
    bio: user?.bio || "",
  });
  const [draft, setDraft] = useState(profileData);

  const displayName = fullNameFrom(profileData);
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const yearLabel = yearFromDob(profileData.dob);
  const bio =
    profileData.bio ||
    "Computer Science student interested in product engineering and design.";

  const metaItems = [
    yearLabel && { icon: <FiUser size={12} />, label: yearLabel },
    profileData.major && { icon: <FiBookOpen size={12} />, label: profileData.major },
    profileData.university && { icon: <FiBookOpen size={12} />, label: profileData.university },
    profileData.email && { icon: <FiMail size={12} />, label: profileData.email },
  ].filter(Boolean);

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = () => {
    setProfileData(draft);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraft(profileData);
    setIsEditing(false);
  };

  return (
    <main className="jobseeker-profile-page">
      <section className="jobseeker-profile-card">
        <div className="jobseeker-profile-banner" />

        <div className="jobseeker-profile-body">
          <div className="jobseeker-profile-top">
            <div className="jobseeker-profile-avatar">{initials}</div>

            <div className="jobseeker-profile-actions">
              <button
                type="button"
                className="profile-action-btn primary"
                onClick={() => {
                  setDraft(profileData);
                  setIsEditing(true);
                }}
              >
                <FiEdit2 size={12} />
                Edit profile
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="jobseeker-profile-form">
              <div className="profile-form-grid">
                <label>
                  First name
                  <input
                    value={draft.firstName}
                    onChange={(event) => updateDraft("firstName", event.target.value)}
                  />
                </label>
                <label>
                  Last name
                  <input
                    value={draft.lastName}
                    onChange={(event) => updateDraft("lastName", event.target.value)}
                  />
                </label>
                <label>
                  Date of birth
                  <input
                    type="date"
                    value={draft.dob}
                    onChange={(event) => updateDraft("dob", event.target.value)}
                  />
                </label>
                <label>
                  University
                  <input
                    value={draft.university}
                    onChange={(event) => updateDraft("university", event.target.value)}
                  />
                </label>
                <label>
                  Major
                  <input
                    value={draft.major}
                    onChange={(event) => updateDraft("major", event.target.value)}
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(event) => updateDraft("email", event.target.value)}
                  />
                </label>
              </div>

              <label className="profile-bio-field">
                Bio
                <textarea
                  value={draft.bio}
                  onChange={(event) => updateDraft("bio", event.target.value)}
                  placeholder="Write a short profile summary."
                />
              </label>

              <div className="profile-form-actions">
                <button type="button" className="profile-action-btn" onClick={cancelEdit}>
                  <FiX size={12} />
                  Cancel
                </button>
                <button type="button" className="profile-action-btn primary" onClick={saveProfile}>
                  <FiCheck size={12} />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1>{displayName}</h1>
              <div className="jobseeker-profile-meta">
                {metaItems.map((item) => (
                  <span key={item.label}>
                    {item.icon}
                    {item.label}
                  </span>
                ))}
              </div>
              <p>{bio}</p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
