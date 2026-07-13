import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBookmark } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Navbar from "../components/layout/Navbar";
import InlineApplyModal from "../components/apply/InlineApplyModal";
import "../components/layout/Navbar.css";
import "./Opportunities.css";

const formatCompensation = (type) => {
  const map = {
    internship: "$400/mo",
    scholarship: "$24,000/yr",
    job: "$650/mo",
    volunteer: "Transport covered",
    competition: "$5,000 prize pool",
  };
  return map[type] || "";
};

const getOrganizationName = (opp) => {
  return (
    opp?.organization?.org_name ||
    opp?.Organization?.org_name ||
    opp?.org_name ||
    "Organization"
  );
};

const parseOpportunityMeta = (description) => {
  if (typeof description !== "string") {
    return { salary: "", jobType: "", pax: "" };
  }

  return {
    pax: (description.match(/Pax:\s*(.+?)(\n|$)/)?.[1] || "").trim(),
    jobType: (description.match(/Job Type:\s*(.+?)(\n|$)/)?.[1] || "").trim(),
    salary: (description.match(/Salary:\s*(.+?)(\n|$)/)?.[1] || "").trim(),
  };
};

const Categories = [
  "All",
  "Internship",
  "Scholarship",
  "Job",
  "Volunteer",
  "Competition",
];

const INITIAL_VISIBLE = 8;
const LOAD_STEP = 8;

const Opportunities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [bookmarks, setBookmarks] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [applyingOpportunity, setApplyingOpportunity] = useState(null);

  const fetchList = async (filters = {}) => {
    const params = { limit: 100, sort: "newest", ...filters };
    if (!params.type) delete params.type;
    const { data } = await client.get("/opportunities", { params });
    setOpportunities(data.data);
    setVisibleCount(INITIAL_VISIBLE);
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (user?.role === "student") {
      client
        .get("/bookmarks")
        .then((res) => {
          setBookmarks(new Set((res.data.data || []).map((b) => b.opportunity_id ?? b.id)));
        })
        .catch(() => {});
    }
  }, [user]);

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    const type = filter === "All" ? "" : filter.toLowerCase();
    fetchList({ type, q: search || undefined });
  };

  const handleSearch = () => {
    const type = activeFilter === "All" ? "" : activeFilter.toLowerCase();
    fetchList({ q: search || undefined, type: type || undefined });
  };

  const toggleBookmark = async (oppId) => {
    if (!user) return;
    if (bookmarks.has(oppId)) {
      await client.delete(`/bookmarks/${oppId}`);
      setBookmarks((prev) => {
        const next = new Set(prev);
        next.delete(oppId);
        return next;
      });
      return;
    }

    await client.post("/bookmarks", { opportunity_id: oppId });
    setBookmarks((prev) => new Set(prev).add(oppId));
  };

  const profileTags = user
    ? [
        ...(user.student_profile?.year_of_study
          ? [`Year ${user.student_profile.year_of_study}`]
          : []),
        ...(user.student_profile?.major ? [user.student_profile.major] : []),
        ...(user.student_profile?.university
          ? [user.student_profile.university]
          : []),
      ]
    : [];

  const visibleOpportunities = opportunities.slice(0, visibleCount);
  const hasMore = visibleCount < opportunities.length;

  const openApplyModal = (opp) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "student") return;
    setApplyingOpportunity(opp);
  };

  return (
    <>
      <Navbar />
      <main className="opp-page">
        <div className="opp-inner">
          {/* ── Header ── */}
          <div className="opp-header">
            <div>
              {profileTags.length > 0 && (
                <p className="opp-context">{profileTags.join(" · ")}</p>
              )}
            </div>
          </div>

          {/* ── Search bar ── */}
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
                placeholder="Search marketing internships, ASEAN scholarships"
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
            <button className="opp-search-btn" onClick={handleSearch}>
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

          {/* ── Filter pills ── */}
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

          {/* ── Card grid ── */}
          <div className="opp-grid">
            {visibleOpportunities.map((opp) => (
              <article
                key={opp.id}
                className="opp-card"
                onClick={() => navigate(`/opportunities/${opp.id}`)}
              >
                <div className="opp-card-top">
                  <h3 className="opp-card-title">{opp.title}</h3>
                  <button
                    type="button"
                    className={`opp-card-bookmark ${bookmarks.has(opp.id) ? "saved" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(opp.id);
                    }}
                    aria-label={bookmarks.has(opp.id) ? "Unsave opportunity" : "Save opportunity"}
                  >
                    <FiBookmark size={16} color={bookmarks.has(opp.id) ? "#2563eb" : "#64748b"} />
                  </button>
                </div>

                <p className="opp-card-company-line">
                  {getOrganizationName(opp)}
                  <span className="opp-card-dot">•</span>
                  {opp.location || "Remote"}
                </p>

                <div className="opp-card-divider" />

                {(() => {
                  const meta = parseOpportunityMeta(opp.description);
                  return (
                    <div className="opp-card-details-grid">
                      <p className="opp-card-detail-label">Salary</p>
                      <p className="opp-card-detail-value">
                        {meta.salary || formatCompensation(opp.type) || "Negotiable"}
                      </p>

                      <p className="opp-card-detail-label">Job Type</p>
                      <p className="opp-card-detail-value">
                        {meta.jobType || opp.type?.[0]?.toUpperCase() + opp.type?.slice(1) || "-"}
                      </p>

                      <p className="opp-card-detail-label">Industry</p>
                      <p className="opp-card-detail-value">
                        {opp.category?.name || "General"}
                      </p>

                      <p className="opp-card-detail-label">Available Positions</p>
                      <p className="opp-card-detail-value">
                        {meta.pax ? `${meta.pax} pax` : "-"}
                      </p>
                    </div>
                  );
                })()}

                <div className="opp-card-actions">
                  <button
                    type="button"
                    className="opp-card-btn secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/opportunities/${opp.id}`);
                    }}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    className="opp-card-btn primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openApplyModal(opp);
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              </article>
            ))}
          </div>

          {hasMore && (
            <div className="opp-see-more-wrap">
              <button
                type="button"
                className="opp-see-more-btn"
                onClick={() => {
                  setVisibleCount((prev) => prev + LOAD_STEP);
                }}
              >
                See more
              </button>
            </div>
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
};

export default Opportunities;
