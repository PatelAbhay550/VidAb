import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../config/firebase";
import { Link } from "react-router-dom";
import { CiShare2 } from "react-icons/ci";
import { doc, getDoc } from "firebase/firestore";
import styles from "./Playarea.module.css";

const Playarea = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const videoRef = doc(db, "Videos", videoId);
        const videoDoc = await getDoc(videoRef);

        if (videoDoc.exists()) {
          setVideo(videoDoc.data());
          document.title = videoDoc.data().title;
        } else {
          console.log("Video not found");
        }
      } catch (error) {
        console.error("Error fetching video details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: video.title,

          url: window.location.href,
        })
        .then(() => console.log("Share successful"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Web Share API not supported in your browser.");
    }
  };

  return (
    <div className={styles.playarecontainer}>
      {isLoading && <p>Loading video details...</p>}
      {video && (
        <div>
          <video className="video" src={video.vidurl} controls></video>

          <h2>Title: {video.title}</h2>
          <p>Desc: {video?.description || "No description"}</p>
          <div className={styles.user}>
            <img
              src={
                video.userimg ||
                "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1200px-User_icon_2.svg.png"
              }
              alt={video.title}
            />
            <div className="left">
              <p>{video.username}</p>
              <p>
                Uploaded: {video.dateupload} {video.timeupload}
              </p>
            </div>
          </div>

          <div className="comment">
            <Link
              style={{ color: "inherit", textDecoration: "none" }}
              to={`/comment/${videoId}`}
            >
              <div className="comop"> Comments:</div>
            </Link>
          </div>

          <button className="action-button" onClick={handleShare}>
            <CiShare2 />
            Share
          </button>

          <Link to="/" className="action-button">
            {" "}
            Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default Playarea;
