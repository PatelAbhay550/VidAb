import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { getDocs, query, collection, orderBy, limit } from "firebase/firestore";

const Videos = () => {
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

        // Store the fetched data in local storage
        localStorage.setItem("videosData", JSON.stringify(videosData));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check if data is already present in local storage
    const storedVideosData = JSON.parse(localStorage.getItem("videosData"));

    if (storedVideosData) {
      // Use stored data if available
      setVidlist(storedVideosData);
      setIsLoading(false);
    } else {
      // Fetch data if not present in local storage
      fetchData();
    }
  }, []); // Fetch data on component mount

  return (
    <div className="containerv">
      {vidlist.map((video) => (
        <div className="video-card" key={video.id}>
          <video className="video" src={video.vidurl} controls></video>
          <div className="video-details">
            <div className="leftd">
              <img src={video.userimg} alt={video.title} />
              <p>{video.username}</p>
            </div>
            <div className="rightd">
              <h3>{video.title}</h3>
              <p> Uploaded: {video.timeupload}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Videos;
