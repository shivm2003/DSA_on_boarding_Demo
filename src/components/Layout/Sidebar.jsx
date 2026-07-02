import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UserPlus, ClipboardList, Users, BarChart3, Settings, LogOut, Bell } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* Decorative gradient glow overlay */}
      <div className="sidebar-glow" aria-hidden="true" />

      <div className="sidebar-header">
        <div className="logo-container">
          <img
            src="/Logo.png"
            alt="India Shelter"
            className="sidebar-logo-img"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div style="color: #fff; font-weight: 700; font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                  <span style="color: #e11d48;">▪</span> IndiaShelter
                </div>
                <div style="font-size: 0.65rem; color: rgba(255,255,255,0.5); margin-left: 1.1rem; margin-top: 0.15rem; text-transform: uppercase; letter-spacing: 0.08em;">
                  Sasti Laaye Ghar Ka Loan
                </div>
              `;
            }}
          />
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink
              to="/app"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              end
            >
              <LayoutDashboard size={20} strokeWidth={1.5} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/app/onboarding"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <UserPlus size={20} strokeWidth={1.5} />
              <span>New Onboarding</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/app/applications"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <ClipboardList size={20} strokeWidth={1.5} />
              <span>Review Queue</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/app/dsa-directory"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <Users size={20} strokeWidth={1.5} />
              <span>DSA Directory</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/app/dsa-portfolio"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              <BarChart3 size={20} strokeWidth={1.5} />
              <span>DSA Portfolio & Performance</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-settings-white w-full justify-center">
          <Settings size={18} strokeWidth={1.5} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;