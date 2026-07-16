import { Link } from "react-router-dom";
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
    slug: "internship",
    desc: "Paid + unpaid, hybrid + onsite",
  },
  {
    icon: <GraduationCap size={20} />,
    title: "Scholarship",
    slug: "scholarship",
    desc: "Undergrad, postgrad, exchange",
  },
  {
    icon: <ClipboardList size={20} />,
    title: "Job",
    slug: "job",
    desc: "Entry & graduate roles",
  },
  {
    icon: <Heart size={20} />,
    title: "Volunteer",
    slug: "volunteer",
    desc: "NGOs and community work",
  },
  {
    icon: <Trophy size={20} />,
    title: "Competition",
    slug: "competition",
    desc: "Hackathons, business, arts",
  },
];

const OpportunityTypes = () => {
  return (
    <section className="opt">
      <div className="opt__inner">
        <div className="opt__header">
          <div>
            <h2 className="opt__title">Whatever you're looking for next.</h2>
          </div>
        </div>

        <div className="opt__grid">
          {types.map((t) => (
            <Link key={t.title} to={`/opportunities?type=${t.slug}`} className="opt__card">
              <div className="opt__icon">{t.icon}</div>
              <div className="opt__card-bottom">
                <h3 className="opt__card-title">{t.title}</h3>
                <p className="opt__card-desc">{t.desc}</p>
                <div className="opt__card-footer">
                  <span className="opt__count">{t.count} OPEN</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OpportunityTypes;
