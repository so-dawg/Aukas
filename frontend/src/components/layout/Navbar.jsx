import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Opportunities", to: "/opportunities" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

const Navbar = () => {
  const user = null;
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-text">Aukas</span>
        </Link>

        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`navbar-link ${isActive(link.to) ? "active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-actions">
          {user && (
            <Link to="/whitelist" className="navbar-button secondary">
              Whitelist
            </Link>
          )}

          {user ? (
            <button
              type="button"
              className="profile-button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
            >
              <span className="profile-avatar">
                {(user.name?.[0] || "U").toUpperCase()}
              </span>
              <span>{user.name || "Account"}</span>
            </button>
          ) : (
            <>
              <Link to="/login" className="navbar-button secondary">
                Log In
              </Link>
              <Link to="/signup" className="navbar-button primary">
                Sign Up
              </Link>
            </>
          )}

          <button
            type="button"
            className={`navbar-menu-button ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span className="menu-icon" />
          </button>
        </div>
      </div>

      <div className={`navbar-mobile ${menuOpen ? "open" : ""}`}>
        <ul className="navbar-mobile-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`navbar-mobile-link ${isActive(link.to) ? "active" : ""}`}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {user && (
            <li>
              <Link to="/whitelist" onClick={() => setMenuOpen(false)} className="navbar-mobile-link">
                Whitelist
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-mobile-actions">
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="navbar-button secondary">
                Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  console.log("Logout");
                }}
                className="navbar-button secondary"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="navbar-button secondary">
                Log In
              </Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="navbar-button primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
