import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ApiKeyChecker = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // 管理者・マネージャーのみチェック
    if (user && ['admin', 'manager'].includes(user.role)) {
      const apiKey = localStorage.getItem('zaicoApiKey');
      
      if (!apiKey) {
        // APIキーが未設定の場合、設定画面にリダイレクト
        console.log('Zaico APIキーが未設定です。設定画面にリダイレクトします。');
        
        // 現在のパスが設定画面でない場合のみリダイレクト
        if (window.location.pathname !== '/settings/zaico-sync') {
          navigate('/settings/zaico-sync');
        }
      }
    }
  }, [user, navigate]);

  return children;
};

export default ApiKeyChecker;
