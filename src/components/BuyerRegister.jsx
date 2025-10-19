import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const BuyerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    country: '',
    postalCode: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.country || !formData.postalCode || 
        !formData.address || !formData.phone || !formData.email || 
        !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return false;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password length check
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      // Set role as overseas_customer for buyers
      const result = register({ 
        ...userData, 
        role: 'overseas_customer',
        // Set dummy values for fields not in buyer registration
        birthDate: '2000-01-01',
        occupation: 'Buyer'
      });
      
      if (result.success) {
        alert('Registration completed successfully. Please login.');
        navigate('/login');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h1>🎮 Game Trading System</h1>
          <p>Buyer Registration</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group form-group-half">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Smith"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group form-group-half">
            <label htmlFor="companyName">Company Name (Optional)</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Your Company Ltd."
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="United States"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">ZIP / Postal Code *</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="12345 or 123-4567"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State"
              disabled={loading}
              required
            />
          </div>

          <div className="form-divider"></div>

          <div className="form-group form-group-half">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1-234-567-8900"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com (Used for login)"
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Enter again"
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register as Buyer'}
          </button>

          <div className="login-link">
            <p>Already have an account?</p>
            <Link to="/intl/portal/auth">Login here</Link>
          </div>
          
          <div className="login-link" style={{ marginTop: '10px' }}>
            <p>日本国内のお客様（ゲームを売りたい方）</p>
            <Link to="/register">こちらから登録してください</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerRegister;

