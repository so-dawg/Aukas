import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiBookmark, FiUser } from "react-icons/fi";
import logo from "../../assets/AukasLogo.jpg";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isJobSeeker = user?.role === "student";
  const isOrganization = user?.role === "organization";
  const navLinks = isOrganization
    ? [
        { label: "Home", to: "/" },
        { label: "My Post", to: "/my-post" },
        { label: "Applications", to: "/applications" },
        { label: "Contact Us", to: "/contact" },
      ]
    : [
        { label: "Home", to: "/" },
        { label: "Opportunities", to: "/opportunities" },
        ...(isJobSeeker
          ? [{ label: "My Applications", to: "/my-applications" }]
          : []),
        { label: "Contact Us", to: "/contact" },
      ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Aukas logo" className="navbar-logo-image" />
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
          {isJobSeeker && (
            <Link
              to="/saved"
              className="navbar-icon-button"
              aria-label="Saved opportunities"
              title="Saved opportunities"
            >
              <FiBookmark size={18} />
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/profile"
                className="profile-button"
                aria-label={user.full_name ? `${user.full_name} account` : "Account"}
                title={user.full_name || "Account"}
              >
                <FiUser size={18} />
              </Link>
            </>
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

          {isJobSeeker && (
            <li>
              <Link
                to="/saved"
                onClick={() => setMenuOpen(false)}
                className="navbar-mobile-link"
              >
                Saved
              </Link>
            </li>
          )}
        </ul>

        <div className="navbar-mobile-actions">
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="navbar-button secondary"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="navbar-button secondary"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="navbar-button secondary"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="navbar-button primary"
              >
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
