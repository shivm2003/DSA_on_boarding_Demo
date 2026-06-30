import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import users from '../../data/users.json';
import './Login.css';

const getCaptchaPair = () => {
  const first = Math.floor(Math.random() * 99) + 1;
  const second = Math.floor(Math.random() * 99) + 1;
  return { first, second };
};

const Login = () => {
  const navigate = useNavigate();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captcha, setCaptcha] = useState(getCaptchaPair());
  const [error, setError] = useState('');

  const resetCaptcha = () => {
    setCaptcha(getCaptchaPair());
    setCaptchaAnswer('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const user = users.find(
      (item) => item.username === employeeCode.trim() && item.password === password
    );

    if (!user) {
      setError('Invalid username or password.');
      resetCaptcha();
      return;
    }

    const expectedSum = captcha.first + captcha.second;
    if (parseInt(captchaAnswer, 10) !== expectedSum) {
      setError('Captcha answer is incorrect. Please try again.');
      resetCaptcha();
      return;
    }

    const redirectPath = user.role === 'product' ? '/product' : '/app';
    navigate(redirectPath);
  };

  return (
    <div className="login-page">
      <div className="login-card glass-panel">
        <div className="login-heading">
          <div>
            <h1>ISFC Login</h1>
            <p>Employee code and password based sign in.</p>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            Employee Code
            <input
              type="text"
              name="employeeCode"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="Enter your employee code"
              autoComplete="username"
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
            />
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
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-primary login-submit">
            Sign In
          </button>

          <div className="login-note">
            <p>Use one of the configured user credentials from the JSON store.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
