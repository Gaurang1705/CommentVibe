import React, { useState, useEffect } from "react";
import axios from "axios";

function Analyze() {
  const [chartImage, setChartImage] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const [positiveFeedback, setPositiveFeedback] = useState("");
  const [negativeFeedback, setNegativeFeedback] = useState("");
  const [loadingPositive, setLoadingPositive] = useState(false);
  const [loadingNegative, setLoadingNegative] = useState(false);

  // New states for video info
  const [videoId, setVideoId] = useState("");
  const [videoStats, setVideoStats] = useState({ likeCount: null, commentCount: null });
  const [videoError, setVideoError] = useState("");

  const [topComments, setTopComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  // Helper to extract video ID from various YouTube URL formats
  function extractVideoId(url) {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch {
      return null;
    }
  }

const handleSubmit = async () => {
  if (inputValue.trim() === "") {
    alert("Please enter a valid URL!");
    return;
  }

  const id = extractVideoId(inputValue.trim());
  if (!id) {
    alert("Invalid YouTube URL!");
    return;
  }

  setVideoId(id);

  // Reset all previous state
  setVideoStats({ likeCount: null, commentCount: null });
  setVideoError("");
  setTopComments([]);
  setFeedbackText("");
  setPositiveFeedback("");
  setNegativeFeedback("");
  setChartImage(null);

  try {
    // Fetch video stats
    const res = await axios.get(`http://localhost:8000/video-stats?videoId=${id}`);
    setVideoStats({
      likeCount: res.data.likeCount,
      commentCount: res.data.commentCount,
    });
  } catch (err) {
    setVideoError("Could not fetch video stats.");
  }

  try {
    setLoadingChart(true);
    setLoadingFeedback(true);
    setLoadingPositive(true);
    setLoadingNegative(true);
    setLoadingComments(true);

    // Step 1: Fetch comments and save to CSV
    console.log("Fetching comments and saving to CSV...");
    await axios.get(`http://localhost:8000/fetch-comments-csv?videoId=${id}`);
    console.log("Comments saved to CSV.");

    // Step 2: Perform sentiment analysis
    console.log("Performing sentiment analysis...");
    await axios.get("http://localhost:8000/sentiment-analysis");
    console.log("Sentiment analysis completed.");

    // Step 3: Fetch top comments
    console.log("Fetching top comments...");
    await fetchTopComments();
    console.log("Top comments fetched.");

    // Step 4: Fetch chart
    const chartResponse = await axios.get("http://localhost:8000/sentiment-analysis", {
      responseType: "blob",
    });
    const imageUrl = URL.createObjectURL(chartResponse.data);
    setChartImage(imageUrl);
    setLoadingChart(false);

    // Step 5: Fetch feedbacks
    const [feedbackResponse, posResponse, negResponse] = await Promise.all([
      axios.get("http://localhost:8000/feedback"),
      axios.get("http://localhost:8000/positive-feedback"),
      axios.get("http://localhost:8000/negative-feedback"),
    ]);

    setFeedbackText(feedbackResponse.data.feedback);
    setPositiveFeedback(posResponse.data.feedback);
    setNegativeFeedback(negResponse.data.feedback);
    setLoadingFeedback(false);
    setLoadingPositive(false);
    setLoadingNegative(false);
  } catch (error) {
    console.error("Error:", error);
    setFeedbackText("⚠️ Failed to generate feedback.");
    setPositiveFeedback("⚠️ Failed to generate positive feedback.");
    setNegativeFeedback("⚠️ Failed to generate negative feedback.");
    setLoadingChart(false);
    setLoadingFeedback(false);
    setLoadingPositive(false);
    setLoadingNegative(false);
    setLoadingComments(false);
  }
};


  const fetchTopComments = async () => {
    if (loadingComments) return; // prevent duplicate calls
    setLoadingComments(true);
    try {
      const response = await axios.get("http://localhost:8000/top-comments");
      setTopComments(response.data);
    } catch (error) {
      console.error("Error fetching top comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  return (
  <section className="sentiment-section">
    <div className="analyze-container">
      <label className="sentiment-label">Enter Your Social Media Post Link</label>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className="sentiment-input"
        placeholder="Social Media Post Link"
      />
      <button className="btn-submit" onClick={handleSubmit} style={{width: "30%"}}>
        Analyze Sentiment
      </button>

      {/* Video Embed and Stats */}
      {videoId && (
        <div className="video-container">
          <iframe
            width="480"
            height="270"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <div className="video-stats">
            {videoError ? (
              <span>{videoError}</span>
            ) : (
              <>
                <span>👍 Likes: {videoStats.likeCount ?? "Loading..."}</span>
                <span style={{ marginLeft: "2rem" }}>💬 Comments: {videoStats.commentCount ?? "Loading..."}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top 10 Comments Section */}
      <div className="comments-section">
  <h3 className="section-heading">💬 Top 10 Comments</h3>
  {loadingComments ? (
    <div className="spinner"></div> // Loader for comments
  ) : (
    <ul className="comments-list">
      {topComments.map((comment, index) => (
        <li key={index} className="comment-item">
          <p>{comment.comment}</p>
          <span>👍 {comment.likes} Likes</span>
        </li>
      ))}
    </ul>
  )}
</div>

      {/* Pie Chart Section */}
      <div className="chart-section">
        <h3>📊 Sentiment Distribution</h3>
        {loadingChart ? (
          <div className="spinner"></div>
        ) : chartImage ? (
          <img src={chartImage} alt="Sentiment Analysis Pie Chart" className="chart-image" />
        ) : null}
      </div>

      {/* Feedback Sections */}
      <div className="feedback-section">
  <h3>👍 Positive Feedback</h3>
  {loadingPositive ? (
    <div className="spinner"></div>
  ) : positiveFeedback ? (
    <div className="feedback-box">
      {positiveFeedback.split(/\n(?=\d+\.\s)|(?<=\.\s)(?=\d+\.\s)/g).map((line, index) => (
        <p key={index} style={{ margin: "0.5rem 0" }}>{line.trim()}</p>
      ))}
    </div>
  ) : null}
</div>


      <div className="feedback-section">
  <h3>👎 Negative Feedback</h3>
  {loadingNegative ? (
    <div className="spinner"></div>
  ) : negativeFeedback ? (
    <div className="feedback-box">
      {negativeFeedback.split(/\n(?=\d+\.\s)|(?<=\.\s)(?=\d+\.\s)/g).map((line, index) => (
        <p key={index} style={{ margin: "0.5rem 0" }}>{line.trim()}</p>
      ))}
    </div>
  ) : null}
</div>


      <div className="feedback-section">
  <h3>🧠 Overall Feedback from Mistral</h3>
  {loadingFeedback ? (
    <div className="spinner"></div>
  ) : feedbackText ? (
    <div className="feedback-box">
      {feedbackText.split(/\n(?=\d+\.\s)|(?<=\.\s)(?=\d+\.\s)/g).map((line, index) => (
        <p key={index} style={{ margin: "0.5rem 0" }}>{line.trim()}</p>
      ))}
    </div>
  ) : null}
</div>

    </div>

    {/* Spinner CSS */}
    <style>{`
      .section-heading {
  font-size: 2.4rem; /* Match the size of other headings */
  font-weight: bold;
  margin-bottom: 1rem;
  text-align: center; /* Center-align the heading */
}

.spinner {
  margin: 1rem auto;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #555;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

      .analyze-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }

      .sentiment-label,
      .sentiment-input,
      .btn-submit,
      .chart-section,
      .feedback-section,
      .feedback-box,
      .video-container,
      .video-stats {
        width: 100%;
        margin-bottom: 1rem;
      }

      .sentiment-label {
        font-size: 2.4rem; /* Increase font size for the label */
        font-weight: bold;
        margin-bottom: 1rem;
        text-align: center; /* Center-align the label */
      }

      .chart-section h3 {
        font-size: 2.4rem; /* Increase font size for the heading */
        font-weight: bold;
        margin-bottom: 1rem;
        text-align: center; /* Center-align the heading */
      }

      .feedback-section h3 {
        font-size: 2.4rem; /* Increase font size for feedback headings */
        font-weight: bold;
        margin-bottom: 1rem;
        text-align: center; /* Center-align the headings */
      }

      .sentiment-input {
  width: 100%;
  max-width: 50rem;
  height: 3.5rem;
  padding: 0.5rem;
  font-size: 1.6rem; /* Match the font size of the placeholder */
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #333333; /* Dark input background */
  color: #ffffff; /* White text */
  text-align: center;
  margin-bottom: 1rem;
}

.sentiment-input::placeholder {
  color: #aaaaaa; /* Light gray placeholder */
  font-size: 1.6rem; /* Ensure placeholder font size matches input text */
}

      .btn-submit {
        padding: 0.8rem 1.5rem;
        font-size: 1.6rem; /* Adjust font size for better readability */
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        text-align: center; /* Ensure text is centered */
        display: inline-block; /* Ensure proper alignment */
      }

      .btn-submit:hover {
        background-color: #45a049;
      }

      .chart-image {
        max-width: 100%;
        height: auto;
        border-radius: 12px;
        margin-top: 1rem;
      }

      .feedback-box {
        padding: 1rem;
        border-radius: 8px;
        color: #333;
      }

      .video-container iframe {
        border-radius: 12px;
      }

      .video-stats {
        margin-top: 0.5rem;
        font-size: 1.7rem;
        color: #ccc;
      }

      .comments-section {
        margin-top: 2rem;
        text-align: center;
      }

      .comments-list {
        list-style: none;
        padding: 0;
        margin: 1rem 0;
      }

      .comment-item {
        margin-bottom: 1rem;
        padding: 1rem;
        background-color: #333;
        border-radius: 8px;
        color: #fff;
      }

      .comment-item span {
        display: block;
        margin-top: 0.5rem;
        font-size: 1.4rem;
        color: #aaa;
      }
    `}</style>
  </section>
);

}

export default Analyze;