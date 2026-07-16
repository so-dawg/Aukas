import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FiEye,
  FiEyeOff,
  FiUser,
  FiMail,
  FiLock,
  FiBookOpen,
  FiCalendar,
  FiBriefcase,
  FiGlobe,
  FiPhone,
  FiInfo,
} from "react-icons/fi";
import "./Signup.css";


function Label({ children }) {
  return <label className="label">{children}</label>;
}

function Input({ id, type = "text", placeholder, value, onChange, icon }) {
  return (
    <div className="inputWrapper">
      {icon && <span className="inputIcon">{icon}</span>}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input ${icon ? "inputWithIcon" : ""}`}
      />
    </div>
  );
}

function PasswordField({ id, label, value, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <div className="field">
      <Label>{label}</Label>
      <div className="passwordWrapper">
        <div className="inputWrapper">
          <span className="inputIcon"><FiLock size={15} /></span>
          <input
            id={id}
            type={show ? "text" : "password"}
            placeholder="8+ chars, one number"
            value={value}
            onChange={onChange}
            className="input inputWithIcon inputPaddingRight"
          />
          <button type="button" onClick={() => setShow(!show)} className="toggleBtn">
            {show ? <FiEyeOff size={15} /> : <FiEye size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Student Form */

function StudentForm({ data, onChange }) {
  const f = (key) => ({
    value: data[key],
    onChange: (e) => onChange(key, e.target.value),
  });

  return (
    <div>
      <div className="grid2">
        <div>
          <Label>First name</Label>
          <Input id="s-first" placeholder="Kanha" icon={<FiUser size={15} />} {...f("firstName")} />
        </div>
        <div>
          <Label>Last name</Label>
          <Input id="s-last" placeholder="Sokun" icon={<FiUser size={15} />} {...f("lastName")} />
        </div>
      </div>

      <div className="field">
        <Label>Date of birth</Label>
        <div className="inputWrapper">
          <span className="inputIcon"><FiCalendar size={15} /></span>
          <input
            id="s-dob"
            type="date"
            value={data.dob}
            onChange={(e) => onChange("dob", e.target.value)}
            className="input inputWithIcon"
          />
        </div>
      </div>

      <div className="field">
        <Label>University</Label>
        <div className="selectWrapper">
          <span className="selectIcon"><FiBookOpen size={15} /></span>
          <select
            value={data.university}
            onChange={(e) => onChange("university", e.target.value)}
            className="select selectWithIcon"
          >
            <option value="" disabled>Select your university</option>
            <option>Cambodia Academy of Digital Technology</option>
            <option>Royal University of Phnom Penh</option>
            <option>Paragon International University</option>
            <option>American University of Phnom Penh</option>
            <option>National University of Management</option>
            <option>Other</option>
          </select>
        </div>
        {data.university === "Other" && (
          <Input
            id="s-university-other"
            placeholder="Please specify your university"
            icon={<FiBookOpen size={15} />}
            {...f("universityOther")}
          />
        )}
      </div>

      <div className="field">
        <Label>Major</Label>
        <Input id="s-major" placeholder="e.g. Computer Science, Business…" icon={<FiBookOpen size={15} />} {...f("major")} />
      </div>

      <div className="field">
        <Label>Email address</Label>
        <Input id="s-email" type="email" placeholder="kanha@gmail.com" icon={<FiMail size={15} />} {...f("email")} />
      </div>

      <PasswordField
        id="s-pw"
        label="Password"
        value={data.password}
        onChange={(e) => onChange("password", e.target.value)}
      />
    </div>
  );
}

/* Org Form */

function OrgForm({ data, onChange }) {
  const f = (key) => ({
    value: data[key],
    onChange: (e) => onChange(key, e.target.value),
  });

  return (
    <div>
      <div className="field">
        <Label>Organisation name</Label>
        <Input id="o-name" placeholder="e.g. Tech Innovations Ltd." icon={<FiBriefcase size={15} />} {...f("orgName")} />
      </div>

      <div className="field">
        <Label>Industry</Label>
        <div className="selectWrapper">
          <span className="selectIcon"><FiBriefcase size={15} /></span>
          <select
            value={data.industry}
            onChange={(e) => onChange("industry", e.target.value)}
            className="select selectWithIcon"
          >
            <option value="" disabled>Select an industry</option>
            <option>Technology</option>
            <option>Finance & Banking</option>
            <option>Education</option>
            <option>Healthcare</option>
            <option>NGO / Non-profit</option>
            <option>Retail & E-commerce</option>
            <option>Media & Communications</option>
            <option>Other</option>
          </select>
        </div>
        {data.industry === "Other" && (
          <Input
            id="o-industry-other"
            placeholder="Please specify your industry"
            icon={<FiBriefcase size={15} />}
            {...f("industryOther")}
          />
        )}
      </div>

      <div className="field">
        <Label>Company size</Label>
        <div className="selectWrapper">
          <span className="selectIcon"><FiUser size={15} /></span>
          <select
            value={data.companySize}
            onChange={(e) => onChange("companySize", e.target.value)}
            className="select selectWithIcon"
          >
            <option value="" disabled>Number of employees</option>
            <option>1 – 10</option>
            <option>11 – 50</option>
            <option>51 – 200</option>
            <option>201 – 500</option>
            <option>500+</option>
          </select>
        </div>
      </div>

      <div className="field">
        <Label>Website <span className="optional">(optional)</span></Label>
        <Input id="o-website" placeholder="https://yourcompany.com" icon={<FiGlobe size={15} />} {...f("website")} />
      </div>

      <div className="field">
        <Label>Contact number <span className="optional">(optional)</span></Label>
        <Input id="o-phone" type="tel" placeholder="+855 12 345 678" icon={<FiPhone size={15} />} {...f("phone")} />
      </div>

      <div className="field">
        <Label>Work email</Label>
        <Input id="o-email" type="email" placeholder="company@gmail.com" icon={<FiMail size={15} />} {...f("email")} />
      </div>

      <PasswordField
        id="o-pw"
        label="Password"
        value={data.password}
        onChange={(e) => onChange("password", e.target.value)}
      />
    </div>
  );
}

export default function AukasSignup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [role, setRole] = useState("student");

  const [studentData, setStudentData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    university: "",
    universityOther: "",
    major: "",
    email: "",
    password: "",
  });

  const [orgData, setOrgData] = useState({
    orgName: "",
    industry: "",
    industryOther: "",
    companySize: "",
    website: "",
    phone: "",
    email: "",
    password: "",
  });

  const isStudent = role === "student";
  const updateStudent = (k, v) => setStudentData((p) => ({ ...p, [k]: v }));
  const updateOrg = (k, v) => setOrgData((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      let user;
      if (isStudent) {
        user = await register({
          full_name: `${studentData.firstName} ${studentData.lastName}`.trim(),
          email: studentData.email,
          password: studentData.password,
          role: "student",
          profile: {
            university:
              studentData.university === "Other"
                ? studentData.universityOther
                : studentData.university,
            major: studentData.major,
          },
        });
      } else {
        user = await register({
          full_name: orgData.orgName,
          email: orgData.email,
          password: orgData.password,
          role: "organization",
          profile: {
            org_name: orgData.orgName,
            website: orgData.website || undefined,
          },
        });
      }
      navigate(user?.role === "organization" ? "/profile" : "/opportunities");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h1 className="title">
          Create account on <span>Aukas</span>
        </h1>

        <p className="subtitle">
          {isStudent
            ? "Join as a student to get more opportunities."
            : "Post opportunities as an organisation."}
        </p>

        <div className="toggle">
          <button
            type="button"
            className={role === "student" ? "active" : ""}
            onClick={() => setRole("student")}
          >
            Student
          </button>
          <button
            type="button"
            className={role === "organization" ? "active" : ""}
            onClick={() => setRole("organization")}
          >
            Organisation
          </button>
        </div>

        {isStudent ? (
          <StudentForm data={studentData} onChange={updateStudent} />
        ) : (
          <OrgForm data={orgData} onChange={updateOrg} />
        )}

        {error && <p className="errorMsg">{error}</p>}

        <button type="submit" className="submitBtn">
          Create account
        </button>

        <p className="footerText">
          By creating an account you agree to Aukas'{" "}
          <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </p>

        <p className="signinRow">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
