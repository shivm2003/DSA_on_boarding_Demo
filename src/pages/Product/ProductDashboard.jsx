import React from 'react';
import './ProductDashboard.css';

const ProductDashboard = () => {
  return (
    <div className="product-dashboard-page">
      <h1 className="page-title">Product Dashboard</h1>
      <p className="text-muted">This is the product module workspace with the same login experience.</p>
      <div className="product-grid">
        <div className="product-card glass-panel">
          <h2>Product Insights</h2>
          <p>Monitor the product pipeline and review performance metrics.</p>
        </div>
        <div className="product-card glass-panel">
          <h2>Lead Conversion</h2>
          <p>Track product lead conversions and funnel efficiency.</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDashboard;
