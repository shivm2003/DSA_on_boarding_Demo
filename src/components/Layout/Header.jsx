import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, UserCircle, LogOut } from 'lucide-react';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <header className="header glass-panel">
      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search with Code, Name, Number..." />
      </div>
      
      <div className="header-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge-dot"></span>
        </button>
        <div className="user-profile">
          <UserCircle size={32} className="user-avatar" />
          <div className="user-info">
            <span className="user-name">Central Approver</span>
            <span className="user-role">Management</span>
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
