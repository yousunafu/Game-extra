import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const BuyerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = login(email, password);
      
      if (result.success) {
        // 海外バイヤーのみログイン許可
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user.role !== 'overseas_customer') {
          setError('This login page is for overseas buyers only');
          localStorage.removeItem('currentUser');
          setLoading(false);
          return;
        }
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🎮 Game Trading System</h1>
          <p>Overseas Buyer Login</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@mail.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="register-link">
            <p>Don't have an account?</p>
            <Link to="/intl/portal/register">Register as Buyer</Link>
          </div>
          
          <div className="other-login-links">
            <p className="small-text">Other Login Options</p>
            <Link to="/login" className="alt-link">🇯🇵 日本国内のお客様はこちら</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerLogin;

