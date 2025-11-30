import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          💪 GymTrack
        </Link>
        
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">🏋️ Workouts</Link>
          <Link to="/templates" className="navbar-link">📋 Templates</Link>
          <Link to="/analytics" className="navbar-link">📊 Analytics</Link>
          <Link to="/sleep" className="navbar-link">💤 Sleep</Link>
          <Link to="/nutrition" className="navbar-link">🍎 Nutrition</Link>
          <Link to="/profile" className="navbar-link">👤 Profile</Link>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
