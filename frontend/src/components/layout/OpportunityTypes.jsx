import "./OpportunityTypes.css";
import {
  Briefcase,
  GraduationCap,
  ClipboardList,
  Heart,
  Trophy,
} from "lucide-react";

const types = [
  {
    icon: <Briefcase size={20} />,
    title: "Internship",
    desc: "Paid + unpaid, hybrid + onsite",
    count: "428",
  },
  {
    icon: <GraduationCap size={20} />,
    title: "Scholarship",
    desc: "Undergrad, postgrad, exchange",
    count: "312",
  },
  {
    icon: <ClipboardList size={20} />,
    title: "Job",
    desc: "Entry & graduate roles",
    count: "286",
  },
  {
    icon: <Heart size={20} />,
    title: "Volunteer",
    desc: "NGOs and community work",
    count: "142",
  },
  {
    icon: <Trophy size={20} />,
    title: "Competition",
    desc: "Hackathons, business, arts",
    count: "80",
  },
];

const OpportunityTypes = () => {
  return (
    <section className="opt">
      <div className="opt__inner">
        <div className="opt__header">
          <div>
            <p className="opt__eyebrow">FIVE TYPES · ONE PLATFORM</p>
            <h2 className="opt__title">Whatever you're looking for next.</h2>
          </div>
          <a className="opt__see-all" href="#">
            See all open →
          </a>
        </div>

        <div className="opt__grid">
          {types.map((t) => (
            <div key={t.title} className="opt__card">
              <div className="opt__icon">{t.icon}</div>
              <div className="opt__card-bottom">
                <h3 className="opt__card-title">{t.title}</h3>
                <p className="opt__card-desc">{t.desc}</p>
                <div className="opt__card-footer">
                  <span className="opt__count">{t.count} OPEN</span>
                  <span className="opt__arrow">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OpportunityTypes;
