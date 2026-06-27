import { useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import "../components/layout/Navbar.css";
import "./Contact.css";

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <main className="contact-page">
        <section className="contact-hero">
          <h1 className="contact-hero-title">Contact Us</h1>
          <p className="contact-hero-desc">
            Have a question, feedback, or want to partner with us? Reach out —
            we'd love to hear from you.
          </p>
        </section>

        <section className="contact-grid">
          <div className="contact-info">
            <div className="contact-info-card">
              <h3>Email</h3>
              <p>hello@aukas.app</p>
            </div>
            <div className="contact-info-card">
              <h3>Location</h3>
              <p>Phnom Penh, Cambodia</p>
            </div>
            <div className="contact-info-card">
              <h3>Follow Us</h3>
              <p>Facebook &bull; Telegram &bull; LinkedIn</p>
            </div>
          </div>

          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="contact-form-row">
              <input type="text" placeholder="Your name" className="contact-input" />
              <input type="email" placeholder="Your email" className="contact-input" />
            </div>
            <input type="text" placeholder="Subject" className="contact-input" />
            <textarea placeholder="Message" className="contact-textarea" rows={5} />
            <button type="submit" className="contact-btn">Send Message</button>
          </form>
        </section>
      </main>
    </>
  );
};

export default Contact;
