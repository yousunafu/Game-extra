import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UserManagement.css';

const UserManagement = () => {
  const { getAllUsers, isAdmin, isManager } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  }, [getAllUsers]);

  // 権限チェック
  if (!isAdmin && !isManager) {
    return (
      <div className="unauthorized-container">
        <h1>🚫 アクセス拒否</h1>
        <p>このページにアクセスする権限がありません。</p>
      </div>
    );
  }

  // フィルタリングとソート
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      let aValue = a[sortKey];
      let bValue = b[sortKey];
      
      if (sortKey === 'name') {
        aValue = a.name;
        bValue = b.name;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getRoleBadge = (role) => {
    const roleConfig = {
      'admin': { label: '管理者', color: '#e74c3c' },
      'manager': { label: 'マネージャー', color: '#f39c12' },
      'staff': { label: 'スタッフ', color: '#3498db' },
      'customer': { label: '国内顧客', color: '#27ae60' },
      'overseas_customer': { label: '海外顧客', color: '#9b59b6' }
    };
    
    const config = roleConfig[role] || { label: '不明', color: '#95a5a6' };
    
    return (
      <span 
        className="role-badge" 
        style={{ backgroundColor: config.color }}
      >
        {config.label}
      </span>
    );
  };

  const getRoleStats = () => {
    const stats = {
      admin: 0,
      manager: 0,
      staff: 0,
      customer: 0,
      overseas_customer: 0
    };
    
    users.forEach(user => {
      if (stats.hasOwnProperty(user.role)) {
        stats[user.role]++;
      }
    });
    
    return stats;
  };

  const roleStats = getRoleStats();

  return (
    <div className="user-management-container">
      <div className="page-header">
        <h1>👤 ユーザー管理</h1>
        <p>登録されている全ユーザーの一覧と管理</p>
      </div>

      {/* 統計カード */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">総ユーザー数</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <div className="stat-number">{roleStats.admin + roleStats.manager}</div>
            <div className="stat-label">管理者・マネージャー</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <div className="stat-number">{roleStats.staff}</div>
            <div className="stat-label">スタッフ</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-number">{roleStats.customer + roleStats.overseas_customer}</div>
            <div className="stat-label">顧客</div>
          </div>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="controls-section">
        <div className="search-controls">
          <div className="search-input">
            <input
              type="text"
              placeholder="名前またはメールアドレスで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">全ての役割</option>
              <option value="admin">管理者</option>
              <option value="manager">マネージャー</option>
              <option value="staff">スタッフ</option>
              <option value="customer">国内顧客</option>
              <option value="overseas_customer">海外顧客</option>
            </select>
            
            <select
              value={`${sortKey}-${sortOrder}`}
              onChange={(e) => {
                const [key, order] = e.target.value.split('-');
                setSortKey(key);
                setSortOrder(order);
              }}
            >
              <option value="name-asc">名前 (A-Z)</option>
              <option value="name-desc">名前 (Z-A)</option>
              <option value="email-asc">メール (A-Z)</option>
              <option value="email-desc">メール (Z-A)</option>
              <option value="role-asc">役割 (A-Z)</option>
              <option value="role-desc">役割 (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="users-section">
        <div className="section-header">
          <h2>登録ユーザー一覧</h2>
          <span className="user-count">{filteredUsers.length} / {users.length} ユーザー</span>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>条件に一致するユーザーが見つかりませんでした。</p>
          </div>
        ) : (
          <div className="users-grid">
            {filteredUsers.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-header">
                  <div className="user-avatar">
                    {user.name.charAt(0)}
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                  </div>
                  {getRoleBadge(user.role)}
                </div>
                
                <div className="user-details">
                  {user.phone && (
                    <div className="detail-item">
                      <span className="detail-label">📞 電話番号:</span>
                      <span className="detail-value">{user.phone}</span>
                    </div>
                  )}
                  
                  {user.address && (
                    <div className="detail-item">
                      <span className="detail-label">📍 住所:</span>
                      <span className="detail-value">{user.address}</span>
                    </div>
                  )}
                  
                  {user.occupation && (
                    <div className="detail-item">
                      <span className="detail-label">💼 職業:</span>
                      <span className="detail-value">{user.occupation}</span>
                    </div>
                  )}
                  
                  {user.department && (
                    <div className="detail-item">
                      <span className="detail-label">🏢 部署:</span>
                      <span className="detail-value">{user.department}</span>
                    </div>
                  )}
                  
                  {user.country && (
                    <div className="detail-item">
                      <span className="detail-label">🌍 国:</span>
                      <span className="detail-value">{user.country}</span>
                    </div>
                  )}
                  
                  {user.language && (
                    <div className="detail-item">
                      <span className="detail-label">🗣️ 言語:</span>
                      <span className="detail-value">{user.language}</span>
                    </div>
                  )}
                </div>
                
                <div className="user-footer">
                  <span className="user-id">ID: {user.id}</span>
                  <span className="user-role-detail">
                    {user.role === 'admin' ? 'システム管理者' :
                     user.role === 'manager' ? 'マネージャー' :
                     user.role === 'staff' ? 'スタッフ' :
                     user.role === 'customer' ? '国内顧客' :
                     user.role === 'overseas_customer' ? '海外顧客' : '不明'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
