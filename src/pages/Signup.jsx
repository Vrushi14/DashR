import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pill, Check, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Signup() {
  const [odsCode, setOdsCode] = useState('');
  const [pharmacyName, setPharmacyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  // Simulate auto-filling pharmacy name for Indian stores (e.g. from GSTIN or Drug License code)
  const handleOdsChange = (e) => {
    const val = e.target.value;
    setOdsCode(val);

    if (val.length >= 5) {
      setIsSearching(true);
      // Simulate API query latency
      const timer = setTimeout(() => {
        if (!pharmacyName) {
          const upperVal = val.toUpperCase();
          if (upperVal.startsWith('27') || upperVal.includes('MH') || upperVal.includes('MUM')) {
            setPharmacyName('Krishna Medicos, Andheri West, Mumbai');
          } else if (upperVal.startsWith('07') || upperVal.includes('DL') || upperVal.includes('DEL')) {
            setPharmacyName('Apollo Pharmacy, Connaught Place, New Delhi');
          } else {
            setPharmacyName('Radha Medical & General Stores, Bengaluru');
          }
        }
        setIsSearching(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  };

  // Real-time password requirement validators
  const requirements = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'One number', valid: /[0-9]/.test(password) },
    { label: 'One special character', valid: /[^A-Za-z0-9]/.test(password) }
  ];

  const allRequirementsMet = requirements.every(req => req.valid);
  const passwordsMatch = password && password === confirmPassword;
  const isFormValid = pharmacyName && firstName && lastName && email && allRequirementsMet && passwordsMatch && agreed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      // Map pharmacyName to database 'name' field
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pharmacyName,
          email,
          password
        })
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Signed up successfully', data);
        navigate('/dashboard');
      } else {
        alert('Signup failed: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server. Make sure your server is running.');
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
          <h1 className="left-panel-title" style={{ fontSize: '56px', fontWeight: '400', lineHeight: '1.2', color: '#FAF9F6', marginBottom: '32px' }}>
            Elevate your <br />
            <span style={{ fontStyle: 'italic' }}>pharmacy experience.</span>
          </h1>

          {/* Classic Subtitle / Quote */}
          <p className="left-panel-desc" style={{ fontStyle: 'italic', fontSize: '19px', color: 'rgba(255, 255, 255, 0.8)', borderLeft: '2px solid #38bdf8', paddingLeft: '20px', lineHeight: '1.6' }}>
            "DashRx represents the intersection of elegant design and uncompromising data precision, tailored exclusively for the sophisticated Indian pharmacy owner."
          </p>
        </div>
      </div>

      {/* Right Panel: Signup Form */}
      <div className="signup-right-panel">
        <div className="ambient-blob" style={{ top: '20%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 60%)' }}></div>
        <div className="ambient-blob" style={{ bottom: '10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(123,34,224,0.04) 0%, transparent 60%)' }}></div>

        <div className="signup-card">
          {/* Mobile Back Link (Visible on mobile instead of left panel link) */}
          <Link to="/" className="back-link" style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600', marginBottom: '10px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to home
          </Link>

          {/* Form Header (Mobile Logo & Form title) */}
          <div style={{ marginBottom: '14px' }}>
            <Link to="/" className="logo" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <img src="/DashRx.png" alt="DashRx" style={{ height: '60px', objectFit: 'contain' }} />
            </Link>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: '0 0 4px 0' }}>
              Create Your Free Account
            </h2>
          </div>


          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="signup-form">

            {/* ODS / GSTIN Search */}
            <div className="signup-input-group">
              <label className="signup-label">
                GSTIN or Drug License Number <span>(Search your pharmacy)</span>
              </label>
              <input
                type="text"
                value={odsCode}
                onChange={handleOdsChange}
                className="signup-input"
                placeholder="E.G. 27AAAAA1111A1Z1 OR DL-12345"
                style={{ textTransform: 'uppercase' }}
              />
              <p className="signup-helper-text">
                {isSearching ? (
                  <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Searching databases and auto-filling details...</span>
                ) : (
                  'Enter your GSTIN/DL number and we\'ll auto-fill your pharmacy details'
                )}
              </p>
            </div>

            {/* Pharmacy Name */}
            <div className="signup-input-group">
              <label className="signup-label">Pharmacy Name</label>
              <input
                type="text"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                required
                className="signup-input"
                placeholder="e.g. Krishna Medicos, Mumbai"
              />
            </div>

            {/* First Name & Last Name (Side by Side) */}
            <div className="signup-grid-2col">
              <div className="signup-input-group">
                <label className="signup-label">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="signup-input"
                  placeholder="Rahul"
                />
              </div>
              <div className="signup-input-group">
                <label className="signup-label">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="signup-input"
                  placeholder="Sharma"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="signup-input-group">
              <label className="signup-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="signup-input"
                placeholder="you@yourpharmacy.in"
              />
            </div>

            {/* Password */}
            <div className="signup-input-group">
              <label className="signup-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="signup-input"
                placeholder="Create a strong password"
              />

              {/* Dynamic Password Validation Requirements */}
              {password && (
                <div className="password-requirements-box">
                  {requirements.map((req, i) => (
                    <div key={i} className={`requirement-item ${req.valid ? 'valid' : ''}`}>
                      <Check
                        size={14}
                        color={req.valid ? '#10B981' : '#94A3B8'}
                        strokeWidth={req.valid ? 4 : 2}
                      />
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="signup-input-group">
              <label className="signup-label">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="signup-input"
                placeholder="Re-enter your password"
              />
              {confirmPassword && !passwordsMatch && (
                <p className="signup-helper-text" style={{ color: '#EF4444', fontWeight: 'bold' }}>
                  Passwords do not match
                </p>
              )}
              {confirmPassword && passwordsMatch && (
                <p className="signup-helper-text" style={{ color: '#10B981', fontWeight: 'bold' }}>
                  Passwords matched
                </p>
              )}
            </div>

            {/* Terms & Conditions Checkbox */}
            <label className="signup-checkbox-container">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="signup-checkbox-label">
                I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              className="signup-submit-btn"
              disabled={!isFormValid}
            >
              Create Free Account <ArrowRight size={16} />
            </button>
          </form>

          {/* Form Footer */}
          <div className="signup-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>

    </div>
  );
}
