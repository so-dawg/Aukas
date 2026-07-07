import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Label({ children }) {
  return <label className="label">{children}</label>;
}

function PasswordField({ id, label, value, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <div className="field">
      <Label>{label}</Label>
      <div className="inputWrapper">
        <span className="inputIcon"><FiLock size={15} /></span>
        <input
          id={id}
          type={show ? "text" : "password"}
          placeholder="Enter your password"
          value={value}
          onChange={onChange}
          className="input inputWithIcon inputPaddingRight"
        />
        <button type="button" onClick={() => setShow(!show)} className="toggleBtn">
          {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      navigate(user?.role === "organization" ? "/profile" : "/opportunities");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h1 className="title">
          Welcome back to <span>Aukas</span>
        </h1>
        <p className="subtitle">Login to continue to your existing account.</p>

        {error && <p className="errorMsg">{error}</p>}

        <div className="field">
          <Label>Email address</Label>
          <div className="inputWrapper">
            <span className="inputIcon"><FiMail size={15} /></span>
            <input
              id="email"
              type="email"
              placeholder="sokunkanha@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input inputWithIcon"
              required
            />
          </div>
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="forgotRow">
          <a href="#" className="forgotLink">Forgot password?</a>
        </div>

        <button type="submit" className="submitBtn">
          Login
        </button>

        <p className="signinRow">
          Don't have an account yet? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
