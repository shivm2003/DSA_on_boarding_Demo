import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './ProductLayout.css';

const ProductLayout = () => {
  return (
    <div className="product-layout">
      <aside className="product-sidebar glass-panel">
        <div className="product-sidebar-header">
          <h2>Product Module</h2>
          <p className="text-muted">Product team workspace</p>
        </div>
        <nav className="product-nav">
          <NavLink to="/product/app" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')} end>
            Dashboard
          </NavLink>
          <NavLink to="/product/dsa-list" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')}>
            DSA List
          </NavLink>
          <NavLink to="/product/onboarding-list" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')}>
            DSA Onboarding List
          </NavLink>
          <NavLink to="/product/pending-items" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')}>
            Pending Item
          </NavLink>
          <NavLink to="/product/upload-payout" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')}>
            Upload Payout
          </NavLink>
          <NavLink to="/product/payout-management" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')}>
            Payout Management
          </NavLink>
          <NavLink to="/product/master-upload" className={({ isActive }) => (isActive ? 'product-link active' : 'product-link')}>
            Master Upload
          </NavLink>
        </nav>
      </aside>

      <main className="product-content glass-panel">
        <Outlet />
      </main>
    </div>
  );
};

export default ProductLayout;
