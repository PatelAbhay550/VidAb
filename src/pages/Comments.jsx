import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { db, auth } from "../config/firebase";
import {
  getDocs,
  query,
  collection,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { FaTrash } from "react-icons/fa";

const Comments = () => {
  const location = useLocation();
  const vidurl = location.pathname.split("/")[2];
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [keyForRerender, setKeyForRerender] = useState(0);

  const triggerRerender = () => {
    setKeyForRerender((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const q = query(
          collection(db, "Comments"),
          where("vidurl", "==", vidurl),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const commentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsData);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, [vidurl, keyForRerender]);

  const handleAddComment = async () => {
    if (!currentUser) {
      alert("Please sign in to add comments!");
      return;
    }
    if (!newComment.trim()) {
      alert("Please enter a non-empty comment!");
      return;
    }
    try {
      const newCommentData = {
        userEmail: currentUser.email,
        userName: currentUser.displayName || "Anonymous",
        userImage: currentUser.photoURL || "",
        text: newComment,
        timestamp: new Date(),
        vidurl: vidurl,
        userUid: currentUser.uid,
      };

      await addDoc(collection(db, "Comments"), newCommentData);

      setNewComment("");
      triggerRerender();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, "Comments", commentId));
      triggerRerender();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div key={keyForRerender} className="container">
      {isLoading ? (
        <p>Loading comments...</p>
      ) : (
        <div>
          {currentUser && (
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
              />
              <button onClick={handleAddComment} className="action-button">
                Add Comment
              </button>
              <button className="action-button hm">
                <Link to="/">Home</Link>
              </button>
            </div>
          )}

          {!currentUser && (
            <p className="sign-in-message">
              Please <Link to="/login">sign in</Link> to add comments.
            </p>
          )}

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="comments-container"
              style={{ marginBottom: "-40px", overflow: "hidden" }}
            >
              <p
                className="link-button"
                style={{
                  marginBottom: "10px",
                  padding: "0px 15px",
                  color: "#000",
                  width: "250px",
                }}
              >
                {comment.text}
              </p>
              <p className="comment-details ">
                <img
                  className="imgcom"
                  src={
                    comment?.userImage ||
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/1200px-User_icon_2.svg.png"
                  }
                  alt="user"
                />
                Comment by: {comment.userName}
                <br />
                {comment.timestamp.toDate().toLocaleString()}
                {currentUser?.uid === comment.userUid && (
                  <FaTrash
                    className="delete-icon"
                    onClick={() => handleDeleteComment(comment.id)}
                  />
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
