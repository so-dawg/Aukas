import { Link } from "react-router-dom";
import logo from "../../assets/AukasLogo.jpg";
import "./Footer.css";

const linkColumns = [
  {
    title: "Company",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "Press", to: "/press" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center", to: "#" },
      { label: "API docs", to: "#" },
      { label: "Status", to: "#" },
      { label: "Privacy", to: "#" },
    ],
  },
  {
    title: "Languages",
    links: [
      { label: "English", to: "#" },
      { label: "ភាសាខ្មែរ", to: "#" },
    ],
  },
];

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <div className="footer-logo-row">
          <img src={logo} alt="Aukas logo" className="footer-logo-image" />
        </div>
        <p className="footer-tagline">
          Opportunities Hub — a Cambodia-first platform
          built by IDT Group 3, CS Gen 11.
        </p>
      </div>

      {linkColumns.map((col) => (
        <div className="footer-column footer-column--navbar" key={col.title}>
          <span className="footer-column-title">{col.title}</span>
          {col.links.map((link) => (
            link.to === "#" ? (
              <a
                key={link.label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="footer-link"
              >
                {link.label}
              </a>
            ) : (
              <Link key={link.label} to={link.to} className="footer-link">
                {link.label}
              </Link>
            )
          ))}
        </div>
      ))}
    </div>
  </footer>
);

export default Footer;
