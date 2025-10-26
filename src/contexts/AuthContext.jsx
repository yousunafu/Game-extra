import React, { createContext, useState, useContext, useEffect } from 'react';
import { mockUsers } from '../data/mockUsers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// localStorageからユーザーリストを取得
const getUsers = () => {
  const storedUsers = localStorage.getItem('registeredUsers');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  // 初回はmockUsersを保存
  localStorage.setItem('registeredUsers', JSON.stringify(mockUsers));
  return mockUsers;
};

// localStorageにユーザーリストを保存
const saveUsers = (users) => {
  localStorage.setItem('registeredUsers', JSON.stringify(users));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password, allowedRoles = []) => {
    const users = getUsers();
    const foundUser = users.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      // 役職チェック（allowedRolesが指定されている場合）
      if (allowedRoles.length > 0 && !allowedRoles.includes(foundUser.role)) {
        return { 
          success: false, 
          error: 'このログイン画面は指定された役職専用です' 
        };
      }

      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return { success: true };
    }

    return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
  };

  const register = (userData) => {
    const users = getUsers();
    
    // メールアドレスの重複チェック
    const existingEmail = users.find(u => u.email === userData.email);
    if (existingEmail) {
      return { success: false, error: 'このメールアドレスは既に登録されています' };
    }

    // 新しいユーザーID（最大ID + 1）
    const maxId = users.reduce((max, u) => Math.max(max, u.id), 0);
    const newUser = {
      ...userData,
      id: maxId + 1,
      // roleが指定されていない場合はcustomerをデフォルトに
      role: userData.role || 'customer'
    };

    // ユーザーリストに追加して保存
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);

    return { success: true };
  };

  const updateUser = (userId, updatedData) => {
    const users = getUsers();
    
    // メールアドレスを変更する場合、重複チェック
    if (updatedData.email) {
      const existingEmail = users.find(u => u.email === updatedData.email && u.id !== userId);
      if (existingEmail) {
        return { success: false, error: 'このメールアドレスは既に使用されています' };
      }
    }

    // ユーザー情報を更新
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        return { ...u, ...updatedData };
      }
      return u;
    });

    saveUsers(updatedUsers);

    // 現在ログイン中のユーザーの場合、セッション情報も更新
    if (user?.id === userId) {
      const updatedUser = updatedUsers.find(u => u.id === userId);
      if (updatedUser) {
        const userWithoutPassword = { ...updatedUser };
        delete userWithoutPassword.password;
        setUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      }
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const getAllUsers = () => {
    return getUsers();
  };

  const value = {
    user,
    login,
    register,
    updateUser,
    logout,
    getAllUsers,
    loading,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isOverseasCustomer: user?.role === 'overseas_customer',
    isStaff: user?.role === 'staff' || user?.role === 'admin' || user?.role === 'manager',
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'manager' || user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};