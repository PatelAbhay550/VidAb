import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";

const Videos = () => {
  const [vidlist, setVidlist] = useState([]);
  const vidref = collection(db, "Videos");

  useEffect(() => {
    const getVids = async () => {
      try {
        const querySnapshot = await getDocs(vidref);
        const videosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVidlist(videosData);
      } catch (err) {
        console.error(err);
      }
    };

    getVids();
  }, [vidref]);

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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Videos;
