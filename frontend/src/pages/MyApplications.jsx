import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Navbar from "../components/layout/Navbar";
import "../components/layout/Navbar.css";
import "./MyApplications.css";

const statusLabel = {
  clicked: "Applied",
  in_review: "In review",
  accepted: "Accepted",
  rejected: "Rejected",
};

const statusClass = {
  clicked: "status-clicked",
  in_review: "status-review",
  accepted: "status-accepted",
  rejected: "status-rejected",
};

export default function MyApplications() {
  const { user } = useAuth();
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

  return (
    <>
      <Navbar />
      <main className="applications-page">
        <div className="applications-inner">
          <header className="applications-header">
            <div>
              <h1 className="applications-title">My Applications</h1>
              <p className="applications-subtitle">
                {user?.full_name
                  ? `Hi ${user.full_name.split(" ")[0]}, here are the opportunities you have applied for.`
                  : "View the status updates from organizations for each opportunity."}
              </p>
            </div>
            <div className="applications-stats">
              <span>{appliedCount.toLocaleString()} applications</span>
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
                const appliedDate = new Date(application.applied_at).toLocaleDateString();
                const deadlineText = opportunity.deadline
                  ? `Deadline ${new Date(opportunity.deadline).toLocaleDateString()}`
                  : "No deadline";

                return (
                  <article key={application.id} className="applications-card">
                    <div className="applications-card-main">
                      <div className="applications-card-top">
                        <span className={`applications-status ${statusClass[application.status] || "status-clicked"}`}>
                          {statusLabel[application.status] || application.status}
                        </span>
                        <span className="applications-type">{(opportunity.type || "Opportunity").toUpperCase()}</span>
                      </div>
                      <h2 className="applications-card-title">
                        <Link to={`/opportunities/${opportunity.id}`}>{opportunity.title || "Untitled opportunity"}</Link>
                      </h2>
                      <p className="applications-card-meta">
                        {organization.org_name || "Unknown organization"} · {opportunity.category?.name || "Uncategorized"}
                      </p>
                      <div className="applications-card-details">
                        <span>Applied {appliedDate}</span>
                        <span>{deadlineText}</span>
                      </div>
                    </div>
                    <div className="applications-card-action">
                      <Link to={`/opportunities/${opportunity.id}`} className="applications-view-link">
                        View details
                      </Link>
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
