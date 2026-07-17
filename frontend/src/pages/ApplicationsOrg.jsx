import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { FiBriefcase, FiCalendar, FiClock, FiFilter, FiGrid, FiPhone } from "react-icons/fi";
import "./ApplicationsOrg.css";

const STATUS_TABS = ["all", "new", "interviewed", "hired", "rejected"];
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
  interviewed: "Interviewed",
  hired: "Hired",
  rejected: "Rejected",
};

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "clicked" || value === "new") return "new";
  if (value === "in_review" || value === "interviewed") return "interviewed";
  if (value === "shortlisted") return "interviewed";
  if (value === "accepted" || value === "hired") return "hired";
  if (value === "rejected") return "rejected";
  return "new";
}

export default function ApplicationsOrg() {
  const { user, loading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
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

  const handleStatusChange = async (applicationId, uiStatus) => {
    setUpdatingStatusId(applicationId);
    setError("");

    try {
      const { data } = await client.patch(`/applications/${applicationId}/status`, {
        status: uiStatus,
      });

      const nextStatus = data?.data?.status || uiStatus;
      setApplications((prev) =>
        prev.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: nextStatus,
              }
            : application,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.error?.message || "Unable to update application status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

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
                {filteredRows.map((application) => {
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
                      <div>
                        {applicant.full_name && (
                          <p className="org-primary">{applicant.full_name}</p>
                        )}
                        {applicant.email && (
                          <p className="org-secondary">{applicant.email}</p>
                        )}
                        {studentProfile.phone_number && (
                          <p className="org-secondary org-secondary-icon">
                            <FiPhone size={13} />
                            {studentProfile.phone_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="org-col job-col">
                      <p className="org-primary">{opportunity.title || "Untitled opportunity"}</p>
                      <p className="org-meta-line">
                        <FiBriefcase size={13} />
                        {(opportunity.type || "opportunity").replace("_", " ")}
                      </p>
                      {opportunity.category?.name && (
                        <p className="org-meta-line">
                          <FiGrid size={13} />
                          {opportunity.category.name}
                        </p>
                      )}
                    </div>

                    <div className="org-col date-col">
                      <p className="org-primary org-primary-icon">
                        <FiCalendar size={14} />
                        {dateLine}
                      </p>
                      <p className="org-secondary org-secondary-icon">
                        <FiClock size={14} />
                        {timeLine}
                      </p>
                    </div>

                    <div className="org-col status-col">
                      <div className={`org-status-control status-${application.uiStatus}`}>
                        <select
                          className="org-status-select"
                          value={application.uiStatus}
                          onChange={(e) => handleStatusChange(application.id, e.target.value)}
                          disabled={updatingStatusId === application.id}
                          aria-label="Application status"
                        >
                          <option value="new">New</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </article>
                );
              })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
