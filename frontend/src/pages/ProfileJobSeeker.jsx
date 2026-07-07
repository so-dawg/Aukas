import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import client from "../api/client";
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

export default function ProfileJobSeeker() {
  const { user } = useAuth();
  const profile = user?.student_profile || user?.profile || {};
  const initialName = useMemo(
    () => splitName(user?.full_name),
    [user?.full_name],
  );

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: initialName.firstName,
    lastName: initialName.lastName,
    yearOfStudy: profile.year_of_study || "",
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

  const metaItems = [
    profileData.yearOfStudy && {
      icon: <FiUser size={12} />,
      label: `Year ${profileData.yearOfStudy}`,
    },
    profileData.email && {
      icon: <FiMail size={12} />,
      label: profileData.email,
    },
  ].filter(Boolean);

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      const newFullName = fullNameFrom(draft);
      const userPayload = {};
      if (newFullName !== user?.full_name) userPayload.full_name = newFullName;
      if (draft.email !== user?.email) userPayload.email = draft.email;
      if (Object.keys(userPayload).length > 0)
        await client.patch("/users/me", userPayload);

      const studentPayload = {};
      if (draft.university !== profile.university)
        studentPayload.university = draft.university;
      if (draft.major !== profile.major) studentPayload.major = draft.major;
      if (draft.yearOfStudy !== (profile.year_of_study?.toString() || ""))
        studentPayload.year_of_study = parseInt(draft.yearOfStudy, 10);
      if (Object.keys(studentPayload).length > 0)
        await client.patch("/students/me", studentPayload);

      setProfileData(draft);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setDraft(profileData);
    setIsEditing(false);
    setError(null);
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
              <Link to="/my-applications" className="profile-action-btn secondary">
                <FiBookOpen size={12} />
                My applications
              </Link>
            </div>
          </div>

          {isEditing ? (
            <div className="jobseeker-profile-form">
              <div className="profile-form-grid">
                <label>
                  First name
                  <input
                    value={draft.firstName}
                    onChange={(event) =>
                      updateDraft("firstName", event.target.value)
                    }
                  />
                </label>
                <label>
                  Last name
                  <input
                    value={draft.lastName}
                    onChange={(event) =>
                      updateDraft("lastName", event.target.value)
                    }
                  />
                </label>
                <label>
                  Year of study
                  <select
                    value={draft.yearOfStudy}
                    onChange={(event) =>
                      updateDraft("yearOfStudy", event.target.value)
                    }
                  >
                    <option value="">Select year</option>
                    {[1, 2, 3, 4, 5, 6].map((y) => (
                      <option key={y} value={y}>
                        Year {y}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  University
                  <input
                    value={draft.university}
                    onChange={(event) =>
                      updateDraft("university", event.target.value)
                    }
                  />
                </label>
                <label>
                  Major
                  <input
                    value={draft.major}
                    onChange={(event) =>
                      updateDraft("major", event.target.value)
                    }
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(event) =>
                      updateDraft("email", event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-action-btn"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  <FiX size={12} />
                  Cancel
                </button>
                <button
                  type="button"
                  className="profile-action-btn primary"
                  onClick={saveProfile}
                  disabled={saving}
                >
                  <FiCheck size={12} />
                  {saving ? "Saving..." : "Save"}
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
            </>
          )}
        </div>
      </section>
    </main>
  );
}
