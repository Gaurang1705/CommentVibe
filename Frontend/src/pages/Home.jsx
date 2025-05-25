import { FaLongArrowAltRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  // Function to navigate to the Analyze page
  const goToAnalyze = () => {
    navigate("/analyze"); // Redirects to the Analyze page
  };

  return (
    <main className="hero-section-main">
      <div className="container grid grid-two-cols">
        <div className="hero-content">
          <h1 className="heading-xl">
            Analyze the Pulse of Conversations: Discover Insights Behind Every Comment!
          </h1>
          <p className="paragraph">
            Uncover the true sentiment behind every comment with our advanced AI-powered sentiment analyzer. Whether it's positive, negative, or neutral, our tool helps you gain valuable insights from social media conversations. Analyze trends, understand audience emotions, and get suggestions on how to enhance your content. Join us in turning feedback into actionable intelligence!
          </p>
          <button className="btn btn-darken btn-inline bg-white-box" onClick={goToAnalyze}>
            Get Started <FaLongArrowAltRight />
          </button>
        </div>
        <div className="hero-image">
          <video
            src="/images/Commentvibevd.mp4"
            alt="Our Logo"
            className="banner-image"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      </div>
    </main>
  );
};
