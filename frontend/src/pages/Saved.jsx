import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBookmark } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Navbar from "../components/layout/Navbar";
import InlineApplyModal from "../components/apply/InlineApplyModal";
import "./Saved.css";
import "./Opportunities.css";

const Categories = [
  "All",
  "Internship",
  "Scholarship",
  "Job",
  "Volunteer",
  "Competition",
];

function getOpportunityId(item) {
  return item?.opportunity_id ?? item?.id;
}

function getOpportunity(item) {
  return item?.opportunity || item?.Opportunity || item;
}

function getOrganizationName(opportunity) {
  return (
    opportunity?.organization?.org_name ||
    opportunity?.Organization?.org_name ||
    "Organization"
  );
}

function getCategoryName(opportunity) {
  return opportunity?.category?.name || opportunity?.Category?.name || "";
}

function getDeadlineTime(item) {
  const source = item?.deadline ?? item?.opportunity?.deadline;
  if (!source) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(source).getTime();
  if (Number.isNaN(timestamp)) return Number.POSITIVE_INFINITY;
  return timestamp;
}

function sortByNearestDeadline(list) {
  return [...list].sort((a, b) => getDeadlineTime(a) - getDeadlineTime(b));
}

function formatDeadline(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Saved() {
  const { user } = useAuth();
  // Stores the full bookmarked opportunity objects
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [applyingOpportunity, setApplyingOpportunity] = useState(null);

  //Fetch bookmarks on mount - only for logged-in students
  useEffect(() => {
    client
      .get("/bookmarks")
      .then((res) => setBookmarks(sortByNearestDeadline(res.data.data || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const removeBookmark = async (oppId) => {
    if (!oppId) return;
    try {
      await client.delete(`/bookmarks/${oppId}`);
      setBookmarks((prev) =>
        sortByNearestDeadline(prev.filter((item) => getOpportunityId(item) !== oppId)),
      );
    } catch {
      // Ignore request errors and keep current UI state.
    }
  };

  const closingIn = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24),
    );
    if (days < 0) return "Closed";
    if (days === 0) return "Due today";
    if (days === 1) return "1 day left";
    return `${days} days left`;
  };

  const handleSearch = () => {
    setSubmittedSearch(search.trim());
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const opportunity = getOpportunity(b);
    const type = (opportunity?.type || "").toLowerCase();
    const matchesType =
      activeFilter === "All" || type === activeFilter.toLowerCase();

    const normalized = submittedSearch.toLowerCase();
    const matchesSearch =
      !normalized ||
      opportunity?.title?.toLowerCase().includes(normalized) ||
      getOrganizationName(opportunity).toLowerCase().includes(normalized) ||
      opportunity?.location?.toLowerCase().includes(normalized) ||
      getCategoryName(opportunity).toLowerCase().includes(normalized);

    return matchesType && matchesSearch;
  });

  const openApplyModal = (opportunity) => {
    if (!user || user.role !== "student") return;

    setApplyingOpportunity({
      ...opportunity,
      id: opportunity?.id || opportunity?.opportunity_id,
    });
  };

  if (loading)
    return (
      <>
        <Navbar />{" "}
        <main style={{ padding: "2rem", textAlign: "center" }}>
          Loading…
        </main>{" "}
      </>
    );

  return (
    <>
      <Navbar />
      <main className="saved-page">
        <div className="saved-inner">
          {bookmarks.length === 0 ? (
            <div className="saved-empty">
              <p>No opportunities saved.</p>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <>
              <div className="opp-search-bar">
                <div className="opp-search-input-wrap">
                  <svg
                    className="opp-search-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    className="opp-search-input"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <span className="opp-search-divider" />
                <div className="opp-location-picker">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Phnom Penh</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <button className="opp-search-btn" type="button" onClick={handleSearch}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  Search
                </button>
              </div>

              <div className="opp-filters">
                {Categories.map((cat) => (
                  <button
                    key={cat}
                    className={`opp-filter-pill ${activeFilter === cat ? "active" : ""}`}
                    onClick={() => handleFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <p className="saved-empty">No saved opportunities matched your filters.</p>
            </>
          ) : (
            <>
              <div className="opp-search-bar">
                <div className="opp-search-input-wrap">
                  <svg
                    className="opp-search-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    className="opp-search-input"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <span className="opp-search-divider" />
                <div className="opp-location-picker">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Phnom Penh</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
                <button className="opp-search-btn" type="button" onClick={handleSearch}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  Search
                </button>
              </div>

              <div className="opp-filters">
                {Categories.map((cat) => (
                  <button
                    key={cat}
                    className={`opp-filter-pill ${activeFilter === cat ? "active" : ""}`}
                    onClick={() => handleFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="saved-list">
                {filteredBookmarks.map((b) => {
                  const oppId = getOpportunityId(b);
                  const opportunity = getOpportunity(b);
                  const deadline = opportunity?.deadline;
                  return (
                    <article key={oppId || b.id} className="saved-card">
                      <div className="saved-main">
                        <h3 className="saved-title">{opportunity?.title || "Untitled opportunity"}</h3>
                        <p className="saved-company-line">
                          {getOrganizationName(opportunity)}
                          <span className="saved-dot">•</span>
                          {opportunity?.location || "Remote"}
                        </p>

                        <div className="saved-actions">
                          <Link to={`/opportunities/${oppId}`} className="saved-btn secondary">
                            Details
                          </Link>
                          <button
                            type="button"
                            className="saved-btn primary"
                            onClick={() => openApplyModal(opportunity)}
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>

                      <div className="saved-side">
                        <div className="saved-side-top">
                          <button
                            type="button"
                            className="saved-unsave-btn"
                            onClick={() => removeBookmark(oppId)}
                            aria-label="Unsave opportunity"
                            title="Unsave"
                          >
                            <FiBookmark size={16} />
                          </button>
                        </div>

                        <div className="saved-deadline">
                          <p className="saved-deadline-label">Deadline</p>
                          <p className="saved-deadline-date">{formatDeadline(deadline)}</p>
                          {deadline && (
                            <span className="saved-deadline-badge">{closingIn(deadline)}</span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <InlineApplyModal
        open={Boolean(applyingOpportunity)}
        opportunity={applyingOpportunity}
        onClose={() => setApplyingOpportunity(null)}
      />
    </>
  );
}
