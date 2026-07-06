import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Clock } from 'lucide-react';
import './ProductLayout.css';

const ProductLayout = () => {
  return (
    <div className="product-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      <aside className="product-sidebar glass-panel" style={{ width: '280px', padding: '1.5rem', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(180deg, rgba(30,30,40,0.95) 0%, rgba(20,20,25,0.95) 100%)' }}>
        
        <div className="product-sidebar-header" style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="logo-container" style={{ marginBottom: '1.5rem' }}>
            <img
              src="/Logo.png"
              alt="India Shelter"
              style={{ maxWidth: '160px', display: 'block' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<h2 style="color:white; margin:0;">IndiaShelter</h2>';
              }}
            />
          </div>
          <div style={{ paddingLeft: '0.5rem', borderLeft: '3px solid var(--primary)' }}>
            <h2 style={{ fontSize: '1.1rem', margin: '0 0 4px 0', fontWeight: '600', color: '#fff' }}>Product Team</h2>
            <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Workspace</p>
          </div>
        </div>

        <nav className="product-nav" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavLink to="/product/app" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')} end style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s ease' }}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/product/dsa-list" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s ease' }}>
            <Users size={18} />
            <span>DSA List</span>
          </NavLink>
          
          <NavLink to="/product/onboarding-list" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s ease' }}>
            <UserPlus size={18} />
            <span>Onboarding List</span>
          </NavLink>
          
          <NavLink to="/product/pending-items" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s ease' }}>
            <Clock size={18} />
            <span>Pending Review</span>
          </NavLink>
        </nav>
      </aside>

      <main className="product-content glass-panel" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ProductLayout;
