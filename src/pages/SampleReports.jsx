import { FileText, Download, Percent, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SampleReports() {
  // HTML-to-Word (.doc) Document Generator
  const downloadDoc = (filename, htmlContent) => {
    const docContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>DashRx Sample Report</title>
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
        ${htmlContent}
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print-to-PDF Window Trigger
  const printToPDF = (title, htmlContent) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>${title}</title>
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
          ${htmlContent}
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

  const samplePricingReport = `
    <h1>[SAMPLE] DashRx Purchase Invoice Pricing Discrepancies</h1>
    <p><strong>Pharmacy Entity :</strong> Sample Pharmacy, London</p>
    <p><strong>ODS Code        :</strong> FLF77</p>
    <p><strong>Analysis Period  :</strong> May 2026 Audit</p>
    <p><strong>Total Leakage   :</strong> £112.40</p>
    
    <h2>Reconciled Supplier Invoices</h2>
    <table>
      <thead>
        <tr>
          <th>Distributor</th>
          <th>Invoice No.</th>
          <th>Billed Rate</th>
          <th>Contract Rate</th>
          <th>Variance</th>
          <th>Leakage Loss</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Alliance Healthcare</td>
          <td>ALL/LON/9482</td>
          <td>£12.40</td>
          <td>£11.20</td>
          <td>+£1.20</td>
          <td class="highlight">£72.00</td>
        </tr>
        <tr>
          <td>AAH Pharmaceuticals</td>
          <td>AAH/DIS/40291</td>
          <td>£9.80</td>
          <td>£9.14</td>
          <td>+£0.66</td>
          <td class="highlight">£40.40</td>
        </tr>
      </tbody>
    </table>
  `;

  const sampleGstReport = `
    <h1>[SAMPLE] DashRx FP34 VAT Reconciliation Report</h1>
    <p><strong>ODS Code        :</strong> FLF77</p>
    <p><strong>Pharmacy        :</strong> Sample Pharmacy, London</p>
    <p><strong>Report Period   :</strong> Q1 2026 Summary</p>
    
    <h2>VAT Input Reconciliation Ledger</h2>
    <table>
      <thead>
        <tr>
          <th>VAT Rate</th>
          <th>Audited Purchases</th>
          <th>Billed Invoice VAT</th>
          <th>NHSBSA Matched VAT</th>
          <th>Eligible Input VAT</th>
          <th>Discrepancy Gap</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>VAT @ 5%</td>
          <td>£8,088</td>
          <td>£404</td>
          <td>£404</td>
          <td>£404</td>
          <td>£0</td>
        </tr>
        <tr>
          <td>VAT @ 20%</td>
          <td>£32,971</td>
          <td>£6,594</td>
          <td>£6,282</td>
          <td>£6,282</td>
          <td class="highlight">£312</td>
        </tr>
      </tbody>
    </table>
  `;

  return (
    <div className="legal-viewport-container" style={{ padding: '80px 20px', minHeight: '80vh', position: 'relative' }}>
      <div className="ambient-blob" style={{ top: '-10%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(0,120,255,0.06) 0%, transparent 60%)', filter: 'blur(100px)' }}></div>
      <div className="container" style={{ maxWidth: '960px', position: 'relative', zIndex: 1 }}>
        
        {/* Back Link */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0078FF', textDecoration: 'none', fontWeight: 'bold', marginBottom: '24px', fontSize: '14.5px' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-1px' }}>Sample Reports</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '48px', lineHeight: '1.6' }}>
          See exactly how DashRx structures your pharmacy's financial audits, claims templates, and tax reconciliation files. Click any card below to download high-fidelity sample files.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 1 */}
          <div className="settings-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap', padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '12px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ color: '#0078FF', marginBottom: '12px' }}>
                <FileText size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0' }}>Distributor Purchase & Margin Audit</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Detailed invoice auditing sheet cross-referencing actual stockist PO bill rates against trade margin agreements. Flags rate differences and scheme shortfall leaks.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '200px' }}>
              <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }} onClick={() => downloadDoc('DashRx_Sample_Margin_Audit.doc', samplePricingReport)}>
                <Download size={14} /> Download .DOC
              </button>
              <button className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }} onClick={() => printToPDF('Sample Pricing Audit', samplePricingReport)}>
                <Download size={14} /> Download .PDF
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="settings-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap', padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '12px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ color: '#0078FF', marginBottom: '12px' }}>
                <Percent size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0' }}>FP34 VAT Reconciliation Report</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Reconciliation summaries comparing purchase invoice VAT charges against NHSBSA FP34 Schedule of Payments. Highlights VAT rate matches, unreclaimed input VAT, and FP34 processing discrepancies.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '200px' }}>
              <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }} onClick={() => downloadDoc('DashRx_Sample_VAT_FP34_Audit.doc', sampleGstReport)}>
                <Download size={14} /> Download .DOC
              </button>
              <button className="btn btn-secondary" style={{ padding: '10px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }} onClick={() => printToPDF('Sample FP34 VAT Audit', sampleGstReport)}>
                <Download size={14} /> Download .PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
