import footerContact from "../../api/footerData.json";
import { MdPlace } from "react-icons/md";
import { TbMailPlus } from "react-icons/tb";
import { FaTools } from "react-icons/fa"; // New icon for "Built By"

export const Footers = () => {
  const footerIcon = {
    MdPlace: <MdPlace />,
    FaTools: <FaTools />, // Icon for "Built By"
    TbMailPlus: <TbMailPlus />,
  };

  return (
    <footer className="footer-section">
      <div className="container grid grid-three-cols">
        {footerContact.map((curData, index) => {
          const { icon, details } = curData;
          return (
            <div className="footer-contact" key={index}>
              <div className="icon">{footerIcon[icon]}</div>
              <p className="footer-contact-details">{details}</p>
            </div>
          );
        })}
      </div>
    </footer>
  );
};