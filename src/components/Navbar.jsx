import { Link } from 'react-router-dom';
import { Pill } from 'lucide-react';

export default function Navbar() {
  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <Link to="/" className="logo">
          <img src="/DashRx.png" alt="DashRx" style={{ height: '110px', objectFit: 'contain' }} />
        </Link>
        <div className="nav-links">
          <a href="/#features" className="btn-nav">Features</a>
          <a href="/#leaderboard" className="btn-nav">Leaderboard</a>
          <Link to="/sample-reports" className="btn-nav">Sample Reports</Link>
          <a href="/#pricing" className="btn-nav">Pricing</a>
          <Link to="/blog" className="btn-nav">Blog</Link>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '9px 22px', fontSize: '14px', color: '#ffffff' }}>Start Free</Link>
        </div>
      </nav>
    </div>
  );
}
