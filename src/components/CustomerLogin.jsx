import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const CustomerLogin = () => {
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
        // 国内買取依頼者のみログイン許可
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user.role !== 'customer') {
          setError('このログイン画面は国内の買取依頼者専用です');
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
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🎮 ゲーム買取システム</h1>
          <p>国内買取依頼者ログイン</p>
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
              placeholder="example@mail.com"
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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>

          <div className="register-link">
            <p>アカウントをお持ちでない方は</p>
            <Link to="/register">新規会員登録はこちら</Link>
          </div>
          
          <div className="other-login-links">
            <p className="small-text">その他のログイン</p>
            <Link to="/intl/portal/auth" className="alt-link">🌍 For Overseas Buyers</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerLogin;

