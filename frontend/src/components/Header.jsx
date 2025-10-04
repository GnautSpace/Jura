import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from "react-icons/fa";
import './Header.css';

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header>
      <div className="logo-div">
        <img src="jura-logo-2.png" className="logo" alt="logo" />
      </div>
      <div className="menu-icon" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      <nav className={`nav-menu ${isOpen ? "open" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/features">Features</Link>
        <Link to="/about">About</Link>
      </nav>
    </header>
  );
}

export default Header;
