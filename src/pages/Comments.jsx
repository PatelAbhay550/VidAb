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
} from "firebase/firestore";
// Import your CSS file

const Comments = () => {
  const location = useLocation();
  const vidurl = location.pathname.split("/")[2];
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

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

    // Fetch comments when the component mounts or when the vidurl changes
    fetchComments();

    // Set up an authentication state observer
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    // Clean up the observer to avoid memory leaks
    return () => unsubscribe();
  }, [vidurl]);

  const handleAddComment = async () => {
    if (!currentUser) {
      // If user is not signed in, you can redirect them to the sign-in page or show a message
      alert("Please sign in to add comments!");
      return;
    }

    try {
      // Create a new comment object with necessary information
      const newCommentData = {
        userEmail: currentUser.email,
        userName: currentUser.displayName || "Anonymous",
        userImage: currentUser.photoURL || "",
        text: newComment,
        timestamp: new Date(),
        vidurl: vidurl,
      };

      // Add the new comment to the "Comments" collection in Firestore
      await addDoc(collection(db, "Comments"), newCommentData);

      // Clear the comment input after adding a comment
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="comments-container">
      {isLoading ? (
        <p>Loading comments...</p>
      ) : (
        <div>
          {currentUser && (
            <div>
              {/* Comment input for signed-in users */}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="comment-input"
              />
              <button onClick={handleAddComment} className="comment-button">
                Add Comment
              </button>
              <button
                className="homebtn"
                style={{ padding: "5px 10px", marginLeft: "20px" }}
              >
                <Link to="/">Home</Link>
              </button>
            </div>
          )}

          {!currentUser && (
            <p className="sign-in-message">
              Please <Link to="/login">sign in</Link> to add comments.
            </p>
          )}

          {/* Display comments */}
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p>{comment.text}</p>
              <p className="comment-details">
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
              </p>
              {/* Add more details as needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;
