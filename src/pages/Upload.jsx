import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { storage } from "../config/firebase";
import { auth, db } from "../config/firebase";
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
    <div>
      <h2>Upload Video</h2>
      {auth.currentUser ? (
        <>
          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <br />
          <label>
            Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <br />
          <label>
            Select Video:
            <input type="file" accept="video/*" onChange={handleFileChange} />
          </label>
          <br />
          <button className="uploadbtn" onClick={handleUpload}>
            Upload
          </button>
          <p>{percent} % done</p>

          <Link className="homee" to="/">
            Home
          </Link>
        </>
      ) : (
        <p>Please sign in to upload videos.</p>
      )}
    </div>
  );
};

export default Upload;
