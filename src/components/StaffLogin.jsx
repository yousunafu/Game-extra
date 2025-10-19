import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const StaffLogin = () => {
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
        // スタッフ系のみログイン許可
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (!['staff', 'manager', 'admin'].includes(user.role)) {
          setError('このログイン画面はスタッフ専用です');
          localStorage.removeItem('currentUser');
          setLoading(false);
          return;
        }
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('ログイン処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container staff-login">
      <div className="login-box">
        <div className="login-header">
          <h1>🔐 システム管理画面</h1>
          <p>スタッフログイン</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="staff@gamestore.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="パスワードを入力"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button staff-btn" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>

          <div className="staff-note">
            <p>⚠️ このページはスタッフ専用です</p>
            <p>一般のお客様は<Link to="/login">こちら</Link>からログインしてください</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffLogin;

