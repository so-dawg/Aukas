import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiBookmark } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Navbar from "../components/layout/Navbar";
import "../components/layout/Navbar.css";
import "./Opportunities.css";

const iconMap = {
  internship: "",
  scholarship: "\\",
  job: "\\",
  volunteer: "\\",
  competition: "\\",
};

const tagMap = {
  internship: { label: "Internship", sub: "Full-time" },
  scholarship: { label: "Scholarship", sub: "Full tuition + stipend" },
  job: { label: "Job", sub: "Full-time" },
  volunteer: { label: "Volunteer", sub: "Flexible hours" },
  competition: { label: "Competition", sub: "Teams of 4" },
};

const orgColorMap = {
  Pathmazing: "#16A34A",
  "ASEAN Foundation": "#2563EB",
  WingBank: "#D97706",
  "Smart City": "#D97706",
  PSE: "#16A34A",
  KOSIGN: "#0D7490",
  Confirel: "#D97706",
};

const closingIn = (deadline) => {
  if (!deadline) return null;
  const days = Math.ceil(
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24),
  );
  if (days <= 0) return "Closed";
  if (days === 1) return "Closes in 1d";
  return `Closes in ${days}d`;
};

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

const initial = (name) => (name ? name[0].toUpperCase() : "?");

const colorForOrg = (name) => {
  if (orgColorMap[name]) return orgColorMap[name];
  const colors = [
    "#2563eb",
    "#059669",
    "#d97706",
    "#0D7490",
    "#7c3aed",
    "#dc2626",
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const Categories = [
  "All",
  "Internship",
  "Scholarship",
  "Job",
  "Volunteer",
  "Competition",
];

const Opportunities = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [bookmarks, setBookmarks] = useState(new Set());

  const fetchList = async (filters = {}) => {
    const params = { limit: 8, sort: "newest", ...filters };
    if (!params.type) delete params.type;
    const { data } = await client.get("/opportunities", { params });
    setOpportunities(data.data);
    setTotal(data.meta.total);
    if (data.data.length > 0) {
      const first = data.data[0];
      try {
        const detail = await client.get(`/opportunities/${first.id}`);
        setFeatured(detail.data);
      } catch {
        setFeatured(first);
      }
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (user?.role === "student") {
      client
        .get("/bookmarks")
        .then((res) => {
          setBookmarks(new Set(res.data.data.map((b) => b.opportunity_id)));
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
        const n = new Set(prev);
        n.delete(oppId);
        return n;
      });
    } else {
      await client.post("/bookmarks", { opportunity_id: oppId });
      setBookmarks((prev) => new Set(prev).add(oppId));
    }
  };

  const profileTags = [];
  if (user?.student_profile?.year_of_study)
    profileTags.push(`Year ${user.student_profile.year_of_study}`);
  if (user?.student_profile?.major)
    profileTags.push(user.student_profile.major);
  if (user?.student_profile?.university)
    profileTags.push(user.student_profile.university);
  profileTags.push("open to internships");

  return (
    <>
      <Navbar />
      <main className="opp-page">
        <div className="opp-inner">
          {/* ── Header ── */}
          <div className="opp-header">
            <div>
              <span className="opp-greeting">
                HI {user?.full_name?.toUpperCase() || "STUDENT"} · WELCOME BACK
              </span>
              <h1 className="opp-headline">
                {total.toLocaleString()} opportunities for you
              </h1>
              <p className="opp-context">{profileTags.join(" · ")}</p>
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
            <a
              href="#"
              className="opp-browse-all"
              onClick={(e) => {
                e.preventDefault();
                handleFilter("All");
              }}
            >
              Browse all
            </a>
          </div>

          {/* ── Featured card ── */}
          {featured && (
            <div className="opp-featured" key={featured.id}>
              <div className="opp-featured-left">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.5"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
                </svg>
              </div>
              <div className="opp-featured-right">
                <div className="opp-featured-badges">
                  <span className="opp-featured-star">Featured this week</span>
                  <span className="opp-featured-type">
                    {featured.type?.toUpperCase()}{" "}
                    {featured.deadline
                      ? `CLOSES IN ${Math.ceil((new Date(featured.deadline) - new Date()) / (1000 * 60 * 60 * 24))}D`
                      : "OPEN"}
                  </span>
                </div>
                <h2 className="opp-featured-title">{featured.title}</h2>
                <p className="opp-featured-desc">
                  {featured.description ||
                    `Full-tuition ${featured.type} for ASEAN undergraduates in technology fields. Includes living stipend and mentorship.`}
                </p>
                <div className="opp-featured-actions">
                  <button
                    className="opp-featured-btn primary"
                    onClick={() => navigate(`/opportunities/${featured.id}`)}
                  >
                    Open listing
                  </button>
                  <button
                    className={`opp-featured-btn outline ${bookmarks.has(featured.id) ? "saved" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(featured.id);
                    }}
                  >
                    <FiBookmark size={16} /> {bookmarks.has(featured.id) ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Card grid ── */}
          <div className="opp-grid">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="opp-card"
                onClick={() => navigate(`/opportunities/${opp.id}`)}
              >
                <div className="opp-card-top">
                  <div className="opp-card-org">
                    <div
                      className="opp-card-avatar"
                      style={{
                        background: colorForOrg(opp.organization?.org_name),
                      }}
                    >
                      {initial(opp.organization?.org_name)}
                    </div>
                    <div>
                      <p className="opp-card-org-name">
                        {opp.organization?.org_name}
                      </p>
                      <p className="opp-card-location">
                        {opp.location || "Remote"}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`opp-card-bookmark ${bookmarks.has(opp.id) ? "saved" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(opp.id);
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill={bookmarks.has(opp.id) ? "#2563eb" : "none"}
                      stroke={bookmarks.has(opp.id) ? "#2563eb" : "#94a3b8"}
                      strokeWidth="2"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>
                </div>
                <h3 className="opp-card-title">{opp.title}</h3>
                <div className="opp-card-tags">
                  <span className="opp-card-tag">
                    {iconMap[opp.type]} {tagMap[opp.type]?.label}
                  </span>
                  <span className="opp-card-tag">{tagMap[opp.type]?.sub}</span>
                </div>
                <div className="opp-card-footer">
                  <span className="opp-card-closing">
                    ⏰ {closingIn(opp.deadline)}
                  </span>
                  <span className="opp-card-comp">
                    {formatCompensation(opp.type)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Opportunities;
