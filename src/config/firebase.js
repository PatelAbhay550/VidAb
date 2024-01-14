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
  apiKey: "AIzaSyAbZA1lKp1BbJHMRNKrDjN5ED0p1HrpCNg",
  authDomain: "vid-ab.firebaseapp.com",
  projectId: "vid-ab",
  storageBucket: "vid-ab.appspot.com",
  messagingSenderId: "228275783697",
  appId: "1:228275783697:web:de2dbe54fadce6d90749b0",
  measurementId: "G-G6RZ9WGT63",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleprovider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
