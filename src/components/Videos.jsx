import React from "react";
import { useQuery, QueryClientProvider } from "react-query";
import { db } from "../config/firebase";
import { getDocs, query, collection, orderBy, limit } from "firebase/firestore";

const Videos = () => {
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

  const { data: vidlist, isLoading } = useQuery("videos", getVids);

  if (isLoading) {
    return <p>Loading...</p>;
  }

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
