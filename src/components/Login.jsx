import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
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
          <p>ログインしてください</p>
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
            <Link to="/register">新規会員登録はこちら（国内・買取）</Link>
          </div>
          
          <div className="register-link" style={{ marginTop: '5px' }}>
            <p>For overseas buyers</p>
            <Link to="/register/buyer">Register here (Purchase)</Link>
          </div>
        </form>

        <div className="demo-accounts">
          <h3>デモアカウント</h3>
          <div className="demo-grid">
            <div className="demo-account">
              <h4>お客様</h4>
              <p>yamada@example.com</p>
              <p>PW: pass123</p>
            </div>
            <div className="demo-account">
              <h4>海外顧客 (USA)</h4>
              <p>john@example.com</p>
              <p>PW: pass123</p>
            </div>
            <div className="demo-account">
              <h4>海外顧客 (China)</h4>
              <p>liming@example.com</p>
              <p>PW: pass123</p>
            </div>
            <div className="demo-account">
              <h4>スタッフ</h4>
              <p>sato@gamestore.com</p>
              <p>PW: staff123</p>
            </div>
            <div className="demo-account">
              <h4>管理者</h4>
              <p>admin@gamestore.com</p>
              <p>PW: admin123</p>
            </div>
            <div className="demo-account">
              <h4>マネージャー</h4>
              <p>tanaka@gamestore.com</p>
              <p>PW: manager123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;