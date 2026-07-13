import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiBriefcase, FiClock, FiMapPin, FiTag, FiUsers } from "react-icons/fi";
import { FiAlertCircle, FiCheckCircle, FiFileText, FiUpload, FiX } from "react-icons/fi";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import "./OpportunityDetail.css";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const ACCEPTED_CV_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ACCEPTED_CV_EXTENSIONS = [".pdf", ".doc", ".docx"];

function getFileExtension(fileName = "") {
  const idx = fileName.lastIndexOf(".");
  if (idx < 0) return "";
  return fileName.slice(idx).toLowerCase();
}

function parseOpportunityDescription(value) {
  if (typeof value !== "string") {
    return { pax: "", jobType: "", salary: "", sections: [] };
  }

  let text = value;
  const pax = (text.match(/^Pax:\s*(.+?)(\n|$)/)?.[1] || "").trim();
  if (pax) {
    text = text.replace(/^Pax:\s*(.+?)(\n|$)\n?/, "");
  }

  const jobType = (text.match(/^Job Type:\s*(.+?)(\n|$)/)?.[1] || "").trim();
  if (jobType) {
    text = text.replace(/^Job Type:\s*(.+?)(\n|$)\n?/, "");
  }

  const salary = (text.match(/^Salary:\s*(.+?)(\n|$)/)?.[1] || "").trim();
  if (salary) {
    text = text.replace(/^Salary:\s*(.+?)(\n|$)\n?/, "");
  }

  const match = text.match(
    /Responsibilities:\s*([\s\S]*?)\n\nRequirements:\s*([\s\S]*?)\n\nBenefits:\s*([\s\S]*)$/,
  );

  if (!match) {
    return {
      pax,
      jobType,
      salary,
      sections: [{ title: "Description", content: value.trim() }],
    };
  }

  return {
    pax,
    jobType,
    salary,
    sections: [
      { title: "Responsibilities", content: match[1].trim() },
      { title: "Requirements", content: match[2].trim() },
      { title: "Benefits", content: match[3].trim() },
    ],
  };
}

function formatDate(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPositions(paxValue) {
  if (!paxValue) return "-";
  const normalized = String(paxValue).trim();
  if (!normalized) return "-";
  if (/\bpax\b/i.test(normalized)) return normalized;
  return `${normalized} pax`;
}

function getOrganizationName(opportunity) {
  return (
    opportunity?.Organization?.org_name ||
    opportunity?.organization?.org_name ||
    opportunity?.org_name ||
    "Organization"
  );
}

function toBulletLines(content) {
  if (!content) return [];
  return String(content)
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

export default function OpportunityDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCv, setSelectedCv] = useState(null);
  const [applyError, setApplyError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    client
      .get(`/opportunities/${id}`)
      .then((res) => {
        setOpportunity(res.data?.data || null);
      })
      .catch((err) => {
        setError(err.response?.data?.error?.message || "Unable to load opportunity details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (location.state?.openApply) {
      setShowApplyModal(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (!showApplyModal) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowApplyModal(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showApplyModal]);

  const parsed = useMemo(
    () => parseOpportunityDescription(opportunity?.description),
    [opportunity?.description],
  );

  const isStudent = user?.role === "student";

  const openApplyModal = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isStudent) return;

    setApplyError("");
    setSelectedCv(null);
    setApplySubmitted(false);
    setShowApplyModal(true);
  };

  const closeApplyModal = () => {
    if (isSubmitting) return;
    setShowApplyModal(false);
    setApplyError("");
    setSelectedCv(null);
    setApplySubmitted(false);
  };

  const handleCvChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedCv(null);
      setApplyError("");
      return;
    }

    const hasAcceptedMimeType = ACCEPTED_CV_TYPES.has(file.type);
    const hasAcceptedExtension = ACCEPTED_CV_EXTENSIONS.includes(getFileExtension(file.name));

    if (!hasAcceptedMimeType && !hasAcceptedExtension) {
      setApplyError("Please upload a PDF, DOC, or DOCX file.");
      setSelectedCv(null);
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setApplyError("File size must be 10MB or less.");
      setSelectedCv(null);
      return;
    }

    setApplyError("");
    setSelectedCv(file);
  };

  const submitApplication = async () => {
    if (!id || !isStudent) return;

    if (!selectedCv) {
      setApplyError("CV is required.");
      return;
    }

    setIsSubmitting(true);
    setApplyError("");

    try {
      // Backend currently stores the application record; document upload endpoint can be connected later.
      await client.post("/applications", { opportunity_id: id });
      setApplySubmitted(true);
    } catch (err) {
      setApplyError(err.response?.data?.error?.message || "Unable to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewInApplicationTracker = () => {
    setShowApplyModal(false);
    navigate("/my-applications");
  };

  return (
    <>
      <Navbar />
      <main className="opp-detail-page">
        <div className="opp-detail-inner">
          {loading ? (
            <div className="opp-detail-state">Loading opportunity details...</div>
          ) : error ? (
            <div className="opp-detail-state opp-detail-error">{error}</div>
          ) : !opportunity ? (
            <div className="opp-detail-state">Opportunity not found.</div>
          ) : (
            <article className="opp-detail-card">
              <header className="opp-hero">
                <div className="opp-hero-left">
                  <div className="opp-hero-copy">
                    <h1>{opportunity.title || "Untitled opportunity"}</h1>
                    <div className="opp-hero-meta-line">
                      <span><FiBriefcase size={14} /> {getOrganizationName(opportunity)}</span>
                      <span><FiMapPin size={14} /> {opportunity.location || "Remote"}</span>
                    </div>
                  </div>
                </div>
              </header>

              <section className="opp-detail-meta-strip">
                <div>
                  <span><FiBriefcase size={14} /> Salary</span>
                  <strong>{parsed.salary || "Negotiable"}</strong>
                </div>
                <div>
                  <span><FiClock size={14} /> Job Type</span>
                  <strong>{parsed.jobType || opportunity.type || "-"}</strong>
                </div>
                <div>
                  <span><FiTag size={14} /> Category</span>
                  <strong>{opportunity.Category?.name || opportunity.category?.name || "Uncategorized"}</strong>
                </div>
                <div>
                  <span><FiClock size={14} /> Deadline</span>
                  <strong>{formatDate(opportunity.deadline)}</strong>
                </div>
                <div>
                  <span><FiUsers size={14} /> Available Positions</span>
                  <strong>{formatPositions(parsed.pax)}</strong>
                </div>
              </section>

              <section className="opp-detail-sections">
                {parsed.sections.map((section) => (
                  <div key={section.title} className="opp-detail-section">
                    <h2>{section.title}</h2>
                    {toBulletLines(section.content).length > 0 ? (
                      <ul>
                        {toBulletLines(section.content).map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{section.content || "-"}</p>
                    )}
                  </div>
                ))}
              </section>

              <div className="opp-detail-bottom-actions">
                <button
                  type="button"
                  className="opp-detail-bottom-back"
                  onClick={() => navigate(-1)}
                >
                  Back
                </button>

                {!authLoading && isStudent ? (
                  <button
                    type="button"
                    className="opp-detail-bottom-apply"
                    onClick={openApplyModal}
                  >
                    Apply Now
                  </button>
                ) : !authLoading && !user ? (
                  <button
                    type="button"
                    className="opp-detail-bottom-apply"
                    onClick={openApplyModal}
                  >
                    Log In To Apply
                  </button>
                ) : null}
              </div>
            </article>
          )}
        </div>
      </main>

      {showApplyModal && opportunity && (
        <div
          className="apply-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Application form"
          onClick={closeApplyModal}
        >
          <div className="apply-modal" onClick={(event) => event.stopPropagation()}>
            {!applySubmitted ? (
              <>
                <div className="apply-modal-head">
                  <div>
                    <p className="apply-modal-eyebrow">APPLICATION</p>
                    <h2>{opportunity.title || "Untitled opportunity"}</h2>
                    <p className="apply-modal-company">
                      {opportunity.Organization?.org_name || opportunity.organization?.org_name || "Organization"}
                      {" "}
                      ·
                      {" "}
                      {opportunity.location || "Remote"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="apply-modal-close"
                    onClick={closeApplyModal}
                    aria-label="Close"
                    disabled={isSubmitting}
                  >
                    <FiX size={18} />
                  </button>
                </div>

                <section className="apply-modal-meta-grid">
                  <div>
                    <span>Salary</span>
                    <strong>{parsed.salary || "Negotiable"}</strong>
                  </div>
                  <div>
                    <span>Job Type</span>
                    <strong>{parsed.jobType || opportunity.type || "-"}</strong>
                  </div>
                  <div>
                    <span>Industry</span>
                    <strong>{opportunity.Category?.name || opportunity.category?.name || "General"}</strong>
                  </div>
                  <div>
                    <span>Positions</span>
                    <strong>{formatPositions(parsed.pax)}</strong>
                  </div>
                  <div>
                    <span>Deadline</span>
                    <strong>{formatDate(opportunity.deadline)}</strong>
                  </div>
                </section>

                <section className="apply-modal-materials">
                  <h3>Required materials</h3>
                  <p>
                    Upload each file below to complete your application. Accepted formats: PDF,
                    DOC, DOCX (max 10MB).
                  </p>

                  <div className="apply-file-row">
                    <div className="apply-file-row-head">
                      <span>CV</span>
                      <span className="apply-required">Required</span>
                    </div>

                    <label className={`apply-file-input-wrap ${selectedCv ? "has-file" : ""}`} htmlFor="apply-cv-input">
                      <input
                        id="apply-cv-input"
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleCvChange}
                        disabled={isSubmitting}
                      />
                      <span className="apply-file-icon" aria-hidden="true">
                        {selectedCv ? <FiCheckCircle size={16} /> : <FiFileText size={16} />}
                      </span>
                      <span className="apply-file-input-label">
                        {selectedCv ? selectedCv.name : "Upload your cv"}
                      </span>
                      {!selectedCv && (
                        <span className="apply-file-upload-icon" aria-hidden="true">
                          <FiUpload size={15} />
                        </span>
                      )}
                    </label>

                    {applyError && (
                      <p className="apply-modal-error">
                        <FiAlertCircle size={14} />
                        <span>{applyError}</span>
                      </p>
                    )}
                  </div>
                </section>

                <div className="apply-modal-actions">
                  <button
                    type="button"
                    className="apply-cancel-btn"
                    onClick={closeApplyModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="apply-submit-btn"
                    onClick={submitApplication}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </>
            ) : (
              <div className="apply-modal-success">
                <div className="apply-modal-success-icon">
                  <FiCheckCircle size={32} />
                </div>
                <h3>Application submitted</h3>
                <p>
                  Your application to
                  {" "}
                  <strong>{opportunity.title || "this opportunity"}</strong>
                  {" "}
                  at
                  {" "}
                  {opportunity.Organization?.org_name || opportunity.organization?.org_name || "Organization"}
                  {" "}
                  was sent successfully.
                </p>
                <button
                  type="button"
                  className="apply-submit-btn apply-success-cta"
                  onClick={viewInApplicationTracker}
                >
                  View in Application Tracker
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
