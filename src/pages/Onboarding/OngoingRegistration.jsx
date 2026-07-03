import { useEffect, useMemo, useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import {
  Building2,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  UserRound
} from 'lucide-react';
import { STEPS } from './constants';
import './Onboarding.css';

const VIEW_LABELS = {
  ongoing: 'Ongoing Onboarding',
  drafts: 'Draft Applications',
  completed: 'Completed'
};

const getStepNumber = (step) => {
  const stepIndex = STEPS.indexOf(step);
  if (stepIndex >= 0) return stepIndex + 1;
  if (step === 'Review') return STEPS.length;
  return 1;
};

const getProgress = (step, progress) => {
  if (typeof progress === 'number') return Math.max(0, Math.min(100, progress));
  return Math.round((getStepNumber(step) / STEPS.length) * 100);
};

const getDisplayStatus = (app) => {
  if (app.status === 'Approved' || app.status === 'Completed') return 'Completed';
  if (app.status === 'Draft' || app.step === 'Draft' || app.step === 'Upload Document') return 'Draft';
  return app.status || 'Pending';
};

const isDraftApplication = (app) => (
  ['Draft', 'Pending'].includes(app.status)
  || app.step === 'Draft'
  || app.step === 'Upload Document'
  || Boolean(app.step && app.status !== 'Completed')
);

const getEntityClass = (entityType) => {
  if (entityType === 'Individual') return 'entity-individual';
  if (entityType === 'Proprietorship') return 'entity-proprietorship';
  return 'entity-partnership';
};

const OngoingRegistration = () => {
  const [applications, setApplications] = useState([]);
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [entityFilter, setEntityFilter] = useState('All Entity Types');
  const [stepFilter, setStepFilter] = useState('All Steps');
  const activeView = searchParams.get('view') || 'ongoing';

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/submissions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setApplications(Array.isArray(data) ? data : []);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error('Failed to fetch ongoing registrations:', error);
        setApplications([]);
      }
    };

    fetchApplications();
  }, []);

  const normalizedApplications = useMemo(() => applications.map((app) => {
    const companyDetails = app.data?.companyDetails || {};
    const contact = app.data?.contactVerification || {};
    const step = app.step || 'Upload Document';
    const status = getDisplayStatus(app);
    const entityType = companyDetails.entityType || 'Unknown';
    const name = companyDetails.companyName || app.name || 'Unnamed Application';
    const stepNumber = getStepNumber(step);

    return {
      ...app,
      appId: app.id || app.dsaCode || 'N/A',
      name,
      entityType,
      contact,
      status,
      step,
      stepNumber,
      progress: getProgress(step, app.progress)
    };
  }), [applications]);

  const filteredApplications = useMemo(() => {
    const viewFiltered = normalizedApplications.filter((app) => {
      if (activeView === 'completed') return app.status === 'Completed';
      if (activeView === 'drafts') return isDraftApplication(app);
      return app.status !== 'Completed';
    });

    return viewFiltered.filter((app) => {
      const queryText = query.trim().toLowerCase();
      const matchesQuery = !queryText
        || app.appId.toLowerCase().includes(queryText)
        || app.name.toLowerCase().includes(queryText)
        || (app.contact.phone || '').toLowerCase().includes(queryText);
      const matchesStatus = statusFilter === 'All Status' || app.status === statusFilter;
      const matchesEntity = entityFilter === 'All Entity Types' || app.entityType === entityFilter;
      const matchesStep = stepFilter === 'All Steps' || app.step === stepFilter;
      return matchesQuery && matchesStatus && matchesEntity && matchesStep;
    });
  }, [activeView, entityFilter, normalizedApplications, query, statusFilter, stepFilter]);

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('All Status');
    setEntityFilter('All Entity Types');
    setStepFilter('All Steps');
  };

  return (
    <div className="onboarding-dashboard-page">
      <section className="onboarding-dashboard-hero">
        <div>
          <h1 className="page-title">Welcome, Shivam!</h1>
          <p className="text-muted text-sm mt-2">Manage and track all vendor / DSA onboarding applications.</p>
        </div>
        <div className="onboarding-hero-actions">
          <NavLink to="/app/onboarding/new" className="btn btn-primary onboarding-action-btn">
            <Plus size={18} /> New Onboarding
          </NavLink>
        </div>
      </section>

      <section className="onboarding-list-panel glass-panel animate-fade-in">
        <div className="onboarding-list-header">
          <div>
            <div className="onboarding-title-row">
              <h2>{VIEW_LABELS[activeView] || VIEW_LABELS.ongoing}</h2>
              <span className="onboarding-count-pill">{filteredApplications.length} Applications</span>
            </div>
            <p className="text-sm text-muted mt-2">Continue and complete your in-progress onboarding applications.</p>
          </div>
        </div>

        <div className="onboarding-filter-grid">
          <div className="onboarding-search-control">
            <Search size={18} />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by vendor or application ID..."
            />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>All Status</option>
            <option>Pending</option>
            <option>Draft</option>
            <option>Query Raised</option>
            <option>Document Pending</option>
            <option>Completed</option>
          </select>
          <select value={entityFilter} onChange={(event) => setEntityFilter(event.target.value)}>
            <option>All Entity Types</option>
            <option>Individual</option>
            <option>Proprietorship</option>
            <option>Partnership</option>
            <option>Private/Public Ltd Company</option>
            <option>Unknown</option>
          </select>
          <select value={stepFilter} onChange={(event) => setStepFilter(event.target.value)}>
            <option>All Steps</option>
            {STEPS.map((step) => <option key={step}>{step}</option>)}
            <option>Draft</option>
            <option>Review</option>
          </select>
          <button type="button" className="btn btn-outline onboarding-reset-btn" onClick={resetFilters}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>

        <div className="onboarding-list-head">
          <span>Application Details</span>
          <span>Current Step</span>
          <span>Progress</span>
          <span>Status</span>
          <span>Last Updated</span>
          <span>Action</span>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="onboarding-empty-state">
            <h3>No applications found</h3>
            <p className="text-muted">Start a new onboarding or adjust the filters.</p>
          </div>
        ) : (
          <div className="onboarding-application-list">
            {filteredApplications.map((app) => (
              <article className="onboarding-application-row" key={app.id || app.dsaCode || app.name}>
                <div className="onboarding-app-details">
                  <div className="onboarding-app-icon">
                    {app.entityType === 'Individual' ? <UserRound size={28} /> : <Building2 size={28} />}
                  </div>
                  <div>
                    <h3>{app.appId}</h3>
                    <p>{app.name}</p>
                    <span className={`onboarding-entity-pill ${getEntityClass(app.entityType)}`}>{app.entityType}</span>
                  </div>
                </div>

                <div className="onboarding-step-cell">
                  <span>{app.stepNumber}</span>
                  <div>
                    <strong>{app.step}</strong>
                    <p>Step {app.stepNumber} of {STEPS.length}</p>
                  </div>
                </div>

                <div className="onboarding-progress-cell">
                  <strong>{app.progress}%</strong>
                  <div className="onboarding-progress-track">
                    <div className="onboarding-progress-fill" style={{ width: `${app.progress}%` }} />
                  </div>
                </div>

                <div>
                  <span className={`onboarding-status-pill status-${app.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {app.status}
                  </span>
                </div>

                <div className="onboarding-date-cell">
                  <strong>{app.date || app.updatedAt || 'N/A'}</strong>
                  <p>by Shivam Mishra</p>
                </div>

                <div className="onboarding-row-actions">
                  <NavLink to={`/app/onboarding/${app.appId}`} className="btn btn-primary btn-sm">Continue</NavLink>
                  <button type="button" className="onboarding-more-btn" aria-label="More actions">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="onboarding-info-strip">
          <div className="onboarding-info-icon">i</div>
          <div>
            <p>Once you complete all steps and submit, your application will be sent for review.</p>
            <p>Your progress is saved when you click Save & Next or choose to save while going back.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OngoingRegistration;
