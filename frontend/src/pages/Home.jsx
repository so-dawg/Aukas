import Navbar from "../components/layout/Navbar";
import Hero from "../components/layout/Hero";
import OpportunityTypes from "../components/layout/OpportunityTypes";
import HowItWork from "../components/layout/HowItWork";
import OrgHero from "../components/layout/OrgHero";
import "../components/layout/Navbar.css";

const Home = () => {
  return (
    <>
      <Navbar />
      <main className="home-page">
        <Hero />
        <OpportunityTypes />
        <HowItWork />
        <OrgHero />
      </main>
    </>
  );
};

export default Home;
