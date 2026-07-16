import "./HowItWork.css";

const steps = [
  {
    step: "STEP 01",
    title: "Build your profile once",
    desc: "Year, major, skills, interests. Reuse it for every application, no re-typing.",
  },
  {
    step: "STEP 02",
    title: "Apply in one click",
    desc: "Filter by deadline, stipend, type. Save what catches your eye, apply when you're ready.",
  },
  {
    step: "STEP 03",
    title: "Track everything in one place",
    desc: "See submitted, interview, offer status on a single timeline.",
  },
];

const HowItWork = () => {
  return (
    <section className="how-section">
      <div className="how-inner">
        <p className="how-eyebrow">HOW IT WORKS</p>
        <h2 className="how-title">Three steps. Zero fees.</h2>
        <div className="how-grid">
          {steps.map((s) => (
            <div key={s.step} className="how-card">
              <p className="how-card__step">{s.step}</p>
              <h3 className="how-card__title">{s.title}</h3>
              <p className="how-card__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWork;
