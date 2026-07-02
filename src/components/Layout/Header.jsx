import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, UserCircle, LogOut } from 'lucide-react';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      const stored = sessionStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const displayName = user?.display_name || 'User';
  const roleName = user?.role
    ? user.role.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Staff';

  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search applications, vendors, or mobile..." />
      </div>

      <div className="header-actions">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
          <span className="badge-dot"></span>
        </button>
        <div className="user-profile">
          <UserCircle size={32} className="user-avatar" />
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role">{roleName}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;