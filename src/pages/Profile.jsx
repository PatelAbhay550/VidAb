import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import {
  getDocs,
  query,
  collection,
  orderBy,
  limit,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Videos from "../components/Videos";
import { FaTrash } from "react-icons/fa"; // Import the delete icon from react-icons library
import "./Profile.css";

const Profile = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userVideos, setUserVideos] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
      setLoading(false);

      if (user) {
        // If the user is signed in, fetch their videos
        fetchUserVideos(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserVideos = async (userId) => {
    try {
      const q = query(
        collection(db, "Videos"),
        where("uid", "==", userId),
        orderBy("timeupload", "desc"),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const videosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserVideos(videosData);
    } catch (error) {
      console.error("Error fetching user videos:", error);
    }
  };
  function renderDeleteButton(video) {
    return (
      <button onClick={() => handleDelete(video.id)} className="delete-button">
        <FaTrash />
      </button>
    );
  }
  const handleDelete = async (videoId) => {
    try {
      // Delete the video from the database
      await deleteDoc(doc(db, "Videos", videoId));

      // Remove the deleted video from the state
      setUserVideos((prevVideos) =>
        prevVideos.filter((video) => video.id !== videoId)
      );
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  if (loading) {
    return <p className="loading">Logging in...</p>;
  }

  if (isSignedIn) {
    return (
      <div className="mainp">
        <div className="container">
          <div className="profile-card">
            <img
              className="profile-image"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1200px-User_icon_2.svg.png"
              alt="Profile"
            />
            <div className="profile-details">
             <h2>{auth.currentUser.displayName}</h2>

              {userVideos.length > 0 ? (
                <>
                  <h3>Your Videos:</h3>
                  <Videos
                    videos={userVideos}
                    renderDeleteButton={renderDeleteButton}
                  />
                </>
              ) : (
                <>
                  <p>You haven't uploaded any videos yet.</p>
                  <Link to="/upload">
                    <button className="action-button">Upload Video</button>
                  </Link>
                </>
              )}
              <Link to="/">
                <button className="action-button">Home</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <Navigate to="/" />;
  }
};

export default Profile;
