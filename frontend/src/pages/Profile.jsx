import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState(user?.age || '');
  const [height, setHeight] = useState(user?.height || '');
  const [weight, setWeight] = useState(user?.weight || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [fitnessGoal, setFitnessGoal] = useState(user?.fitness_goal || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate BMI
  const calculateBMI = () => {
    if (!user?.height || !user?.weight) return null;
    const heightInMeters = user.height / 100;
    const bmi = user.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#3b82f6' };
    if (bmi < 25) return { category: 'Normal', color: '#22c55e' };
    if (bmi < 30) return { category: 'Overweight', color: '#f59e0b' };
    return { category: 'Obese', color: '#ef4444' };
  };

  // Calculate daily calorie needs (Mifflin-St Jeor Equation)
  const calculateTDEE = () => {
    if (!user?.weight || !user?.height || !user?.age || !user?.gender) return null;
    
    let bmr;
    if (user.gender === 'Male') {
      bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + 5;
    } else if (user.gender === 'Female') {
      bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 161;
    } else {
      // Default to average
      bmr = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) - 78;
    }
    
    // Moderate activity level (3-5 workouts/week)
    const tdee = bmr * 1.55;
    return Math.round(tdee);
  };

  // Calculate protein recommendation
  const calculateProtein = () => {
    if (!user?.weight || !user?.fitness_goal) return null;
    
    let proteinPerKg;
    switch (user.fitness_goal) {
      case 'Muscle Gain':
      case 'Strength Training':
        proteinPerKg = 2.0; // 2g per kg for muscle building
        break;
      case 'Weight Loss':
        proteinPerKg = 1.8; // Higher protein for weight loss to preserve muscle
        break;
      case 'Sports Performance':
        proteinPerKg = 1.6;
        break;
      default:
        proteinPerKg = 1.4; // General fitness
    }
    
    return Math.round(user.weight * proteinPerKg);
  };

  // Calculate ideal weight range (based on BMI 18.5-25)
  const calculateIdealWeightRange = () => {
    if (!user?.height) return null;
    const heightInMeters = user.height / 100;
    const minWeight = 18.5 * heightInMeters * heightInMeters;
    const maxWeight = 25 * heightInMeters * heightInMeters;
    return { min: Math.round(minWeight), max: Math.round(maxWeight) };
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(parseFloat(bmi)) : null;
  const tdee = calculateTDEE();
  const proteinGoal = calculateProtein();
  const idealWeight = calculateIdealWeightRange();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = {};
      if (username !== user.username) updateData.username = username;
      if (email !== user.email) updateData.email = email;
      if (password) updateData.password = password;
      if (age !== user.age) updateData.age = age ? parseInt(age) : null;
      if (height !== user.height) updateData.height = height ? parseFloat(height) : null;
      if (weight !== user.weight) updateData.weight = weight ? parseFloat(weight) : null;
      if (gender !== user.gender) updateData.gender = gender || null;
      if (fitnessGoal !== user.fitness_goal) updateData.fitness_goal = fitnessGoal || null;

      if (Object.keys(updateData).length === 0) {
        setError('No changes to save');
        setLoading(false);
        return;
      }

      await userAPI.updateUser(updateData);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setPassword('');
      
      // Reload user data
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!window.confirm('Please confirm again. All your workout data will be permanently deleted.')) {
      return;
    }

    try {
      await userAPI.deleteUser();
      logout();
      navigate('/login');
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="profile-container">
          <h1>Profile Settings</h1>

          <div className="profile-card card">
            <div className="profile-header">
              <div className="profile-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <div className="profile-info">
                <h2>{user?.username}</h2>
                <p>{user?.email}</p>
              </div>
            </div>

            {!editing ? (
              <div className="profile-view">
                <div className="stats-grid">
                  {user?.age && (
                    <div className="stat-item">
                      <span className="stat-label">Age</span>
                      <span className="stat-value">{user.age} years</span>
                    </div>
                  )}
                  {user?.height && (
                    <div className="stat-item">
                      <span className="stat-label">Height</span>
                      <span className="stat-value">{user.height} cm</span>
                    </div>
                  )}
                  {user?.weight && (
                    <div className="stat-item">
                      <span className="stat-label">Weight</span>
                      <span className="stat-value">{user.weight} kg</span>
                    </div>
                  )}
                  {user?.gender && (
                    <div className="stat-item">
                      <span className="stat-label">Gender</span>
                      <span className="stat-value">{user.gender}</span>
                    </div>
                  )}
                  {user?.fitness_goal && (
                    <div className="stat-item">
                      <span className="stat-label">Fitness Goal</span>
                      <span className="stat-value">{user.fitness_goal}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setEditing(true)} className="btn btn-primary">
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="profile-edit">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    minLength="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">New Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength="6"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-section">
                  <h3>Personal Stats</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="age">Age (years)</label>
                      <input
                        type="number"
                        id="age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min="1"
                        max="150"
                        placeholder="e.g., 25"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="height">Height (cm)</label>
                      <input
                        type="number"
                        id="height"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        min="50"
                        max="300"
                        step="0.1"
                        placeholder="e.g., 175"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="weight">Weight (kg)</label>
                      <input
                        type="number"
                        id="weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        min="20"
                        max="500"
                        step="0.1"
                        placeholder="e.g., 70"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="fitnessGoal">Fitness Goal</label>
                    <select
                      id="fitnessGoal"
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                    >
                      <option value="">Select fitness goal</option>
                      <option value="Weight Loss">Weight Loss</option>
                      <option value="Muscle Gain">Muscle Gain</option>
                      <option value="Strength Training">Strength Training</option>
                      <option value="General Fitness">General Fitness</option>
                      <option value="Endurance">Endurance</option>
                      <option value="Flexibility">Flexibility</option>
                      <option value="Sports Performance">Sports Performance</option>
                    </select>
                  </div>
                </div>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <div className="profile-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setUsername(user.username);
                      setEmail(user.email);
                      setPassword('');
                      setAge(user.age || '');
                      setHeight(user.height || '');
                      setWeight(user.weight || '');
                      setGender(user.gender || '');
                      setFitnessGoal(user.fitness_goal || '');
                      setError('');
                      setSuccess('');
                    }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Personalized Insights */}
          {(bmi || tdee || proteinGoal || idealWeight) && (
            <div className="insights-card card">
              <h3>📊 Your Health Insights</h3>
              <p className="insights-subtitle">Based on your personal stats</p>

              <div className="insights-grid">
                {bmi && bmiInfo && (
                  <div className="insight-item">
                    <div className="insight-header">
                      <span className="insight-icon">⚖️</span>
                      <span className="insight-title">Body Mass Index (BMI)</span>
                    </div>
                    <div className="insight-value" style={{ color: bmiInfo.color }}>
                      {bmi}
                    </div>
                    <div className="insight-label" style={{ color: bmiInfo.color }}>
                      {bmiInfo.category}
                    </div>
                    <div className="insight-description">
                      Normal range: 18.5 - 25
                    </div>
                  </div>
                )}

                {tdee && (
                  <div className="insight-item">
                    <div className="insight-header">
                      <span className="insight-icon">🔥</span>
                      <span className="insight-title">Daily Calorie Goal</span>
                    </div>
                    <div className="insight-value">
                      {tdee}
                    </div>
                    <div className="insight-label">calories/day</div>
                    <div className="insight-description">
                      {user?.fitness_goal === 'Weight Loss' && `For weight loss: ${tdee - 500} cal`}
                      {user?.fitness_goal === 'Muscle Gain' && `For muscle gain: ${tdee + 300} cal`}
                      {(!user?.fitness_goal || (user?.fitness_goal !== 'Weight Loss' && user?.fitness_goal !== 'Muscle Gain')) && 'Based on moderate activity'}
                    </div>
                  </div>
                )}

                {proteinGoal && (
                  <div className="insight-item">
                    <div className="insight-header">
                      <span className="insight-icon">🥩</span>
                      <span className="insight-title">Daily Protein Goal</span>
                    </div>
                    <div className="insight-value">
                      {proteinGoal}g
                    </div>
                    <div className="insight-label">per day</div>
                    <div className="insight-description">
                      Optimized for {user?.fitness_goal?.toLowerCase() || 'your goals'}
                    </div>
                  </div>
                )}

                {idealWeight && user?.weight && (
                  <div className="insight-item">
                    <div className="insight-header">
                      <span className="insight-icon">🎯</span>
                      <span className="insight-title">Healthy Weight Range</span>
                    </div>
                    <div className="insight-value">
                      {idealWeight.min} - {idealWeight.max}
                    </div>
                    <div className="insight-label">kg</div>
                    <div className="insight-description">
                      {user.weight < idealWeight.min && `+${(idealWeight.min - user.weight).toFixed(1)} kg to minimum`}
                      {user.weight > idealWeight.max && `-${(user.weight - idealWeight.max).toFixed(1)} kg to maximum`}
                      {user.weight >= idealWeight.min && user.weight <= idealWeight.max && '✓ You\'re in the healthy range!'}
                    </div>
                  </div>
                )}
              </div>

              {user?.fitness_goal && (
                <div className="goal-recommendations">
                  <h4>💡 Recommendations for {user.fitness_goal}</h4>
                  <ul>
                    {user.fitness_goal === 'Weight Loss' && (
                      <>
                        <li>Maintain a calorie deficit of 300-500 calories per day</li>
                        <li>Aim for {proteinGoal}g protein daily to preserve muscle mass</li>
                        <li>Include 3-4 strength training sessions per week</li>
                        <li>Stay hydrated with at least 2-3 liters of water daily</li>
                      </>
                    )}
                    {user.fitness_goal === 'Muscle Gain' && (
                      <>
                        <li>Eat in a calorie surplus of 250-500 calories per day</li>
                        <li>Consume {proteinGoal}g protein daily spread across meals</li>
                        <li>Focus on progressive overload in your workouts</li>
                        <li>Prioritize 7-9 hours of quality sleep for recovery</li>
                      </>
                    )}
                    {user.fitness_goal === 'Strength Training' && (
                      <>
                        <li>Train each muscle group 2-3 times per week</li>
                        <li>Focus on compound movements (squat, bench, deadlift)</li>
                        <li>Eat {proteinGoal}g protein daily for muscle recovery</li>
                        <li>Allow adequate rest between heavy training sessions</li>
                      </>
                    )}
                    {user.fitness_goal === 'General Fitness' && (
                      <>
                        <li>Aim for 150 minutes of moderate activity per week</li>
                        <li>Mix cardio and strength training for balanced fitness</li>
                        <li>Maintain a balanced diet with {tdee} calories daily</li>
                        <li>Stay consistent with 3-5 workouts per week</li>
                      </>
                    )}
                    {user.fitness_goal === 'Endurance' && (
                      <>
                        <li>Gradually increase workout duration and intensity</li>
                        <li>Focus on cardiovascular exercises (running, cycling, swimming)</li>
                        <li>Ensure adequate carbohydrate intake for energy</li>
                        <li>Include rest days for recovery and adaptation</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="danger-zone card">
            <h3>Danger Zone</h3>
            <p>Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
