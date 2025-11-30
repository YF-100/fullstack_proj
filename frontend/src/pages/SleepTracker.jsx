import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { sleepAPI } from '../services/api';
import './SleepTracker.css';

const SleepTracker = () => {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: 8,
    quality: 3,
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadSleepLogs();
  }, []);

  const loadSleepLogs = async () => {
    try {
      const response = await sleepAPI.getSleepLogs();
      setLogs(response.data);
    } catch (err) {
      setError('Failed to load sleep logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await sleepAPI.createSleepLog(formData);
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        hours: 8,
        quality: 3,
        notes: ''
      });
      loadSleepLogs();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create sleep log');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sleep log?')) return;
    
    try {
      await sleepAPI.deleteSleepLog(id);
      loadSleepLogs();
    } catch (err) {
      alert('Failed to delete sleep log');
    }
  };

  const getQualityEmoji = (quality) => {
    const emojis = { 1: '😫', 2: '😕', 3: '😐', 4: '😊', 5: '😴' };
    return emojis[quality] || '😐';
  };

  const getQualityLabel = (quality) => {
    const labels = { 1: 'Very Poor', 2: 'Poor', 3: 'Fair', 4: 'Good', 5: 'Excellent' };
    return labels[quality] || 'Fair';
  };

  const averageHours = logs.length > 0 
    ? (logs.reduce((sum, log) => sum + log.hours, 0) / logs.length).toFixed(1)
    : 0;

  const averageQuality = logs.length > 0
    ? (logs.reduce((sum, log) => sum + log.quality, 0) / logs.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="tracker-header">
          <h1>💤 Sleep Tracker</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Log Sleep'}
          </button>
        </div>

        {logs.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Average Hours</h3>
                <p className="stat-value">{averageHours}h</p>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>Average Quality</h3>
                <p className="stat-value">{averageQuality}/5</p>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>Total Logs</h3>
                <p className="stat-value">{logs.length}</p>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="tracker-form card">
            <h3>Log Your Sleep</h3>
            
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hours">Hours of Sleep *</label>
              <div className="range-input">
                <input
                  type="range"
                  id="hours"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) })}
                />
                <span className="range-value">{formData.hours}h</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="quality">Sleep Quality *</label>
              <div className="quality-selector">
                {[1, 2, 3, 4, 5].map(q => (
                  <button
                    key={q}
                    type="button"
                    className={`quality-btn ${formData.quality === q ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, quality: q })}
                  >
                    <span className="quality-emoji">{getQualityEmoji(q)}</span>
                    <span className="quality-label">{getQualityLabel(q)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any notes about your sleep..."
                rows="3"
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="btn btn-primary">
              Save Sleep Log
            </button>
          </form>
        )}

        <div className="logs-list">
          {logs.length === 0 ? (
            <div className="empty-state card">
              <p>No sleep logs yet. Start tracking your sleep!</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="log-card card">
                <div className="log-header">
                  <span className="log-date">{new Date(log.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</span>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>
                <div className="log-content">
                  <div className="log-stat">
                    <span className="log-label">Duration</span>
                    <span className="log-value">{log.hours}h</span>
                  </div>
                  <div className="log-stat">
                    <span className="log-label">Quality</span>
                    <span className="log-value">
                      {getQualityEmoji(log.quality)} {getQualityLabel(log.quality)}
                    </span>
                  </div>
                </div>
                {log.notes && (
                  <div className="log-notes">
                    <strong>Notes:</strong> {log.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default SleepTracker;
