import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db } from "../config/firebase";
import {
  getDocs,
  query,
  collection,
  orderBy,
  limit,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { parse, formatDistanceToNow } from "date-fns";
import { FaComments } from "react-icons/fa6";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const calculateTimeDifference = (dateString, timeString) => {
  try {
    if (!dateString || !timeString) {
      throw new Error("Invalid date or time");
    }

    const combinedDateTime = `${dateString} ${timeString}`;
    const parsedDate = parse(
      combinedDateTime,
      "MM/dd/yyyy hh:mm:ss a",
      new Date()
    );

    if (isNaN(parsedDate.getTime())) {
      throw new Error("Invalid parsed date");
    }

    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (error) {
    console.error("Error calculating time difference:", error);
    return "Some time Ago";
  }
};

const Videos = ({ videos, renderDeleteButton, onDelete }) => {
  const [vidlist, setVidlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const getVids = async () => {
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
      return videosData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
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
      await deleteDoc(doc(db, "Videos", videoId));

      // Remove the deleted video from the state
      setVidlist((prevVideos) =>
        prevVideos.filter((video) => video.id !== videoId)
      );

      // Propagate the delete action to the parent component
      onDelete && onDelete(videoId);

      if (selectedVideo && selectedVideo.id === videoId) {
        setSelectedVideo(null);
      }
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const videosData = await getVids();
        setVidlist(videosData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data on component mount
    fetchData();
  }, []);

  return (
    <div className="containerv">
      {videos.map((video) => (
        <div className="video-card" key={video.id}>
          <Link to={`/playarea/${video.id}`}>
            {video.thumbnail ? (
              <img
                className="video-thumbnail"
                src={video.thumbnail}
                style={{
                  width: "100%",
                  objectFit: "contain",
                  background: "#6c95ff",
                  aspectRatio: "16/9",
                }}
                alt={video.title}
              />
            ) : (
              <video
                className="video"
                src={video.vidurl}
                controls={selectedVideo === video}
                style={{
                  width: "100%",
                  objectFit: "contain",
                  background: "#6c95ff",
                  aspectRatio: "16/9",
                }}
                onClick={() => handleVideoClick(video)}
              ></video>
            )}
          </Link>
          <div className="video-details">
            <div className="leftd">
              <img src={video.userimg} alt={video.title} />
              <p>{video.username}</p>
            </div>
            <div className="rightd">
              <h3>{video.title} </h3>
              <p>
                Uploaded:{" "}
                {calculateTimeDifference(video.dateupload, video.timeupload)}
              </p>
              {renderDeleteButton && renderDeleteButton(video)}
            </div>
          </div>
        </div>
      ))}
      {selectedVideo === null && <p></p>}
      {selectedVideo && (
        <div>
          <h2>Selected Video Details</h2>
          <p>ID: {selectedVideo.id}</p>
          <p>Title: {selectedVideo.title}</p>
          {/* Add more details as needed */}
        </div>
      )}
    </div>
  );
};

export default Videos;
