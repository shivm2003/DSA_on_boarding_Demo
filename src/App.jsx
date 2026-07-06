import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Onboarding from './pages/Onboarding/Onboarding';
import OngoingRegistration from './pages/Onboarding/OngoingRegistration';
import ReviewQueue from './pages/ReviewQueue/ReviewQueue';
import Login from './pages/Login/Login';
import DSADirectory from './pages/DSADirectory/DSADirectory';
import ProductLayout from './pages/Product/ProductLayout';
import ProductDashboard from './pages/Product/ProductDashboard';
import ProductDSAList from './pages/Product/ProductDSAList';
import ProductOnboardingList from './pages/Product/ProductOnboardingList';
import ProductPendingItems from './pages/Product/ProductPendingItems';
import ProductApplicationDetails from './pages/Product/ProductApplicationDetails';
import SalesforceStatus from './pages/Product/SalesforceStatus';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="onboarding" element={<OngoingRegistration />} />
          <Route path="onboarding/new" element={<Onboarding />} />
          <Route path="onboarding/:applicationId" element={<Onboarding />} />
          <Route path="applications" element={<ReviewQueue />} />
          <Route path="dsa-directory" element={<DSADirectory />} />
        </Route>
        <Route path="/product" element={<ProductLayout />}>
          <Route index element={<ProductDashboard />} />
          <Route path="app" element={<ProductDashboard />} />
          <Route path="dsa-list" element={<ProductDSAList />} />
          <Route path="onboarding-list" element={<ProductOnboardingList />} />
          <Route path="pending-items" element={<ProductPendingItems />} />
          <Route path="application/:id" element={<ProductApplicationDetails />} />
          <Route path="salesforce/:id" element={<SalesforceStatus />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
