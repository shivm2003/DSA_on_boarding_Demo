import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle, AlertTriangle, Cloud, CloudOff, Info } from 'lucide-react';
import './ProductDashboard.css';

const SalesforceStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sfData, setSfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesforceStatus();
  }, [id]);

  const fetchSalesforceStatus = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/product/salesforce/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSfData(data);
      } else {
        setError('Failed to fetch Salesforce status.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/product/salesforce/${id}/retry`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Retry successful! Integration complete.');
        fetchSalesforceStatus();
      } else {
        alert('Retry failed.');
      }
    } catch (err) {
      alert('Network error during retry.');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem' }} />
        <p>Loading Salesforce Integration Status...</p>
      </div>
    );
  }

  if (error || !sfData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>
        <AlertTriangle size={32} style={{ margin: '0 auto 1rem' }} />
        <p>{error}</p>
      </div>
    );
  }

  const isSuccess = sfData.status === 'Salesforce Completed';
  const isFailed = sfData.status === 'Salesforce Failed';

  return (
    <div className="product-dashboard-page" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      
      <div className="flex items-center gap-3 pb-4 border-bottom" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/product/application/${id}`)}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="page-title m-0">Salesforce Integration Status</h1>
          <p className="text-muted mt-1 text-sm">Application ID: <strong>{id}</strong></p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        
        {isSuccess ? (
          <Cloud size={64} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
        ) : isFailed ? (
          <CloudOff size={64} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        ) : (
          <Info size={64} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
        )}

        <h2 style={{ margin: 0 }}>
          {isSuccess ? 'Integration Successful' : isFailed ? 'Integration Failed' : 'Pending Integration'}
        </h2>
        
        <p className="text-muted" style={{ maxWidth: '400px' }}>
          {sfData.message}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', maxWidth: '500px', marginTop: '1.5rem', textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px' }}>
          <div>
            <div className="text-muted text-sm mb-1">Current Status</div>
            <div className={`status-badge status-${sfData.status.replace(/\s+/g, '-').toLowerCase()}`} style={{ display: 'inline-block' }}>
              {sfData.status}
            </div>
          </div>
          <div>
            <div className="text-muted text-sm mb-1">Last Sync Attempt</div>
            <div><strong>{sfData.lastSync}</strong></div>
          </div>
          <div>
            <div className="text-muted text-sm mb-1">Retry Count</div>
            <div><strong>{sfData.retryCount}</strong></div>
          </div>
        </div>

        {isFailed && (
          <button className="btn btn-primary mt-4 flex items-center gap-2" onClick={handleRetry} disabled={retrying}>
            {retrying ? <RefreshCw size={16} className="spin" /> : <RefreshCw size={16} />} 
            {retrying ? 'Retrying...' : 'Retry Salesforce Sync'}
          </button>
        )}
      </div>

    </div>
  );
};

export default SalesforceStatus;
