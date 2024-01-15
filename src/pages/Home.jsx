import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Videos from "../components/Videos";
import { db } from "../config/firebase";
import { getDocs, query, collection, orderBy, limit } from "firebase/firestore";

const PrivacyPopup = ({ onClose }) => {
  return (
    <div className="privacy-popup-overlay">
      <div className="privacy-popup">
        <h2>Privacy Policy</h2>

        <h2>Privacy Policy for Vidab - Video Streaming Web App</h2>

        <p>Last Updated: [Date]</p>

        <p>
          Welcome to Vidab, a video streaming web app designed for your
          entertainment. Before using Vidab, please take a moment to review our
          Privacy Policy. By accessing or using Vidab, you agree to the terms
          outlined in this policy.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 User-Provided Information</h3>

        <p>
          To enhance your Vidab experience, we may collect certain information
          from you, including but not limited to:
        </p>

        <ul>
          <li>
            <strong>Account Information:</strong> When you create an account, we
            collect your username, email address, and password.
          </li>
          <li>
            <strong>Profile Information:</strong> Users have the option to
            provide additional information such as a profile picture and bio.
          </li>
        </ul>

        <h3>1.2 Automatically Collected Information</h3>

        <p>We may also collect certain information automatically, including:</p>

        <ul>
          <li>
            <strong>Usage Data:</strong> Vidab collects data about your
            interactions with the platform, such as the videos you watch,
            duration, and user engagement.
          </li>
          <li>
            <strong>Device Information:</strong> We may collect information
            about the devices you use to access Vidab, such as device type,
            operating system, and browser type.
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>

        <p>We use the collected information to:</p>

        <ul>
          <li>Provide and improve Vidab's features and services.</li>
          <li>
            Personalize your experience and deliver content tailored to your
            preferences.
          </li>
          <li>Respond to your inquiries and provide customer support.</li>
          <li>Send you important notifications and updates about Vidab.</li>
        </ul>

        <h2>3. Sharing of Information</h2>

        <h3>3.1 User-Generated Content</h3>

        <p>
          Users are solely responsible for the content they upload to Vidab. We
          do not claim ownership of any videos, and users retain full
          responsibility for the legality and appropriateness of their content.
        </p>

        <h3>3.2 Third-Party Service Providers</h3>

        <p>
          We may engage third-party service providers to assist with various
          aspects of Vidab, such as hosting, analytics, and customer support.
          These service providers may have access to your information for these
          purposes.
        </p>

        <h2>7. Contact Us</h2>

        <p>
          If you have any questions or concerns about this Privacy Policy,
          Contact us at:{" "}
          <a href="mailto:patelahay550@gmail.com">patelahay550@gmail.com</a>
        </p>

        <p>
          By using Vidab, you acknowledge that you have read and understood this
          Privacy Policy.
        </p>

        <button onClick={onClose}>I Agree</button>
      </div>
    </div>
  );
};

const Home = () => {
  document.title = "Vidab - Video streaming App";
  const [latestVideos, setLatestVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(
    !localStorage.getItem("privacyAccepted")
  );

  const handlePrivacyAcceptance = () => {
    localStorage.setItem("privacyAccepted", "true");
    setShowPrivacyPopup(false);
  };

  useEffect(() => {
    const fetchLatestVideos = async () => {
      try {
        const q = query(
          collection(db, "Videos"),
          orderBy("timeupload", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        const videosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLatestVideos(videosData);
      } catch (error) {
        console.error("Error fetching latest videos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestVideos();
  }, []);

  return (
    <>
      <Navbar />
      {showPrivacyPopup && <PrivacyPopup onClose={handlePrivacyAcceptance} />}
      {isLoading ? <p>Loading...</p> : <Videos videos={latestVideos} />}
    </>
  );
};

export default Home;
