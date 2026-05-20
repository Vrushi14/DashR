import { ArrowRight, BarChart2, PieChart, Shield, Zap, Receipt, Search, FolderUp, Target, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Home() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [leaderboardMetric, setLeaderboardMetric] = useState('bills');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  const leaderboardData = {
    bills: [
      { rank: 1, name: 'Apollo Pharmacy Central', location: 'Delhi Connaught Place', id: '27AAAAA1211A1Z1', value: '28,490 bills', percentile: '99.9%' },
      { rank: 2, name: 'MedPlus Franchise Hub', location: 'Hyderabad Gachibowli', id: '36BBBBB2022B1Z2', value: '25,120 bills', percentile: '99.9%' },
      { rank: 3, name: 'Noble Plus Chemist', location: 'Mumbai Pedder Road', id: '27CCCCC3033C1Z3', value: '22,940 bills', percentile: '99.8%' },
      { rank: 4, name: 'Wellness Forever Wellness', location: 'Pune Koregaon Park', id: '27DDDDD4044D1Z4', value: '19,410 bills', percentile: '99.7%' },
      { rank: 5, name: 'Krishna Medicos Retail', location: 'Mumbai West', id: '27AAAAA1111A1Z1', value: '8,420 bills', percentile: '97.3%' },
      { rank: 6, name: 'Ascent Retail Pharmacy', location: 'Mumbai Andheri East', id: '27EEEEE5055E1Z5', value: '8,110 bills', percentile: '97.3%' }
    ],
    chronic: [
      { rank: 1, name: 'Noble Plus Chemist', location: 'Mumbai Pedder Road', id: '27CCCCC3033C1Z3', value: '18,520 refills', percentile: '99.9%' },
      { rank: 2, name: 'Apollo Pharmacy Central', location: 'Delhi Connaught Place', id: '27AAAAA1211A1Z1', value: '17,440 refills', percentile: '99.9%' },
      { rank: 3, name: 'MedPlus Franchise Hub', location: 'Hyderabad Gachibowli', id: '36BBBBB2022B1Z2', value: '16,910 refills', percentile: '99.8%' },
      { rank: 4, name: 'Krishna Medicos Retail', location: 'Mumbai West', id: '27AAAAA1111A1Z1', value: '6,062 refills', percentile: '98.8%' }
    ],
    screenings: [
      { rank: 1, name: 'Wellness Forever Wellness', location: 'Pune Koregaon Park', id: '27DDDDD4044D1Z4', value: '1,420 checks', percentile: '99.9%' },
      { rank: 2, name: 'Noble Plus Chemist', location: 'Mumbai Pedder Road', id: '27CCCCC3033C1Z3', value: '1,310 checks', percentile: '99.8%' },
      { rank: 3, name: 'Krishna Medicos Retail', location: 'Mumbai West', id: '27AAAAA1111A1Z1', value: '820 checks', percentile: '99.1%' }
    ],
    vaccinations: [
      { rank: 1, name: 'Apollo Pharmacy Central', location: 'Delhi Connaught Place', id: '27AAAAA1211A1Z1', value: '980 jabs', percentile: '99.9%' },
      { rank: 2, name: 'Wellness Forever Wellness', location: 'Pune Koregaon Park', id: '27DDDDD4044D1Z4', value: '910 jabs', percentile: '99.8%' },
      { rank: 3, name: 'Krishna Medicos Retail', location: 'Mumbai West', id: '27AAAAA1111A1Z1', value: '310 jabs', percentile: '97.9%' }
    ],
    erx: [
      { rank: 1, name: 'MedPlus Franchise Hub', location: 'Hyderabad Gachibowli', id: '36BBBBB2022B1Z2', value: '98.5% digitised', percentile: '99.9%' },
      { rank: 2, name: 'Apollo Pharmacy Central', location: 'Delhi Connaught Place', id: '27AAAAA1211A1Z1', value: '97.2% digitised', percentile: '99.9%' },
      { rank: 3, name: 'Krishna Medicos Retail', location: 'Mumbai West', id: '27AAAAA1111A1Z1', value: '91.4% digitised', percentile: '99.4%' }
    ]
  };

  const getFilteredLeaderboard = () => {
    const list = leaderboardData[leaderboardMetric] || [];
    if (!leaderboardSearch.trim()) return list;
    return list.filter(pharm => 
      pharm.name.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
      pharm.location.toLowerCase().includes(leaderboardSearch.toLowerCase())
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
      question: "What documents do I need to start using DashRx in India?",
      answer: "You only need a valid GSTIN or state Drug License (DL) number to register. Our platform queries official databases to automatically configure your pharmacy details, allowing you to get set up in under 2 minutes."
    },
    {
      question: "How does DashRx extract and audit my stockist bills?",
      answer: "You can easily upload PDF or image copies of your distributor/stockist statements or invoices. Our intelligent parsing engine extracts purchase prices, batch codes, quantities, and GST rates, instantly flagging shortfalls, rate differences, or bonus scheme leakages."
    },
    {
      question: "Which Indian pharmacy software (ERP/POS) does DashRx support?",
      answer: "DashRx supports direct reports and data exports from all major Indian pharmacy management software, including Marg ERP, eVitalRx, RedBook, Pharmatech, and Vyapaar, making statement reconciliation completely frictionless."
    },
    {
      question: "How does the pharmacy comparison feature work privately?",
      answer: "We anonymize all pharmacy data and compile localized price benchmarks. You can privately compare the purchase rates you receive from distributors against average regional rates without exposing your commercial identity or sensitive data."
    },
    {
      question: "Which distributors/stockists are supported for reconciliation?",
      answer: "We support reconciliation for all major national and regional distributors in India (including companies like API Holdings, Keimed, Ascent Wellness, and local stockists for major pharma companies like Cipla, Sun Pharma, Abbott, and Alkem)."
    },
    {
      question: "Is my pharmacy's financial and business data secure?",
      answer: "Yes, completely. We utilize industry-grade 256-bit encryption (AES-256) for all data at rest and in transit. Your individual invoice entries and negotiated stockist pricing are private to your account and never shared."
    },
    {
      question: "Can I try DashRx before committing to a paid tier?",
      answer: "Absolutely. Our Free Plan allows you to audit up to 10 stockist invoices every month with standard leak detection completely free. No credit card or upfront payments are required."
    },
    {
      question: "What if I need assistance getting my first batch of stockist statements reconciled?",
      answer: "Our dedicated Indian customer support team is available via WhatsApp and phone to help you onboard. We provide free initial training to help you set up automated invoice parsing."
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero" style={{ position: 'relative', overflow: 'hidden', padding: '120px 20px 80px' }}>
        {/* Large ambient glows for hero */}
        <div className="ambient-blob" style={{ top: '-20%', left: '20%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(0,120,255,0.08) 0%, transparent 60%)', filter: 'blur(120px)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-grid" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="hero-content" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>
              <span className="feature-tag" style={{ display: 'inline-block', marginBottom: '24px' }}>Now live across India 🇮🇳</span>
              <h1 style={{ fontSize: '56px', fontWeight: '800', letterSpacing: '-1.5px', marginBottom: '24px', lineHeight: '1.1' }}>
                Maximize Your Pharmacy Margins, <br/>
                <span style={{ color: 'var(--accent-color)' }}>Zero Pricing Leakages.</span>
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '32px', maxWidth: '640px' }}>
                Say goodbye to manual bill auditing and complex spreadsheets. DashRx automatically reconciles distributor statements, flags GST discrepancies, and tracks local pin-code inventory demands.
              </p>
              <div className="hero-buttons" style={{ justifyContent: 'center' }}>
                <Link to="/signup" className="btn btn-primary flex items-center gap-2" style={{ padding: '14px 28px', fontSize: '16px' }}>
                  Start Auditing Free <ArrowRight size={20} />
                </Link>
                <a href="#features" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
                  Explore Smart Features
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 timeline-section" style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--divider-color)' }}>
        <div className="ambient-blob" style={{ top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.05) 0%, transparent 60%)', filter: 'blur(100px)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center">
            <span className="feature-tag" style={{ display: 'inline-block', marginBottom: '16px' }}>How it works</span>
            <h2 className="section-title" style={{ fontSize: '40px', marginBottom: '16px' }}>From PDF to Insights in Three Steps</h2>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto 64px' }}>
              No spreadsheets. No manual data entry. Upload your stockist statements and let DashRx do the heavy lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="step-card">
              <div className="step-badge">1</div>
              <div className="step-icon-wrapper">
                <FolderUp size={40} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-color)' }}>Upload Invoices</h3>
              <div className="step-divider"></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                Drop your stockist PDF invoices or GSTR-2B files into DashRx. We handle everything automatically.
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
                Your payment data is extracted and organized into clear, interactive charts and tables — in seconds.
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

      {/* Features Section */}
      <section id="features" className="features-section ambient-wrapper" style={{ padding: '100px 20px' }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="section-title" style={{ fontSize: '44px' }}>Everything You Need to Grow Your Pharmacy</h2>
          <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto 80px' }}>
            Four powerful tools purpose-built for Indian pharmacy owners and managers to audit purchases and maximize profit.
          </p>
          
          {/* Row 1 - GST and Margin Analytics Dashboard */}
          <div className="feature-row">
            <div className="ambient-blob" style={{ top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%)' }}></div>
            <div className="feature-content">
              <span className="feature-tag">Pricing & Margin Dashboard</span>
              <h3>Your margins and leakages, instantly audited</h3>
              <p>Upload your purchase sheets or stockist invoices and get a clear, visual breakdown of input tax credits, generic-to-branded mix ratios, and dynamic supplier discounts.</p>
              <ul className="feature-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Smart PDF invoice parser — no manual data typing</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> 7 interactive analytics views and trend lines</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Real-time generic vs branded margin metrics</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Expensive inventory items leakage deep-dive</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Verified GST input credit discrepancy logs</li>
              </ul>
            </div>
            <div className="feature-mockup" style={{ padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src="/GST&Margin.png" 
                alt="GST & Margin Dashboard" 
                style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 12px 30px rgba(0,0,0,0.15)', border: '1px solid var(--divider-color)' }} 
              />
            </div>
          </div>

          {/* Row 2 - Geographical Drug Trends & Demand Heatmap */}
          <div className="feature-row reverse">
            <div className="ambient-blob" style={{ bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%)' }}></div>
            <div className="feature-content">
              <span className="feature-tag">Geographical Drug Index</span>
              <h3>Pin-code inventory insights at your fingertips</h3>
              <p>Access anonymized purchasing and therapeutic category trends from over 5,000 retail counters across India. Know what drugs are trending in your district in real-time.</p>
              <ul className="feature-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Forecast therapeutic growth categories (Cardiac, OTC, Diabetic)</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Scan local pin-code inventory demand shifts</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Filter by generic molecule or brand name</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Pinpoint high-growth chronic medications in advance</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Smart stockout prevention warning indexes</li>
              </ul>
            </div>
            <div className="feature-mockup" style={{ padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src="/pincode.png" 
                alt="Geographical Drug Demand Trends" 
                style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 12px 30px rgba(0,0,0,0.15)', border: '1px solid var(--divider-color)' }} 
              />
            </div>
          </div>

          {/* Row 3 - Hyper-Local Pharmacy Benchmarking */}
          <div className="feature-row">
            <div className="ambient-blob" style={{ top: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%)' }}></div>
            <div className="feature-content">
              <span className="feature-tag">Secure Benchmarking</span>
              <h3>Benchmark privately against local leaders</h3>
              <p>Compare your store's margin structures, purchase prices, and chronic-to-acute mix ratios side by side against anonymous stores of similar scale in your city.</p>
              <ul className="feature-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Secure comparison against 10+ nearby pharmacies</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Real-time gross margin & inventory turnover ratios</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> National and regional purchase cost benchmarks</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Visual percentile charts for audit meetings</li>
              </ul>
            </div>
            <div className="feature-mockup" style={{ padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src="/PeerBenchmark.png" 
                alt="Competitive Peer Benchmarking" 
                style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 12px 30px rgba(0,0,0,0.15)', border: '1px solid var(--divider-color)' }} 
              />
            </div>
          </div>

          {/* Row 4 - Automated Stockist Bill Reconciliation */}
          <div className="feature-row reverse">
            <div className="ambient-blob" style={{ bottom: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 70%)' }}></div>
            <div className="feature-content">
              <span className="feature-tag">Reconciliation Hub</span>
              <h3>Match stockist invoices automatically</h3>
              <p>Upload statements from national portals or local stockists, and let DashRx cross-reference them against actual purchase orders to catch dynamic discount variances instantly.</p>
              <ul className="feature-list">
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Direct support for Apollo B2B, PharmEasy, and local stockists</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> GSTR-2B matching and automated input credit checks</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> DirectClaim – Auto-generate claims notes for stockist refunds</li>
                <li><Check size={18} style={{ color: 'var(--accent-color)' }} /> Complete historic statement audit logs</li>
              </ul>
            </div>
            <div className="feature-mockup" style={{ padding: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img 
                src="/BillReconcilation.png" 
                alt="Automated Stockist Bill Reconciliation" 
                style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 12px 30px rgba(0,0,0,0.15)', border: '1px solid var(--divider-color)' }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* National Leaderboard Section */}
      <section id="leaderboard" className="py-24" style={{ borderTop: '1px solid var(--divider-color)', borderBottom: '1px solid var(--divider-color)', position: 'relative' }}>
        <div className="container">
          <div className="text-center">
            <span className="feature-tag" style={{ display: 'inline-block', marginBottom: '16px' }}>National Leaderboard</span>
            <h2 className="section-title" style={{ fontSize: '40px', marginBottom: '16px' }}>See Where Your Pharmacy Stands Nationally</h2>
            <p className="section-subtitle" style={{ maxWidth: '650px', margin: '0 auto 48px' }}>
              Compare bill volumes, chronic refills, and digital e-Rx adoption rates across 15,200+ Indian pharmacies.
            </p>
          </div>

          {/* Interactive Leaderboard Component */}
          <div className="settings-card" style={{ maxWidth: '960px', margin: '0 auto', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setLeaderboardMetric('bills')}
                  className={`btn-export ${leaderboardMetric === 'bills' ? 'active' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: leaderboardMetric === 'bills' ? '#0078FF' : 'transparent', color: leaderboardMetric === 'bills' ? '#FFF' : 'var(--text-muted)', border: '1px solid var(--divider-color)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Bill Volume
                </button>
                <button 
                  onClick={() => setLeaderboardMetric('chronic')}
                  className={`btn-export ${leaderboardMetric === 'chronic' ? 'active' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: leaderboardMetric === 'chronic' ? '#0078FF' : 'transparent', color: leaderboardMetric === 'chronic' ? '#FFF' : 'var(--text-muted)', border: '1px solid var(--divider-color)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Chronic Refills
                </button>
                <button 
                  onClick={() => setLeaderboardMetric('screenings')}
                  className={`btn-export ${leaderboardMetric === 'screenings' ? 'active' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: leaderboardMetric === 'screenings' ? '#0078FF' : 'transparent', color: leaderboardMetric === 'screenings' ? '#FFF' : 'var(--text-muted)', border: '1px solid var(--divider-color)', cursor: 'pointer', fontWeight: 600 }}
                >
                  BP & Sugar Checks
                </button>
                <button 
                  onClick={() => setLeaderboardMetric('vaccinations')}
                  className={`btn-export ${leaderboardMetric === 'vaccinations' ? 'active' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: leaderboardMetric === 'vaccinations' ? '#0078FF' : 'transparent', color: leaderboardMetric === 'vaccinations' ? '#FFF' : 'var(--text-muted)', border: '1px solid var(--divider-color)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Vaccinations
                </button>
                <button 
                  onClick={() => setLeaderboardMetric('erx')}
                  className={`btn-export ${leaderboardMetric === 'erx' ? 'active' : ''}`}
                  style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px', background: leaderboardMetric === 'erx' ? '#0078FF' : 'transparent', color: leaderboardMetric === 'erx' ? '#FFF' : 'var(--text-muted)', border: '1px solid var(--divider-color)', cursor: 'pointer', fontWeight: 600 }}
                >
                  e-Rx Digitisation
                </button>
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="Search pharmacy or city..." 
                  className="settings-input"
                  style={{ width: '240px', padding: '10px 14px', fontSize: '13.5px', borderRadius: '6px', border: '1px solid var(--divider-color)', background: 'var(--bg-color)', color: 'var(--text-main)' }}
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
                    <th>City / State</th>
                    <th>Volume / Metric</th>
                    <th>Percentile</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredLeaderboard().map((pharm) => (
                    <tr key={pharm.rank} style={{ borderBottom: '1px solid var(--divider-color)' }}>
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
                      <td>{pharm.location}</td>
                      <td style={{ fontWeight: 'bold' }}>{pharm.value}</td>
                      <td style={{ color: '#10B981', fontWeight: 600 }}>{pharm.percentile}</td>
                      <td><span className="badge-pill badge-pill-success" style={{ fontSize: '11px', padding: '3px 8px' }}>Verified</span></td>
                    </tr>
                  ))}
                  {getFilteredLeaderboard().length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                        No pharmacies found matching "{leaderboardSearch}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Start Free to Unlock Your Standing <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--divider-color)', borderBottom: '1px solid var(--divider-color)' }}>
        <div className="container text-center">
          <Shield size={48} color="var(--chart-blue)" style={{ margin: '0 auto 24px' }} />
          <h2 className="section-title">Strict Privacy & DPDP Compliance</h2>
          <p className="section-subtitle" style={{ maxWidth: '650px', margin: '0 auto' }}>
            We know pharmacy data is business-sensitive. Your invoice details and billing analytics are strictly end-to-end encrypted, keeping you fully compliant with the Digital Personal Data Protection (DPDP) Act of India.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        {/* Ambient background glows */}
        <div className="ambient-blob" style={{ top: '-10%', left: '5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 60%)' }}></div>
        <div className="ambient-blob" style={{ bottom: '-15%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(123,34,224,0.05) 0%, transparent 60%)' }}></div>

        <div className="container">
          <div className="text-center" style={{ position: 'relative', zIndex: 2 }}>
            <span className="feature-tag" style={{ display: 'inline-block', marginBottom: '16px' }}>Pricing Plans</span>
            <h2 className="section-title" style={{ fontSize: '44px', fontWeight: '800', letterSpacing: '-1px' }}>Fair Pricing. Transparent Benefits.</h2>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
              No long-term contracts. Cancel or upgrade with a single click. Select the plan that matches your pharmacy's growth scale.
            </p>
          </div>

          {/* Interactive Toggle Switch */}
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
            <span className="pricing-discount-badge">Save 20%</span>
          </div>

          {/* Pricing Grid */}
          <div className="pricing-grid">
            {/* Plan 1: Free Forever */}
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">Free Forever</h3>
                <p className="pricing-plan-desc">For single retail counters starting out with statement audits.</p>
              </div>
              <div className="pricing-price-container">
                <span className="pricing-price-currency">₹</span>
                <span className="pricing-price-amount">0</span>
                <span className="pricing-price-period">/month</span>
              </div>
              <ul className="pricing-features-list">
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Audit up to 10 stockist invoices/mo</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Basic leakage detection alerts</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>GST input credit discrepancy summaries</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Secure 256-bit DPDP data encryption</span>
                </li>
                <li className="disabled">
                  <Check size={18} style={{ color: 'var(--text-muted)' }} />
                  <span>Local pin-code demand heatmaps</span>
                </li>
                <li className="disabled">
                  <Check size={18} style={{ color: 'var(--text-muted)' }} />
                  <span>Automated stockist claims refund writer</span>
                </li>
              </ul>
              <Link to="/signup" className="pricing-btn pricing-btn-outline">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <div className="pricing-card-footer">No credit card required</div>
            </div>

            {/* Plan 2: Pro Growth (Featured) */}
            <div className="pricing-card featured">
              <div className="featured-glow"></div>
              <span className="popular-badge">Most Popular</span>
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">Pro Growth</h3>
                <p className="pricing-plan-desc">Accelerate revenue & plug leakages for scaling independent stores.</p>
              </div>
              <div className="pricing-price-container">
                <span className="pricing-price-currency">₹</span>
                <span className="pricing-price-amount">{isAnnual ? '1,199' : '1,499'}</span>
                <span className="pricing-price-period">/month</span>
                {isAnnual && (
                  <span className="pricing-price-subtext">Billed ₹14,388 annually (Save ₹3,600)</span>
                )}
              </div>
              <ul className="pricing-features-list">
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span><strong>Unlimited</strong> stockist invoice audits</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Real-time generic vs branded margin optimization</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span><strong>Hyper-local pin-code demand heatmaps</strong></span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Direct stockist claims helper & auto-refund writer</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Private anonymous competitive peer benchmarking</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Priority email & WhatsApp chat support</span>
                </li>
              </ul>
              <Link to="/signup" className="pricing-btn pricing-btn-primary">
                Start 14-Day Free Trial <ArrowRight size={16} />
              </Link>
              <div className="pricing-card-footer">Zero risk. Cancel anytime.</div>
            </div>

            {/* Plan 3: Multi-Store */}
            <div className="pricing-card">
              <div className="pricing-card-header">
                <h3 className="pricing-plan-name">Multi-Store</h3>
                <p className="pricing-plan-desc">For expanding chain pharmacies & multi-counter operations.</p>
              </div>
              <div className="pricing-price-container">
                <span className="pricing-price-currency">₹</span>
                <span className="pricing-price-amount">{isAnnual ? '3,199' : '3,999'}</span>
                <span className="pricing-price-period">/month</span>
                {isAnnual && (
                  <span className="pricing-price-subtext">Billed ₹38,388 annually (Save ₹9,600)</span>
                )}
              </div>
              <ul className="pricing-features-list">
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Manage and sync up to <strong>8 retail counters</strong></span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Centralized chain procurement audit dashboard</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Consolidated multi-counter input tax credit reconciliation</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Advanced regional-scale demand forecasting indexes</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Dedicated corporate accounts manager & onboarding</span>
                </li>
                <li>
                  <Check size={18} style={{ color: 'var(--accent-color)', strokeWidth: 3 }} />
                  <span>Custom ERP/POS database integration options</span>
                </li>
              </ul>
              <Link to="/signup" className="pricing-btn pricing-btn-gradient">
                Upgrade to Multi-Store <ArrowRight size={16} />
              </Link>
              <div className="pricing-card-footer">Custom scales available on demand</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="container text-center">
          <span className="faq-badge">FAQ</span>
          <h2 style={{ fontSize: '42px', fontWeight: '800', color: '#0A2540', marginBottom: '12px', letterSpacing: '-1px' }}>
            Frequently asked questions
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            Everything you need to know about DashRx.
          </p>

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


      {/* CTA Section */}
      <section className="py-24 text-center" style={{ position: 'relative' }}>
        <div className="ambient-blob" style={{ bottom: '-30%', left: '30%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 60%)', filter: 'blur(100px)' }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 className="section-title">Take Back Control of Your Pharmacy's Margins</h2>
          <p className="section-subtitle">Boost your store profit by plugging distributor leakages today. Setup in under 60 seconds.</p>
          <Link to="/signup" className="btn btn-primary flex items-center gap-2" style={{ margin: '0 auto', width: 'fit-content', padding: '16px 32px' }}>
            Get Started for Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
