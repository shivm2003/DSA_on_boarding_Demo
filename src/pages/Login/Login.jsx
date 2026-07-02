import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API_BASE = 'http://localhost:5000';

const getCaptchaPair = () => {
  const first = Math.floor(Math.random() * 10) + 1;
  const second = Math.floor(Math.random() * 10) + 1;
  return { first, second };
};

const Login = () => {
  const navigate = useNavigate();
  // 0: Login, 1: Request OTP, 2: Verify OTP, 3: Reset Password
  const [authStep, setAuthStep] = useState(0); 
  
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captcha, setCaptcha] = useState(getCaptchaPair());
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const resetCaptcha = () => {
    setCaptcha(getCaptchaPair());
    setCaptchaAnswer('');
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!employeeCode.trim() || !password) {
      setError('Please enter employee code and password.');
      return;
    }

    const expectedSum = captcha.first + captcha.second;
    if (parseInt(captchaAnswer, 10) !== expectedSum) {
      setError('Captcha answer is incorrect. Please try again.');
      resetCaptcha();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: employeeCode.trim(),
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Invalid username or password.');
        resetCaptcha();
        setLoading(false);
        return;
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      const redirectPath = data.user.role === 'product' ? '/product' : '/app';
      navigate(redirectPath);

    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOtp = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!employeeCode.trim() || !dob.trim() || !mobile.trim()) {
      setError('Please enter all required fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password/generate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: employeeCode.trim(),
          dob: dob.trim(),
          mobile: mobile.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to generate OTP.');
      } else {
        setSuccessMsg(`OTP Sent! (Demo OTP: ${data.otp})`);
        setAuthStep(2); // Move to Verify OTP step
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!otp.trim()) {
      setError('Please enter the OTP.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: employeeCode.trim(),
          otp: otp.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Invalid OTP.');
      } else {
        setSuccessMsg(data.message);
        setAuthStep(3); // Move to Reset Password step
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!newPassword || !confirmPassword) {
      setError('Please enter your new passwords.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: employeeCode.trim(),
          otp: otp.trim(), // Need to send this back to double check
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to reset password.');
      } else {
        setSuccessMsg(data.message);
        // Switch back to login view after success
        setTimeout(() => {
           setAuthStep(0);
           setPassword('');
           setOtp('');
           setDob('');
           setMobile('');
           setNewPassword('');
           setConfirmPassword('');
           setSuccessMsg('');
           resetCaptcha();
        }, 3000);
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-panel">
        <div className="login-heading">
          <div>
            <h1>
              {authStep === 0 && 'ISFC Login'}
              {authStep === 1 && 'Forgot Password'}
              {authStep === 2 && 'Verify OTP'}
              {authStep === 3 && 'Reset Password'}
            </h1>
            <p>
              {authStep === 0 && 'Employee code and password based sign in.'}
              {authStep === 1 && 'Enter your employee details to receive an OTP.'}
              {authStep === 2 && 'Enter the OTP sent to your mobile.'}
              {authStep === 3 && 'Create a new password for your account.'}
            </p>
          </div>
        </div>

        {/* --- STEP 1: REQUEST OTP --- */}
        {authStep === 1 && (
          <form className="login-form" onSubmit={handleGenerateOtp}>
             <label>
              Employee Code
              <input
                type="text"
                name="employeeCode"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="Enter your employee code"
                autoComplete="username"
                disabled={loading}
              />
            </label>
            <label>
              Date of Birth (YYYY-MM-DD)
              <input
                type="text"
                name="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="e.g. 1990-01-01"
                disabled={loading}
              />
            </label>
            <label>
              Mobile Number
              <input
                type="text"
                name="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter registered mobile number"
                disabled={loading}
              />
            </label>
            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <div className="login-note" style={{marginTop: '1rem', textAlign: 'center'}}>
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthStep(0); setError(''); setSuccessMsg(''); }}>Back to Login</a>
            </div>
          </form>
        )}

        {/* --- STEP 2: VERIFY OTP --- */}
        {authStep === 2 && (
          <form className="login-form" onSubmit={handleVerifyOtp}>
             <label>
              OTP
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                disabled={loading}
              />
            </label>
            
            {error && <div className="login-error">{error}</div>}
            {successMsg && <div className="login-success" style={{color: 'var(--success-color)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)'}}>{successMsg}</div>}

            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <div className="login-note" style={{marginTop: '1rem', textAlign: 'center'}}>
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthStep(1); setError(''); setSuccessMsg(''); }}>Back to Details</a>
            </div>
          </form>
        )}

        {/* --- STEP 3: SET NEW PASSWORD --- */}
        {authStep === 3 && (
          <form className="login-form" onSubmit={handleResetPassword}>
            <label>
              New Password
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={loading}
              />
            </label>
            <label>
              Confirm Password
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={loading}
              />
            </label>

            {error && <div className="login-error">{error}</div>}
            {successMsg && <div className="login-success" style={{color: 'var(--success-color)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)'}}>{successMsg}</div>}

            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* --- STEP 0: LOGIN --- */}
        {authStep === 0 && (
          <form className="login-form" onSubmit={handleLoginSubmit}>
            {successMsg && <div className="login-success" style={{color: 'var(--success-color)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)'}}>{successMsg}</div>}
            
            <label>
              Employee Code
              <input
                type="text"
                name="employeeCode"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="Enter your employee code"
                autoComplete="username"
                disabled={loading}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
              <div style={{textAlign: 'right', marginTop: '0.25rem'}}>
                 <a href="#" onClick={(e) => { e.preventDefault(); setAuthStep(1); setError(''); }} style={{fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none'}}>Forgot Password?</a>
              </div>
            </label>

            <label className="captcha-label">
              Captcha: <strong>{captcha.first} + {captcha.second}</strong>
              <input
                type="number"
                name="captchaAnswer"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Enter the result"
                min="0"
                disabled={loading}
              />
            </label>

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
