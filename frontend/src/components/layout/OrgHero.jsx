import "./OrgHero.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OrgHero = () => {
  const stats = [
    { label: "VERIFIED STUDENTS", value: "9,400+" },
    { label: "AVG. APPLICANTS", value: "38" },
    { label: "DAYS TO FILL", value: "~14" },
    { label: "ORG PARTNERS", value: "84" },
  ];

  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="org-section">
      <div className="org-card">
        <div className="org-text">
          <span className="org-eyebrow">FOR ORGANISATIONS</span>
          <h2 className="org-title">
            Hire from Cambodia's top universities, free.
          </h2>
          <p className="org-desc">
            Post internships, jobs, scholarships, or volunteer roles. Reach
            9,400+ verified students across RUPP, ITC, AUPP, RULE, PUC, Norton,
            and more — at no cost.
          </p>
          <div className="org-actions">
            <button
              className="org-btn org-btn--primary"
              onClick={() => {
                if (!user || user.role === "student") navigate("/signup");
                else if (user.role === "organization") navigate("/my-post");
              }}
            >
              Post your first role
            </button>
          </div>
        </div>

        <div className="org-grid">
          {stats.map((s) => (
            <div key={s.label} className="org-stat">
              <span className="org-stat__label">{s.label}</span>
              <span className="org-stat__value">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrgHero;
