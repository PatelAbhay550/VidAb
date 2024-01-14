// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnGSGLwbSk0bHChztE9YxpA3SBENEfMqQ",
  authDomain: "myblog-65oq23.firebaseapp.com",
  projectId: "myblog-65oq23",
  storageBucket: "myblog-65oq23.appspot.com",
  messagingSenderId: "896041618741",
  appId: "1:896041618741:web:d0642510e1a99befd8507c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleprovider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
