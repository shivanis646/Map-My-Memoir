import "../styles/profile.css";
import logo from "../assets/Map_My_Memoir__1_-removebg-preview.png";
import { logoutUser } from "../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  FaHome,
  FaMapMarkedAlt,
  FaPlus,
  FaCompass,
  FaHeart,
  FaUser
} from "react-icons/fa";
import { GiSecretBook } from "react-icons/gi";
import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [latestMemories, setLatestMemories] = useState([]);

  // ✅ NEW: total memories count (public + private)
  const [memoryCount, setMemoryCount] = useState(0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logoutUser();
    navigate("/login");
  };

  const handleEditClick = () => {
    navigate("/edit-profile");
  };

  useEffect(() => {
    document.title = "Map My Memoir - Profile";

    const fetchProfileData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      const userId = session.user.id;

      /* 🔹 Fetch profile info */
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id,name,profilepic,tagline,countries,favorites")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError.message);
        navigate("/login");
        return;
      }

      setUser(profileData);

      /* 🔹 Fetch latest 3 memories */
      const { data: memoryData, error: memoryError } = await supabase
        .from("memories")
        .select("id,title,memory_story,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);

      if (memoryError) {
        console.error("Error fetching latest memories:", memoryError.message);
      } else {
        setLatestMemories(memoryData || []);
      }

      /* 🔹 Count ALL memories (public + private) */
      const { count, error: countError } = await supabase
        .from("memories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        console.error("Error counting memories:", countError.message);
      } else {
        setMemoryCount(count || 0);
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="icon-sidebar">
        <div className="sidebar-top">
          <img src={logo} alt="Logo" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <Link to="/"><FaHome color="#5e412f" /></Link>
          <Link to="/mymap"><FaMapMarkedAlt color="#5e412f" /></Link>
          <Link to="/create"><FaPlus color="#5e412f" /></Link>
          <Link to="/explore"><FaCompass color="#5e412f" /></Link>
          <Link to="/vault"><GiSecretBook color="#5e412f" /></Link>
          <Link to="/favorites"><FaHeart color="#5e412f" /></Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="navbar">
          <p>Map My Memoir</p>
          <Link className="prof" to="/profile">
            <FaUser size={27} color="#5e412f" />
          </Link>
        </header>

        {/* Profile Section */}
        <section className="profile-section">
          <div className="profile-card">
            <img
              src={user.profilepic || "/default-profile.png"}
              alt="Profile"
              className="profile-img"
            />
            <h2>{user.name}</h2>
            <p className="tagline">"{user.tagline || "Life is a journey..."}"</p>

            <div className="profile-stats">
              <div>
                <h3>{memoryCount}</h3>
                <p>Memories</p>
              </div>
              <div>
                <h3>{user.countries || 0}</h3>
                <p>Countries</p>
              </div>
              <div>
                <h3>{user.favorites || 0}</h3>
                <p>Favorites</p>
              </div>
            </div>

            <div className="d">
              <button className="btn" onClick={handleEditClick}>
                Edit Profile
              </button>
              <button className="btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* Latest Memories */}
        <section className="memory-preview">
          <h3>Your Latest Memories</h3>
          <div className="memory-list">
            {latestMemories.length > 0 ? (
              latestMemories.map(memory => (
                <div className="memory-card1" key={memory.id}>
                  <h4>{memory.title}</h4>
                  <p>
                    {memory.memory_story
                      ? memory.memory_story.slice(0, 80) + "..."
                      : "No preview available"}
                  </p>
                </div>
              ))
            ) : (
              <p>No memories yet!</p>
            )}
          </div>
        </section>

        <footer>
          <p>© 2025 Map My Memoir. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default Profile;
