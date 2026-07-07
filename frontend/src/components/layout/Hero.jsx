import { useNavigate } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      {/* Left */}
      <div className="hero__left">
        <h1 className="hero__title">
          Every opportunity for Cambodian students,{" "}
          <span className="hero__title--blue">in one place.</span>
        </h1>
        <p className="hero__desc">
          Aukas brings internships, scholarships, jobs, volunteer work, and
          competitions onto a single platform — verified, deadline-tracked, and
          free for students to apply.
        </p>
        <div className="hero__buttons">
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </div>

      {/* Right - Dark card */}
      <div className="hero__card">
        <div className="hero__card-blob" />
        <p className="hero__card-label">THIS WEEK ON AUKAS</p>
        <div className="hero__stats">
          <div>
            <p className="hero__stat-value">1,248</p>
            <p className="hero__stat-desc">Open opportunities</p>
          </div>
          <div>
            <p className="hero__stat-value">312</p>
            <p className="hero__stat-desc">New this week</p>
          </div>
          <div>
            <p className="hero__stat-value">84</p>
            <p className="hero__stat-desc">Partner orgs</p>
          </div>
          <div>
            <p className="hero__stat-value">$2.4M</p>
            <p className="hero__stat-desc">In scholarships</p>
          </div>
        </div>
        <div className="hero__card-footer">
          <div className="hero__avatars">
            <div className="avatar" style={{ background: "#6c8fff" }} />
            <div className="avatar" style={{ background: "#ffaa5a" }} />
            <div className="avatar" style={{ background: "#4ecfa8" }} />
            <div className="avatar" style={{ background: "#ff7eb3" }} />
          </div>
          <p className="hero__card-note">9,400+ students applied this month</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
