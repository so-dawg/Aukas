import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiFileText, FiUpload, FiX } from "react-icons/fi";
import client from "../../api/client";
import "./InlineApplyModal.css";

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

function parseOpportunityMeta(description) {
  if (typeof description !== "string") {
    return { salary: "", jobType: "", pax: "" };
  }

  return {
    pax: (description.match(/Pax:\s*(.+?)(\n|$)/)?.[1] || "").trim(),
    jobType: (description.match(/Job Type:\s*(.+?)(\n|$)/)?.[1] || "").trim(),
    salary: (description.match(/Salary:\s*(.+?)(\n|$)/)?.[1] || "").trim(),
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
  return opportunity?.organization?.org_name || opportunity?.Organization?.org_name || "Organization";
}

function getCategoryName(opportunity) {
  return opportunity?.category?.name || opportunity?.Category?.name || "General";
}

export default function InlineApplyModal({ open, opportunity, onClose }) {
  const [selectedCv, setSelectedCv] = useState(null);
  const [applyError, setApplyError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [loadingOpportunity, setLoadingOpportunity] = useState(false);
  const [resolvedOpportunity, setResolvedOpportunity] = useState(null);

  const currentOpportunity = resolvedOpportunity || opportunity;

  const parsed = useMemo(
    () => parseOpportunityMeta(currentOpportunity?.description),
    [currentOpportunity?.description],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedCv(null);
    setApplyError("");
    setApplySubmitted(false);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setResolvedOpportunity(null);
      setLoadingOpportunity(false);
      return;
    }

    if (!opportunity?.id) {
      setResolvedOpportunity(opportunity || null);
      return;
    }

    let isActive = true;
    setLoadingOpportunity(true);

    client
      .get(`/opportunities/${opportunity.id}`)
      .then((res) => {
        if (!isActive) return;
        setResolvedOpportunity(res.data?.data || opportunity);
      })
      .catch(() => {
        if (!isActive) return;
        // Fallback to the current list card data when detail fetch fails.
        setResolvedOpportunity(opportunity);
      })
      .finally(() => {
        if (isActive) setLoadingOpportunity(false);
      });

    return () => {
      isActive = false;
    };
  }, [open, opportunity]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !opportunity) return null;

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
    if (!currentOpportunity?.id) return;

    if (!selectedCv) {
      setApplyError("CV is required.");
      return;
    }

    setIsSubmitting(true);
    setApplyError("");

    try {
      await client.post("/applications", { opportunity_id: currentOpportunity.id });
      setApplySubmitted(true);
    } catch (err) {
      setApplyError(err.response?.data?.error?.message || "Unable to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="inline-apply-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Application form"
      onClick={onClose}
    >
      <div className="inline-apply-modal" onClick={(event) => event.stopPropagation()}>
        {!applySubmitted ? (
          <>
            {loadingOpportunity ? (
              <div className="inline-apply-loading">Loading latest opportunity data...</div>
            ) : null}

            <div className="inline-apply-head">
              <div>
                <p className="inline-apply-eyebrow">APPLICATION</p>
                <h2>{currentOpportunity?.title || "Untitled opportunity"}</h2>
                <p className="inline-apply-company">
                  {getOrganizationName(currentOpportunity)} · {currentOpportunity?.location || "Remote"}
                </p>
              </div>

              <button
                type="button"
                className="inline-apply-close"
                onClick={onClose}
                aria-label="Close"
                disabled={isSubmitting}
              >
                <FiX size={18} />
              </button>
            </div>

            <section className="inline-apply-meta-grid">
              <div>
                <span>Salary</span>
                <strong>{parsed.salary || "Negotiable"}</strong>
              </div>
              <div>
                <span>Job Type</span>
                <strong>{parsed.jobType || currentOpportunity?.type || "-"}</strong>
              </div>
              <div>
                <span>Industry</span>
                <strong>{getCategoryName(currentOpportunity)}</strong>
              </div>
              <div>
                <span>Positions</span>
                <strong>{formatPositions(parsed.pax)}</strong>
              </div>
              <div>
                <span>Deadline</span>
                <strong>{formatDate(currentOpportunity?.deadline)}</strong>
              </div>
            </section>

            <section className="inline-apply-materials">
              <h3>Required materials</h3>
              <p>
                Upload each file below to complete your application. Accepted formats: PDF,
                DOC, DOCX (max 10MB).
              </p>

              <div className="inline-apply-file-row">
                <div className="inline-apply-file-head">
                  <span>CV</span>
                  <span className="inline-apply-required">Required</span>
                </div>

                <label className={`inline-apply-file-wrap ${selectedCv ? "has-file" : ""}`} htmlFor="inline-apply-cv-input">
                  <input
                    id="inline-apply-cv-input"
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleCvChange}
                    disabled={isSubmitting}
                  />
                  <span className="inline-apply-file-icon" aria-hidden="true">
                    {selectedCv ? <FiCheckCircle size={16} /> : <FiFileText size={16} />}
                  </span>
                  <span className="inline-apply-file-label">
                    {selectedCv ? selectedCv.name : "Upload your cv"}
                  </span>
                  {!selectedCv && (
                    <span className="inline-apply-upload-icon" aria-hidden="true">
                      <FiUpload size={15} />
                    </span>
                  )}
                </label>

                {applyError && (
                  <p className="inline-apply-error">
                    <FiAlertCircle size={14} />
                    <span>{applyError}</span>
                  </p>
                )}
              </div>
            </section>

            <div className="inline-apply-actions">
              <button
                type="button"
                className="inline-apply-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-apply-submit"
                onClick={submitApplication}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </>
        ) : (
          <div className="inline-apply-success">
            <div className="inline-apply-success-icon">
              <FiCheckCircle size={28} />
            </div>
            <h3>Application submitted</h3>
            <p>
              Your application was sent successfully. You can continue browsing opportunities
              on this page.
            </p>
            <button
              type="button"
              className="inline-apply-submit inline-apply-success-btn"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
