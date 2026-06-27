import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import "../components/layout/Navbar.css";
import "./About.css";

const team = [
  { name: "Mey Chansopheaktra", role: "Project Lead & Full-Stack" },
  { name: "Ly Sokkunita", role: "Database Developer" },
  { name: "Nget Sokunkanha", role: "Frontend Developer" },
];

const values = [
  {
    title: "Cambodia First",
    desc: "Every feature is designed for Cambodian students and organisations. No cookie-cutter solutions.",
  },
  {
    title: "Free & Open",
    desc: "Opportunities are free to browse and apply. Organisations post at no cost — no paywalls.",
  },
  {
    title: "Trusted Data",
    desc: "All opportunities are verified and deadline-tracked. No expired listings, no spam.",
  },
  {
    title: "Built by Students",
    desc: "We are CS Generation 11, building real tools for real people as part of our 7-week project.",
  },
];

const About = () => {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace("#", ""));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <>
      <Navbar />
      <main className="about-page">
        <section id="top" className="about-hero">
          <h1 className="about-hero-title">
            About <span className="about-hero--blue">Aukas</span>
          </h1>
          <p className="about-hero-desc">
            Aukas is a Cambodia-first opportunities platform built by IDT Group 3,
            CS Generation 11. We connect students with internships, scholarships,
            jobs, volunteer work, and competitions — all verified and free.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-section-desc">
            Every Cambodian student deserves equal access to life-changing
            opportunities. We remove the friction of scattered job boards,
            expired listings, and paywalled applications by bringing everything
            onto one trusted platform.
          </p>
        </section>

        <section className="about-section">
          <h2 className="about-section-title">Our Values</h2>
          <div className="about-values">
            {values.map((v) => (
              <div key={v.title} className="about-value-card">
                <h3 className="about-value-title">{v.title}</h3>
                <p className="about-value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="team" className="about-section">
          <h2 className="about-section-title">Meet the Team</h2>
          <div className="about-team">
            {team.map((m) => (
              <div key={m.name} className="about-team-card">
                <div className="about-team-avatar">{m.name[0]}</div>
                <h3 className="about-team-name">{m.name}</h3>
                <p className="about-team-role">{m.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
};

export default About;
