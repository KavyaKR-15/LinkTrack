import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link2, Shield, BarChart3, QrCode, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, login, register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // If user is already authenticated, send them to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { username, email, password, confirmPassword } = formData;

    // Validate inputs
    if (!email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (!isLogin) {
      if (!username) {
        setError('Please choose a username.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setFormLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-container animate-fade-in">
      <div className="home-hero">
        <div className="hero-badge">
          <Sparkles size={14} />
          <span>The Ultimate Link Management Platform</span>
        </div>
        <h1>
          Shorten. Share. <br />
          <span className="gradient-text">Track Everything.</span>
        </h1>
        <p className="hero-desc">
          Create, customize, and secure shortened URLs with in-depth browser, operating system, and visit-device metrics. All in a premium dashboard.
        </p>

        <div className="features-list">
          <div className="feature-item">
            <div className="feature-icon"><Shield size={20} /></div>
            <div>
              <h4>JWT Protection</h4>
              <p>Your dashboards and short URL statistics are protected with military-grade hashing.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><BarChart3 size={20} /></div>
            <div>
              <h4>Detailed Click Analytics</h4>
              <p>Track operating systems, browser clients, click history, and unique timeline counts.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><QrCode size={20} /></div>
            <div>
              <h4>QR Code Generator</h4>
              <p>Instantly download high-quality scan-codes for your shortened campaigns.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="home-auth-card">
        <div className="glass-card auth-card">
          <div className="auth-tabs">
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Register
            </button>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-control"
                  placeholder="e.g. janesmith"
                  value={formData.username}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block mt-3" disabled={formLoading}>
              <span>{formLoading ? 'Verifying...' : isLogin ? 'Access Dashboard' : 'Register Account'}</span>
              {!formLoading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="auth-footer mt-3 text-center">
            {isLogin ? "New to LinkTrack?" : "Already have an account?"}{' '}
            <button 
              type="button" 
              className="btn-link"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? "Sign up now" : "Log in here"}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .home-container {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 4rem;
          align-items: center;
          min-height: calc(100vh - 120px);
          padding: 2rem 0;
        }

        .home-hero {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          color: #a5b4fc;
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          width: fit-content;
        }

        .home-hero h1 {
          font-size: 3.5rem;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .gradient-text {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-desc {
          font-size: 1.15rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .feature-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .feature-icon {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          padding: 0.6rem;
          border-radius: var(--radius-md);
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-item h4 {
          font-size: 1rem;
          margin-bottom: 0.25rem;
          color: white;
        }

        .feature-item p {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .auth-card {
          border-radius: var(--radius-lg);
          padding: 2.5rem;
        }

        .auth-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 2rem;
          gap: 1.5rem;
        }

        .auth-tab {
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          padding-bottom: 0.75rem;
          color: var(--text-secondary);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .auth-tab.active {
          color: white;
          border-bottom-color: var(--accent-primary);
        }

        .btn-block {
          width: 100%;
        }

        .btn-link {
          background: transparent;
          border: none;
          color: var(--accent-primary);
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-body);
        }

        .btn-link:hover {
          color: var(--accent-secondary);
          text-decoration: underline;
        }

        .auth-footer {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1024px) {
          .home-container {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          .home-hero h1 {
            font-size: 2.75rem;
          }
        }
      `}</style>
    </div>
  );
}
