import React from 'react';
import { Link } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>403</h1>
        <h2>アクセス権限がありません</h2>
        <p>このページを表示する権限がありません。</p>
        <Link to="/" className="back-home">ホームに戻る</Link>
      </div>
    </div>
  );
};

export default Unauthorized;