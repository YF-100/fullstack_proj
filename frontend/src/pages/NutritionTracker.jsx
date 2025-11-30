import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { nutritionAPI } from '../services/api';
import './NutritionTracker.css';

const NutritionTracker = () => {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 70,
    water: 2.0,
    notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadNutritionLogs();
  }, []);

  const loadNutritionLogs = async () => {
    try {
      const response = await nutritionAPI.getNutritionLogs();
      setLogs(response.data);
    } catch (err) {
      setError('Failed to load nutrition logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await nutritionAPI.createNutritionLog(formData);
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        calories: 2000,
        protein: 150,
        carbs: 250,
        fats: 70,
        water: 2.0,
        notes: ''
      });
      loadNutritionLogs();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create nutrition log');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this nutrition log?')) return;
    
    try {
      await nutritionAPI.deleteNutritionLog(id);
      loadNutritionLogs();
    } catch (err) {
      alert('Failed to delete nutrition log');
    }
  };

  const averageCalories = logs.length > 0 
    ? Math.round(logs.reduce((sum, log) => sum + log.calories, 0) / logs.length)
    : 0;

  const averageProtein = logs.length > 0
    ? (logs.reduce((sum, log) => sum + log.protein, 0) / logs.length).toFixed(1)
    : 0;

  const averageWater = logs.length > 0
    ? (logs.reduce((sum, log) => sum + (log.water || 0), 0) / logs.length).toFixed(1)
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
          <h1>🍎 Nutrition Tracker</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            {showForm ? 'Cancel' : '+ Log Nutrition'}
          </button>
        </div>

        {logs.length > 0 && (
          <div className="stats-grid">
            <div className="stat-card card">
              <div className="stat-icon">🔥</div>
              <div className="stat-content">
                <h3>Avg Calories</h3>
                <p className="stat-value">{averageCalories}</p>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon">💪</div>
              <div className="stat-content">
                <h3>Avg Protein</h3>
                <p className="stat-value">{averageProtein}g</p>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon">💧</div>
              <div className="stat-content">
                <h3>Avg Water</h3>
                <p className="stat-value">{averageWater}L</p>
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
            <h3>Log Your Nutrition</h3>
            
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="calories">Calories * 🔥</label>
                <input
                  type="number"
                  id="calories"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="protein">Protein (g) * 💪</label>
                <input
                  type="number"
                  id="protein"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) })}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="carbs">Carbs (g) 🍞</label>
                <input
                  type="number"
                  id="carbs"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fats">Fats (g) 🥑</label>
                <input
                  type="number"
                  id="fats"
                  step="0.1"
                  value={formData.fats}
                  onChange={(e) => setFormData({ ...formData, fats: parseFloat(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="water">Water (liters) 💧</label>
              <div className="range-input">
                <input
                  type="range"
                  id="water"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.water}
                  onChange={(e) => setFormData({ ...formData, water: parseFloat(e.target.value) })}
                />
                <span className="range-value">{formData.water}L</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes (optional)</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Meals, snacks, notes..."
                rows="3"
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" className="btn btn-primary">
              Save Nutrition Log
            </button>
          </form>
        )}

        <div className="logs-list">
          {logs.length === 0 ? (
            <div className="empty-state card">
              <p>No nutrition logs yet. Start tracking your nutrition!</p>
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
                <div className="nutrition-grid">
                  <div className="nutrition-stat">
                    <span className="nutrition-icon">🔥</span>
                    <div>
                      <span className="log-label">Calories</span>
                      <span className="log-value">{log.calories}</span>
                    </div>
                  </div>
                  <div className="nutrition-stat">
                    <span className="nutrition-icon">💪</span>
                    <div>
                      <span className="log-label">Protein</span>
                      <span className="log-value">{log.protein}g</span>
                    </div>
                  </div>
                  {log.carbs != null && (
                    <div className="nutrition-stat">
                      <span className="nutrition-icon">🍞</span>
                      <div>
                        <span className="log-label">Carbs</span>
                        <span className="log-value">{log.carbs}g</span>
                      </div>
                    </div>
                  )}
                  {log.fats != null && (
                    <div className="nutrition-stat">
                      <span className="nutrition-icon">🥑</span>
                      <div>
                        <span className="log-label">Fats</span>
                        <span className="log-value">{log.fats}g</span>
                      </div>
                    </div>
                  )}
                  {log.water != null && (
                    <div className="nutrition-stat">
                      <span className="nutrition-icon">💧</span>
                      <div>
                        <span className="log-label">Water</span>
                        <span className="log-value">{log.water}L</span>
                      </div>
                    </div>
                  )}
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

export default NutritionTracker;
