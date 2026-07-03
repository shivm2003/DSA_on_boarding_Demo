import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronUp,
  CirclePlus,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Settings,
  UserPlus,
  Users
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const isOnboarding = location.pathname.startsWith('/app/onboarding');
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (!isOnboarding) return;

    const fetchApplications = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/submissions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setApplications(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch onboarding counts:', error);
      }
    };

    fetchApplications();
  }, [isOnboarding]);

  const onboardingCounts = useMemo(() => {
    const isCompleted = (app) => ['Approved', 'Completed'].includes(app.status);
    const isDraft = (app) => (
      ['Draft', 'Pending'].includes(app.status)
      || app.step === 'Draft'
      || app.step === 'Upload Document'
      || Boolean(app.step && !isCompleted(app))
    );

    return {
      drafts: applications.filter(isDraft).length,
      completed: applications.filter(isCompleted).length
    };
  }, [applications]);

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
              {isOnboarding && <ChevronUp size={16} strokeWidth={1.8} />}
            </NavLink>
            {isOnboarding && (
              <ul className="nav-submenu">
                <li>
                  <NavLink to="/app/onboarding/new" className={({ isActive }) => (isActive ? 'nav-sub-link active' : 'nav-sub-link')}>
                    <CirclePlus size={16} strokeWidth={1.8} />
                    <span>New Registration</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/app/onboarding?view=drafts" className={() => (location.search === '?view=drafts' ? 'nav-sub-link active' : 'nav-sub-link')}>
                    <Clock3 size={16} strokeWidth={1.8} />
                    <span>Draft Applications</span>
                    <strong>{onboardingCounts.drafts}</strong>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/app/onboarding?view=completed" className={() => (location.search === '?view=completed' ? 'nav-sub-link active' : 'nav-sub-link')}>
                    <CheckCircle2 size={16} strokeWidth={1.8} />
                    <span>Completed</span>
                    <strong>{onboardingCounts.completed}</strong>
                  </NavLink>
                </li>
              </ul>
            )}
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
              <span>DSA Portfolio & Performance</span>
            </NavLink>
          </li>
          {/* DSA Portfolio menu removed per request */}
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
