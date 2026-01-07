import { useEffect, useState } from "react";
import L from "leaflet";
import "../styles/mymap.css";
import logo from "../assets/Map_My_Memoir__1_-removebg-preview.png";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaMapMarkedAlt,
  FaPlus,
  FaCompass,
  FaHeart,
  FaUser
} from "react-icons/fa";
import { GiSecretBook } from "react-icons/gi";
import { supabase } from "../utils/supabaseClient";

function MapView() {
  const [memories, setMemories] = useState([]);
  const [currentMode, setCurrentMode] = useState("place");
  const [selectedFilters, setSelectedFilters] = useState({
    place: [],
    emotion: []
  });
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  // ✅ ADDED: logged-in user (ONLY ADDITION)
  const [user, setUser] = useState(null);

  // ✅ ADDED: get logged-in user (ONLY ADDITION)
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // ✅ EDITED: fetch ONLY this user's memories
  useEffect(() => {
    if (!user) return;

    document.title = "Map My Memoir - My Map";

    const fetchMemories = async () => {
      try {
        const { data, error } = await supabase
          .from("memories")
          .select("*")
          .eq("user_id", user.id) // 🔥 ONLY CHANGE
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMemories(data || []);
      } catch (err) {
        console.error("Error fetching memories:", err.message);
      }
    };

    fetchMemories();
  }, [user]);

  // ✅ Initialize Leaflet map (UNCHANGED)
  useEffect(() => {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;
    if (mapContainer._leaflet_id != null) mapContainer._leaflet_id = null;

    const newMap = L.map("map").setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(newMap);

    setMap(newMap);
    return () => newMap.remove();
  }, []);

  // ✅ Update map pins (UNCHANGED)
  useEffect(() => {
    if (!map || !memories.length) return;
    updateMapPins();
  }, [map, memories, currentMode, selectedFilters]);

  const addMapPin = (coords, color, title) => {
    if (!map || !coords || coords.length !== 2) return null;

    const icon = L.divIcon({
      className: "",
      html: `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='${color}' stroke='white' stroke-width='2'><path d='M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z'/><circle cx='12' cy='10' r='3'/></svg>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    });

    return L.marker(coords, { icon }).addTo(map).bindPopup(title);
  };

  const clearMapPins = () => {
    markers.forEach(marker => map && marker && map.removeLayer(marker));
    setMarkers([]);
  };

  const updateMapPins = () => {
    clearMapPins();
    const newMarkers = [];

    memories.forEach(mem => {
      const lat = parseFloat(mem.lat);
      const lng = parseFloat(mem.lng);
      if (!lat || !lng) return;

      let shouldShow = false;
      let color = "#38E4DA";

      if (currentMode === "place") {
        const memPlace = mem.place_type?.toLowerCase();

        shouldShow =
          selectedFilters.place.length === 0 ||
          (memPlace && selectedFilters.place.includes(memPlace));

        if (memPlace) {
          switch (memPlace) {
            case "beach": color = "#90d7d8ff"; break;
            case "mountain": color = "#aeebaeff"; break;
            case "city": color = "#fc9f9fff"; break;
            case "village": color = "#c38d75ff"; break;
            case "forest": color = "#9fc69fff"; break;
            case "temple": color = "#dab454ff"; break;
          }
        }
      }

      if (currentMode === "emotion") {
        const memEmotion = (mem.emotion || "")
          .replace(/[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/gu, "")
          .trim()
          .toLowerCase();

        shouldShow =
          selectedFilters.emotion.length === 0 ||
          (memEmotion && selectedFilters.emotion.includes(memEmotion));

        if (memEmotion) {
          switch (memEmotion) {
            case "peaceful": color = "#FFD1DC"; break;
            case "nostalgic": color = "#CBAACB"; break;
            case "happy": color = "#B5EAD7"; break;
            case "sad": color = "#AEC6CF"; break;
            case "excited": color = "#ffff80"; break;
          }
        }
      }

      if (shouldShow) {
        const marker = addMapPin(
          [lat, lng],
          color,
          `<b>${mem.title || "Untitled"}</b><br/>${
            mem.memory_story
              ? mem.memory_story.slice(0, 50) + "..."
              : "No story available"
          }`
        );
        if (marker) newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);
  };

  const handleModeToggle = e => {
    const newMode = e.target.checked ? "emotion" : "place";
    setCurrentMode(newMode);
    setSelectedFilters({ place: [], emotion: [] });
  };

  const handleFilterChange = (filterType, value, isChecked) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: isChecked
        ? [...prev[filterType], value]
        : prev[filterType].filter(v => v !== value)
    }));
  };

  const filterContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    margin: "15px 0",
    padding: "10px"
  };

  const filterLabelStyle = (color, isSelected) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: color,
    padding: "2px 5px",
    borderRadius: "8px",
    fontSize: "12px",
    cursor: "pointer",
    border: isSelected ? "3px solid #333" : "3px solid transparent",
    boxShadow: isSelected
      ? "0 2px 8px rgba(0,0,0,0.2)"
      : "0 1px 3px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
    userSelect: "none",
    fontWeight: isSelected ? "bold" : "normal"
  });

  const checkboxStyle = {
    width: "16px",
    height: "16px",
    cursor: "pointer",
    accentColor: "#333"
  };

  return (
    <div className="layout">
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

      <div className="main-content">
        <header className="navbar">
          <p>Map My Memoir</p>
          <Link className="prof" to="/profile">
            <FaUser size={27} color="#5e412f" />
          </Link>
        </header>

        <div className="map-section">
          <div className="toggle-section">
            <span>Place Tags</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={currentMode === "emotion"}
                onChange={handleModeToggle}
              />
              <span className="slider3"></span>
            </label>
            <span>Emotion Tags</span>
          </div>

          {/* FILTERS — UNCHANGED */}
          {currentMode === "place" && (
            <div style={filterContainerStyle}>
              {[
                { value: "beach", label: "🌊 Beach", color: "#90d7d8ff" },
                { value: "mountain", label: "⛰️ Mountain", color: "#aeebaeff" },
                { value: "city", label: "🏙️ City", color: "#fc9f9fff" },
                { value: "village", label: "🏡 Village", color: "#c38d75ff" },
                { value: "forest", label: "🌲 Forest", color: "#9fc69fff" },
                { value: "temple", label: "🛕 Temple", color: "#dab454ff" }
              ].map(filter => {
                const isSelected = selectedFilters.place.includes(filter.value);
                return (
                  <label
                    key={filter.value}
                    style={filterLabelStyle(filter.color, isSelected)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e =>
                        handleFilterChange(
                          "place",
                          filter.value,
                          e.target.checked
                        )
                      }
                      style={checkboxStyle}
                    />
                    {filter.label}
                  </label>
                );
              })}
            </div>
          )}

          {currentMode === "emotion" && (
            <div style={filterContainerStyle}>
              {[
                { value: "peaceful", label: "🕊️ Peaceful", color: "#FFD1DC" },
                { value: "nostalgic", label: "📻 Nostalgic", color: "#CBAACB" },
                { value: "happy", label: "😄 Happy", color: "#B5EAD7" },
                { value: "sad", label: "😢 Sad", color: "#AEC6CF" },
                { value: "excited", label: "🤩 Excited", color: "#ffff80" }
              ].map(filter => {
                const isSelected = selectedFilters.emotion.includes(filter.value);
                return (
                  <label
                    key={filter.value}
                    style={filterLabelStyle(filter.color, isSelected)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e =>
                        handleFilterChange(
                          "emotion",
                          filter.value,
                          e.target.checked
                        )
                      }
                      style={checkboxStyle}
                    />
                    {filter.label}
                  </label>
                );
              })}
            </div>
          )}

          <div className="map-container">
            <div id="map" style={{ height: "80vh", width: "100%" }} />
          </div>
        </div>

        <footer>
          <p>© 2025 Map My Memoir. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default MapView;
