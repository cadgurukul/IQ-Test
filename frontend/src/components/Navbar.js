import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBrain, FaSignOutAlt, FaUserCircle, FaChartBar } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <FaBrain className="brand-icon" />
          <span>IQ Test Platform</span>
        </Link>
        
        {user && (
          <div className="navbar-menu">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/reports" className="nav-link">
              <FaChartBar /> Reports
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link">
                Admin
              </Link>
            )}
            <div className="user-menu">
              <FaUserCircle className="user-icon" />
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
