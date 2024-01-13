// Auth.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
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
      console.error("Error signing in:", error.message);
    }
  };

  const googlelogin = async () => {
    try {
      await signInWithPopup(auth, googleprovider);
    } catch (error) {
      console.error("Error signing in:", error.message);
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
            Sign in with Google
          </button>
        </>
      )}
    </div>
  );
};

export default Auth;
