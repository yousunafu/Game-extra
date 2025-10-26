import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (!isAuthenticated) {
    // 役職に応じた適切なログインページにリダイレクト
    const getLoginPath = () => {
      // セッション復元時の役職判定
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          switch (userData.role) {
            case 'customer':
              return '/login';
            case 'overseas_customer':
              return '/intl/portal/auth';
            case 'staff':
            case 'manager':
            case 'admin':
              return '/sys/staff/auth';
            default:
              return '/login';
          }
        } catch (error) {
          // パースエラーの場合は顧客ログインにリダイレクト
          return '/login';
        }
      }
      // デフォルトは顧客ログイン
      return '/login';
    };

    return <Navigate to={getLoginPath()} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;