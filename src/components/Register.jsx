import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    occupation: '',
    postalCode: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 郵便番号から住所を自動入力
  const handlePostalCodeChange = async (e) => {
    const postalCode = e.target.value;
    setFormData(prev => ({
      ...prev,
      postalCode: postalCode
    }));

    // ハイフンを除去して7桁の数字かチェック
    const cleanedPostalCode = postalCode.replace(/-/g, '');
    if (cleanedPostalCode.length === 7 && /^\d{7}$/.test(cleanedPostalCode)) {
      setAddressLoading(true);
      try {
        // zipcloud APIを使用して住所を取得
        const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanedPostalCode}`);
        const data = await response.json();
        
        if (data.status === 200 && data.results) {
          const result = data.results[0];
          // 都道府県 + 市区町村 + 町域を結合
          const fullAddress = `${result.address1}${result.address2}${result.address3}`;
          setFormData(prev => ({
            ...prev,
            address: fullAddress
          }));
        } else {
          // 住所が見つからない場合
          console.log('住所が見つかりませんでした');
        }
      } catch (error) {
        console.error('住所の取得に失敗しました:', error);
      } finally {
        setAddressLoading(false);
      }
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.birthDate || !formData.phone || 
        !formData.occupation || !formData.postalCode || !formData.address || 
        !formData.email || !formData.password || !formData.confirmPassword) {
      setError('必須項目を全て入力してください');
      return false;
    }

    // 生年月日のチェック（18歳以上）
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setError('18歳以上の方のみご利用いただけます');
      return false;
    }

    // メールアドレスの形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('正しいメールアドレスを入力してください');
      return false;
    }

    // 郵便番号の形式チェック（例: 123-4567）
    const postalCodeRegex = /^\d{3}-?\d{4}$/;
    if (!postalCodeRegex.test(formData.postalCode)) {
      setError('郵便番号は「123-4567」の形式で入力してください');
      return false;
    }

    // 電話番号の形式チェック（例: 090-1234-5678）
    const phoneRegex = /^0\d{1,4}-?\d{1,4}-?\d{4}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('正しい電話番号を入力してください');
      return false;
    }

    // パスワードの長さチェック
    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return false;
    }

    // パスワード確認
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
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
      const result = register(userData);
      
      if (result.success) {
        alert('会員登録が完了しました。ログインしてください。');
        navigate('/login');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('登録処理中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <div className="register-header">
          <h1>🎮 ゲーム買取システム</h1>
          <p>新規会員登録</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group form-group-half">
            <label htmlFor="name">お名前 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="山田太郎"
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="birthDate">生年月日 *</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="occupation">職業 *</label>
              <select
                id="occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                disabled={loading}
                required
              >
                <option value="">選択してください</option>
                <option value="会社員">会社員</option>
                <option value="自営業">自営業</option>
                <option value="公務員">公務員</option>
                <option value="会社役員">会社役員</option>
                <option value="学生">学生</option>
                <option value="パート・アルバイト">パート・アルバイト</option>
                <option value="専業主婦・主夫">専業主婦・主夫</option>
                <option value="無職">無職</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>

          <div className="form-group form-group-half">
            <label htmlFor="postalCode">
              郵便番号 * 
              {addressLoading && <span className="address-loading"> 住所を取得中...</span>}
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handlePostalCodeChange}
              placeholder="123-4567"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">住所 *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="東京都新宿区○○1-2-3"
              disabled={loading}
              required
            />
          </div>

          <div className="form-divider"></div>

          <div className="form-group form-group-half">
            <label htmlFor="phone">電話番号 *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="090-1234-5678"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">メールアドレス *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com（ログイン時に使用します）"
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">パスワード *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="6文字以上"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">パスワード確認 *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="もう一度入力"
                disabled={loading}
                required
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? '登録中...' : '会員登録'}
          </button>

          <div className="login-link">
            <p>すでにアカウントをお持ちの方は</p>
            <Link to="/login">ログインはこちら</Link>
          </div>
          
          <div className="login-link" style={{ marginTop: '10px' }}>
            <p>For overseas buyers (Purchase games)</p>
            <Link to="/intl/portal/register">Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

