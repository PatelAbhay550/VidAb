import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { storage } from "../config/firebase";
import { auth, db } from "../config/firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const Upload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uid, setUid] = useState("");
  const [file, setFile] = useState("");
  const [redirectToHome, setRedirectToHome] = useState(false);
  const [percent, setPercent] = useState(0);
  const currDate = new Date().toLocaleDateString();
  const currTime = new Date().toLocaleTimeString();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
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
        // Upload file to Firebase Storage
        // Assuming userId is obtained from the authenticated user
        const userId = auth.currentUser.uid;
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

            // Add video details to the Firestore "Videos" collection
            const videosCollectionRef = collection(db, "Videos");

            // Define the data to be added to the Firestore document
            const videoData = {
              title,
              vidurl: downloadURL,
              uid: userId,
              dateupload: currDate,
              timeupload: currTime,
            };

            // Check if the user logged in via Google
            if (auth.currentUser.providerData[0]?.providerId === "google.com") {
              // If the user logged in via Google, use Google profile image and email
              videoData.userimg = auth.currentUser.photoURL;
              videoData.username = auth.currentUser.email;
            } else {
              // If the user did not log in via Google, use default values
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
            setPercent(0);
          }
        );
      } else {
        // If there is no current user, set redirectToHome to true
        setRedirectToHome(true);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  if (redirectToHome) {
    // Redirect to home if there is no current user
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
          <label
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
            htmlFor="uploadvid"
          >
            <img
              style={{ width: "52px" }}
              src="https://cdn.pixabay.com/photo/2016/01/03/00/43/upload-1118929_640.png"
              alt="upload"
            />
            Select Video:
            <input
              style={{ display: "none" }}
              type="file"
              accept="video/*"
              id="uploadvid"
              onChange={handleFileChange}
            />
          </label>
          <br />
          <button className="action-button upb" onClick={handleUpload}>
            Upload
          </button>
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
