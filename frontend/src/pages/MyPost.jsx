import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Navbar from "../components/layout/Navbar";
import { FiCalendar, FiMapPin, FiSearch, FiTag, FiUsers } from "react-icons/fi";
import "./MyPost.css";

const emptyForm = {
  title: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
  pax: "",
  location: "",
  deadline: "",
  category_id: "",
};

function buildOpportunityDescription(form) {
  const pax = form.pax.toString().trim();

  return `${`Pax: ${pax}\n\n`}${[
    `Responsibilities:\n${form.responsibilities.trim()}`,
    `Requirements:\n${form.requirements.trim()}`,
    `Benefits:\n${form.benefits.trim()}`,
  ].join("\n\n")}`;
}

function parseOpportunityDescription(value) {
  if (typeof value !== "string") return null;

  let text = value;
  let pax = "";

  const paxMatch = text.match(/^Pax:\s*(.+?)\n\n/);
  if (paxMatch) {
    pax = paxMatch[1].trim();
    text = text.slice(paxMatch[0].length);
  }

  const match = text.match(
    /Responsibilities:\s*([\s\S]*?)\n\nRequirements:\s*([\s\S]*?)\n\nBenefits:\s*([\s\S]*)$/,
  );

  if (!match) return null;

  return {
    pax,
    sections: [
      { title: "Responsibilities", content: match[1].trim() },
      { title: "Requirements", content: match[2].trim() },
      { title: "Benefits", content: match[3].trim() },
    ],
  };
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusLabel(status) {
  switch (status) {
    case "approved":
      return "Approved";
    case "pending":
      return "Pending review";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    default:
      return "Draft";
  }
}

export default function MyPost() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedPostId, setExpandedPostId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryRes, postsRes] = await Promise.all([
          client.get("/categories"),
          client.get("/organizations/me/opportunities"),
        ]);
        setCategories(categoryRes.data?.data || []);
        setPosts(postsRes.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Unable to load your posts right now.");
      } finally {
        setLoadingPosts(false);
      }
    };

    if (user?.role === "organization") {
      loadData();
    }
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "organization") return <Navigate to="/opportunities" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        description: buildOpportunityDescription(form),
        location: form.location.trim() || null,
        deadline: form.deadline || null,
      };

      const { data } = await client.post("/opportunities", payload);
      setPosts((prev) => [data.data, ...prev]);
      setForm(emptyForm);
      setSuccess("Opportunity posted successfully.");
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Unable to create this opportunity.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (postId) => {
    const shouldDelete = window.confirm("Delete this opportunity?");
    if (!shouldDelete) return;

    setError("");
    setSuccess("");

    try {
      await client.delete(`/opportunities/${postId}`);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setSuccess("Opportunity deleted.");
      if (expandedPostId === postId) setExpandedPostId(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Unable to delete this opportunity.");
    }
  };

  const matchesTab = (post) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return ["draft", "pending", "approved"].includes(post.status);
    return ["rejected", "expired"].includes(post.status);
  };

  const matchesStatusFilter = (post) => {
    if (statusFilter === "all") return true;
    return post.status === statusFilter;
  };

  const matchesQuery = (post) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return (
      post.title?.toLowerCase().includes(normalized) ||
      post.description?.toLowerCase().includes(normalized) ||
      post.location?.toLowerCase().includes(normalized) ||
      post.category?.name?.toLowerCase().includes(normalized)
    );
  };

  const filteredPosts = posts.filter(
    (post) => matchesTab(post) && matchesStatusFilter(post) && matchesQuery(post),
  );

  const activeCount = posts.filter((post) => ["draft", "pending", "approved"].includes(post.status)).length;
  const closedCount = posts.filter((post) => ["rejected", "expired"].includes(post.status)).length;

  return (
    <>
      <Navbar />
      <main className="mypost-page">
        <div className="mypost-shell">
          <section className="mypost-panel">
            <header className="mypost-header">
              <div className="mypost-heading">
                <h1>My Opportunities</h1>
                <p>Manage and track the opportunities you have posted.</p>
                <button
                  className="mypost-primary-btn"
                  type="button"
                  onClick={() => {
                    setShowForm((prev) => !prev);
                    setError("");
                    setSuccess("");
                  }}
                >
                  {showForm ? "Close Form" : "+ Post Opportunity"}
                </button>
              </div>
            </header>

            {error && <p className="mypost-message mypost-message--error">{error}</p>}
            {success && <p className="mypost-message mypost-message--success">{success}</p>}

            {showForm && (
              <section className="mypost-create-card">
                <form className="mypost-form" onSubmit={handleSubmit}>
                  <div className="grid2">
                    <div className="field">
                      <label className="label">Opportunity title</label>
                      <input
                        className="input"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Volunteer at Animal Shelter"
                        required
                      />
                    </div>

                    <div className="field">
                      <label className="label">Category</label>
                      <select
                        className="select"
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Responsibilities</label>
                    <textarea
                      className="input mypost-textarea"
                      name="responsibilities"
                      rows="4"
                      value={form.responsibilities}
                      onChange={handleChange}
                      placeholder="List the key responsibilities for this opportunity."
                      required
                    />
                  </div>

                  <div className="field">
                    <label className="label">Requirements</label>
                    <textarea
                      className="input mypost-textarea"
                      name="requirements"
                      rows="4"
                      value={form.requirements}
                      onChange={handleChange}
                      placeholder="List skills, qualifications, and expectations."
                      required
                    />
                  </div>

                  <div className="field">
                    <label className="label">Benefits</label>
                    <textarea
                      className="input mypost-textarea"
                      name="benefits"
                      rows="4"
                      value={form.benefits}
                      onChange={handleChange}
                      placeholder="Describe what applicants will gain from this opportunity."
                      required
                    />
                  </div>

                  <div className="grid2">
                    <div className="field">
                      <label className="label">Location</label>
                      <input
                        className="input"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Phnom Penh"
                      />
                    </div>

                    <div className="field">
                      <label className="label">Application deadline</label>
                      <input
                        className="input"
                        type="date"
                        name="deadline"
                        value={form.deadline}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label className="label">Pax</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      name="pax"
                      value={form.pax}
                      onChange={handleChange}
                      placeholder="e.g. 20"
                      required
                    />
                  </div>

                  <button className="mypost-primary-btn" type="submit" disabled={submitting}>
                    {submitting ? "Posting..." : "Create Post"}
                  </button>
                </form>
              </section>
            )}

            {!showForm && (
              <>
                <section className="mypost-controls">
                  <div className="mypost-tabs" role="tablist" aria-label="Opportunity tabs">
                    <button
                      type="button"
                      className={`mypost-tab ${activeTab === "all" ? "active" : ""}`}
                      onClick={() => setActiveTab("all")}
                    >
                      All ({posts.length})
                    </button>
                    <button
                      type="button"
                      className={`mypost-tab ${activeTab === "active" ? "active" : ""}`}
                      onClick={() => setActiveTab("active")}
                    >
                      Active ({activeCount})
                    </button>
                    <button
                      type="button"
                      className={`mypost-tab ${activeTab === "closed" ? "active" : ""}`}
                      onClick={() => setActiveTab("closed")}
                    >
                      Closed ({closedCount})
                    </button>
                  </div>

                  <div className="mypost-filters">
                    <label className="mypost-search">
                      <FiSearch size={16} />
                      <input
                        type="text"
                        placeholder="Search opportunities..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>

                    <select
                      className="mypost-status-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Filter</option>
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </section>

                {loadingPosts ? (
                  <p className="mypost-empty">Loading your posts...</p>
                ) : posts.length === 0 ? (
                  <section className="mypost-empty-state">
                    <h2>You have not posted any opportunities yet</h2>
                    <p>Click Post Opportunity to create your first listing.</p>
                  </section>
                ) : filteredPosts.length === 0 ? (
                  <p className="mypost-empty">No opportunities matched your filters.</p>
                ) : (
                  <div className="mypost-list">
                    {filteredPosts.map((post) => {
                      const isExpanded = expandedPostId === post.id;
                      const applicationsCount = post.applications_count ?? 0;
                      const parsedDescription = parseOpportunityDescription(post.description);
                      const summaryText = parsedDescription
                        ? parsedDescription.sections[0].content
                        : post.description;

                      return (
                        <article key={post.id} className="mypost-item">
                          <div className="mypost-item-thumb" aria-hidden="true">
                            <span>{(post.category?.name || "OP").slice(0, 2).toUpperCase()}</span>
                          </div>

                          <div className="mypost-item-main">
                            <div className="mypost-item-top">
                              <h3>{post.title}</h3>
                              <span className={`mypost-status ${post.status}`}>{getStatusLabel(post.status)}</span>
                            </div>

                            {isExpanded && parsedDescription ? (
                              <div className="mypost-detail-sections">
                                {parsedDescription.sections.map((section) => (
                                  <section key={section.title} className="mypost-detail-section">
                                    <h4>{section.title}</h4>
                                    <p>{section.content || "-"}</p>
                                  </section>
                                ))}
                              </div>
                            ) : (
                              <p className={`mypost-description ${isExpanded ? "expanded" : ""}`}>
                                {summaryText}
                              </p>
                            )}

                            <div className="mypost-meta-row">
                              <span><FiTag size={14} /> {post.category?.name || "Uncategorized"}</span>
                              <span><FiMapPin size={14} /> {post.location || "Remote / flexible"}</span>
                              {parsedDescription?.pax && <span><FiUsers size={14} /> Pax: {parsedDescription.pax}</span>}
                              <span><FiCalendar size={14} /> Deadline: {formatDate(post.deadline)}</span>
                            </div>
                          </div>

                          <div className="mypost-item-stats">
                            <p><FiUsers size={16} /> {applicationsCount}</p>
                            <span>Applications</span>
                          </div>

                          <div className="mypost-item-actions">
                            <button
                              type="button"
                              className="mypost-secondary-btn"
                              onClick={() => setExpandedPostId((prev) => (prev === post.id ? null : post.id))}
                            >
                              {isExpanded ? "Hide Details" : "View Details"}
                            </button>
                            <button
                              type="button"
                              className="mypost-danger-btn"
                              onClick={() => handleDelete(post.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
