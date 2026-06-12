import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link2, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to={user ? "/dashboard" : "/"} className="navbar-logo">
          <div className="logo-icon-wrapper">
            <Link2 size={22} className="logo-icon" />
          </div>
          <span>LinkTrack</span>
        </Link>

        <nav className="navbar-nav">
          {user ? (
            <div className="nav-user-actions">
              <Link to="/dashboard" className="nav-link">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              <div className="nav-divider"></div>
              <div className="user-profile-badge">
                <User size={16} />
                <span className="username-text">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Log Out">
                <LogOut size={18} />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-public-actions">
              <span className="tagline">Simplifying Short Links</span>
            </div>
          )}
        </nav>
      </div>

      <style>{`
        .navbar-header {
          background: rgba(10, 15, 29, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0.85rem 1.5rem;
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          color: white;
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.35rem;
          background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .logo-icon-wrapper {
          background: var(--accent-gradient);
          border-radius: var(--radius-sm);
          padding: 0.35rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }

        .logo-icon {
          color: white;
          transform: rotate(-45deg);
        }

        .navbar-logo:hover .logo-icon-wrapper {
          transform: scale(1.05);
        }

        .navbar-nav {
          display: flex;
          align-items: center;
        }

        .tagline {
          font-family: var(--font-heading);
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .nav-user-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
          transition: color var(--transition-fast);
        }

        .nav-link:hover {
          color: white;
        }

        .nav-divider {
          width: 1px;
          height: 18px;
          background: var(--border-color);
        }

        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .username-text {
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 600;
        }

        .btn-logout {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.4rem 0.6rem;
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .btn-logout:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.08);
        }

        @media (max-width: 640px) {
          .logout-text, .username-text, .nav-divider {
            display: none;
          }
          .user-profile-badge {
            padding: 0.4rem;
          }
        }
      `}</style>
    </header>
  );
}
