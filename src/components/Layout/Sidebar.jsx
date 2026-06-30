import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, ClipboardList, Settings, Users, Briefcase, BarChart3 } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-container">
          <Briefcase className="logo-icon" />
          <span className="logo-text">India Shelter</span>
        </div>
        <p className="subtitle">DSA Portal</p>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to="/app" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/app/onboarding" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <UserPlus size={20} />
              <span>New Onboarding</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/app/applications" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <ClipboardList size={20} />
              <span>Review Queue</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/app/dsa-directory" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Users size={20} />
              <span>DSA Directory</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/app/dsa-portfolio" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <BarChart3 size={20} />
              <span>DSA Portfolio & Performance</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-outline w-full justify-center">
          <Settings size={18} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
