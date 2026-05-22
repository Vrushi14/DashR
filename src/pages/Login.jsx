import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Logged in successfully', data);
        // Persist full profile so Dashboard can hydrate from it
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('pharmadash_user_name', data.user.name || '');
        localStorage.setItem('pharmadash_pharmacy_name', data.user.pharmacy_name || '');
        localStorage.setItem('pharmadash_ods_code', data.user.ods_code || '');
        localStorage.setItem('pharmadash_nhs_contract', data.user.nhs_contract || '');
        navigate('/dashboard');
      } else {
        alert('Login failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    }
  };

  return (
    <div className="signup-split-layout">

      {/* Left Panel: Classic Editorial Value Proposition */}
      <div className="signup-left-panel">
        <div className="left-panel-content">
          {/* Back link */}
          <Link to="/" className="left-panel-back-link" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: '20px' }}>
            <ArrowLeft size={16} /> Back to home
          </Link>

          {/* Logo */}
          <Link to="/" className="left-panel-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', marginBottom: '-25px', marginTop: '-35px', marginLeft: '-28px' }}>
            <img src="/DashRx.png" alt="DashRx" style={{ height: '150px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </Link>

          {/* Large Title */}
          <h1 className="left-panel-title" style={{ fontSize: '56px', fontWeight: '400', lineHeight: '1.25', color: '#FAF9F6', marginBottom: '32px' }}>
            Welcome back to your <br />
            <span style={{ fontStyle: 'italic' }}>pharmacy command.</span>
          </h1>

          {/* Classic Subtitle / Quote */}
          <p className="left-panel-desc" style={{ fontStyle: 'italic', fontSize: '19px', color: 'rgba(255, 255, 255, 0.8)', borderLeft: '2px solid #38bdf8', paddingLeft: '20px', lineHeight: '1.6' }}>
            "Step back into your command center. Dashboard precision, built to elevate the daily operational standard of UK NHS pharmacies."
          </p>
        </div>
      </div>

      {/* Right Panel: Signin Form */}
      <div className="signup-right-panel">
        <div className="signup-card login-card-custom" style={{ maxWidth: '440px' }}>
          {/* Mobile Back Link */}
          <Link to="/" className="back-link" style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '10px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          {/* Form Header */}
          <div style={{ marginBottom: '14px' }}>
            <Link to="/" className="logo" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src="/DashRx.png" alt="DashRx" style={{ height: '60px', objectFit: 'contain' }} />
            </Link>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: '0 0 4px 0' }}>
              Welcome Back
            </h2>
            <p className="signup-card-desc" style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
              Access your pharmacy dashboard insights
            </p>
          </div>

          {/* Signin Form */}
          <form onSubmit={handleSubmit} className="signup-form">

            {/* Email Address */}
            <div className="signup-input-group">
              <label className="signup-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="signup-input"
                placeholder="admin@pharmacy.co.uk"
              />
            </div>

            {/* Password */}
            <div className="signup-input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="signup-label">Password</label>
                <a href="#forgot" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-color)' }}>Forgot password?</a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="signup-input"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="signup-submit-btn"
              style={{ marginTop: '4px' }}
            >
              Sign In <ArrowRight size={16} />
            </button>
          </form>

          {/* Form Footer */}
          <div className="signup-footer" style={{ marginTop: '20px' }}>
            Don't have an account? <Link to="/signup">Create one free</Link>
          </div>
        </div>
      </div>

    </div>
  );
}
