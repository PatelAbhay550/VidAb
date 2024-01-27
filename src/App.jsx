import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./components/Auth";
import Profile from "./pages/Profile";
import Upload from "./pages/Upload";
import { ToastContainer } from "react-toastify";
import Comments from "./pages/Comments";
import Playarea from "./pages/Playarea";

function App() {
  return (
    <>
      <ToastContainer />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/comment/:videoId" element={<Comments />} />
          <Route path="/Playarea/:videoId" element={<Playarea />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
