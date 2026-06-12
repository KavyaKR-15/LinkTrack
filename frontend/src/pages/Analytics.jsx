import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  ArrowLeft, Calendar, BarChart3, Clock, Laptop, 
  Globe, Shield, Eye, HelpCircle, AlertCircle
} from 'lucide-react';

export default function Analytics() {
  const { id } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
      return;
    }
    if (user) {
      fetchAnalytics();
    }
  }, [id, user, authLoading, navigate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/analytics/${id}`);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load analytics details.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-center" style={{ minHeight: '80vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="glass-card error-card text-center animate-fade-in" style={{ maxWidth: '500px', margin: '4rem auto' }}>
        <AlertCircle size={48} color="var(--danger)" className="mb-2" />
        <h2>Analytics Error</h2>
        <p className="mb-3">{error || 'Could not retrieve data.'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  const { urlInfo, stats } = analyticsData;

  // Render SVG Chart Helpers
  const renderSvgChart = () => {
    const timeline = stats.timeline || [];
    if (timeline.length === 0) return null;

    const width = 640;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Find max value to scale Y axis (minimum height scale of 5)
    const maxVal = Math.max(...timeline.map(t => t.clicks), 5);
    
    // Compute data points coordinates
    const points = timeline.map((data, index) => {
      const x = paddingLeft + (index / (timeline.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (data.clicks / maxVal) * chartHeight;
      return { x, y, clicks: data.clicks, label: data.displayDate };
    });

    // Generate SVG path string
    const linePath = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area path string (goes back down to the baseline)
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
      : '';

    // Create horizontal grid lines
    const gridLines = [];
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const yVal = Math.round((maxVal / ticks) * i);
      const yCoord = paddingTop + chartHeight - (yVal / maxVal) * chartHeight;
      gridLines.push({ yCoord, yVal });
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="svg-timeline-chart" width="100%">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line 
              x1={paddingLeft} 
              y1={line.yCoord} 
              x2={width - paddingRight} 
              y2={line.yCoord} 
              stroke="rgba(255, 255, 255, 0.05)" 
              strokeDasharray="4 4"
            />
            <text 
              x={paddingLeft - 10} 
              y={line.yCoord + 4} 
              fill="var(--text-muted)" 
              fontSize="10px" 
              textAnchor="end"
              className="mono"
            >
              {line.yVal}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line stroke */}
        <path 
          d={linePath} 
          fill="none" 
          stroke="var(--accent-primary)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />

        {/* Circles & Labels */}
        {points.map((p, idx) => (
          <g key={idx} className="chart-node-group">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="5" 
              fill="#0a0f1d" 
              stroke="var(--accent-primary)" 
              strokeWidth="2.5" 
            />
            
            {/* Tooltip on hover */}
            <g className="chart-tooltip">
              <rect 
                x={p.x - 20} 
                y={p.y - 28} 
                width="40" 
                height="18" 
                rx="3" 
                fill="var(--bg-primary)" 
                stroke="var(--border-color)"
              />
              <text 
                x={p.x} 
                y={p.y - 16} 
                fill="white" 
                fontSize="10px" 
                fontWeight="bold"
                textAnchor="middle"
              >
                {p.clicks}
              </text>
            </g>

            {/* X Axis labels */}
            <text 
              x={p.x} 
              y={height - 8} 
              fill="var(--text-secondary)" 
              fontSize="10px" 
              textAnchor="middle"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Render Horizontal Progress bar for distributions
  const renderProgressBar = (title, items) => {
    if (!items || items.length === 0) {
      return <div className="empty-mini-state">No data recorded yet</div>;
    }

    const total = items.reduce((acc, curr) => acc + curr.value, 0);

    return (
      <div className="dist-list">
        {items.map((item, idx) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={idx} className="dist-item mb-2">
              <div className="dist-item-header flex-between mb-1">
                <span className="dist-name">{item.name}</span>
                <span className="dist-value mono">{item.value} ({pct}%)</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${pct}%`,
                    background: idx === 0 
                      ? 'var(--accent-gradient)' 
                      : `rgba(99, 102, 241, ${Math.max(0.2, 1 - idx * 0.25)})`
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Convert Device Object back to Array
  const deviceArray = Object.entries(stats.devices || {})
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="analytics-container animate-fade-in">
      {/* Top action bar */}
      <div className="action-bar mb-2">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* URL Meta details card */}
      <div className="glass-card mb-3 url-info-card">
        <div className="url-info-main">
          <h2>{urlInfo.title}</h2>
          <div className="links-group mt-1">
            <span className="info-label">Short link:</span>
            <a href={`http://localhost:5000/${urlInfo.shortCode}`} target="_blank" rel="noopener noreferrer" className="short-link mono">
              http://localhost:5000/{urlInfo.shortCode}
            </a>
          </div>
          <div className="links-group mt-1">
            <span className="info-label">Destination:</span>
            <a href={urlInfo.originalUrl} target="_blank" rel="noopener noreferrer" className="original-link mono truncate">
              {urlInfo.originalUrl}
            </a>
          </div>
        </div>

        <div className="url-info-meta">
          <div className="meta-item">
            <Calendar size={14} />
            <span>Created {new Date(urlInfo.createdAt).toLocaleDateString()}</span>
          </div>
          {urlInfo.expiryDate && (
            <div className="meta-item">
              <Clock size={14} />
              <span className={new Date(urlInfo.expiryDate) < new Date() ? 'text-danger' : 'text-warning'}>
                {new Date(urlInfo.expiryDate) < new Date() ? 'Expired' : `Expires ${new Date(urlInfo.expiryDate).toLocaleDateString()}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid mb-3">
        <div className="glass-card kpi-card">
          <span className="kpi-title">Total Clicks</span>
          <span className="kpi-value mono">{stats.totalClicks}</span>
        </div>
        <div className="glass-card kpi-card">
          <span className="kpi-title">Unique Visits (Logged)</span>
          <span className="kpi-value mono">{stats.recentVisits.length}</span>
        </div>
        <div className="glass-card kpi-card">
          <span className="kpi-title">Last Visited</span>
          <span className="kpi-value date-value">
            {stats.lastVisited ? new Date(stats.lastVisited).toLocaleString() : 'Never'}
          </span>
        </div>
      </div>

      {/* Analytics Visualizations Layout */}
      <div className="analytics-details-layout mb-3">
        {/* Click Timeline Graph */}
        <div className="glass-card chart-card flex-1">
          <div className="flex-between mb-3">
            <h3>Clicks Timeline (Last 7 Days)</h3>
            <span className="badge badge-success">Live Tracking</span>
          </div>
          <div className="svg-container">
            {renderSvgChart()}
          </div>
        </div>

        {/* Distributions Side panel */}
        <div className="distributions-panel">
          <div className="glass-card dist-card mb-2">
            <h3><Laptop size={16} className="title-icon" />Devices</h3>
            {renderProgressBar('Devices', deviceArray)}
          </div>
          <div className="glass-card dist-card mb-2">
            <h3><Globe size={16} className="title-icon" />Browsers</h3>
            {renderProgressBar('Browsers', stats.browsers)}
          </div>
          <div className="glass-card dist-card">
            <h3><Shield size={16} className="title-icon" />Platforms / OS</h3>
            {renderProgressBar('Platforms', stats.oss)}
          </div>
        </div>
      </div>

      {/* Recent Visits Table logs */}
      <div className="glass-card visits-log-card">
        <h3 className="mb-2">Recent Visits Log (Last 20 Click Events)</h3>
        {stats.recentVisits.length === 0 ? (
          <div className="empty-mini-state text-center py-3">No clicks registered yet. Share your shortened link to gather data!</div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                  <th>Device</th>
                  <th>Browser</th>
                  <th>Platform/OS</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="mono">{new Date(visit.timestamp).toLocaleString()}</td>
                    <td className="mono">{visit.ipAddress}</td>
                    <td>
                      <span className={`badge ${
                        visit.device === 'Mobile' ? 'badge-warning' : 
                        visit.device === 'Tablet' ? 'badge-success' : 'badge-success'
                      }`}>
                        {visit.device}
                      </span>
                    </td>
                    <td>{visit.browser}</td>
                    <td>{visit.os}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .analytics-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .url-info-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          gap: 2rem;
        }

        .url-info-main {
          flex: 1;
        }

        .info-label {
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.8rem;
          text-transform: uppercase;
          width: 90px;
          display: inline-block;
        }

        .short-link {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .short-link:hover {
          color: var(--accent-secondary);
        }

        .original-link {
          color: var(--text-secondary);
          max-width: 450px;
          display: inline-block;
          vertical-align: middle;
        }

        .url-info-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          align-items: flex-end;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        .kpi-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          text-align: center;
        }

        .kpi-title {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .kpi-value {
          font-size: 2.25rem;
          font-weight: 800;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .date-value {
          font-size: 1.15rem;
          font-weight: 600;
          color: white;
          margin-top: 0.75rem;
        }

        .analytics-details-layout {
          display: flex;
          gap: 1.5rem;
        }

        .chart-card {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.75rem;
        }

        .svg-container {
          width: 100%;
          background: rgba(255, 255, 255, 0.01);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          padding: 1rem;
          margin-top: 1rem;
        }

        .svg-timeline-chart {
          overflow: visible;
        }

        .chart-node-group circle {
          cursor: pointer;
          transition: r 0.1s ease;
        }

        .chart-node-group:hover circle {
          r: 7.5;
        }

        .chart-tooltip {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
        }

        .chart-node-group:hover .chart-tooltip {
          opacity: 1;
        }

        .distributions-panel {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex-shrink: 0;
        }

        .dist-card {
          padding: 1.25rem;
        }

        .dist-card h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .title-icon {
          color: var(--accent-primary);
        }

        .empty-mini-state {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          padding: 1rem 0;
        }

        .dist-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: white;
        }

        .dist-value {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .progress-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
        }

        .text-danger { color: var(--danger); }
        .text-warning { color: var(--warning); }

        @media (max-width: 1024px) {
          .analytics-details-layout {
            flex-direction: column;
          }
          .distributions-panel {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          .url-info-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .url-info-meta {
            align-items: flex-start;
          }
        }

        @media (max-width: 768px) {
          .distributions-panel {
            grid-template-columns: 1fr;
          }
          .kpi-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
