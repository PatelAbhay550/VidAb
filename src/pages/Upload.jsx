import React, { useState, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { storage } from "../config/firebase";
import { auth, db } from "../config/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import VideoThumbnail from "react-video-thumbnail";
import "./Upload.css";

const Upload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uid, setUid] = useState("");
  const [file, setFile] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [percent, setPercent] = useState(0);
  const videoRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const currDate = new Date().toLocaleDateString();
  const currTime = new Date().toLocaleTimeString();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleThumbnailChange = (e) => {
    const selectedThumbnail = e.target.files[0];
    setThumbnail(selectedThumbnail);
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please select a file.");
        return;
      }

      // Check if there is a current user
      if (auth.currentUser) {
        // If there is a current user, proceed with the upload
        const userId = auth.currentUser.uid;

        // Upload file to Firebase Storage
        const storageRef = ref(storage, `/files/${userId}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const percent = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setPercent(percent);
          },
          async (err) => {
            console.error("Error uploading file:", err);
          },
          async () => {
            // After successful upload, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Use the provided thumbnail if available; otherwise, generate one
            const thumbnailURL = thumbnail
              ? await uploadThumbnail(userId, downloadURL)
              : await generateThumbnail(downloadURL);

            // Add video details to the Firestore "Videos" collection
            const videosCollectionRef = collection(db, "Videos");
            const videoData = {
              title,
              vidurl: downloadURL,
              desc: description,
              uid: userId,
              dateupload: currDate,
              timeupload: currTime,
              thumbnail: thumbnailURL,
            };

            // Check if the user logged in via Google
            if (auth.currentUser.providerData[0]?.providerId === "google.com") {
              videoData.userimg = auth.currentUser.photoURL;
              videoData.username = auth.currentUser.email;
            } else {
              videoData.userimg =
                "https://w0.peakpx.com/wallpaper/454/815/HD-wallpaper-naruto-art-fictional-character-thumbnail.jpg";
              videoData.username = auth.currentUser.email;
            }

            // Check if there is a description and add it to the document
            if (description) {
              videoData.description = description;
            }

            // Add the document to the collection
            await addDoc(videosCollectionRef, videoData);
            toast.success("Video uploaded successfully!", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });

            // Reset form fields after successful upload
            setTitle("");
            setDescription("");
            setFile("");
            setUid("");
            setThumbnail("");
            setPercent(0);
            thumbnailInputRef.current.value = ""; // Clear the thumbnail input
          }
        );
      } else {
        setRedirectToHome(true);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const uploadThumbnail = async (userId, videoURL) => {
    // Upload custom thumbnail to Firebase Storage
    const thumbnailRef = ref(
      storage,
      `/thumbnails/${userId}/${thumbnail.name}`
    );
    await uploadBytesResumable(thumbnailRef, thumbnail);

    // Get the download URL for the uploaded thumbnail
    return await getDownloadURL(thumbnailRef);
  };

  const generateThumbnail = async (videoUrl) => {
    // Use the react-video-thumbnail library to generate a thumbnail
    try {
      const thumbnailURL = await VideoThumbnail.get(videoUrl);
      return thumbnailURL;
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return "";
    }
  };

  if (redirectToHome) {
    return <Navigate to="/" />;
  }

  return (
    <div className="upl">
      <h2>Upload Video</h2>
      {auth.currentUser ? (
        <>
          <label htmlFor="title">
            Title:
            <input
              type="text"
              value={title}
              id="title"
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <br />
          <label htmlFor="desc">
            Description:
            <textarea
              value={description}
              id="desc"
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <br />
          <label htmlFor="uploadvid">
            <br />
            Click to Select Video:
            <img
              style={{ width: "52px" }}
              src="https://cdn.pixabay.com/photo/2016/01/03/00/43/upload-1118929_640.png"
              alt="upload"
            />
            <input
              type="file"
              style={{ display: "none" }}
              accept="video/*"
              id="uploadvid"
              onChange={handleFileChange}
            />
          </label>
          <br />
          <label htmlFor="uploadthumb">
            Click to Select Thumbnail:
            <img
              style={{ width: "52px" }}
              src="https://cdn.pixabay.com/photo/2016/01/03/00/43/upload-1118929_640.png"
              alt="upload"
            />
            <input
              ref={thumbnailInputRef}
              style={{ display: "none" }}
              type="file"
              accept="image/*"
              id="uploadthumb"
              onChange={handleThumbnailChange}
            />
          </label>
          {thumbnail && (
            <img
              style={{ width: "52px" }}
              src={URL.createObjectURL(thumbnail)}
              alt="Thumbnail"
            />
          )}
          <br />
          <button className="action-button upb" onClick={handleUpload}>
            Upload
          </button>{" "}
          <Link className="action-button hm go" to="/">
            Home
          </Link>
          <p>{percent} % done</p>
        </>
      ) : (
        <p>Please sign in to upload videos. {<Navigate to="/" />}</p>
      )}
    </div>
  );
};

export default Upload;
