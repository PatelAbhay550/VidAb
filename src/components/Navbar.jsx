import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth } from "../config/firebase";
import "./Navbar.css";
import { FaUpload } from "react-icons/fa";
const Navbar = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1200px-User_icon_2.svg.png"
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
      setLoading(false);

      // Set the profile image after checking the authentication state
      if (user && user.photoURL) {
        setProfile(auth.currentUser.photoURL);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="loading">Logging in...</p>;
  }

  if (isSignedIn) {
    return (
      <div className="main">
        <div className="left">
          <h1>VidAb</h1>
        </div>
        <div className="right">
          <Link to="/upload">
            <FaUpload className="upload" />
          </Link>
          <Link to="/profile">
            <img src={profile} alt="user" />
          </Link>
          <Link to="/login">
            <button>Log out</button>
          </Link>
        </div>
      </div>
    );
  } else {
    return (
      <div className="main">
        <div className="left">
          <h2>VidAb</h2>
        </div>
        <div className="right">
          <Link to="/login">
            <button className="button">Log in</button>
          </Link>
        </div>
      </div>
    );
  }
};

export default Navbar;
