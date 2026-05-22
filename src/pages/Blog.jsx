import { useState } from 'react';
import { ArrowLeft, Clock, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Blog() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const articles = [
    {
      id: 1,
      title: "How to Audit Your Stockist Statements & Stop Margin Overcharges",
      category: "Audit Strategy",
      readTime: "6 min read",
      date: "May 12, 2026",
      summary: "Manual invoice checking is slow and misses key rate differences. Discover how to build a quick audit workflow that catches stockist overcharges on high-margin chronic medicines.",
      content: `
        <p>Independent pharmacies face significant challenges in checking every single line item on their stockist bills. With over 20+ stockists and hundreds of invoices monthly, checking manually is practically impossible.</p>
        
        <h3>1. Focus on Your Top 20 High-Value Chronic Brands</h3>
        <p>80% of pricing errors happen on your top 20% high-volume chronic stock. Focus your pricing audit on cardiac, diabetic, and oncology medications where price agreements fluctuate monthly.</p>
        
        <h3>2. Log Distributor Price Agreements</h3>
        <p>Many distributors offer verbal or temporary discounts that are not updated in their billing ERP systems. Always keep a written log of your distributor trade agreements and compare them side-by-side with your billed purchase rate.</p>
        
        <h3>3. Reconcile Free Medicine Schemes</h3>
        <p>Pharma distributors frequently offer "10+1 free" or "10+2 free" bonus schemes. Verify that your invoices accurately credit these bonus items, and check that you aren't paying full tax values on promotional stocks.</p>
      `
    },
    {
      id: 2,
      title: "Demystifying VAT Reconciliation & FP34 Payments for NHS Pharmacy Owners",
      category: "Tax Compliance",
      readTime: "8 min read",
      date: "May 08, 2026",
      summary: "Understanding UK VAT categories, NHSBSA Schedule of Payments, and matching purchase invoices to ensure you reclaim every pound of eligible input VAT.",
      content: `
        <p>For UK pharmacy owners, managing VAT and NHSBSA reimbursement is a major compliance area. Correctly reconciling your purchase invoices against standard rate (20%) and reduced rate (5%) VAT is essential to avoid losing tax reclaims.</p>
        
        <h3>Understanding VAT Slabs: 20% vs 5%</h3>
        <p>Pharmaceutical supplies in the UK fall into different VAT categories. Most prescription items are zero-rated, but standard business purchases and certain OTC items attract 20% VAT, while some hygiene and smoking cessation products fall under the 5% reduced rate. Reconciling your invoices is critical to identifying input VAT that can be reclaimed from HMRC.</p>
        
        <h3>Matching Supplier Invoices to FP34 Schedules</h3>
        <p>Discrepancies often occur between distributor invoice dates and NHSBSA FP34 Schedule of Payments processing cycles. Setting up a monthly matching process helps you track down missed claims and ensure the dispensing fees and drug tariff discounts are fully accounted for.</p>
      `
    },
    {
      id: 3,
      title: "Smart Ways to Minimize Medicine Expiries at Retail Counters",
      category: "Inventory Control",
      readTime: "5 min read",
      date: "April 28, 2026",
      summary: "Expiries are a massive leak in pharmacy profitability. Learn how to track batches, manage near-expiry returns, and optimize inventory turnover ratios.",
      content: `
        <p>Medicine expiry losses can drain up to 3% of a retail pharmacy's net profit. Implementing clear batch-checking systems is the easiest way to preserve capital.</p>
        
        <h3>1. Establish the 'FEFO' Principle</h3>
        <p>FEFO stands for First Expiry, First Out. Train your counter staff to place newer stock batches behind older batches on shelves. This ensures items close to expiry are sold first.</p>
        
        <h3>2. Run Near-Expiry Audits 90 Days in Advance</h3>
        <p>Most UK pharmaceutical distributors require return claims for near-expiry medicines to be lodged at least 60-90 days before the actual expiry date. Run quarterly batch reports to isolate expiring stock in advance.</p>
      `
    }
  ];

  const filteredArticles = categoryFilter === 'All' 
    ? articles 
    : articles.filter(a => a.category === categoryFilter);

  if (selectedArticle) {
    return (
      <div className="legal-viewport-container" style={{ padding: '80px 20px', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <button 
            onClick={() => setSelectedArticle(null)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0078FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginBottom: '24px', fontSize: '14.5px' }}
          >
            <ArrowLeft size={16} /> Back to Blog List
          </button>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
            <span className="badge-pill badge-pill-success" style={{ fontSize: '11px' }}>{selectedArticle.category}</span>
            <span>&bull;</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {selectedArticle.readTime}</span>
            <span>&bull;</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {selectedArticle.date}</span>
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '24px', lineHeight: '1.2', color: 'var(--text-main)' }}>{selectedArticle.title}</h1>
          <div style={{ borderBottom: '1px solid var(--divider-color)', marginBottom: '32px' }}></div>

          <div 
            className="blog-post-content"
            style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text-main)' }}
            dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="legal-viewport-container" style={{ padding: '80px 20px', minHeight: '80vh', position: 'relative' }}>
      <div className="ambient-blob" style={{ top: '-10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 60%)', filter: 'blur(100px)' }}></div>
      <div className="container" style={{ maxWidth: '960px', position: 'relative', zIndex: 1 }}>
        
        {/* Back Link */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0078FF', textDecoration: 'none', fontWeight: 'bold', marginBottom: '24px', fontSize: '14.5px' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-1px' }}>The DashRx Blog</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '48px', lineHeight: '1.6' }}>
          Insights, strategy guides, and tax audit guides to help independent pharmacy owners scale their retail margins.
        </p>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {['All', 'Audit Strategy', 'Tax Compliance', 'Inventory Control'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn-export ${categoryFilter === cat ? 'active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '13.5px', borderRadius: '6px', background: categoryFilter === cat ? '#0078FF' : 'transparent', color: categoryFilter === cat ? '#FFF' : 'var(--text-muted)', border: '1px solid var(--divider-color)', cursor: 'pointer', fontWeight: 600 }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredArticles.map((art) => (
            <div key={art.id} className="settings-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span className="badge-pill badge-pill-success" style={{ fontSize: '11px' }}>{art.category}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{art.date}</span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 12px 0', lineHeight: '1.3' }}>{art.title}</h3>
                <p style={{ fontSize: '14.5px', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 24px 0', flex: 1 }}>{art.summary}</p>
                <button 
                  onClick={() => setSelectedArticle(art)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0078FF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', width: 'fit-content', padding: 0 }}
                >
                  Read Article <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
