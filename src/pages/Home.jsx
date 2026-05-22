import { ArrowRight, BarChart2, Shield, FolderUp, Target, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [leaderboardMetric, setLeaderboardMetric] = useState('items');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  const leaderboardData = {
    items: [
      { rank: 1, name: 'Smiths Pharmacy', location: 'London', id: 'F1234', value: '28,490 items', percentile: '99.9%' },
      { rank: 2, name: 'Well Pharmacy', location: 'Manchester', id: 'F2345', value: '25,120 items', percentile: '99.9%' },
      { rank: 3, name: 'Boots', location: 'Birmingham', id: 'F3456', value: '22,940 items', percentile: '99.8%' }
    ],
    nms: [
      { rank: 1, name: 'Smiths Pharmacy', location: 'London', id: 'F1234', value: '1,420 NMS', percentile: '99.9%' },
      { rank: 2, name: 'LloydsPharmacy', location: 'Leeds', id: 'F4567', value: '1,310 NMS', percentile: '99.8%' }
    ],
    pf_total: [
      { rank: 1, name: 'Well Pharmacy', location: 'Manchester', id: 'F2345', value: '980 consults', percentile: '99.9%' },
      { rank: 2, name: 'Smiths Pharmacy', location: 'London', id: 'F1234', value: '910 consults', percentile: '99.8%' }
    ],
    bp_checks: [
      { rank: 1, name: 'Boots', location: 'Birmingham', id: 'F3456', value: '1,850 checks', percentile: '99.9%' },
      { rank: 2, name: 'Well Pharmacy', location: 'Manchester', id: 'F2345', value: '1,740 checks', percentile: '99.9%' }
    ],
    flu_total: [
      { rank: 1, name: 'Smiths Pharmacy', location: 'London', id: 'F1234', value: '2,400 jabs', percentile: '99.9%' },
      { rank: 2, name: 'Boots', location: 'Birmingham', id: 'F3456', value: '2,100 jabs', percentile: '99.8%' }
    ],
    eps_rate: [
      { rank: 1, name: 'LloydsPharmacy', location: 'Leeds', id: 'F4567', value: '98.5% EPS', percentile: '99.9%' },
      { rank: 2, name: 'Smiths Pharmacy', location: 'London', id: 'F1234', value: '97.2% EPS', percentile: '99.9%' }
    ]
  };

  const getFilteredLeaderboard = () => {
    const list = leaderboardData[leaderboardMetric] || [];
    if (!leaderboardSearch.trim()) return list;
    return list.filter(pharm =>
      pharm.name.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
      pharm.location.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
      pharm.id.toLowerCase().includes(leaderboardSearch.toLowerCase())
    );
  };

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  const faqData = [
    {
      question: "What is an FP34 Schedule of Payments?",
      answer: "The FP34 is a monthly statement issued by the NHSBSA to every NHS community pharmacy. It details your drug costs, fees, discounts, and services payments. DashRx turns this document into visual, actionable insights."
    },
    {
      question: "How does DashRx extract my data?",
      answer: "Our smart extraction engine reads your uploaded FP34 PDF automatically. It identifies and organises every data point — drug costs, dispensing fees, clinical services, and more — without any manual input from you."
    },
    {
      question: "What dispensing data is available?",
      answer: "DashRx includes national NHS dispensing data covering over 11,000 pharmacies in England. You can search by ODS code, view historical trends, and access detailed breakdowns by item, cost, and prescribing practice."
    },
    {
      question: "How does pharmacy comparison work?",
      answer: "You can compare 2 to 10 pharmacies side by side using national dispensing data. Select pharmacies by ODS code and compare across multiple metrics including items dispensed, costs, and prescribing patterns."
    },
    {
      question: "Which suppliers does reconciliation support?",
      answer: "DashRx supports statements from Alliance Healthcare, AAH, Phoenix, Sigma, Bestway/Wardles, B&S, and NWOS. Upload your supplier statement and we'll automatically match it against your records."
    },
    {
      question: "Is my pharmacy data secure?",
      answer: "Absolutely. We use encrypted storage, secure authentication, and follow GDPR guidelines. Your data is never shared with third parties. We're a UK-based platform built specifically for NHS pharmacies."
    },
    {
      question: "Can I try DashRx before paying?",
      answer: "Yes! Our free plan lets you upload up to 3 months of FP34 data with full access to all dashboard views and charts. No credit card required. Upgrade to Pro when you're ready for unlimited history."
    }
  ];

  return (
    <div>
      <section className="hero" style={{ position: 'relative', overflow: 'hidden', padding: '120px 20px 80px' }}>
        <div className="ambient-blob" style={{ top: '-20%', left: '20%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(0,120,255,0.08) 0%, transparent 60%)', filter: 'blur(120px)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-grid" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="hero-content" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>
              <span className="feature-tag" style={{ display: 'inline-block', marginBottom: '24px' }}>Built for NHS Community Pharmacies 🇬🇧</span>
              <h1 style={{ fontSize: '56px', fontWeight: '800', letterSpacing: '-1.5px', marginBottom: '24px', lineHeight: '1.1' }}>
                The only dashboard you need <br />
                <span style={{ color: 'var(--accent-color)' }}>to run your pharmacy.</span>
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px', maxWidth: '640px' }}>
                Track all the insights about your pharmacy and grow your business. From FP34 payments to national dispensing data, comparison tools, and statement reconciliation — everything in one place.
              </p>
              <div className="hero-buttons" style={{ justifyContent: 'center' }}>
                <Link to="/signup" className="btn btn-primary flex items-center gap-2" style={{ padding: '14px 28px', fontSize: '16px' }}>
                  Get Started Free <ArrowRight size={20} />
                </Link>
                <a href="#features" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
                  See What's Inside
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 timeline-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="ambient-blob" style={{ top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.05) 0%, transparent 60%)', filter: 'blur(100px)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center">
            <span className="feature-tag" style={{ display: 'inline-block', marginBottom: '16px' }}>How it works</span>
            <h2 className="section-title" style={{ fontSize: '40px', marginBottom: '16px' }}>From PDF to Insights in Three Steps</h2>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto 64px' }}>
              No spreadsheets. No manual data entry. Upload your schedule and let DashRx do the heavy lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="step-card">
              <div className="step-badge">1</div>
              <div className="step-icon-wrapper">
                <FolderUp size={40} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-color)' }}>Upload Your FP34</h3>
              <div className="step-divider"></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Drop your NHSBSA Schedule of Payments PDF into DashRx. We handle everything else automatically.
              </p>
            </div>

            <div className="step-card">
              <div className="step-badge">2</div>
              <div className="step-icon-wrapper">
                <BarChart2 size={40} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-color)' }}>Instant Analysis</h3>
              <div className="step-divider"></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Your payment data is intelligently extracted and organised into clear, interactive charts and tables — in seconds.
              </p>
            </div>

            <div className="step-card">
              <div className="step-badge">3</div>
              <div className="step-icon-wrapper">
                <Target size={40} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-color)' }}>Actionable Insights</h3>
              <div className="step-divider"></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Compare months, spot trends, benchmark against other pharmacies, and reconcile your statements — all from one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section ambient-wrapper" style={{ padding: '100px 20px' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="section-title" style={{ fontSize: '44px' }}>Everything you need to grow your pharmacy</h2>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto 80px' }}>
            Four powerful tools purpose-built for UK pharmacy owners and managers.
          </p>

          <div className="feature-row">
            <div className="ambient-blob" style={{ top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%)' }}></div>
            <div className="feature-content">
              <span className="feature-tag">FP34 Payment Dashboard</span>
              <h3>Your payments, instantly understood</h3>
              <p>Upload your NHSBSA Schedule of Payments and get a clear, visual breakdown of drug costs, fees, services, and trends.</p>
              <ul className="feature-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Smart PDF extraction — no manual entry</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> 7 interactive dashboard views</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Month-on-month trend analysis</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Expensive items deep-dive</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Drug cost & clawback breakdown</li>
              </ul>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/Fp34Dashboard.png"
                alt="FP34 Dashboard Mockup"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="ambient-blob" style={{ bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%)' }}></div>
            <div className="feature-content">
              <span className="feature-tag">National Dispensing Data</span>
              <h3>National insights at your fingertips</h3>
              <p>Access NHS dispensing data for over 11,000 pharmacies across England. See how your pharmacy stacks up nationally.</p>
              <ul className="feature-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Browse national NHS dispensing data</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Search any pharmacy by ODS code</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Historical trends and breakdowns</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Filter by date range and metrics</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Regional and ICB-level analysis</li>
              </ul>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/national dispensing.png"
                alt="National Dispensing Data"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>

          <div className="feature-row">
            <div className="ambient-blob" style={{ top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%)' }}></div>
            <div className="feature-content">
              <span className="feature-tag">Pharmacy Comparison</span>
              <h3>Benchmark against your peers</h3>
              <p>Compare 2 to 10 pharmacies side by side. See how you perform against local competitors and national benchmarks.</p>
              <ul className="feature-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Compare up to 10 pharmacies</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Multiple metric comparison</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> National & regional benchmarks</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Visual charts for easy analysis</li>
              </ul>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/comparison.png"
                alt="Pharmacy Comparison"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>

          <div className="feature-row reverse">
            <div className="ambient-blob" style={{ bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%)' }}></div>
            <div className="feature-content">
              <span className="feature-tag">Statement Reconciliation</span>
              <h3>Match invoices automatically</h3>
              <p>Upload supplier statements and let DashRx match them against your records. Spot discrepancies instantly.</p>
              <ul className="feature-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Support for Alliance, AAH, Phoenix</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Sigma, Bestway/Wardles, B&S, NWOS</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Automated discrepancy detection</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Save & review reconciliation history</li>
              </ul>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/dispense.png"
                alt="Statement Reconciliation"
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section id="leaderboard" className="py-24" style={{ position: 'relative' }}>
        <div className="container">
          <div className="text-center">
            <span className="feature-tag" style={{ display: 'inline-block', marginBottom: '16px' }}>National Leaderboard</span>
            <h2 className="section-title" style={{ fontSize: '40px', marginBottom: '16px' }}>See where your pharmacy stands nationally</h2>
            <p className="section-subtitle" style={{ maxWidth: '650px', margin: '0 auto 48px' }}>
              Real-time rankings across 11,000+ UK community pharmacies powered by NHSBSA open data.
            </p>
          </div>

          <div className="settings-card" style={{ maxWidth: '960px', margin: '0 auto', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['items', 'nms', 'pf_total', 'bp_checks', 'flu_total', 'eps_rate'].map(metric => (
                  <button
                    key={metric}
                    onClick={() => setLeaderboardMetric(metric)}
                    className={`btn-export ${leaderboardMetric === metric ? 'active' : ''}`}
                    style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: leaderboardMetric === metric ? '#0078FF' : 'transparent', color: leaderboardMetric === metric ? '#FFF' : 'var(--text-muted)', border: '1px solid var(--divider-color)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    {metric === 'items' ? 'Items' :
                      metric === 'nms' ? 'NMS' :
                        metric === 'pf_total' ? 'Pharmacy First' :
                          metric === 'bp_checks' ? 'BP Checks' :
                            metric === 'flu_total' ? 'Flu Jabs' : 'EPS Rate'}
                  </button>
                ))}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Find your pharmacy (ODS code)..."
                  className="settings-input"
                  style={{ width: '260px', padding: '10px 14px', fontSize: '13.5px', borderRadius: '6px', border: '1px solid var(--divider-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
                  value={leaderboardSearch}
                  onChange={(e) => setLeaderboardSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="responsive-table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="premium-table" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,120,255,0.04)' }}>
                    <th style={{ padding: '12px' }}>Rank</th>
                    <th>Pharmacy Name</th>
                    <th>ODS Code</th>
                    <th>Location</th>
                    <th>Metric Value</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredLeaderboard().map((pharm) => (
                    <tr key={pharm.id} style={{ borderBottom: '1px solid var(--divider-color)' }}>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          fontSize: '11.5px',
                          fontWeight: 'bold',
                          backgroundColor: pharm.rank === 1 ? '#FBBF24' : pharm.rank === 2 ? '#94A3B8' : pharm.rank === 3 ? '#B45309' : 'transparent',
                          color: pharm.rank <= 3 ? '#FFF' : 'var(--text-main)'
                        }}>
                          #{pharm.rank}
                        </span>
                      </td>
                      <td><strong>{pharm.name}</strong></td>
                      <td>{pharm.id}</td>
                      <td>{pharm.location}</td>
                      <td style={{ fontWeight: 'bold' }}>{pharm.value}</td>
                    </tr>
                  ))}
                  {getFilteredLeaderboard().length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No pharmacies found matching "{leaderboardSearch}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Sign Up Free for Full Analytics <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container">
          <div className="secure-private-card">
            <Shield size={48} color="var(--chart-blue)" strokeWidth={1.5} aria-hidden />
            <h2 className="secure-private-card-title">Secure &amp; Private</h2>
            <p className="secure-private-card-text">
              Encrypted storage, GDPR compliant, and privacy by design. Your data stays yours.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="pricing-section">
        <div className="ambient-blob" style={{ top: '-10%', left: '5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 60%)' }}></div>
        <div className="ambient-blob" style={{ bottom: '-15%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(123,34,224,0.05) 0%, transparent 60%)' }}></div>

        <div className="container">
          <div className="text-center" style={{ position: 'relative', zIndex: 2 }}>
            <span className="feature-tag" style={{ display: 'inline-block', marginBottom: '16px' }}>Pricing</span>
            <h2 className="section-title" style={{ fontSize: '44px', fontWeight: '800', letterSpacing: '-1px' }}>Simple, transparent pricing</h2>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Start free, upgrade when you're ready. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="pricing-toggle-container">
            <span
              className={`pricing-toggle-label ${!isAnnual ? 'active' : ''}`}
              onClick={() => setIsAnnual(false)}
            >
              Billed Monthly
            </span>
            <div
              className={`pricing-toggle-switch ${isAnnual ? 'active' : ''}`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <div className="pricing-toggle-handle"></div>
            </div>
            <span
              className={`pricing-toggle-label ${isAnnual ? 'active' : ''}`}
              onClick={() => setIsAnnual(true)}
            >
              Billed Annually
            </span>
            <span className="pricing-discount-badge">Save 2 Months</span>
          </div>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">Free</h3>
                <p className="pricing-plan-desc">Try DashRx with your real data</p>
              </div>
              <div className="pricing-price-container">
                <span className="pricing-price-currency">£</span>
                <span className="pricing-price-amount">0</span>
                <span className="pricing-price-period"></span>
              </div>
              <ul className="pricing-features-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>Upload up to 3 months of data</span></li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>7 interactive dashboard tabs</span></li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>16 professional charts</span></li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>Expensive items analysis</span></li>
              </ul>
              <Link to="/signup" className="pricing-btn pricing-btn-outline">Get Started</Link>
            </div>

            <div className="pricing-card featured">
              <div className="featured-glow"></div>
              <span className="popular-badge">Starter</span>
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">Starter</h3>
                <p className="pricing-plan-desc">For single-site independents</p>
              </div>
              <div className="pricing-price-container">
                <span className="pricing-price-currency">£</span>
                <span className="pricing-price-amount">{isAnnual ? '190' : '19'}</span>
                <span className="pricing-price-period">{isAnnual ? '/year' : '/month'}</span>
              </div>
              <ul className="pricing-features-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>One Pharmacy Account</span></li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>Unlimited monthly data uploads</span></li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>Full dispensing data & comparison</span></li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>Statement reconciliation</span></li>
              </ul>
              <Link to="/signup" className="pricing-btn pricing-btn-primary">Start Free Trial</Link>
            </div>

            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">Professional</h3>
                <p className="pricing-plan-desc">For growing pharmacy businesses</p>
              </div>
              <div className="pricing-price-container">
                <span className="pricing-price-currency">£</span>
                <span className="pricing-price-amount">{isAnnual ? '490' : '49'}</span>
                <span className="pricing-price-period">{isAnnual ? '/year' : '/month'}</span>
              </div>
              <ul className="pricing-features-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>Up to 5 pharmacies</span></li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>Compare months side-by-side</span></li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>Unlimited user accounts</span></li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> <span>Advanced analytics dashboard</span></li>
              </ul>
              <Link to="/signup" className="pricing-btn pricing-btn-gradient">Upgrade to Pro</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="faq-section">
        <div className="container text-center">
          <span className="faq-badge">FAQ</span>
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: '#0A2540', marginBottom: '12px', letterSpacing: '-1px' }}>
            Frequently asked questions
          </h2>
          <div className="faq-container">
            {faqData.map((item, index) => {
              const isActive = activeFaq === index;
              return (
                <div key={index} className={`faq-item ${isActive ? 'active' : ''}`}>
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isActive}
                  >
                    <span className="faq-question-text">{item.question}</span>
                    <span className="faq-icon">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21l-12-18h24z" />
                      </svg>
                    </span>
                  </button>
                  <div className="faq-answer">
                    <div className="faq-answer-text">
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 text-center" style={{ position: 'relative' }}>
        <div className="ambient-blob" style={{ bottom: '-30%', left: '30%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 60%)', filter: 'blur(100px)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="section-title">Ready to take control of your pharmacy?</h2>
          <p className="section-subtitle">Join UK pharmacies using DashRx to track insights, understand payments, and grow their business. Free to start, no credit card required.</p>
          <Link to="/signup" className="btn btn-primary flex items-center gap-2" style={{ margin: '0 auto', width: 'fit-content', padding: '16px 32px' }}>
            Start Free Today <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
