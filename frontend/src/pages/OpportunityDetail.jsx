import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Navbar from "../components/layout/Navbar";
import "../components/layout/Navbar.css";
import "./OpportunityDetail.css";

const iconMap = {
  internship: "\uD83C\uDFE2",
  scholarship: "\uD83C\uDF93",
  job: "\uD83C\uDFE2",
  volunteer: "\uD83E\uDD1D",
  competition: "\uD83C\uDFC6",
};

const closingIn = (deadline) => {
  if (!deadline) return null;
  const days = Math.ceil(
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0) return "Closed";
  if (days === 1) return "Closes in 1 day";
  return `Closes in ${days} days`;
};

const OpportunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    client
      .get(`/opportunities/${id}`)
      .then((res) => setOpp(res.data))
      .catch(() => setOpp(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === "student") {
      client
        .get("/bookmarks")
        .then((res) => {
          if (res.data.data.some((b) => b.opportunity_id === id)) setSaved(true);
        })
        .catch(() => {});
    }
  }, [user, id]);

  const toggleBookmark = async () => {
    if (!user) return;
    if (saved) {
      await client.delete(`/bookmarks/${id}`);
      setSaved(false);
    } else {
      await client.post("/bookmarks", { opportunity_id: id });
      setSaved(true);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="detail-page"><div className="detail-loading">Loading\u2026</div></main>
      </>
    );
  }

  if (!opp) {
    return (
      <>
        <Navbar />
        <main className="detail-page">
          <div className="detail-notfound">
            <h1>Opportunity not found</h1>
            <Link to="/opportunities" className="detail-back-link">\u2190 Browse all opportunities</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="detail-page">
        <div className="detail-inner">
          <Link to="/opportunities" className="detail-back">\u2190 Back to opportunities</Link>

          <div className="detail-header">
            <div className="detail-header-top">
              <div className="detail-type-badge">
                {iconMap[opp.type]} {opp.type?.charAt(0).toUpperCase() + opp.type?.slice(1)}
              </div>
              {opp.deadline && (
                <span className="detail-deadline">{closingIn(opp.deadline)}</span>
              )}
            </div>
            <h1 className="detail-title">{opp.title}</h1>
            <div className="detail-meta">
              <div className="detail-org">
                <div className="detail-org-avatar">{opp.organization?.org_name?.[0]?.toUpperCase() || "?"}</div>
                <div>
                  <p className="detail-org-name">{opp.organization?.org_name}</p>
                  <p className="detail-org-location">{opp.location || "Remote"}</p>
                </div>
              </div>
              <div className="detail-header-actions">
                <button className="detail-apply-btn">Apply now \u2192</button>
                <button
                  className={`detail-save-btn ${saved ? "saved" : ""}`}
                  onClick={toggleBookmark}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "#2563eb" : "none"} stroke={saved ? "#2563eb" : "#94a3b8"} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  {saved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </div>

          <div className="detail-body">
            <section className="detail-section">
              <h2>About this opportunity</h2>
              <p className="detail-description">{opp.description}</p>
            </section>

            <aside className="detail-sidebar">
              <div className="detail-sidebar-card">
                <h3>Details</h3>
                <dl className="detail-dl">
                  <dt>Category</dt>
                  <dd>{opp.category?.name}</dd>
                  <dt>Location</dt>
                  <dd>{opp.location || "Remote"}</dd>
                  <dt>Deadline</dt>
                  <dd>{opp.deadline || "Open"}</dd>
                  <dt>Status</dt>
                  <dd>{opp.status}</dd>
                  <dt>Organization</dt>
                  <dd>{opp.organization?.org_name}</dd>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
};

export default OpportunityDetail;
