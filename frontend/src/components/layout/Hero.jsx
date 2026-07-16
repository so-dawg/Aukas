import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import HomeHeroImage from "../../assets/HomeHeroimg.png";
import "./Hero.css";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="hero__left">
        <h1 className="hero__title">
          Aukas - <span className="hero__title--blue">All opportunities in one.</span>
        </h1>
        {!user && (
          <>
            <p className="hero__desc">
              Are you student or Organization?
            </p>
            <div className="hero__buttons">
              <button className="btn-primary" onClick={() => navigate("/signup")}>
                Sign Up
              </button>
            </div>
          </>
        )}
      </div>

      <div className="hero__visual" aria-hidden="true">
        <img className="hero__image" src={HomeHeroImage} alt="" />
      </div>
    </section>
  );
};

export default Hero;
