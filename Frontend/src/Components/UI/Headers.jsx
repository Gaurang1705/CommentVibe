import { useState } from "react";
import { NavLink } from "react-router-dom";

export const Headers = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header>
      <div className="container">
        <div className="navbar-grid">
          <div className="Logo">
            <NavLink to="/">
              <h1 className="Heading">CommentVibe</h1>
            </NavLink>
          </div>
          <button className="ham-menu" onClick={toggleMenu}>
            ☰
          </button>
          <nav className={menuOpen ? "menu-open" : ""}>
            <ul>
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li>
                <NavLink to="/Analyze">Analyze</NavLink>
              </li>
              <li>
                <NavLink to="/About">About</NavLink>
              </li>
              <li>
                <NavLink to="/Contact">Contact</NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};