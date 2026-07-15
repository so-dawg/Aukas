import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Navbar from "../components/layout/Navbar";
import "../components/layout/Navbar.css";
import "./MyApplications.css";

const toLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "Opportunity";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const normalizeStage = (status) => {
  const value = String(status || "").toLowerCase();
  if (value === "clicked" || value === "new") return "new";
  if (value === "shortlisted") return "shortlisted";
  if (value === "in_review" || value === "interviewed") return "interviewed";
  if (value === "accepted" || value === "hired") return "hired";
  if (value === "rejected") return "rejected";
  return "new";
};

const stageLabel = {
  new: "New",
  shortlisted: "Shortlisted",
  interviewed: "Interviewed",
  hired: "Hired",
  rejected: "Rejected",
};

export default function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    client
      .get("/applications/me")
      .then((res) => setApplications(res.data.data || []))
      .catch((err) => {
        setError(err.response?.data?.error?.message || "Unable to load applications.");
      })
      .finally(() => setLoading(false));
  }, []);

  const appliedCount = applications.length;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "organization") return <Navigate to="/applications" replace />;
  if (user.role !== "student") return <Navigate to="/opportunities" replace />;

  return (
    <>
      <Navbar />
      <main className="applications-page">
        <div className="applications-inner">
          <header className="applications-header">
            <div className="applications-header-left">
              <div className="applications-stats">
                <span>{appliedCount.toLocaleString()} applications</span>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="applications-loading">Loading your applications...</div>
          ) : error ? (
            <div className="applications-error">{error}</div>
          ) : appliedCount === 0 ? (
            <div className="applications-empty">
              <h2>No applications yet</h2>
              <p>
                When you apply to opportunities, they will appear here along with updates from organizations.
              </p>
              <Link to="/opportunities" className="applications-empty-btn">
                Browse opportunities
              </Link>
            </div>
          ) : (
            <div className="applications-list">
              {applications.map((application) => {
                const opportunity = application.Opportunity || {};
                const organization = opportunity.Organization || {};
                const categoryName =
                  opportunity.Category?.name ||
                  opportunity.category?.name ||
                  "Uncategorized";
                const categoryOrLocation =
                  categoryName === "Uncategorized"
                    ? opportunity.location || "Remote"
                    : categoryName;
                const stage = normalizeStage(application.status);
                const appliedDate = new Date(application.applied_at).toLocaleDateString();
                const deadlineText = opportunity.deadline
                  ? `Deadline ${new Date(opportunity.deadline).toLocaleDateString()}`
                  : "No deadline";

                return (
                  <article key={application.id} className="applications-card">
                    <div className="applications-card-main">
                      <div className="applications-card-top">
                        <span className="applications-type">
                          {toLabel(opportunity.type || categoryName || "Opportunity")}
                        </span>
                      </div>
                      <h2 className="applications-card-title">
                        <Link to={`/opportunities/${opportunity.id}`}>{opportunity.title || "Untitled opportunity"}</Link>
                      </h2>
                      <p className="applications-card-meta">
                        {organization.org_name || "Unknown organization"} · {categoryOrLocation}
                      </p>
                      <div className="applications-card-details">
                        <span>Applied {appliedDate}</span>
                        <span>{deadlineText}</span>
                      </div>
                    </div>
                    <div className="applications-card-action">
                      <span className={`applications-stage-badge stage-${stage}`}>
                        {stageLabel[stage] || "New"}
                      </span>
                      <button
                        type="button"
                        className="applications-view-link"
                        onClick={() => {
                          if (opportunity.id) {
                            navigate(`/opportunities/${opportunity.id}`, {
                              state: { fromMyApplications: true },
                            });
                          }
                        }}
                        disabled={!opportunity.id}
                      >
                        Details
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
