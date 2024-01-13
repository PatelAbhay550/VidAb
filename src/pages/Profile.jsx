import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { auth } from "../config/firebase";
import "./Profile.css";

const Profile = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const userprf =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1200px-User_icon_2.svg.png";
  useEffect(() => {
    // Check if the user is already signed in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="loading">Logging in...</p>;
  }

  if (isSignedIn) {
    return (
      <div className="mainp">
        <div className="container">
          <div className="profile-card">
            <img className="profile-image" src={userprf} alt="Profile" />
            <div className="profile-details">
              <h2>{auth.currentUser.email}</h2>
              <Link to="/">
                <button className="action-button">Home</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <>{Navigate("/")}</>;
  }
};

export default Profile;
