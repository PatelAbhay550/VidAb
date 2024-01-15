import React, { useState, useEffect } from "react";
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
import { Link } from "react-router-dom";

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

const Videos = ({ videos, renderDeleteButton }) => {
  const [vidlist, setVidlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);

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
    setIsDeleteConfirmed(false); // Reset confirmation state
  };

  const handleDelete = async () => {
    if (isDeleteConfirmed) {
      try {
        // Delete the video from the database
        await deleteDoc(doc(db, "Videos", selectedVideo.id));

        // Remove the deleted video from the state
        setVidlist((prevVideos) =>
          prevVideos.filter((video) => video.id !== selectedVideo.id)
        );
      } catch (error) {
        console.error("Error deleting video:", error);
      } finally {
        // Close the delete confirmation popup
        setSelectedVideo(null);
        setIsDeleteConfirmed(false);
      }
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
          <video
            className="video"
            src={video.vidurl}
            controls={selectedVideo === video}
            onClick={() => handleVideoClick(video)}
          ></video>
          <div className="video-details">
            <div className="leftd">
              <img src={video.userimg} alt={video.title} />
              <p>{video.username}</p>
            </div>
            <div className="rightd">
              <h3>{video.title} </h3>
              <p>
                {" "}
                Uploaded:{" "}
                {calculateTimeDifference(video.dateupload, video.timeupload)}
              </p>
              {renderDeleteButton && renderDeleteButton(video)}
            </div>
            <div className="comment">
              <Link to={`/comment/${video.id}`}>
                <FaComments />
              </Link>
            </div>
          </div>
        </div>
      ))}
      {selectedVideo && (
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this video?</p>
          <button onClick={() => setIsDeleteConfirmed(true)}>Yes</button>
          <button onClick={() => setSelectedVideo(null)}>No</button>
        </div>
      )}
    </div>
  );
};

export default Videos;
