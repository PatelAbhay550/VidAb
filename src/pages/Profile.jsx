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
  deleteDoc, // Make sure to import deleteDoc
  doc, // Make sure to import doc
} from "firebase/firestore";
import Videos from "../components/Videos";
import { FaTrash } from "react-icons/fa"; // Import the delete icon from react-icons library
import "./Profile.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

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

  const renderDeleteButton = (video) => {
    return (
      <button
        onClick={() => handleDeleteConfirmation(video)}
        className="delete-button"
      >
        <FaTrash />
      </button>
    );
  };

  const handleDeleteConfirmation = (video) => {
    confirmAlert({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this video?",
      buttons: [
        {
          label: "Yes",
          onClick: () => handleDelete(video.id),
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  const handleDelete = async (videoId) => {
    try {
      // Delete the video from the database
      // Note: You may want to move this logic to Videos.jsx
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
              src={
                auth?.currentUser?.photoURL ||
                "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1200px-User_icon_2.svg.png"
              }
              alt="Profile"
            />

            <div className="profile-details">
              <h2>
                <div>
                  {auth.currentUser.displayName ? (
                    <p>Name: {auth.currentUser.displayName}</p>
                  ) : (
                    <p>Email: {auth.currentUser.email || "N/A"}</p>
                  )}
                </div>
              </h2>

              {userVideos.length > 0 ? (
                <>
                  <h3>Your Videos:</h3>
                  <div className="vidspro">
                    <Videos
                      className="fc"
                      videos={userVideos}
                      renderDeleteButton={renderDeleteButton}
                      onDelete={handleDelete}
                    />
                  </div>
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
                <button className="action-button hm">Home</button>
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
