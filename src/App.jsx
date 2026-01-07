import { BrowserRouter, Routes, Route } from "react-router-dom";
import Project from "./pages/project";
import Profile from "./pages/profile";
import Signup from "./pages/signup";
import Login from "./pages/login";
import Create from "./pages/create";
import ProtectedRoute from "./components/ProtectedRoute";
import MapView from "./pages/mymap";
import Explore from "./pages/explore";
import MemoryDetails from "./pages/memory";
import Vault from "./pages/vault";
import EditProfile from "./pages/editprofile";
import MemoryDetails3 from "./pages/vaultmemory";
import Favorites from "./pages/favorites";
import MemoryDetails2 from "./pages/favmemory";
import { MemoryProvider } from "./context/MemoryContext";

function App() {
  return (
    <BrowserRouter>
      <MemoryProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Project />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/memory/:id" element={<MemoryDetails />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/vaultmemory/:id" element={<MemoryDetails3 />} />
          <Route path="/favmemory/:id" element={<MemoryDetails2 />} />

          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Create />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mymap"
            element={
              <ProtectedRoute>
                <MapView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vault"
            element={
              <ProtectedRoute>
                <Vault />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryProvider>
    </BrowserRouter>
  );
}

export default App;
