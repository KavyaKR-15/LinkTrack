import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import QrCodeModal from '../components/QrCodeModal';
import { 
  Link2, Sparkles, Calendar, Trash2, Copy, BarChart3, 
  QrCode, ExternalLink, RefreshCw, Plus, HelpCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [title, setTitle] = useState('');
  
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // UI state
  const [copiedId, setCopiedId] = useState(null);
  const [selectedQr, setSelectedQr] = useState(null); // { url, title }

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    if (user) {
      fetchUrls();
    }
  }, [user, authLoading, navigate]);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const res = await api.get('/urls');
      setUrls(res.data);
    } catch (err) {
      console.error('Failed to fetch URLs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!originalUrl) {
      setError('Please provide a URL to shorten.');
      return;
    }

    setFormLoading(true);

    try {
      const payload = {
        originalUrl,
        title: title || undefined,
        customAlias: customAlias || undefined,
        expiryDate: expiryDate || undefined
      };

      const res = await api.post('/urls', payload);
      
      setUrls([res.data, ...urls]);
      
      // Clear form
      setOriginalUrl('');
      setCustomAlias('');
      setExpiryDate('');
      setTitle('');
      
      setSuccessMsg('URL shortened successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to shorten URL. Check constraints or try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this short link? All associated analytics visits will be deleted permanently.')) {
      return;
    }

    try {
      await api.delete(`/urls/${id}`);
      setUrls(urls.filter(url => url._id !== id));
    } catch (err) {
      console.error('Delete URL failed:', err);
      alert('Failed to delete URL.');
    }
  };

  const handleCopy = (id, shortCode) => {
    const fullShortUrl = `${API_URL}/${shortCode}`;
    navigator.clipboard.writeText(fullShortUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (expiryStr) => {
    if (!expiryStr) return false;
    return new Date(expiryStr) < new Date();
  };

  if (authLoading || loading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header flex-between mb-3">
        <div>
          <h2>Link Control Board</h2>
          <p>Welcome back, {user?.username}! Create and manage your shortened campaigns below.</p>
        </div>
        <button className="btn btn-secondary btn-icon" onClick={fetchUrls} title="Refresh Links">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Shortening Form Panel */}
      <div className="glass-card mb-3 shorten-form-card">
        <h3 className="mb-2"><Plus size={18} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--accent-primary)' }} />Shorten a new Link</h3>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        <form onSubmit={handleShorten} className="shorten-form">
          <div className="form-row main-row">
            <div className="form-group flex-1">
              <label className="form-label">Destination URL *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. https://www.google.com/search?q=agents"
                value={originalUrl}
                onChange={(e) => { setOriginalUrl(e.target.value); setError(''); }}
                required
              />
            </div>
            <div className="form-group title-input">
              <label className="form-label">Descriptive Title (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. My search query"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row options-row mt-2">
            <div className="form-group flex-1">
              <label className="form-label">Custom Alias (Optional)</label>
              <input
                type="text"
                className="form-control mono"
                placeholder="e.g. my-awesome-alias"
                value={customAlias}
                onChange={(e) => { setCustomAlias(e.target.value); setError(''); }}
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Expiry Date & Time (Optional)</label>
              <input
                type="datetime-local"
                className="form-control"
                value={expiryDate}
                onChange={(e) => { setExpiryDate(e.target.value); setError(''); }}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} // Minimally 1 minute in the future
              />
            </div>
          </div>

          <div className="flex-end mt-3">
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              <Link2 size={16} />
              <span>{formLoading ? 'Creating Link...' : 'Create Short Link'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* URL Grid/Table Panel */}
      <div className="glass-card table-panel">
        <h3 className="mb-2">Your Shortened URLs ({urls.length})</h3>
        
        {urls.length === 0 ? (
          <div className="empty-state text-center mt-3">
            <Link2 size={48} className="empty-icon mb-2" />
            <p>You haven't shortened any links yet. Enter a destination URL above to get started!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Title / Original Link</th>
                  <th>Short Link</th>
                  <th>Clicks</th>
                  <th>Expiry Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => {
                  const fullShortUrl = `${API_URL}/${url.shortCode}`;
                  const expired = isExpired(url.expiryDate);

                  return (
                    <tr key={url._id} className={expired ? 'row-expired' : ''}>
                      <td>
                        <div className="title-cell">
                          <span className="url-title-text" title={url.title}>{url.title}</span>
                          <a 
                            href={url.originalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="original-link mono truncate"
                            title={url.originalUrl}
                          >
                            {url.originalUrl}
                            <ExternalLink size={12} className="inline-icon" />
                          </a>
                        </div>
                      </td>
                      <td className="mono">
                        <div className="short-url-cell">
                          <a 
                            href={fullShortUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="short-link-href"
                          >
                            /{url.shortCode}
                          </a>
                        </div>
                      </td>
                      <td className="mono click-count-cell">
                        <span className="click-number">{url.clickCount}</span>
                      </td>
                      <td>
                        {url.expiryDate ? (
                          <span className={`badge ${expired ? 'badge-danger' : 'badge-warning'}`}>
                            {expired ? 'Expired' : new Date(url.expiryDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="badge badge-success">Permanent</span>
                        )}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button 
                            className={`btn btn-secondary btn-icon-sm ${copiedId === url._id ? 'copied' : ''}`}
                            onClick={() => handleCopy(url._id, url.shortCode)}
                            title="Copy link"
                          >
                            <Copy size={14} />
                            {copiedId === url._id && <span className="tooltip">Copied!</span>}
                          </button>
                          
                          <button 
                            className="btn btn-secondary btn-icon-sm"
                            onClick={() => setSelectedQr({ url: fullShortUrl, title: url.title })}
                            title="Show QR Code"
                          >
                            <QrCode size={14} />
                          </button>

                          <button 
                            className="btn btn-secondary btn-icon-sm"
                            onClick={() => navigate(`/analytics/${url._id}`)}
                            title="View analytics"
                          >
                            <BarChart3 size={14} />
                          </button>

                          <button 
                            className="btn btn-danger btn-icon-sm"
                            onClick={() => handleDelete(url._id)}
                            title="Delete link"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Modal Overlay */}
      {selectedQr && (
        <QrCodeModal
          isOpen={!!selectedQr}
          onClose={() => setSelectedQr(null)}
          shortUrl={selectedQr.url}
          title={selectedQr.title}
        />
      )}

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .dashboard-header h2 {
          font-size: 1.85rem;
          margin-bottom: 0.25rem;
        }

        .shorten-form-card {
          padding: 1.5rem;
        }

        .shorten-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .flex-1 {
          flex: 1;
        }

        .title-input {
          flex: 0 0 350px;
        }

        .empty-state {
          padding: 3rem 1.5rem;
          color: var(--text-secondary);
        }

        .empty-icon {
          color: var(--text-muted);
          opacity: 0.5;
        }

        .title-cell {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          max-width: 320px;
        }

        .url-title-text {
          font-weight: 600;
          color: white;
          font-size: 0.95rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .original-link {
          color: var(--text-muted);
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .original-link:hover {
          color: var(--accent-primary);
        }

        .short-link-href {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .short-link-href:hover {
          color: var(--accent-secondary);
          text-decoration: underline;
        }

        .click-count-cell {
          font-weight: 600;
        }

        .click-number {
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .row-expired td {
          opacity: 0.65;
        }

        .row-expired .short-link-href {
          color: var(--text-muted);
          text-decoration: line-through;
        }

        .actions-cell {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          position: relative;
        }

        .btn-icon-sm {
          padding: 0.45rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .btn-icon-sm.copied {
          background: rgba(16, 185, 129, 0.1);
          border-color: var(--success);
          color: var(--success);
        }

        .tooltip {
          position: absolute;
          bottom: 125%;
          left: 50%;
          transform: translateX(-50%);
          background: #1e293b;
          border: 1px solid var(--border-color);
          color: white;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: var(--shadow-sm);
          pointer-events: none;
          z-index: 5;
        }

        .flex-end {
          display: flex;
          justify-content: flex-end;
        }

        .inline-icon {
          display: inline-block;
          flex-shrink: 0;
        }

        @media (max-width: 868px) {
          .form-row {
            flex-direction: column;
            gap: 1rem;
          }
          .title-input {
            flex: none;
          }
          .title-cell {
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  );
}
