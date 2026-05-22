import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="logo" style={{ marginBottom: '0px', display: 'flex', marginTop: '-35px', marginLeft: '-15px' }}>
              <img src="/DashRx.png" alt="DashRx" style={{ height: '110px', objectFit: 'contain' }} />
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: '1.6', marginTop: '-30px' }}>
              The only dashboard you need to run your pharmacy. Built for modern community pharmacies across the UK.
            </p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="/#features">Features</a></li>
              <li><a href="/#pricing">Pricing</a></li>
              <li><Link to="/sample-reports">Sample Reports</Link></li>
              <li><Link to="/growth-report">Free Growth Report</Link></li>
              <li><a href="/#faq">FAQ</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/login">Log In</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
              <li><a href="mailto:support@dashrx.co.uk?subject=Feature%20Request">Feature Request</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/legal/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/legal/terms-of-service">Terms of Service</Link></li>
              <li><Link to="/legal/cookie-policy">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} DashRx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
