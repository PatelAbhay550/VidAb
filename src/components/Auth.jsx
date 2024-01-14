// Auth.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  linkWithCredential,
} from "firebase/auth";
import { auth, googleprovider } from "../config/firebase";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsSignedIn(!!user);
        setLoading(false);
      });

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    }, 1000);
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  const signin = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        // User already exists, try signing in instead
        try {
          await signInWithEmailAndPassword(auth, email, pass);
        } catch (signInError) {
          console.error(
            "Error signing in with email/password:",
            signInError.message
          );
        }
      } else {
        console.error("Error signing in with email/password:", error.message);
      }
    }
  };

  const googlelogin = async () => {
    try {
      // Attempt to sign in with Google
      await signInWithPopup(auth, googleprovider);
    } catch (error) {
      if (error.code === "auth/account-exists-with-different-credential") {
        // User already exists with a different credential, link accounts
        const credential = error.credential;
        const email = error.email;

        try {
          // Retrieve the existing account's credentials and link it with the Google account
          const existingUser = await signInWithEmailAndPassword(
            auth,
            email,
            "password"
          );
          await linkWithCredential(existingUser, credential);
        } catch (linkError) {
          console.error("Error linking accounts:", linkError.message);
        }
      } else {
        console.error("Error signing in with Google:", error.message);
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="auth-container">
      {isSignedIn ? (
        <>
          <p>You are signed in as: {auth.currentUser.email}</p>
          <button className="button" onClick={logout}>
            Log out
          </button>
          <Link to="/">
            <button className="button link-button">Home</button>
          </Link>
        </>
      ) : (
        <>
          <input
            className="input-field"
            type="text"
            placeholder="Enter Email.."
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input-field"
            type="password"
            placeholder="Enter Password.."
            onChange={(e) => setPass(e.target.value)}
          />
          <button className="button" onClick={signin}>
            Sign in
          </button>
          <br />
          <button className="button link-button" onClick={googlelogin}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png"
              alt="google"
            />
            Sign in with Google
          </button>
        </>
      )}
    </div>
  );
};

export default Auth;
