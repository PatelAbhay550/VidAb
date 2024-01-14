import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { getDocs, query, collection, orderBy, limit } from "firebase/firestore";
import { parse, formatDistanceToNow } from "date-fns";
import { FaComments } from "react-icons/fa6";
import { Link } from "react-router-dom";

// Function to calculate the time difference
const calculateTimeDifference = (dateString, timeString) => {
  const combinedDateTime = `${dateString} ${timeString}`;
  const parsedDate = parse(combinedDateTime, "dd/MM/yyyy HH:mm:ss", new Date());
  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

const Videos = ({ videos, renderDeleteButton }) => {
  const [vidlist, setVidlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
          <video className="video" src={video.vidurl} controls></video>
          <div className="video-details">
            <div className="leftd">
              <img src={video.userimg} alt={video.title} />
              <p>{video.username}</p>
            </div>
            <div className="rightd">
              <h3>
                {video.title}{" "}
                <div className="comment">
                  <Link to={`/comment/${video.id}`}>
                    <FaComments />
                  </Link>
                </div>
              </h3>
              <p>
                {" "}
                Uploaded:{" "}
                {calculateTimeDifference(video.dateupload, video.timeupload)}
              </p>

              {renderDeleteButton && renderDeleteButton(video)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Videos;
