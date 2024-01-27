import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { Link } from "react-router-dom";
import { CiShare2 } from "react-icons/ci";
import { FaPlay, FaExpand, FaCompress, FaPause } from "react-icons/fa";
import {
  doc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import styles from "./Playarea.module.css";

const Playarea = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewsCount, setViewsCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const videoRef = doc(db, "Videos", videoId);
        const videoDoc = await getDoc(videoRef);

        if (videoDoc.exists()) {
          setVideo(videoDoc.data());
          document.title = videoDoc.data().title;

          // Check if the user has already viewed this video
          const existingViewQuery = query(
            collection(db, "Views"),
            where("videoId", "==", videoId),
            where("userId", "==", auth.currentUser?.uid || null)
          );
          const existingViewSnapshot = await getDocs(existingViewQuery);

          if (existingViewSnapshot.size === 0) {
            // User hasn't viewed the video yet, record the view
            const newViewData = {
              videoId,
              userId: auth.currentUser?.uid || null,
              timestamp: serverTimestamp(),
            };
            await addDoc(collection(db, "Views"), newViewData);
            setViewsCount((prevCount) => prevCount + 1);
            console.log("View recorded successfully!");
          } else {
            setViewsCount(existingViewSnapshot.size); // Set the correct view count
          }
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

  const togglePlay = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  const toggleMute = () => {
    setIsMuted((prevIsMuted) => !prevIsMuted);
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleDurationChange = () => {
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (value) => {
    const newTime = (value * duration) / 100;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      } else if (videoRef.current.msRequestFullscreen) {
        videoRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullScreen((prevIsFullScreen) => !prevIsFullScreen);
  };

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

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      if (isPlaying) {
        videoElement.play();
      } else {
        videoElement.pause();
      }

      videoElement.muted = isMuted;
      videoElement.volume = volume;
    }
  }, [isPlaying, isMuted, volume]);

  return (
    <div className={styles.playarecontainer}>
      {isLoading && <p>Loading video details...</p>}
      {video && (
        <div>
          <video
            ref={videoRef}
            className="video cld-video-player cld-fluid"
            src={video.vidurl}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={handleDurationChange}
          ></video>

          <div className={styles.customcontrols}>
            <button onClick={togglePlay}>
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>{" "}
            <span>
              {Math.floor(currentTime)} / {Math.floor(duration)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              step={1}
              value={currentTime}
              onChange={(e) => handleSeek(e.target.value)}
            />
            <button onClick={toggleFullScreen}>
              {isFullScreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>

          <h2>{video.title}</h2>
          <p>Description: {video?.desc || "No description"}</p>
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
              <p className={styles.upti}>
                Uploaded: {video.dateupload} {video.timeupload}
              </p>
              <p>{viewsCount} View(s)</p>
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

          <Link to="/" style={{ marginLeft: "20px" }} className="action-button">
            {" "}
            Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default Playarea;
