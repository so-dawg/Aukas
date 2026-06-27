import { useSearchParams } from "react-router-dom";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");

  return (
    <div>
      <h1>Sign Up</h1>
      {role && <p>Role: {role}</p>}
    </div>
  );
};

export default Signup;
