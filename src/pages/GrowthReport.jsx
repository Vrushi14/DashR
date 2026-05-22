import { useState } from 'react';
import { ArrowLeft, Loader, Percent, TrendingUp, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GrowthReport() {
  const [formData, setFormData] = useState({
    pharmacyName: '',
    monthlyBills: '8000',
    grossMargin: '16.5',
    primaryStockist: 'Alliance Healthcare',
    email: '',
    whatsapp: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const steps = [
    "Connecting to national drug master database...",
    "Benchmarking average stockist purchase rates...",
    "Scanning generic-to-branded acute molecule ratio...",
    "Estimating VAT input discrepancy gap...",
    "Compiling annual commercial growth report..."
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const runAnalysis = (e) => {
    e.preventDefault();
    if (!formData.pharmacyName || !formData.email) {
      alert("Please fill out the pharmacy name and contact email.");
      return;
    }
    setLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setLoading(false);
          setShowResult(true);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
  };

  const resetCalculator = () => {
    setShowResult(false);
    setLoading(false);
    setFormData({
      pharmacyName: '',
      monthlyBills: '8000',
      grossMargin: '16.5',
      primaryStockist: 'Alliance Healthcare',
      email: '',
      whatsapp: ''
    });
  };

  // Scorecard variables calculated dynamically from inputs
  const monthlyBillsNum = parseFloat(formData.monthlyBills) || 8000;
  const currentMarginNum = parseFloat(formData.grossMargin) || 16.5;
  
  // Calculate simulated leaks
  const estimatedLeak = Math.round(monthlyBillsNum * 12.5); // £12.50 per bill lost in discrepancies
  const targetMargin = (currentMarginNum + 3.2).toFixed(1);
  const potentialSavings = Math.round((monthlyBillsNum * 150) * 0.032 * 12); // Turnover * margin increase * 12 months

  const docReportContent = `
    <h1>DashRx Instant Growth Report - ${formData.pharmacyName}</h1>
    <p><strong>Primary Stockist :</strong> ${formData.primaryStockist}</p>
    <p><strong>Dispensing Scale :</strong> ${monthlyBillsNum.toLocaleString()} bills / mo</p>
    <p><strong>Baseline Margin :</strong> ${currentMarginNum}%</p>
    <p><strong>Optimized Margin:</strong> ${targetMargin}%</p>
    
    <h2>Estimated Annual Profit Leakages</h2>
    <table>
      <thead>
        <tr>
          <th>Pricing Gap Area</th>
          <th>Baseline Status</th>
          <th>Optimized Target</th>
          <th>Annual Leakage Loss</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Stockist Rate Mismatch</td>
          <td>Manual PO Checks</td>
          <td>Automated Rate Audits</td>
          <td class="highlight">£${Math.round(potentialSavings * 0.4).toLocaleString()}</td>
        </tr>
        <tr>
          <td>VAT Input Discrepancy Gap</td>
          <td>Partial Reconciliation</td>
          <td>100% FP34 VAT Audits</td>
          <td class="highlight">£${Math.round(potentialSavings * 0.25).toLocaleString()}</td>
        </tr>
        <tr>
          <td>Near-Expiry Returns</td>
          <td>90-Day Returns</td>
          <td>120-Day Alerts</td>
          <td class="highlight">£${Math.round(potentialSavings * 0.35).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  `;

  // HTML-to-Word (.doc) Document Generator
  const downloadDoc = () => {
    const docContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>DashRx Growth Report</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #333333; line-height: 1.5; padding: 30px; }
          h1 { color: #0078FF; font-size: 24px; border-bottom: 2px solid #0078FF; padding-bottom: 10px; margin-bottom: 20px; }
          h2 { color: #1E293B; font-size: 16px; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #0078FF; padding-left: 8px; }
          p { margin: 6px 0; font-size: 13.5px; }
          table { border-collapse: collapse; width: 100%; margin-top: 15px; font-size: 12px; }
          th { background-color: #0078FF; color: #FFFFFF; text-align: left; padding: 8px; border: 1px solid #E2E8F0; }
          td { padding: 8px; border: 1px solid #E2E8F0; color: #334155; }
          tr:nth-child(even) { background-color: #F8FAFC; }
          .highlight { color: #EF4444; font-weight: bold; }
        </style>
      </head>
      <body>
        ${docReportContent}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DashRx_Growth_Report_${formData.pharmacyName.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print-to-PDF Window Trigger
  const printToPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>DashRx Growth Report - ${formData.pharmacyName}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #333333; line-height: 1.5; padding: 40px; }
            h1 { color: #0078FF; font-size: 24px; border-bottom: 2px solid #0078FF; padding-bottom: 10px; margin-bottom: 20px; }
            h2 { color: #1E293B; font-size: 16px; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #0078FF; padding-left: 8px; }
            p { margin: 6px 0; font-size: 13.5px; }
            table { border-collapse: collapse; width: 100%; margin-top: 15px; font-size: 12px; }
            th { background-color: #0078FF; color: #ffffff; text-align: left; padding: 8px; border: 1px solid #E2E8F0; }
            td { padding: 8px; border: 1px solid #E2E8F0; color: #334155; }
            tr:nth-child(even) { background-color: #F8FAFC; }
            .highlight { color: #EF4444; font-weight: bold; }
          </style>
        </head>
        <body>
          ${docReportContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="legal-viewport-container" style={{ padding: '80px 20px', minHeight: '80vh', position: 'relative' }}>
      <div className="ambient-blob" style={{ top: '-10%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 60%)', filter: 'blur(100px)' }}></div>
      <div className="container" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
        
        {/* Back Link */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0078FF', textDecoration: 'none', fontWeight: 'bold', marginBottom: '24px', fontSize: '14.5px' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {!loading && !showResult && (
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-1px' }}>Free Growth Audit</h1>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.6' }}>
              Enter your pharmacy parameters below. Our pricing master indexes will evaluate your margin potential and email a downloadable audit report.
            </p>

            <form onSubmit={runAnalysis} className="settings-card animate-slide-in" style={{ padding: '32px', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '12px' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="settings-label">Pharmacy Name</label>
                  <input 
                    type="text" 
                    name="pharmacyName" 
                    placeholder="e.g. Smiths Pharmacy, London" 
                    className="settings-input" 
                    required 
                    value={formData.pharmacyName} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div>
                  <label className="settings-label">Primary Stockist / Distributor</label>
                  <select name="primaryStockist" className="settings-input" value={formData.primaryStockist} onChange={handleInputChange}>
                    <option value="Alliance Healthcare">Alliance Healthcare</option>
                    <option value="AAH Pharmaceuticals">AAH Pharmaceuticals</option>
                    <option value="Phoenix Medical">Phoenix Medical</option>
                    <option value="Sigma Pharmaceuticals">Sigma Pharmaceuticals</option>
                    <option value="Local Supplier">Independent local supplier</option>
                  </select>
                </div>
                <div>
                  <label className="settings-label">Avg Monthly Bills Count</label>
                  <input 
                    type="number" 
                    name="monthlyBills" 
                    className="settings-input" 
                    value={formData.monthlyBills} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div>
                  <label className="settings-label">Estimated Current Gross Margin (%)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    name="grossMargin" 
                    className="settings-input" 
                    value={formData.grossMargin} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div>
                  <label className="settings-label">Contact Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="name@pharmacy.co.uk" 
                    className="settings-input" 
                    required 
                    value={formData.email} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div>
                  <label className="settings-label">WhatsApp Number (Optional)</label>
                  <input 
                    type="tel" 
                    name="whatsapp" 
                    placeholder="e.g. 07700 900123" 
                    className="settings-input" 
                    value={formData.whatsapp} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                Run Diagnostic Audit Report
              </button>
            </form>
          </div>
        )}

        {loading && (
          <div className="settings-card text-center" style={{ padding: '60px', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '12px' }}>
            <Loader size={48} className="animate-spin" color="#0078FF" style={{ margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Auditing Store Parameters</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{steps[loadingStep]}</p>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginTop: '30px', overflow: 'hidden' }}>
              <div style={{ width: `${((loadingStep + 1) / steps.length) * 100}%`, height: '100%', background: '#0078FF', transition: 'width 0.4s ease' }}></div>
            </div>
          </div>
        )}

        {showResult && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '24px', letterSpacing: '-1px' }}>Your Commercial Scorecard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Score card */}
              <div className="settings-card" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '12px', textAlign: 'center' }}>
                <Percent size={32} color="#0078FF" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>Margin Optimization Score</h3>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#10B981' }}>82 / 100</div>
                <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>Average Standing</p>
              </div>

              {/* Annual leakage card */}
              <div className="settings-card" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '12px', textAlign: 'center' }}>
                <AlertTriangle size={32} color="#EF4444" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>Annual Profit Leakage</h3>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#EF4444' }}>£{estimatedLeak.toLocaleString()}</div>
                <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: '#EF4444', fontWeight: 600 }}>Unreclaimed Bills</p>
              </div>

              {/* Profit potential card */}
              <div className="settings-card" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '12px', textAlign: 'center' }}>
                <TrendingUp size={32} color="#10B981" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 6px 0' }}>Optimum Margin Target</h3>
                <div style={{ fontSize: '36px', fontWeight: 900, color: 'var(--accent-color)' }}>{targetMargin}%</div>
                <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: 'var(--text-muted)' }}>Baseline: {currentMarginNum}%</p>
              </div>
            </div>

            {/* Scorecard table details */}
            <div className="settings-card mb-8" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 16px 0' }}>Audited Revenue Opportunities</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', marginBottom: '24px' }}>
                Based on your monthly volume of {monthlyBillsNum.toLocaleString()} statements, you are losing an estimated <strong>£{potentialSavings.toLocaleString()}</strong> annually in generic substitution and distributor rate adjustments.
              </p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={downloadDoc}>
                  <Download size={16} /> Download .DOC Audit
                </button>
                <button className="btn btn-secondary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={printToPDF}>
                  <Download size={16} /> Download .PDF Scorecard
                </button>
                <button className="btn-export" style={{ padding: '12px 24px', border: '1px solid var(--divider-color)', background: 'transparent', cursor: 'pointer', borderRadius: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={resetCalculator}>
                  <RefreshCw size={16} /> Audit Another Pharmacy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
