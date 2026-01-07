import "../styles/project.css";
import "../styles/create.css";
import logo from "../assets/Map_My_Memoir__1_-removebg-preview.png";
import bgImage from "../assets/bg.png";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaMapMarkedAlt, FaPlus, FaCompass, FaHeart, FaUser, FaLock, FaGlobe } from "react-icons/fa";
import { GiSecretBook } from "react-icons/gi";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

function Create() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    memoryStory: "",
    geoTag: "",
    maploc: "",
    cultureTag: "",
    coreMemory: "",
    foodTag: "",
    storyPlace: "",
    emotion: "",
    placeType: "",
    isPublic: false,
    images: []
  });

  useEffect(() => {
    document.title = "Map My Memoir - Create new memory";
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, isPublic: checked });
    } else if (type === "file") {
      setFormData({ ...formData, images: files });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("You must be logged in!");
      return;
    }
    const userId = session.user.id;

    // --- Upload Images ---
    // --- Upload Images ---
    // --- Upload Images ---
    // --- Upload Images ---
    const uploadedFiles = [];
    if (formData.images && formData.images.length > 0) {
      for (let i = 0; i < formData.images.length; i++) {
        const file = formData.images[i];
        const fileName = `${Date.now()}_${file.name}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("memory-images")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          alert("Failed to upload image!");
          return;
        }

        // Save just the file name/path in the table
        uploadedFiles.push(fileName);
      }
    }




    // --- Resolve Short URL to Lat/Lng ---
    // Resolve lat/lng from map link
    // --- Resolve Short URL to Lat/Lng using Supabase Edge Function ---
    // --- Resolve Short URL to Lat/Lng ---
    // --- Resolve Short URL to Lat/Lng using Supabase Edge Function ---
    // --- Resolve Short URL to Lat/Lng ---
    let lat = null, lng = null;
    if (formData.maploc) {
      try {
        const res = await fetch(`/api/geo-resolve?url=${encodeURIComponent(formData.maploc)}`);
        const data = await res.json();

        if (data.lat && data.lng) {
          lat = data.lat;
          lng = data.lng;
          console.log(lng, lat);
        } else {
          console.warn("Could not resolve coordinates:", data.error);
        }
      } catch (err) {
        console.error("Resolve failed:", err);
      }
    }






    // --- Insert Memory ---
    const { error } = await supabase.from("memories").insert([
      {
        user_id: userId,
        title: formData.title,
        memory_story: formData.memoryStory,
        geo_tag: formData.geoTag,
        maploc: formData.maploc,
        lat,
        lng,
        culture_tag: formData.cultureTag,
        core_memory: formData.coreMemory,
        food_tag: formData.foodTag,
        story_place: formData.storyPlace,
        emotion: formData.emotion,
        place_type: formData.placeType,
        isPublic: formData.isPublic,
        images: uploadedFiles
      }
    ]);

    if (error) {
      console.error("Error creating memory:", error.message);
      alert("Error creating memory!");
      return;
    }

    alert("Memory created successfully!");
    navigate("/vault");
  };

  return (
    <div className="layout">
      <aside className="icon-sidebar">
        <div className="sidebar-top">
          <img src={logo} alt="Logo" className="sidebar-logo" />
        </div>
        <nav className="sidebar-nav">
          <Link to="/" title="Home"><FaHome color="#5e412f" /></Link>
          <Link to="/mymap" title="My Map"><FaMapMarkedAlt color="#5e412f" /></Link>
          <Link to="/create" title="Create Memory"><FaPlus color="#5e412f" /></Link>
          <Link to="/explore" title="Explore"><FaCompass color="#5e412f" /></Link>
          <Link to="/vault" title="Vault"><GiSecretBook color="#5e412f" /></Link>
          <Link to="/favorites" title="Favorites"><FaHeart color="#5e412f" /></Link>
        </nav>
      </aside>

      <div className="main-content" style={{ backgroundImage: `url(${bgImage})` }}>
        <header className="navbar">
          <p>Map My Memoir</p>
          <Link className="prof" to="/profile" title="Profile"><FaUser size={27} color="#5e412f" /></Link>
        </header>

        <main className="form-container">
          <h2>Create a New Memory</h2>
          <form onSubmit={handleSubmit}>
            <label>Memory Title:</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Sunset at Jaisalmer Fort" required />

            <label>Memory Story:</label>
            <textarea rows="6" maxLength="1500" name="memoryStory" value={formData.memoryStory} onChange={handleChange} placeholder="Describe your memory..."></textarea>

            <label>Geo Tag:</label>
            <input type="text" name="geoTag" value={formData.geoTag} onChange={handleChange} placeholder="e.g., Jaisalmer, Rajasthan" required />

            <label>Google Maps Link:</label>
            <input type="text" name="maploc" value={formData.maploc} onChange={handleChange} placeholder="Short or full Google Maps link" required />

            <label>Culture Tag:</label>
            <input type="text" name="cultureTag" value={formData.cultureTag} onChange={handleChange} placeholder="e.g., Rajasthani Folk Art" required />

            <label>Core Memory Tag:</label>
            <input type="text" name="coreMemory" value={formData.coreMemory} onChange={handleChange} placeholder="e.g., First solo trip" required />

            <label>Food Tag (Optional):</label>
            <input type="text" name="foodTag" value={formData.foodTag} onChange={handleChange} placeholder="e.g., Dal Baati Churma" />

            <label>Story of the Place (Optional):</label>
            <textarea rows="3" name="storyPlace" value={formData.storyPlace} onChange={handleChange} placeholder="e.g., Built by Rawal Jaisal in 1156 AD..." />

            <label>Emotion Tag:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="emotion"
                  value="peaceful"
                  checked={formData.emotion === "peaceful"}
                  onChange={handleChange}
                />
                😌 Peaceful
              </label>

              <label>
                <input
                  type="radio"
                  name="emotion"
                  value="happy"
                  checked={formData.emotion === "happy"}
                  onChange={handleChange}
                />
                😊 Happy
              </label>

              <label>
                <input
                  type="radio"
                  name="emotion"
                  value="nostalgic"
                  checked={formData.emotion === "nostalgic"}
                  onChange={handleChange}
                />
                🕰️ Nostalgic
              </label>

              <label>
                <input
                  type="radio"
                  name="emotion"
                  value="sad"
                  checked={formData.emotion === "sad"}
                  onChange={handleChange}
                />
                😔 Sad
              </label>

              <label>
                <input
                  type="radio"
                  name="emotion"
                  value="excited"
                  checked={formData.emotion === "excited"}
                  onChange={handleChange}
                />
                🤩 Excited
              </label>
            </div>



            <label>Photo:</label>
            <input type="file" name="images" accept="image/*" capture="environment" multiple onChange={handleChange} />

            <label>Place Type:</label>
            <div className="radio-group">
              <label><input type="radio" name="placeType" value="beach" onChange={handleChange} /> 🏖️ Beach</label>
              <label><input type="radio" name="placeType" value="mountain" onChange={handleChange} /> 🏔️ Mountain</label>
              <label><input type="radio" name="placeType" value="city" onChange={handleChange} /> 🏙️ City</label>
              <label><input type="radio" name="placeType" value="village" onChange={handleChange} /> 🏡 Village</label>
              <label><input type="radio" name="placeType" value="forest" onChange={handleChange} /> 🌲 Forest</label>
              <label><input type="radio" name="placeType" value="temple" onChange={handleChange} /> 🛕 Temple</label>
            </div>

            <label>Visibility:</label>
            <div className="visibility-toggle">
              <span><FaLock size={23} color="#5e412f" /></span>
              <label className="switch">
                <input type="checkbox" checked={formData.isPublic} onChange={handleChange} />
                <span className="slider1"></span>
              </label>
              <span><FaGlobe size={23} color="#5e412f" /></span>
            </div>

            <button type="submit">Save Memory</button>
          </form>
        </main>

        <footer>
          <p>© 2025 Map My Memoir</p>
        </footer>
      </div>
    </div>
  );
}

export default Create;
