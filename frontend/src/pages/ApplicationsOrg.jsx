import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Navbar from "../components/layout/Navbar";
import { FiBriefcase, FiFilter, FiGrid } from "react-icons/fi";
import "./ApplicationsOrg.css";

const STATUS_TABS = ["all", "new", "shortlisted", "interviewed", "hired", "rejected"];
const OPPORTUNITY_TYPES = [
  { value: "all", label: "All types" },
  { value: "internship", label: "Internship" },
  { value: "job", label: "Job" },
  { value: "scholarship", label: "Scholarship" },
  { value: "volunteer", label: "Volunteer" },
  { value: "competition", label: "Competition" },
];

const tabLabel = {
  all: "All",
  new: "New",
  shortlisted: "Shortlisted",
  interviewed: "Interviewed",
  hired: "Hired",
  rejected: "Rejected",
};

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "clicked" || value === "new") return "new";
  if (value === "shortlisted") return "shortlisted";
  if (value === "in_review" || value === "interviewed") return "interviewed";
  if (value === "accepted" || value === "hired") return "hired";
  if (value === "rejected") return "rejected";
  return "new";
}

function getInitials(name) {
  if (!name) return "NA";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getAvatarClass(index) {
  const themes = ["avatar-a", "avatar-b", "avatar-c", "avatar-d", "avatar-e"];
  return themes[index % themes.length];
}

export default function ApplicationsOrg() {
  const { user, loading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    if (user?.role !== "organization") return;

    setPageLoading(true);
    setError("");
    client
      .get("/applications/received")
      .then((res) => setApplications(res.data?.data || []))
      .catch((err) => {
        setError(err.response?.data?.error?.message || "Unable to load applications.");
      })
      .finally(() => setPageLoading(false));
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!showFilter) return;
      if (!filterRef.current) return;
      if (filterRef.current.contains(event.target)) return;
      setShowFilter(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showFilter]);

  const totalApplications = applications.length;

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "organization") return <Navigate to="/opportunities" replace />;

  const normalizedRows = applications.map((application) => {
    const normalized = normalizeStatus(application.status);
    return {
      ...application,
      uiStatus: normalized,
      uiStatusLabel: tabLabel[normalized],
    };
  });

  const tabCount = (tab) => {
    if (tab === "all") return normalizedRows.length;
    return normalizedRows.filter((row) => row.uiStatus === tab).length;
  };

  const filteredRows = normalizedRows.filter((row) => {
    if (activeTab !== "all" && row.uiStatus !== activeTab) return false;
    if (typeFilter !== "all" && (row.Opportunity?.type || "").toLowerCase() !== typeFilter)
      return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <main className="org-applications-page">
        <div className="org-applications-shell">
          <section className="org-app-toolbar">
            <nav className="org-app-tabs" aria-label="Application status tabs">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`org-app-tab ${activeTab === tab ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tabLabel[tab]} ({tabCount(tab)})
                </button>
              ))}
            </nav>

            <div className="org-applications-actions" ref={filterRef}>
              <button
                type="button"
                className="org-filter-btn"
                onClick={() => setShowFilter((prev) => !prev)}
              >
                <FiFilter size={16} />
                Filter
              </button>
              {showFilter && (
                <div className="org-filter-panel">
                  <label htmlFor="jobTypeFilter">Opportunity type</label>
                  <select
                    id="jobTypeFilter"
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setShowFilter(false);
                    }}
                  >
                    {OPPORTUNITY_TYPES.map((typeOption) => (
                      <option key={typeOption.value} value={typeOption.value}>
                        {typeOption.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          {pageLoading ? (
            <div className="org-applications-state">Loading applications...</div>
          ) : error ? (
            <div className="org-applications-state org-applications-error">{error}</div>
          ) : totalApplications === 0 ? (
            <div className="org-applications-state">
              No one has applied yet. Applications will appear here when job seekers click apply.
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="org-applications-state">No applications match the current filters.</div>
          ) : (
            <section className="org-applications-table-wrap">
              <div className="org-applications-head">
                <span>Applicant</span>
                <span>Job Applied</span>
                <span>Submitted On</span>
                <span>Status</span>
              </div>

              <div className="org-applications-list">
                {filteredRows.map((application, index) => {
                const applicant = application.Student?.User || {};
                const studentProfile = application.Student || {};
                const opportunity = application.Opportunity || {};
                const appliedAt = new Date(application.applied_at);
                const dateLine = Number.isNaN(appliedAt.getTime())
                  ? "-"
                  : appliedAt.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                const timeLine = Number.isNaN(appliedAt.getTime())
                  ? ""
                  : appliedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                return (
                  <article key={application.id} className="org-applications-row">
                    <div className="org-col applicant-col">
                      <span className={`org-avatar ${getAvatarClass(index)}`}>
                        {getInitials(applicant.full_name)}
                      </span>
                      <div>
                        <p className="org-primary">{applicant.full_name || "Unknown name"}</p>
                        <p className="org-secondary">{applicant.email || "No email"}</p>
                        <p className="org-secondary">
                          {studentProfile.phone_number || studentProfile.university || "No phone listed"}
                        </p>
                      </div>
                    </div>

                    <div className="org-col job-col">
                      <p className="org-primary">{opportunity.title || "Untitled opportunity"}</p>
                      <p className="org-meta-line">
                        <FiBriefcase size={13} />
                        {(opportunity.type || "opportunity").replace("_", " ")}
                      </p>
                      <p className="org-meta-line">
                        <FiGrid size={13} />
                        {opportunity.category?.name || "Uncategorized"}
                      </p>
                    </div>

                    <div className="org-col date-col">
                      <p className="org-primary">{dateLine}</p>
                      <p className="org-secondary">{timeLine}</p>
                    </div>

                    <div className="org-col status-col">
                      <span className={`org-status-badge status-${application.uiStatus}`}>
                        {application.uiStatusLabel}
                      </span>
                    </div>
                  </article>
                );
              })}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
