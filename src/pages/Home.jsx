import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Videos from "../components/Videos";
import { db } from "../config/firebase";
import { getDocs, query, collection, orderBy, limit } from "firebase/firestore";

const Home = () => {
  const [latestVideos, setLatestVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      {isLoading ? <p>Loading...</p> : <Videos videos={latestVideos} />}
    </>
  );
};

export default Home;
