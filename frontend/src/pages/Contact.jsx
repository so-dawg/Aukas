import { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import client from "../api/client";
import "../components/layout/Navbar.css";
import "./Contact.css";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post("/contact", { name, email, subject, message });
      alert("Message sent!");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    }catch (err) {
      setError(err.response?.data?.error?.message || "Failed to send message");
    }
  };

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

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-row">
              <input
                type="text"
                placeholder="Your name"
                className="contact-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Your email"
                className="contact-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className="contact-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <textarea
              placeholder="Message"
              className="contact-textarea"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="contact-btn">
              Send Message
            </button>
          </form>
        </section>
      </main>
    </>
  );
};

export default Contact;
