import React from 'react'
import { useRef, useState, useEffect } from "react";
import axios from "axios";

function Analyze() {

 const [chartImage, setChartImage] = useState(null);
  const [inputValue, setInputValue] = useState(""); // The URL input value state
  const [feedbackText, setFeedbackText] = useState("")

  // State to hold sentiment input (currently not used in this snippet)
  const [sentiment, setSentiment] = useState("");
  const handleSentimentChange = (e) => {
    setSentiment(e.target.value);
  };

  // Function to handle the input change for video URL
  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  // UseEffect to check when inputValue changes
  useEffect(() => {
    console.log("Updated inputValue:", inputValue);
  }, [inputValue]); // This will log whenever inputValue updates

  // Function to handle submit
  const handleSubmit = async () => {
    if (inputValue.trim() === "") {
      alert("Please enter a valid URL!");
      return;
    }

    try {
      // Extract the video ID from the URL
      const videoId = inputValue.replace('https://www.youtube.com/watch?v=', '').replace('http://www.youtube.com/watch?v=', '');
      console.log('Extracted video ID:', videoId);

      // Make an HTTP request to the FastAPI server (uncomment for real requests)
      const response = await axios.get(`http://localhost:8000/fetch-comments-csv?videoId=${videoId}`);
      console.log(response);

      // Example: Simulating the API call for a pie chart
      const chartResponse = await axios.get("http://localhost:8000/sentiment-analysis", {
        responseType: "blob", // Important to handle the image correctly
      });

      // Create an object URL from the response blob (image)
      const imageUrl = URL.createObjectURL(chartResponse.data);
      setChartImage(imageUrl); // Set the image URL to display

      // const temp = await axios.get("http://localhost:8000/feedback")
      // setFeedbackText(temp)
    } catch (error) {
      console.error("Error fetching the pie chart:", error);
    }
  };

  return (
    <section className="sentiment-section">
    <label className="sentiment-label">Enter Your Social Media Post Link</label>
    <input
      type="text"
      value={inputValue}
      onChange={handleChange}
      style={{ width: "50rem", height: "3rem", textAlign: "center", fontFamily: "urbanist" }}
      placeholder="Social Media Post Link"
    />
    <button className="btn-submit" onClick={handleSubmit}>
      Analyze Sentiment
    </button>
    {chartImage ? (
      // Display the pie chart image if available
      <img src={chartImage} alt="Sentiment Analysis Pie Chart" />
    ) : (
      <p style={{ color: "black" }}>Loading pie chart...</p>
    )}
    <p style={{color: "black"}}>{feedbackText.data}</p>
    {/* {feedbackText} */}
    {console.log("feedback -> ", feedbackText.data)}
  </section>
  )
}

export default Analyze