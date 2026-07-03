import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import Navbar from "../components/layout/Navbar";

export default function Saved() {
  const { user } = useAuth();
  // Stores the full bookmarked opportunity objects
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  //Fetch bookmarks on mount - only for logged-in students
  useEffect(() => {
    client
      .get("/bookmarks")
      .then((res) => setBookmarks(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  // remove a bookmarks optimistically from local state
  const removeBookmark = async (oppId) => {
    try {
      await client.delete(`/bookmarks/${oppId}`);
      setBookmarks((prev) => prev.filter((b) => b.opportunity_id !== oppId));
    } catch {
      /* ignore */
    }
  };

  const closingIn = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24),
    );
    if (days <= 0) return "Closed";
    if (days === 1) return "Closes in 1 day";
    return `Closes in ${days} days`;
  };

  if (loading)
    return (
      <>
        <Navbar />{" "}
        <main style={{ padding: "2rem", textAlign: "center" }}>
          Loading…
        </main>{" "}
      </>
    );

  return (
    <>
      <Navbar />
      <main className="saved-page">
        <div className="saved-inner">
          <h1>Saved Opportunities ({bookmarks.length})</h1>
          {bookmarks.length === 0 ? (
            <div className="saved-empty">
              <p>You haven't saved any opportunities yet.</p>
              <Link to="/opportunities">Browse opportunities</Link>
            </div>
          ) : (
            <div className="saved-list">
              {bookmarks.map((b) => (
                <div key={b.id} className="saved-card">
                  <Link to={`/opportunities/${b.id}`}>
                    <h3>{b.title}</h3>
                    <p>
                      {b.organization?.org_name}.{b.category?.name}
                    </p>
                    {b.deadline && <span>{closingIn(b.deadline)}</span>}
                  </Link>
                  <button onClick={() => removeBookmark(b.id)}>
                    <FiTrash2 /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
