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
  apiKey: "AIzaSyDTXH3OW1EUbee8yXt04YkC7zvTWfCt1Ts",
  authDomain: "myblog-aee44.firebaseapp.com",
  projectId: "myblog-aee44",
  storageBucket: "myblog-aee44.appspot.com",
  messagingSenderId: "851291435958",
  appId: "1:851291435958:web:b7767c42b275579bf74717",
  measurementId: "G-D7D8PWJ936",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleprovider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
