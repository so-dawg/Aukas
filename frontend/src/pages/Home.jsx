import Navbar from "../components/layout/Navbar";
import Hero from "../components/layout/Hero";
import OpportunityTypes from "../components/layout/OpportunityTypes";
import HowItWork from "../components/layout/HowItWork";
import { useAuth } from "../context/AuthContext";
import "../components/layout/Navbar.css";

const Home = () => {
  const { user, loading } = useAuth();
  const showOpportunityTypes = !loading && user?.role !== "organization";

  return (
    <>
      <Navbar />
      <main className="home-page">
        <Hero />
        {showOpportunityTypes && <OpportunityTypes />}
        <HowItWork />
      </main>
    </>
  );
};

export default Home;
