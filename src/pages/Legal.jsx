import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, CheckCircle } from 'lucide-react';

export default function Legal() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const getActiveTab = () => {
    if (path.includes('privacy-policy')) return 'privacy';
    if (path.includes('terms-of-service')) return 'terms';
    return 'cookies';
  };

  const activeTab = getActiveTab();

  return (
    <div className="legal-viewport-container" style={{ padding: '80px 20px', minHeight: '85vh', position: 'relative' }}>
      <div className="ambient-blob" style={{ top: '-10%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,120,255,0.04) 0%, transparent 60%)', filter: 'blur(100px)' }}></div>
      <div className="container" style={{ maxWidth: '880px', position: 'relative', zIndex: 1 }}>
        
        {/* Back Link */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0078FF', textDecoration: 'none', fontWeight: 'bold', marginBottom: '32px', fontSize: '14.5px' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Tab Headers */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--divider-color)', marginBottom: '40px', paddingBottom: '12px' }}>
          <Link 
            to="/legal/privacy-policy" 
            style={{ 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontWeight: 700, 
              color: activeTab === 'privacy' ? '#0078FF' : 'var(--text-muted)',
              borderBottom: activeTab === 'privacy' ? '2px solid #0078FF' : 'none',
              paddingBottom: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            Privacy Policy
          </Link>
          <Link 
            to="/legal/terms-of-service" 
            style={{ 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontWeight: 700, 
              color: activeTab === 'terms' ? '#0078FF' : 'var(--text-muted)',
              borderBottom: activeTab === 'terms' ? '2px solid #0078FF' : 'none',
              paddingBottom: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            Terms of Service
          </Link>
          <Link 
            to="/legal/cookie-policy" 
            style={{ 
              textDecoration: 'none', 
              fontSize: '16px', 
              fontWeight: 700, 
              color: activeTab === 'cookies' ? '#0078FF' : 'var(--text-muted)',
              borderBottom: activeTab === 'cookies' ? '2px solid #0078FF' : 'none',
              paddingBottom: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            Cookie Policy
          </Link>
        </div>

        {/* Content Render */}
        <div className="settings-card" style={{ padding: '40px', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '12px', lineHeight: '1.7', color: 'var(--text-main)' }}>
          {activeTab === 'privacy' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0078FF', marginBottom: '24px' }}>
                <Shield size={36} />
                <h2 style={{ fontSize: '24px', fontWeight: 950, margin: 0 }}>Privacy Policy</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '24px' }}>Last Updated: May 20, 2026</p>
              
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '24px' }}>1. Data Protection Compliance</h3>
              <p>DashRx is fully compliant with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. We process sensitive commercial data including pharmacy purchase statements, ODS codes, and NHS supplier transaction records solely to generate leakage audits and improve pharmacy operations.</p>
              
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '24px' }}>2. Document Uploads & OCR Parsing</h3>
              <p>When you upload distributor bills (PDF, JPEG, PNG, or CSV formats), the scanning process parses purchase prices, discounts, and VAT slabs. This raw data is encrypted at rest using AES-256 and is never shared, distributed, or exposed to third parties.</p>

              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '24px' }}>3. Peer Benchmarking Anonymity</h3>
              <p>Our Competitive Benchmarking database aggregates gross margins and OTC ratios anonymously. Your individual pharmacy name, exact location coordinates, or individual supplier rates are never exposed. Other pharmacies see only broad regional averages.</p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0078FF', marginBottom: '24px' }}>
                <FileText size={36} />
                <h2 style={{ fontSize: '24px', fontWeight: 950, margin: 0 }}>Terms of Service</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '24px' }}>Last Updated: May 20, 2026</p>

              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '24px' }}>1. Licence to Use</h3>
              <p>DashRx grants pharmacy owners and managers a limited, non-exclusive license to use the analytics portal for operational audits. Any commercial reselling of national leaderboard details or local NHS dispensing trend data is strictly prohibited.</p>

              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '24px' }}>2. Subscriptions & Refunds</h3>
              <p>DashRx Pro Growth plans are billed monthly or annually as selected. Subscriptions can be canceled at any time. VAT invoices compliant with HMRC requirements are generated automatically at the end of each billing cycle.</p>

              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '24px' }}>3. Disclaimer of Tax & VAT Filings</h3>
              <p>While the VAT reconciliation tab identifies input VAT discrepancies between your supplier invoices and NHSBSA FP34 records, the output is for advisory purposes only. Pharmacy owners must consult certified accountants or tax professionals before submitting actual VAT returns to HMRC.</p>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#0078FF', marginBottom: '24px' }}>
                <CheckCircle size={36} />
                <h2 style={{ fontSize: '24px', fontWeight: 950, margin: 0 }}>Cookie Policy</h2>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '24px' }}>Last Updated: May 20, 2026</p>

              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '24px' }}>1. Local State Storage</h3>
              <p>We do not use invasive tracking cookies. DashRx utilizes standard browser cookies and local storage (localStorage) exclusively to maintain your logged-in state, active tab parameters, and selected theme (Light vs Dark mode).</p>

              <h3 style={{ fontSize: '18px', fontWeight: 800, marginTop: '24px' }}>2. Third-Party Analytics</h3>
              <p>We do not share cookie data with external advertising networks. Any cookies created by our hosting infrastructure are strictly functional to ensure server load balancing and API request validation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
