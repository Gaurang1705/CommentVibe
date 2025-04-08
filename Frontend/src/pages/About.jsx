import infoData from "../api/InfoData.json";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export const About = () => {
  return (
    <section className="section-about container">
      <h2 className="container-title">"Behind The Scenes: Meet The Team"</h2>

      <div className="gradient-cards">
        {infoData.map((info) => {
          const { id, Name, LinkedIn, GitHub } = info;
          return (
            <div className="card" key={id}>
              <div className="container-card bg-blue-box">
                <p className="card-title">{Name}</p>
                <div className="card-icons">
                  <a
                    href={LinkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="icon-link"
                  >
                    <FaLinkedin className="icon linkedin-icon" />
                  </a>
                  <a
                    href={GitHub}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="icon-link"
                  >
                    <FaGithub className="icon github-icon" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};