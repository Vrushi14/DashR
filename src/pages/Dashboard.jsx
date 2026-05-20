import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  Sun,
  Moon,
  Download,
  UploadCloud,
  FileDown,
  Pill,
  CheckCircle2,
  AlertCircle,
  Percent,
  TrendingUp,
  MapPin,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Plus,
  Loader2,
  Trash2,
  Trophy,
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Load state from localStorage or default values
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('dashrx_active_tab') || 'dashboard';
  });

  const [pharmacyName, setPharmacyName] = useState(() => {
    return localStorage.getItem('dashrx_pharmacy_name') || 'Krishna Medicos, Mumbai';
  });

  const [userName, setUserName] = useState(() => {
    const sessionUser = localStorage.getItem('user');
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        if (parsed && parsed.name) return parsed.name;
      } catch (e) {
        console.error(e);
      }
    }
    return localStorage.getItem('dashrx_user_name') || 'Rahul Sharma';
  });

  const [gstin, setGstin] = useState(() => {
    return localStorage.getItem('dashrx_gstin') || '27AAAAA1111A1Z1';
  });

  const [drugLicense, setDrugLicense] = useState(() => {
    return localStorage.getItem('dashrx_drug_license') || 'DL-2026/MH-MUM';
  });

  // Default to true for demo experience, so user sees the high-fidelity state first
  const [hasData, setHasData] = useState(() => {
    const stored = localStorage.getItem('dashrx_has_data');
    return stored === null ? true : stored === 'true';
  });

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('dashrx_theme') === 'dark';
  });

  // File Upload and Interactive Processing state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(() => {
    return localStorage.getItem('dashrx_uploaded_file') || '';
  });

  // Invoice detailed audit modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [claimRaisedInvoices, setClaimRaisedInvoices] = useState({});

  // Leaderboard tab interactive state
  const [leaderboardMetric, setLeaderboardMetric] = useState('bills');
  const [leaderboardSearch, setLeaderboardSearch] = useState('');

  // Sync theme with DOM on mount and change
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark-theme');
      localStorage.setItem('dashrx_theme', 'dark');
    } else {
      root.classList.remove('dark-theme');
      localStorage.setItem('dashrx_theme', 'light');
    }
  }, [isDark]);

  // Sync state helpers to local storage
  useEffect(() => {
    localStorage.setItem('dashrx_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('dashrx_pharmacy_name', pharmacyName);
  }, [pharmacyName]);

  useEffect(() => {
    localStorage.setItem('dashrx_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('dashrx_gstin', gstin);
  }, [gstin]);

  useEffect(() => {
    localStorage.setItem('dashrx_drug_license', drugLicense);
  }, [drugLicense]);

  useEffect(() => {
    localStorage.setItem('dashrx_has_data', hasData ? 'true' : 'false');
  }, [hasData]);

  useEffect(() => {
    localStorage.setItem('dashrx_uploaded_file', uploadedFile);
  }, [uploadedFile]);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Switch themes
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert('Pharmacy configuration saved successfully!');
  };

  // Simulate file upload with a dynamic progress bar loader
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerUploadSimulation(file.name);
    }
  };

  const triggerUploadSimulation = (fileName) => {
    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadedFile(fileName);
            setHasData(true);
            setActiveTab('dashboard');
            alert(`Audit complete for "${fileName}". Checked 14 medicines against contract rates: 2 margin leakages identified.`);
          }, 400);
          return 100;
        }
        return prev + 30;
      });
    }, 300);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      triggerUploadSimulation(file.name);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Clear loaded data
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear the audited statement queue? This will reset all current records.')) {
      setHasData(false);
      setUploadedFile('');
      setSelectedInvoice(null);
      setClaimRaisedInvoices({});
    }
  };

  // Trigger claim simulation
  const handleRaiseClaim = (invoiceId) => {
    setClaimRaisedInvoices(prev => ({
      ...prev,
      [invoiceId]: true
    }));
    alert(`Refund Claim Note successfully generated for invoice ${invoiceId}! The claim request has been queued for your stockist/distributor ledger sync.`);
  };

  // HTML-to-Word (.doc) Document Generator
  const downloadDoc = (filename, htmlContent) => {
    const docContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>DashRx Report</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #333333; line-height: 1.5; padding: 30px; }
          h1 { color: #0078FF; font-size: 26px; font-weight: bold; border-bottom: 2px solid #0078FF; padding-bottom: 12px; margin-bottom: 24px; }
          h2 { color: #1E293B; font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; border-left: 4px solid #0078FF; padding-left: 10px; }
          p { margin: 6px 0; font-size: 14px; }
          ul { margin: 10px 0; padding-left: 20px; }
          li { margin-bottom: 6px; font-size: 14px; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; margin-bottom: 20px; font-size: 13px; }
          th { background-color: #0078FF; color: #FFFFFF; font-weight: bold; text-align: left; padding: 10px; border: 1px solid #E2E8F0; }
          td { padding: 10px; border: 1px solid #E2E8F0; color: #334155; }
          tr:nth-child(even) { background-color: #F8FAFC; }
          .leakage-highlight { color: #EF4444; font-weight: bold; }
          .footer-note { font-size: 11px; color: #64748B; text-align: center; margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 10px; }
        </style>
      </head>
      <body>
        ${htmlContent}
        <div class="footer-note">Generated dynamically via DashRx Audit Engine. Strict confidentiality assured.</div>
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

  // Browser Print-to-PDF Layout Processor (creates beautiful vector PDF files)
  const printToPDF = (title, htmlContent) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #333333; line-height: 1.5; padding: 40px; }
            h1 { color: #0078FF; font-size: 26px; border-bottom: 2px solid #0078FF; padding-bottom: 12px; margin-bottom: 24px; }
            h2 { color: #1E293B; font-size: 18px; margin-top: 24px; margin-bottom: 12px; border-left: 4px solid #0078FF; padding-left: 10px; }
            p { margin: 6px 0; font-size: 14px; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin-bottom: 6px; font-size: 14px; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; font-size: 13px; }
            th { background-color: #0078FF; color: #ffffff; text-align: left; padding: 10px; border: 1px solid #E2E8F0; }
            td { padding: 10px; border: 1px solid #E2E8F0; color: #334155; }
            tr:nth-child(even) { background-color: #F8FAFC; }
            .leakage-highlight { color: #EF4444; font-weight: bold; }
            .footer-note { font-size: 11px; color: #64748B; text-align: center; margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 10px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <div class="footer-note">Generated dynamically via DashRx Audit Engine. Strict confidentiality assured.</div>
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

  // Sample static data for mockups
  const invoicesData = [
    {
      id: 'INV-2026-904',
      distributor: 'Keimed Mumbai',
      billNo: 'KEI/MUM/9482',
      date: '15 May 2026',
      amount: '₹2,45,210',
      gstSlab: '12% GST',
      leakage: '₹3,120',
      type: 'Rate Difference',
      status: 'Claim Raised',
      items: [
        { name: 'Telmisartan 40mg (Cardiovascular)', qty: '100 strips', billedRate: '₹72.50', contractRate: '₹68.00', variance: '+₹4.50', totalLeakage: '₹450' },
        { name: 'Atorvastatin 10mg (Cardiovascular)', qty: '120 strips', billedRate: '₹115.00', contractRate: '₹105.00', variance: '+₹10.00', totalLeakage: '₹1,200' },
        { name: 'Pantoprazole 40mg (Gastrointestinal)', qty: '150 strips', billedRate: '₹98.00', contractRate: '₹88.20', variance: '+₹9.80', totalLeakage: '₹1,470' }
      ]
    },
    {
      id: 'INV-2026-1022',
      distributor: 'PharmEasy B2B Portal',
      billNo: 'PE/DIS/40291',
      date: '12 May 2026',
      amount: '₹1,12,450',
      gstSlab: '18% GST',
      leakage: '₹820',
      type: 'Scheme Shortfall',
      status: 'Action Required',
      items: [
        { name: 'Metformin 500mg SR (Diabetic)', qty: '200 strips', billedRate: '₹32.10', contractRate: '₹30.00', variance: '+₹2.10', totalLeakage: '₹420' },
        { name: 'Vildagliptin 50mg (Diabetic)', qty: '100 strips', billedRate: '₹144.00', contractRate: '₹140.00', variance: '+₹4.00', totalLeakage: '₹400' }
      ]
    },
    {
      id: 'INV-2026-7841',
      distributor: 'Ascent Wellness',
      billNo: 'ASC/7821-W',
      date: '08 May 2026',
      amount: '₹84,500',
      gstSlab: '12% GST',
      leakage: '₹0',
      type: 'Fully Matched',
      status: 'Fully Matched',
      items: [
        { name: 'Paracetamol 650mg (OTC / Analgesic)', qty: '300 strips', billedRate: '₹18.00', contractRate: '₹18.00', variance: '₹0.00', totalLeakage: '₹0' },
        { name: 'Montelukast + Levocetirizine (Respiratory)', qty: '100 strips', billedRate: '₹120.00', contractRate: '₹120.00', variance: '₹0.00', totalLeakage: '₹0' }
      ]
    },
    {
      id: 'INV-2026-4402',
      distributor: 'Apollo B2B Portal',
      billNo: 'APO/RE/90832',
      date: '05 May 2026',
      amount: '₹40,440',
      gstSlab: '5% GST',
      leakage: '₹4,220',
      type: 'Rate Difference',
      status: 'Action Required',
      items: [
        { name: 'Amoxycillin + Clavulanic Acid 625 (Antibiotic)', qty: '100 strips', billedRate: '₹182.20', contractRate: '₹140.00', variance: '+₹42.20', totalLeakage: '₹4,220' }
      ]
    }
  ];

  // Leaderboard database (simulated with 11,000+ national rankings context from the UK portal, mapped to India)
  const leaderboardData = {
    bills: [
      { rank: 1, name: 'Apollo Pharmacy Central', location: 'Delhi Connaught Place', id: '27AAAAA1211A1Z1', value: '28,490 bills', percentile: '99.9%' },
      { rank: 2, name: 'MedPlus Franchise Hub', location: 'Hyderabad Gachibowli', id: '36BBBBB2022B1Z2', value: '25,120 bills', percentile: '99.9%' },
      { rank: 3, name: 'Noble Plus Chemist', location: 'Mumbai Pedder Road', id: '27CCCCC3033C1Z3', value: '22,940 bills', percentile: '99.8%' },
      { rank: 4, name: 'Wellness Forever Wellness', location: 'Pune Koregaon Park', id: '27DDDDD4044D1Z4', value: '19,410 bills', percentile: '99.7%' },
      { rank: 412, name: pharmacyName, location: 'Mumbai West', id: gstin, value: '8,420 bills', percentile: '97.3%', isUser: true },
      { rank: 413, name: 'Ascent Retail Pharmacy', location: 'Mumbai Andheri East', id: '27EEEEE5055E1Z5', value: '8,110 bills', percentile: '97.3%' },
      { rank: 414, name: 'Keimed Retailer Store', location: 'Pune Camp', id: '27FFFFF6066F1Z6', value: '7,950 bills', percentile: '97.2%' },
      { rank: 415, name: 'Apollo B2B Outlet', location: 'Navi Mumbai Vashi', id: '27GGGGG7077G1Z7', value: '7,810 bills', percentile: '97.2%' }
    ],
    chronic: [
      { rank: 1, name: 'Noble Plus Chemist', location: 'Mumbai Pedder Road', id: '27CCCCC3033C1Z3', value: '18,520 refills', percentile: '99.9%' },
      { rank: 2, name: 'Apollo Pharmacy Central', location: 'Delhi Connaught Place', id: '27AAAAA1211A1Z1', value: '17,440 refills', percentile: '99.9%' },
      { rank: 3, name: 'MedPlus Franchise Hub', location: 'Hyderabad Gachibowli', id: '36BBBBB2022B1Z2', value: '16,910 refills', percentile: '99.8%' },
      { rank: 185, name: pharmacyName, location: 'Mumbai West', id: gstin, value: '6,062 refills', percentile: '98.8%', isUser: true },
      { rank: 186, name: 'Apex Diabetes Care', location: 'Mumbai Bandra', id: '27HHHHH8088H1Z8', value: '5,940 refills', percentile: '98.7%' }
    ],
    screenings: [
      { rank: 1, name: 'Wellness Forever Wellness', location: 'Pune Koregaon Park', id: '27DDDDD4044D1Z4', value: '1,420 checks', percentile: '99.9%' },
      { rank: 2, name: 'Noble Plus Chemist', location: 'Mumbai Pedder Road', id: '27CCCCC3033C1Z3', value: '1,310 checks', percentile: '99.8%' },
      { rank: 94, name: pharmacyName, location: 'Mumbai West', id: gstin, value: '820 checks', percentile: '99.1%', isUser: true },
      { rank: 95, name: 'Seva Medicos', location: 'Mumbai Kandivali', id: '27IIIII9099I1Z9', value: '810 checks', percentile: '99.1%' }
    ],
    vaccinations: [
      { rank: 1, name: 'Apollo Pharmacy Central', location: 'Delhi Connaught Place', id: '27AAAAA1211A1Z1', value: '980 jabs', percentile: '99.9%' },
      { rank: 2, name: 'Wellness Forever Wellness', location: 'Pune Koregaon Park', id: '27DDDDD4044D1Z4', value: '910 jabs', percentile: '99.8%' },
      { rank: 320, name: pharmacyName, location: 'Mumbai West', id: gstin, value: '310 jabs', percentile: '97.9%', isUser: true },
      { rank: 321, name: 'City Medicos Group', location: 'Thane West', id: '27JJJJJ1010J1ZA', value: '290 jabs', percentile: '97.8%' }
    ],
    erx: [
      { rank: 1, name: 'MedPlus Franchise Hub', location: 'Hyderabad Gachibowli', id: '36BBBBB2022B1Z2', value: '98.5% digitised', percentile: '99.9%' },
      { rank: 2, name: 'Apollo Pharmacy Central', location: 'Delhi Connaught Place', id: '27AAAAA1211A1Z1', value: '97.2% digitised', percentile: '99.9%' },
      { rank: 54, name: pharmacyName, location: 'Mumbai West', id: gstin, value: '91.4% digitised', percentile: '99.4%', isUser: true },
      { rank: 55, name: 'Modern Digital Rx', location: 'Mumbai Colaba', id: '27KKKKK2020K1ZB', value: '90.8% digitised', percentile: '99.4%' }
    ]
  };

  // Dynamic document data HTML templates
  const getPurchaseAuditHTML = () => `
    <h1>DashRx Purchase Audit & Margin Report</h1>
    <p><strong>Pharmacy Entity :</strong> ${pharmacyName}</p>
    <p><strong>GSTIN Registered :</strong> ${gstin}</p>
    <p><strong>Audited By        :</strong> ${userName}</p>
    <p><strong>Audit Date        :</strong> ${new Date().toLocaleDateString('en-IN')}</p>
    
    <h2>Audited Distributor Statements</h2>
    <table>
      <thead>
        <tr>
          <th>Distributor</th>
          <th>Invoice Date</th>
          <th>Bill Number</th>
          <th>GST Slab</th>
          <th>Invoice Amount</th>
          <th>Margin Leakage</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${invoicesData.map(inv => {
    const isClaimed = claimRaisedInvoices[inv.id] || inv.status === 'Claim Raised';
    return `
            <tr>
              <td><strong>${inv.distributor}</strong></td>
              <td>${inv.date}</td>
              <td>${inv.billNo}</td>
              <td>${inv.gstSlab}</td>
              <td>${inv.amount}</td>
              <td class="${inv.leakage !== '₹0' ? 'leakage-highlight' : ''}">${inv.leakage}</td>
              <td>${isClaimed ? 'Claim Raised' : inv.status}</td>
            </tr>
          `;
  }).join('')}
      </tbody>
    </table>
  `;

  const getClaimsSummaryHTML = () => `
    <h1>DashRx Refund Claims Summary</h1>
    <p><strong>Pharmacy Entity :</strong> ${pharmacyName}</p>
    <p><strong>GSTIN Registered :</strong> ${gstin}</p>
    <p><strong>Report Date      :</strong> ${new Date().toLocaleDateString('en-IN')}</p>

    <h2>Active Distributor Discrepancies & Refund Logs</h2>
    <table>
      <thead>
        <tr>
          <th>Stockist / Distributor</th>
          <th>Bill Reference</th>
          <th>Invoice Date</th>
          <th>Bill Value</th>
          <th>Discrepancy Category</th>
          <th>Leakage Amount</th>
          <th>Claim Status</th>
        </tr>
      </thead>
      <tbody>
        ${invoicesData.filter(inv => inv.leakage !== '₹0').map(inv => {
    const isClaimed = claimRaisedInvoices[inv.id] || inv.status === 'Claim Raised';
    return `
            <tr>
              <td><strong>${inv.distributor}</strong></td>
              <td>${inv.billNo}</td>
              <td>${inv.date}</td>
              <td>${inv.amount}</td>
              <td>${inv.type}</td>
              <td class="leakage-highlight">${inv.leakage}</td>
              <td>${isClaimed ? 'Claim Raised / Ledged' : 'Action Required'}</td>
            </tr>
          `;
  }).join('')}
      </tbody>
    </table>
  `;

  const getGSTR2BReportHTML = () => `
    <h1>DashRx GST Input Tax Credit (ITC) Audit Report</h1>
    <p><strong>Pharmacy Entity   :</strong> ${pharmacyName}</p>
    <p><strong>GSTIN Registered  :</strong> ${gstin}</p>
    <p><strong>Drug License No   :</strong> ${drugLicense}</p>
    <p><strong>Report Timestamp  :</strong> ${new Date().toLocaleString('en-IN')}</p>

    <h2>1. General ITC Reconciliation</h2>
    <ul>
      <li><strong>Total Invoice GST Extracted:</strong> ₹57,912</li>
      <li><strong>GSTR-2B Portal Match Rate:</strong> 98.4%</li>
      <li><strong>Eligible GST Input Claims:</strong> ₹54,792</li>
      <li><strong>Mismatched Portal Credit:</strong> ₹3,120 [Requires Supplier Sync]</li>
      <li><strong>Blocked Supplier ITC (Rule 37):</strong> ₹820</li>
    </ul>

    <h2>2. Tax Slab & Ledger Reconciliation Summary</h2>
    <table>
      <thead>
        <tr>
          <th>Tax Slab</th>
          <th>Billed Purchases</th>
          <th>Extracted Invoice GST</th>
          <th>GSTR-2B Matched GST</th>
          <th>Discrepancy / Gap</th>
          <th>Recon Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>GST @ 5%</strong></td>
          <td>₹80,880</td>
          <td>₹4,044</td>
          <td>₹4,044</td>
          <td>₹0</td>
          <td>Fully Reconciled</td>
        </tr>
        <tr>
          <td><strong>GST @ 12%</strong></td>
          <td>₹3,29,710</td>
          <td>₹39,565</td>
          <td>₹36,445</td>
          <td class="leakage-highlight">₹3,120</td>
          <td>Mismatch Detected</td>
        </tr>
        <tr>
          <td><strong>GST @ 18%</strong></td>
          <td>₹72,010</td>
          <td>₹12,962</td>
          <td>₹12,962</td>
          <td>₹0</td>
          <td>Fully Reconciled</td>
        </tr>
      </tbody>
    </table>
  `;

  const getReceiptHTML = (date, cycle, amount) => `
    <h1>DashRx Subscription Invoice</h1>
    <p><strong>Receipt Date     :</strong> ${date}</p>
    <p><strong>Billing Cycle    :</strong> ${cycle}</p>
    <p><strong>Payment Status   :</strong> SUCCESS / PAID</p>
    <p><strong>Invoice Total    :</strong> ${amount}</p>
    
    <h2>Customer Billing Details</h2>
    <p><strong>Pharmacy Entity  :</strong> ${pharmacyName}</p>
    <p><strong>GSTIN Registered :</strong> ${gstin}</p>
    <p><strong>Account Manager  :</strong> ${userName}</p>

    <h2>Product Details</h2>
    <table>
      <thead>
        <tr>
          <th>Item Description</th>
          <th>Subscription Cycle</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>DashRx Pro Growth Plan</strong></td>
          <td>Monthly</td>
          <td>₹1,499.00</td>
        </tr>
        <tr>
          <td>CGST @ 9%</td>
          <td>Monthly</td>
          <td>₹134.91</td>
        </tr>
        <tr>
          <td>SGST @ 9%</td>
          <td>Monthly</td>
          <td>₹134.91</td>
        </tr>
        <tr style="font-weight: bold; background-color: #F8FAFC;">
          <td>Total Paid Amount</td>
          <td>-</td>
          <td>${amount}</td>
        </tr>
      </tbody>
    </table>
  `;

  // Free Growth Report HTML template (Parity with the site footer growth generator)
  const getGrowthReportHTML = () => `
    <h1>DashRx Margin & Commercial Growth Report</h1>
    <p><strong>Pharmacy Entity   :</strong> ${pharmacyName}</p>
    <p><strong>GSTIN Registered  :</strong> ${gstin}</p>
    <p><strong>Drug License No   :</strong> ${drugLicense}</p>
    <p><strong>Analysis Period   :</strong> May 2026 (Live Audit)</p>
    <p><strong>Prepared for     :</strong> ${userName}</p>
    <p><strong>Report Timestamp  :</strong> ${new Date().toLocaleString('en-IN')}</p>

    <h2>1. Executive Margin Performance Score: 82/100</h2>
    <p>Based on our real-time audit of statement uploads and local pin-code cardiovascular drug volumes, your commercial profit index is strong but holds significant untapped margins.</p>
    <ul>
      <li><strong>Pricing Leakage Loss:</strong> ₹12,450 (Rate differences & scheme shortfalls). Securing refund notes raises gross margins by 2.5%.</li>
      <li><strong>Chronic Meds Mix:</strong> 72.0% (Strong repeat refills; highly loyal patient base).</li>
      <li><strong>Inventory Rotation Expiries:</strong> 0.8% loss (Excellent rotation compared to the 1.4% district average).</li>
    </ul>

    <h2>2. Commercial Action Plan</h2>
    <table>
      <thead>
        <tr>
          <th>Pillar / Opportunity</th>
          <th>Current Baseline</th>
          <th>Optimized Target</th>
          <th>Estimated Annual Margin Lift</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Distributor Bill Audit Claims</strong></td>
          <td>₹0 reclaimed</td>
          <td>₹12,450 / month</td>
          <td><strong>+₹1,49,400 / year</strong></td>
        </tr>
        <tr>
          <td><strong>OTC & Wellness Mix Expansion</strong></td>
          <td>28.0% mix</td>
          <td>36.0% mix</td>
          <td><strong>+₹78,200 / year</strong></td>
        </tr>
        <tr>
          <td><strong>Local Cardio Stocking (Pincode 400053)</strong></td>
          <td>Low stock (8 strips)</td>
          <td>Optimal stock (120 strips)</td>
          <td><strong>+₹24,000 / year</strong></td>
        </tr>
      </tbody>
    </table>

    <h2>3. Strategic Recommendations</h2>
    <ol>
      <li>Immediately generate ledger claim notes for Keimed Mumbai and PharmEasy discrepancies to reclaim the outstanding ₹12,450.</li>
      <li>Adjust chronic restocking frequencies to buffer against local district stockouts on Telmisartan.</li>
      <li>Incorporate high-margin OTC products into customer billing prompts to increase general wellness mix.</li>
    </ol>
  `;

  // Render dynamic view titles based on tabs
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'GST & Margin Dashboard';
      case 'recon': return 'Stockist Invoice Reconciliation';
      case 'financials': return 'GST & Tax Breakdown';
      case 'demand': return 'Pin-code Demand Index';
      case 'benchmarking': return 'Private Competitor Benchmarking';
      case 'leaderboard': return 'National Pharmacy Leaderboard';
      case 'growth': return 'Instant Commercial Growth Report';
      case 'settings': return 'Account Settings';
      case 'billing': return 'Subscription & Billing';
      default: return 'DashRx';
    }
  };

  // Filter leaderboard database based on metric and search input
  const getFilteredLeaderboard = () => {
    const list = leaderboardData[leaderboardMetric] || [];
    if (!leaderboardSearch.trim()) return list;
    return list.filter(pharm =>
      pharm.name.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
      pharm.location.toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
      pharm.id.toLowerCase().includes(leaderboardSearch.toLowerCase())
    );
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar navigation customized for DashRx */}
      <aside className="dashboard-sidebar">
        <Link to="/" className="sidebar-logo">
          <img src="/DashRx.png" alt="DashRx" style={{ height: '55px', objectFit: 'contain' }} />
        </Link>

        {/* Navigation Categories */}
        <div style={{ flex: 1 }}>
          <div className="sidebar-section-title">Audit Hub</div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <LayoutDashboard size={18} />
              GST & Margin
            </button>
            <button
              onClick={() => setActiveTab('recon')}
              className={`sidebar-link ${activeTab === 'recon' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <FileText size={18} />
              Stockist Recon
            </button>
            <button
              onClick={() => setActiveTab('financials')}
              className={`sidebar-link ${activeTab === 'financials' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <CreditCard size={18} />
              GST Breakdown
            </button>
          </nav>

          <div className="sidebar-section-title">Market Intel</div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <button
              onClick={() => setActiveTab('demand')}
              className={`sidebar-link ${activeTab === 'demand' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <MapPin size={18} />
              Pin-code Demand
            </button>
            <button
              onClick={() => setActiveTab('benchmarking')}
              className={`sidebar-link ${activeTab === 'benchmarking' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <BarChart2 size={18} />
              Peer Benchmark
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`sidebar-link ${activeTab === 'leaderboard' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Trophy size={18} />
              Leaderboard
            </button>
          </nav>

          <div className="sidebar-section-title">Value Adds</div>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            <button
              onClick={() => setActiveTab('growth')}
              className={`sidebar-link ${activeTab === 'growth' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Sparkles size={18} />
              Growth Report
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <Settings size={18} />
              Settings
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`sidebar-link ${activeTab === 'billing' ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
            >
              <CreditCard size={18} />
              Subscription
            </button>
          </nav>
        </div>

        {/* Footer info in sidebar */}
        <div style={{ borderTop: '1px solid var(--divider-color)', paddingTop: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={12} color="#10B981" /> DPDP Compliant • v2.1.0
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="dashboard-main">
        {/* Top Header Bar matching layout */}
        <header className="dashboard-header">
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            GSTIN: <span style={{ color: 'var(--text-main)' }}>{gstin}</span>
          </div>

          {/* Centered Pharmacy Name */}
          <div className="dashboard-header-pharmacy">{pharmacyName}</div>

          {/* Right Controls */}
          <div className="dashboard-header-right">
            <span className="dashboard-header-user">{userName}</span>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="header-action-btn"
              title="Toggle Light/Dark Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="header-action-btn"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="dashboard-viewport">

          {/* 1. GST & Margin Dashboard */}
          {activeTab === 'dashboard' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div className="dashboard-viewport-title-row">
                <h1 className="dashboard-viewport-title">{getTabTitle()}</h1>
                {hasData && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {uploadedFile && (
                      <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--divider-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} color="#10B981" /> Audited: {uploadedFile}
                      </span>
                    )}
                    <button className="btn-export" style={{ color: '#EF4444', borderColor: 'transparent' }} onClick={handleClearData} title="Clear audited purchases dataset">
                      <Trash2 size={15} /> Clear Data
                    </button>
                    <button className="btn-export" onClick={() => downloadDoc(`DashRx_Margin_Audit_${gstin}.doc`, getPurchaseAuditHTML())}>
                      <Download size={13} /> Export .DOC
                    </button>
                    <button className="btn-export" onClick={() => printToPDF('DashRx Purchase Audit & Margin Report', getPurchaseAuditHTML())}>
                      <Download size={13} /> Export .PDF
                    </button>
                  </div>
                )}
              </div>

              {!hasData ? (
                <div className="empty-state-card">
                  <div className="empty-state-icon-wrapper">
                    <FileDown size={28} />
                  </div>
                  <h2 className="empty-state-title">No statements audited yet</h2>
                  <p className="empty-state-desc">
                    Upload your stockist purchase invoices (PDF/Image) or GSTR-2B details to automatically parse, cross-reference contract pricing, detect margin leakages, and identify GST anomalies.
                  </p>

                  {isUploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                      <Loader2 className="animate-spin" size={24} color="#0078FF" />
                      <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Scanning invoice via OCR ({uploadProgress}%)</div>
                      <div style={{ width: '200px', height: '4px', background: 'var(--divider-color)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#0078FF', transition: 'width 0.2s ease' }}></div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept=".pdf,.png,.jpg,.jpeg,.csv"
                      />
                      <button
                        className="btn-upload-primary"
                        onClick={triggerFileSelect}
                      >
                        Upload Stockist Bill (PDF/Image)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Loaded State (Visual Masterpiece tailored for DashRx) */
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                  {/* KPI Cards Grid */}
                  <div className="stats-grid">
                    <div className="stat-card" style={{ borderLeft: '4px solid #0078FF' }}>
                      <div className="stat-title">Audited Billings (MTD)</div>
                      <div className="stat-value">₹4,82,600</div>
                      <div className="stat-trend stat-trend-up">
                        <span>▲ +12.4%</span> <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>vs previous month</span>
                      </div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid #EF4444' }}>
                      <div className="stat-title">Pricing Leakages</div>
                      <div className="stat-value">₹12,450</div>
                      <div className="stat-trend stat-trend-down">
                        <span>● Action Required</span> <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Rate discrepancies found</span>
                      </div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
                      <div className="stat-title">Saved Leakages</div>
                      <div className="stat-value">₹9,180</div>
                      <div className="stat-trend stat-trend-up">
                        <span>▲ +18.2%</span> <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Recovered via stockist claims</span>
                      </div>
                    </div>
                    <div className="stat-card" style={{ borderLeft: '4px solid #E2E8F0' }}>
                      <div className="stat-title">GSTR-2B ITC Match</div>
                      <div className="stat-value">98.4%</div>
                      <div className="stat-trend stat-trend-up">
                        <span>▲ +0.5%</span> <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Target: 99.5%</span>
                      </div>
                    </div>
                  </div>

                  {/* SVG Charts Section */}
                  <div className="charts-grid">
                    {/* SVG Line Chart for Purchases and Leakages */}
                    <div className="chart-card">
                      <h3 className="chart-card-title">Monthly Audited Purchases & Leakages (6 Months)</h3>
                      <div className="chart-container-svg">
                        <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0078FF" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#0078FF" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          <line x1="0" y1="40" x2="500" y2="40" stroke="var(--divider-color)" strokeWidth="1" strokeDasharray="3" />
                          <line x1="0" y1="90" x2="500" y2="90" stroke="var(--divider-color)" strokeWidth="1" strokeDasharray="3" />
                          <line x1="0" y1="140" x2="500" y2="140" stroke="var(--divider-color)" strokeWidth="1" strokeDasharray="3" />

                          {/* Purchase Volume Area */}
                          <path d="M 10 150 Q 100 110 200 120 T 400 50 Q 450 60 490 30 L 490 170 L 10 170 Z" fill="url(#purchaseGradient)" />

                          {/* Purchase Volume Line (Blue) */}
                          <path d="M 10 150 Q 100 110 200 120 T 400 50 Q 450 60 490 30" fill="none" stroke="#0078FF" strokeWidth="3" strokeLinecap="round" />

                          {/* Leakage Trend Line (Red) */}
                          <path d="M 10 180 C 100 175, 200 165, 300 175 S 400 160, 490 155" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="4" strokeLinecap="round" />

                          {/* Dots */}
                          <circle cx="10" cy="150" r="4" fill="#0078FF" stroke="#FFFFFF" strokeWidth="1.5" />
                          <circle cx="200" cy="120" r="4" fill="#0078FF" stroke="#FFFFFF" strokeWidth="1.5" />
                          <circle cx="400" cy="50" r="4" fill="#0078FF" stroke="#FFFFFF" strokeWidth="1.5" />
                          <circle cx="490" cy="30" r="4" fill="#0078FF" stroke="#FFFFFF" strokeWidth="1.5" />

                          {/* Axis Labels */}
                          <text x="10" y="190" fill="var(--text-muted)" fontSize="11" fontWeight="600" textAnchor="middle">Nov</text>
                          <text x="110" y="190" fill="var(--text-muted)" fontSize="11" fontWeight="600" textAnchor="middle">Dec</text>
                          <text x="210" y="190" fill="var(--text-muted)" fontSize="11" fontWeight="600" textAnchor="middle">Jan</text>
                          <text x="310" y="190" fill="var(--text-muted)" fontSize="11" fontWeight="600" textAnchor="middle">Feb</text>
                          <text x="410" y="190" fill="var(--text-muted)" fontSize="11" fontWeight="600" textAnchor="middle">Mar</text>
                          <text x="490" y="190" fill="var(--text-muted)" fontSize="11" fontWeight="600" textAnchor="middle">Apr</text>
                        </svg>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#0078FF' }}></span>
                          Purchases (MTD Volume)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#EF4444' }}></span>
                          Billing Leakages Trend
                        </div>
                      </div>
                    </div>

                    {/* SVG Bar Chart for Branded vs Generic Margins */}
                    <div className="chart-card">
                      <h3 className="chart-card-title">Margin Split (Branded vs Generics)</h3>
                      <div className="chart-container-svg">
                        <svg viewBox="0 0 300 200" width="100%" height="100%">
                          {/* Branded (Blue Bar) */}
                          <rect x="50" y="55" width="45" height="105" rx="6" fill="#0078FF" />
                          <text x="72" y="185" fill="var(--text-muted)" fontSize="12" fontWeight="700" textAnchor="middle">Branded (72%)</text>
                          <text x="72" y="45" fill="var(--text-main)" fontSize="12" fontWeight="800" textAnchor="middle">16.5% Margin</text>

                          {/* Generic (Teal Bar) */}
                          <rect x="180" y="20" width="45" height="140" rx="6" fill="#10B981" />
                          <text x="202" y="185" fill="var(--text-muted)" fontSize="12" fontWeight="700" textAnchor="middle">Generics (28%)</text>
                          <text x="202" y="10" fill="var(--text-main)" fontSize="12" fontWeight="800" textAnchor="middle">35.8% Margin</text>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Table */}
                  <div className="table-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 className="table-card-title" style={{ margin: 0 }}>Recent Audited Statements</h3>
                      <button className="btn-export" style={{ padding: '6px 12px', fontSize: '12.5px' }} onClick={() => setActiveTab('recon')}>
                        View Reconciler Queue <ArrowRight size={14} />
                      </button>
                    </div>
                    <div className="responsive-table-wrapper">
                      <table className="premium-table">
                        <thead>
                          <tr>
                            <th>Distributor</th>
                            <th>Date</th>
                            <th>Invoice No.</th>
                            <th>GST Slab</th>
                            <th>Bill Amount</th>
                            <th>Leakage Found</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoicesData.map((inv) => {
                            const isClaimed = claimRaisedInvoices[inv.id] || inv.status === 'Claim Raised';
                            return (
                              <tr key={inv.id}>
                                <td><strong>{inv.distributor}</strong></td>
                                <td>{inv.date}</td>
                                <td>{inv.billNo}</td>
                                <td>{inv.gstSlab}</td>
                                <td>{inv.amount}</td>
                                <td>
                                  <span style={{ color: inv.leakage !== '₹0' ? '#EF4444' : 'inherit', fontWeight: inv.leakage !== '₹0' ? 700 : 'normal' }}>
                                    {inv.leakage}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge-pill ${isClaimed
                                    ? 'badge-pill-info'
                                    : inv.status === 'Fully Matched'
                                      ? 'badge-pill-success'
                                      : 'badge-pill-warning'
                                    }`}>
                                    {isClaimed ? 'Claim Raised' : inv.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Stockist Reconciliation Tab */}
          {activeTab === 'recon' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div className="dashboard-viewport-title-row">
                <h1 className="dashboard-viewport-title">{getTabTitle()}</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-export" onClick={() => downloadDoc(`DashRx_Claims_Summary_${gstin}.doc`, getClaimsSummaryHTML())}>
                    <Download size={13} /> Export .DOC
                  </button>
                  <button className="btn-export" onClick={() => printToPDF('DashRx Refund Claims Summary', getClaimsSummaryHTML())}>
                    <Download size={13} /> Export .PDF
                  </button>
                </div>
              </div>

              <div className="table-card">
                <h3 className="table-card-title">Distributor Invoice Discrepancy Queue</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '-8px', marginBottom: '20px' }}>
                  Click "Audit Items" to verify specific line-item contract rate variances and raise claims for stockist refunds.
                </p>
                <div className="responsive-table-wrapper">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Stockist / Distributor</th>
                        <th>Bill Reference</th>
                        <th>Invoice Date</th>
                        <th>Bill Value</th>
                        <th>Leakage / Variance</th>
                        <th>Discrepancy Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesData.map((inv) => {
                        const isClaimed = claimRaisedInvoices[inv.id] || inv.status === 'Claim Raised';
                        const hasLeakage = inv.leakage !== '₹0';
                        return (
                          <tr key={inv.id}>
                            <td><strong>{inv.distributor}</strong></td>
                            <td>{inv.billNo}</td>
                            <td>{inv.date}</td>
                            <td>{inv.amount}</td>
                            <td style={{ color: hasLeakage ? '#EF4444' : 'inherit', fontWeight: hasLeakage ? 700 : 'normal' }}>
                              {inv.leakage}
                            </td>
                            <td>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                                {inv.type}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  className="btn-export"
                                  style={{ padding: '4px 10px', fontSize: '12px' }}
                                  onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}
                                >
                                  {selectedInvoice?.id === inv.id ? 'Close Details' : 'Audit Items'}
                                </button>
                                {hasLeakage && (
                                  <button
                                    className="btn-upload-primary"
                                    style={{ padding: '4px 10px', fontSize: '12px' }}
                                    onClick={() => handleRaiseClaim(inv.id)}
                                    disabled={isClaimed}
                                  >
                                    {isClaimed ? 'Claim Logged' : 'Raise Claim'}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detailed Item Audits Section */}
              {selectedInvoice && (
                <div className="table-card" style={{ marginTop: '24px', animation: 'fadeIn 0.3s ease', border: '1px solid #0078FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        Line Item Audit: {selectedInvoice.distributor} ({selectedInvoice.billNo})
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Comparing actual billed rate against contracted trade margins.
                      </p>
                    </div>
                    {selectedInvoice.leakage !== '₹0' && (
                      <button
                        className="btn-upload-primary"
                        onClick={() => handleRaiseClaim(selectedInvoice.id)}
                        disabled={claimRaisedInvoices[selectedInvoice.id] || selectedInvoice.status === 'Claim Raised'}
                      >
                        {claimRaisedInvoices[selectedInvoice.id] || selectedInvoice.status === 'Claim Raised'
                          ? 'Ledger Claim Filed'
                          : 'Auto-Generate Claim Note'}
                      </button>
                    )}
                  </div>

                  <div className="responsive-table-wrapper">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Medicine Brand / Molecule</th>
                          <th>Audited Qty</th>
                          <th>Billed Stockist Rate</th>
                          <th>Contract PO Rate</th>
                          <th>Price Variance</th>
                          <th>Margin Leakage</th>
                          <th>Audit Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item, idx) => {
                          const hasItemLeakage = item.totalLeakage !== '₹0';
                          return (
                            <tr key={idx}>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.qty}</td>
                              <td>{item.billedRate}</td>
                              <td>{item.contractRate}</td>
                              <td style={{ color: hasItemLeakage ? '#EF4444' : 'inherit', fontWeight: hasItemLeakage ? 700 : 'normal' }}>
                                {item.variance}
                              </td>
                              <td style={{ color: hasItemLeakage ? '#EF4444' : 'inherit', fontWeight: hasItemLeakage ? 700 : 'normal' }}>
                                {item.totalLeakage}
                              </td>
                              <td>
                                <span className={`badge-pill ${hasItemLeakage ? 'badge-pill-warning' : 'badge-pill-success'}`}>
                                  {hasItemLeakage ? 'Overcharged' : 'Price Correct'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. GST & Tax Breakdown Tab */}
          {activeTab === 'financials' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div className="dashboard-viewport-title-row">
                <h1 className="dashboard-viewport-title">{getTabTitle()}</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-export" onClick={() => downloadDoc(`GSTR2B_Audit_Report_${gstin}.doc`, getGSTR2BReportHTML())}>
                    <Download size={15} /> Download .DOC
                  </button>
                  <button className="btn-export" onClick={() => printToPDF('GSTR-2B Audit Report', getGSTR2BReportHTML())}>
                    <Download size={15} /> Download .PDF
                  </button>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid #0078FF' }}>
                  <div className="stat-title">Total Input Credit (ITC)</div>
                  <div className="stat-value">₹57,912</div>
                  <div className="stat-trend stat-trend-up">Extracted from invoices</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #F59E0B' }}>
                  <div className="stat-title">GSTR-2B Mismatches</div>
                  <div className="stat-value">₹3,120</div>
                  <div className="stat-trend stat-trend-down">Pending supplier upload</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #10B981' }}>
                  <div className="stat-title">Eligible GST Claims</div>
                  <div className="stat-value">₹54,792</div>
                  <div className="stat-trend stat-trend-up">Reconciled & matched</div>
                </div>
                <div className="stat-card" style={{ borderLeft: '4px solid #EF4444' }}>
                  <div className="stat-title">Blocked ITC (Rule 37)</div>
                  <div className="stat-value">₹820</div>
                  <div className="stat-trend stat-trend-down">Aging over 180 days</div>
                </div>
              </div>

              <div className="table-card" style={{ marginTop: '24px' }}>
                <h3 className="table-card-title">Tax Slab & Ledger Reconciliation Summary</h3>
                <div className="responsive-table-wrapper">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Tax Slab</th>
                        <th>Billed Purchases</th>
                        <th>Extracted Invoice GST</th>
                        <th>GSTR-2B Matched GST</th>
                        <th>Discrepancy / Gap</th>
                        <th>Recon Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>GST @ 5%</strong></td>
                        <td>₹80,880</td>
                        <td>₹4,044</td>
                        <td>₹4,044</td>
                        <td>₹0</td>
                        <td><span className="badge-pill badge-pill-success">Fully Reconciled</span></td>
                      </tr>
                      <tr>
                        <td><strong>GST @ 12%</strong></td>
                        <td>₹3,29,710</td>
                        <td>₹39,565</td>
                        <td>₹36,445</td>
                        <td style={{ color: '#EF4444', fontWeight: 'bold' }}>₹3,120</td>
                        <td><span className="badge-pill badge-pill-warning">Mismatch Detected</span></td>
                      </tr>
                      <tr>
                        <td><strong>GST @ 18%</strong></td>
                        <td>₹72,010</td>
                        <td>₹12,962</td>
                        <td>₹12,962</td>
                        <td>₹0</td>
                        <td><span className="badge-pill badge-pill-success">Fully Reconciled</span></td>
                      </tr>
                      <tr>
                        <td><strong>GST @ 28%</strong></td>
                        <td>₹0</td>
                        <td>₹0</td>
                        <td>₹0</td>
                        <td>₹0</td>
                        <td><span className="badge-pill badge-pill-success">No Purchases</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. Pin-code Demand Index Tab */}
          {activeTab === 'demand' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div className="dashboard-viewport-title-row">
                <h1 className="dashboard-viewport-title">{getTabTitle()}</h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Active Pin-code: <span style={{ color: 'var(--accent-color)', fontWeight: 800 }}>400053, Mumbai West</span>
                </div>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderLeft: '4px solid #0078FF', borderRadius: '6px', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 800 }}>Geographical Demand Alert</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Anonymized retail counters in your district indicate a sharp <strong>14.8% rise in cardiovascular medications</strong>. Cross-referencing suggests local stockout risk on Telmisartan formulations.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-title">District Demand Index</div>
                  <div className="stat-value">Top 12%</div>
                  <div className="stat-trend stat-trend-up">High chronic volume area</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Inventory Efficiency</div>
                  <div className="stat-value">94.2%</div>
                  <div className="stat-trend stat-trend-up">Turnover optimized</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Spiking Therapeutic Class</div>
                  <div className="stat-value" style={{ fontSize: '20px', paddingTop: '8px' }}>Cardiovascular</div>
                  <div className="stat-trend stat-trend-up">▲ +14.8% Local Demand</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Stock Warnings</div>
                  <div className="stat-value">2 Items</div>
                  <div className="stat-trend stat-trend-down">Below safety thresholds</div>
                </div>
              </div>

              <div className="table-card" style={{ marginTop: '24px' }}>
                <h3 className="table-card-title">Localized Pin-code Demand Forecast</h3>
                <div className="responsive-table-wrapper">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Molecule Name</th>
                        <th>Therapeutic Class</th>
                        <th>Local Demand Trend</th>
                        <th>District Availability</th>
                        <th>Your Store Stock Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Telmisartan 40mg</strong></td>
                        <td>Cardiovascular</td>
                        <td style={{ color: '#10B981', fontWeight: 700 }}>▲ +14.8% Spike</td>
                        <td>42% of stores report stockout</td>
                        <td><span className="badge-pill badge-pill-warning">Low Stock (8 strips)</span></td>
                        <td><button className="btn-export" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => alert('Purchase Order draft generated with Keimed Mumbai!')}>Draft Reorder</button></td>
                      </tr>
                      <tr>
                        <td><strong>Metformin 500mg SR</strong></td>
                        <td>Anti-Diabetic</td>
                        <td style={{ color: '#10B981', fontWeight: 700 }}>▲ +11.2% Spurt</td>
                        <td>85% of stores fully stocked</td>
                        <td><span className="badge-pill badge-pill-success">Optimal Stock (120 strips)</span></td>
                        <td><button className="btn-export" style={{ padding: '4px 8px', fontSize: '11px', opacity: 0.6 }} disabled>Reorder</button></td>
                      </tr>
                      <tr>
                        <td><strong>Paracetamol 650mg</strong></td>
                        <td>Analgesic / OTC</td>
                        <td style={{ color: '#10B981', fontWeight: 700 }}>▲ +9.5% Spurt</td>
                        <td>98% of stores fully stocked</td>
                        <td><span className="badge-pill badge-pill-success">Optimal Stock (340 strips)</span></td>
                        <td><button className="btn-export" style={{ padding: '4px 8px', fontSize: '11px', opacity: 0.6 }} disabled>Reorder</button></td>
                      </tr>
                      <tr>
                        <td><strong>Atorvastatin 10mg</strong></td>
                        <td>Cardiovascular</td>
                        <td style={{ color: '#10B981', fontWeight: 700 }}>▲ +9.2% Growth</td>
                        <td>60% of stores report low stock</td>
                        <td><span className="badge-pill badge-pill-warning">Low Stock (14 strips)</span></td>
                        <td><button className="btn-export" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => alert('Purchase Order draft generated with PharmEasy B2B!')}>Draft Reorder</button></td>
                      </tr>
                      <tr>
                        <td><strong>Pantoprazole 40mg</strong></td>
                        <td>Gastrointestinal</td>
                        <td style={{ color: '#94A3B8' }}>● +6.4% Stable</td>
                        <td>90% of stores fully stocked</td>
                        <td><span className="badge-pill badge-pill-success">Optimal Stock (80 strips)</span></td>
                        <td><button className="btn-export" style={{ padding: '4px 8px', fontSize: '11px', opacity: 0.6 }} disabled>Reorder</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. Competitive Benchmarking Tab */}
          {activeTab === 'benchmarking' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div className="dashboard-viewport-title-row">
                <h1 className="dashboard-viewport-title">{getTabTitle()}</h1>
              </div>

              <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: '6px', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 800 }}>Privacy Benchmark Protection</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  All pricing benchmarks and margin metrics are anonymized and aggregated from over 5,000 retail channels. Your commercial pricing agreements remain encrypted and hidden from third parties.
                </p>
              </div>

              <div className="table-card">
                <h3 className="table-card-title">Commercial Performance Benchmarks</h3>
                <div className="responsive-table-wrapper">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Operational Metric</th>
                        <th>Your Store ({pharmacyName})</th>
                        <th>Regional District Average</th>
                        <th>Top 10% Retailers (Scale matched)</th>
                        <th>Audit Assessment</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Average Gross Margin</strong></td>
                        <td style={{ color: '#0078FF', fontWeight: 'bold' }}>19.8%</td>
                        <td>16.5%</td>
                        <td>21.2%</td>
                        <td><span className="badge-pill badge-pill-success">Above Average</span></td>
                      </tr>
                      <tr>
                        <td><strong>Chronic Medicine Mix</strong></td>
                        <td style={{ fontWeight: 'bold' }}>72.0%</td>
                        <td>64.0%</td>
                        <td>78.0%</td>
                        <td><span className="badge-pill badge-pill-success">High Customer Loyalty</span></td>
                      </tr>
                      <tr>
                        <td><strong>OTC / Wellness Mix</strong></td>
                        <td style={{ color: '#EF4444', fontWeight: 'bold' }}>28.0%</td>
                        <td>36.0%</td>
                        <td>22.0%</td>
                        <td><span className="badge-pill badge-pill-warning">Opportunity to grow</span></td>
                      </tr>
                      <tr>
                        <td><strong>Average Inventory Turnover</strong></td>
                        <td style={{ fontWeight: 'bold' }}>11.2x / yr</td>
                        <td>8.4x / yr</td>
                        <td>14.5x / yr</td>
                        <td><span className="badge-pill badge-pill-success">Highly Efficient</span></td>
                      </tr>
                      <tr>
                        <td><strong>Annual Expiry Stock Loss</strong></td>
                        <td style={{ color: '#10B981', fontWeight: 'bold' }}>0.8%</td>
                        <td>1.4%</td>
                        <td>0.4%</td>
                        <td><span className="badge-pill badge-pill-success">Excellent Stock Rotation</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="settings-card" style={{ marginTop: '24px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: 800 }}>Benchmark Analysis & Recommendations</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Your pharmacy gross margin is currently strong due to robust diabetic and cardiovascular drug refills. However, your OTC & general wellness category represents an under-penetrated opportunity. Stores in Mumbai West scaling their OTC mix to 35% are recording average gross margins of 21.2%. We recommend reviewing your input pricing on OTC brands and negotiating higher bulk margins with Apollo B2B Portal.
                </p>
              </div>
            </div>
          )}

          {/* 6. National Pharmacy Leaderboard Tab (Feature parity with website leaderboard) */}
          {activeTab === 'leaderboard' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div className="dashboard-viewport-title-row">
                <h1 className="dashboard-viewport-title">{getTabTitle()}</h1>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Active Database: <span style={{ color: '#10B981', fontWeight: 800 }}>15,200+ Indian Pharmacies</span>
                </div>
              </div>

              {/* Leaderboard Stat Overview Banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'linear-gradient(135deg, rgba(0,120,255,0.08) 0%, rgba(16,185,129,0.08) 100%)', borderRadius: '8px', border: '1px solid var(--divider-color)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#0078FF', color: '#FFF' }}>
                  <Trophy size={24} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 800 }}>National Standing</h4>
                  <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-muted)' }}>
                    <strong>{pharmacyName}</strong> is ranked <span style={{ color: '#0078FF', fontWeight: 'bold' }}>#412</span> nationwide in Billing Volume. You perform better than <span style={{ color: '#10B981', fontWeight: 'bold' }}>97.3% of stores</span> in India!
                  </p>
                </div>
              </div>

              {/* Leaderboard controls */}
              <div className="table-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setLeaderboardMetric('bills')}
                      className={`btn-export ${leaderboardMetric === 'bills' ? 'active' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '12.5px', background: leaderboardMetric === 'bills' ? '#0078FF' : '', color: leaderboardMetric === 'bills' ? '#FFF' : '' }}
                    >
                      Bill Volume
                    </button>
                    <button
                      onClick={() => setLeaderboardMetric('chronic')}
                      className={`btn-export ${leaderboardMetric === 'chronic' ? 'active' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '12.5px', background: leaderboardMetric === 'chronic' ? '#0078FF' : '', color: leaderboardMetric === 'chronic' ? '#FFF' : '' }}
                    >
                      Chronic Refills
                    </button>
                    <button
                      onClick={() => setLeaderboardMetric('screenings')}
                      className={`btn-export ${leaderboardMetric === 'screenings' ? 'active' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '12.5px', background: leaderboardMetric === 'screenings' ? '#0078FF' : '', color: leaderboardMetric === 'screenings' ? '#FFF' : '' }}
                    >
                      BP & Sugar Checks
                    </button>
                    <button
                      onClick={() => setLeaderboardMetric('vaccinations')}
                      className={`btn-export ${leaderboardMetric === 'vaccinations' ? 'active' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '12.5px', background: leaderboardMetric === 'vaccinations' ? '#0078FF' : '', color: leaderboardMetric === 'vaccinations' ? '#FFF' : '' }}
                    >
                      Vaccination Jabs
                    </button>
                    <button
                      onClick={() => setLeaderboardMetric('erx')}
                      className={`btn-export ${leaderboardMetric === 'erx' ? 'active' : ''}`}
                      style={{ padding: '6px 12px', fontSize: '12.5px', background: leaderboardMetric === 'erx' ? '#0078FF' : '', color: leaderboardMetric === 'erx' ? '#FFF' : '' }}
                    >
                      e-Rx Digitisation
                    </button>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Search pharmacy name or location..."
                      className="settings-input"
                      style={{ width: '260px', padding: '8px 12px', fontSize: '13px' }}
                      value={leaderboardSearch}
                      onChange={(e) => setLeaderboardSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="responsive-table-wrapper">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Pharmacy Name</th>
                        <th>Region / Location</th>
                        <th>GSTIN Prefix</th>
                        <th>Monthly Volume</th>
                        <th>National Percentile</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredLeaderboard().map((pharm) => {
                        const isUserStore = pharm.isUser;
                        return (
                          <tr key={pharm.rank} style={{ background: isUserStore ? 'rgba(0,120,255,0.06)' : '', borderLeft: isUserStore ? '3px solid #0078FF' : '' }}>
                            <td>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                backgroundColor: pharm.rank === 1 ? '#FBBF24' : pharm.rank === 2 ? '#94A3B8' : pharm.rank === 3 ? '#B45309' : 'transparent',
                                color: pharm.rank <= 3 ? '#FFF' : 'inherit'
                              }}>
                                #{pharm.rank}
                              </span>
                            </td>
                            <td>
                              <strong>{pharm.name}</strong> {isUserStore && <span style={{ fontSize: '10px', background: '#0078FF', color: '#FFF', padding: '2px 6px', borderRadius: '10px', marginLeft: '6px' }}>Your Store</span>}
                            </td>
                            <td>{pharm.location}</td>
                            <td><code style={{ fontSize: '12px' }}>{pharm.id.substring(0, 7)}...</code></td>
                            <td style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{pharm.value}</td>
                            <td style={{ color: '#10B981', fontWeight: 600 }}>{pharm.percentile}</td>
                            <td>
                              <span className={`badge-pill ${isUserStore ? 'badge-pill-success' : 'badge-pill-info'}`}>
                                {isUserStore ? 'Audited' : 'Verified'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {getFilteredLeaderboard().length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                            No pharmacies found matching "{leaderboardSearch}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 7. Commercial Growth Report Tab (Feature parity with website footer "Free Growth Report") */}
          {activeTab === 'growth' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div className="dashboard-viewport-title-row">
                <h1 className="dashboard-viewport-title">{getTabTitle()}</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-export" onClick={() => downloadDoc(`DashRx_Growth_Report_${gstin}.doc`, getGrowthReportHTML())}>
                    <Download size={13} /> Download .DOC
                  </button>
                  <button className="btn-export" onClick={() => printToPDF('DashRx Margin & Commercial Growth Report', getGrowthReportHTML())}>
                    <Download size={13} /> Download .PDF
                  </button>
                </div>
              </div>

              <div className="settings-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
                {/* Scorecard and details */}
                <div className="settings-card">
                  <h3 className="settings-section-title">Margin Optimization Performance Score</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, #0078FF 0%, #10B981 100%)', color: '#FFF' }}>
                      <div style={{ fontSize: '28px', fontWeight: 900 }}>82</div>
                      <div style={{ position: 'absolute', bottom: '10px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>/ 100</div>
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800 }}>Health Rating: Excellent</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        Your purchase margins are well-guarded, but you are experiencing an estimated annual pricing leakage of <strong>₹1,49,400</strong> from stockist rate variances.
                      </p>
                    </div>
                  </div>

                  <h3 className="settings-section-title">Identified Profit Expansion Opportunities</h3>
                  <div className="responsive-table-wrapper">
                    <table className="premium-table">
                      <thead>
                        <tr>
                          <th>Growth Pillar</th>
                          <th>Current Status</th>
                          <th>Projected Profit Lift (Annual)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Distributor Pricing Audits</strong></td>
                          <td>₹12,450 leakage identified this month</td>
                          <td style={{ color: '#10B981', fontWeight: 'bold' }}>+₹1,49,400 / yr</td>
                        </tr>
                        <tr>
                          <td><strong>OTC Wellness Mix (to 36%)</strong></td>
                          <td>Currently at 28.0% mix</td>
                          <td style={{ color: '#10B981', fontWeight: 'bold' }}>+₹78,200 / yr</td>
                        </tr>
                        <tr>
                          <td><strong>Pincode Cardio Stocking</strong></td>
                          <td>Low stock alert flagged</td>
                          <td style={{ color: '#10B981', fontWeight: 'bold' }}>+₹24,000 / yr</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right side download banner */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="settings-card" style={{ background: 'linear-gradient(135deg, rgba(0,120,255,0.06) 0%, rgba(16,185,129,0.06) 100%)', border: '1px solid var(--divider-color)', display: 'flex', flexDirection: 'column', justify: 'center', height: '100%' }}>
                    <div style={{ color: '#0078FF', marginBottom: '16px' }}>
                      <Sparkles size={36} />
                    </div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800 }}>Export Commercial Report</h4>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      Download the full pharmacy growth assessment containing specific molecule analysis and stockist rate recommendations.
                    </p>
                    <button
                      className="btn-upload-primary"
                      style={{ width: '100%', marginBottom: '10px' }}
                      onClick={() => downloadDoc(`DashRx_Growth_Report_${gstin}.doc`, getGrowthReportHTML())}
                    >
                      Download as Word Document (.doc)
                    </button>
                    <button
                      className="btn-export"
                      style={{ width: '100%' }}
                      onClick={() => printToPDF('DashRx Margin & Commercial Growth Report', getGrowthReportHTML())}
                    >
                      Download as PDF Document (.pdf)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. Settings Tab */}
          {activeTab === 'settings' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div className="dashboard-viewport-title-row">
                <h1 className="dashboard-viewport-title">{getTabTitle()}</h1>
              </div>

              <div className="settings-grid">
                {/* Profile Settings */}
                <div className="settings-card">
                  <h3 className="settings-section-title">Pharmacy Profile</h3>
                  <form onSubmit={handleSaveSettings} className="settings-form">
                    <div className="settings-input-group">
                      <label className="settings-label">Pharmacy Name</label>
                      <input
                        type="text"
                        value={pharmacyName}
                        onChange={(e) => setPharmacyName(e.target.value)}
                        className="settings-input"
                        placeholder="Krishna Medicos, Mumbai"
                        required
                      />
                    </div>
                    <div className="settings-input-group">
                      <label className="settings-label">Registered Manager / Owner Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="settings-input"
                        placeholder="Rahul Sharma"
                        required
                      />
                    </div>
                    <div className="settings-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="settings-input-group">
                        <label className="settings-label">GSTIN</label>
                        <input
                          type="text"
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          className="settings-input"
                          placeholder="27AAAAA1111A1Z1"
                          maxLength={15}
                          required
                        />
                      </div>
                      <div className="settings-input-group">
                        <label className="settings-label">Drug License (DL) Number</label>
                        <input
                          type="text"
                          value={drugLicense}
                          onChange={(e) => setDrugLicense(e.target.value)}
                          className="settings-input"
                          placeholder="DL-2026/MH-MUM"
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-save-settings">
                      Save Profile
                    </button>
                  </form>
                </div>

                {/* Upload & Seed Area */}
                <div className="settings-card">
                  <h3 className="settings-section-title">Distributor Bill Auditing</h3>

                  {isUploading ? (
                    <div style={{ textAlign: 'center', padding: '30px 0' }}>
                      <Loader2 className="animate-spin" size={48} color="#0078FF" style={{ margin: '0 auto 12px auto' }} />
                      <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Analyzing Statement Invoice ({uploadProgress}%)</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Extracting line item values and reconciling with contract sheets...
                      </p>
                      <div style={{ width: '100%', height: '4px', background: 'var(--divider-color)', borderRadius: '2px', overflow: 'hidden', marginTop: '16px' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#0078FF', transition: 'width 0.2s ease' }}></div>
                      </div>
                    </div>
                  ) : !hasData ? (
                    <div
                      className="upload-dropzone"
                      onClick={triggerFileSelect}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept=".pdf,.png,.jpg,.jpeg,.csv"
                      />
                      <UploadCloud size={32} className="upload-dropzone-icon" />
                      <div className="upload-dropzone-text">Upload Stockist Bill PDF / Image</div>
                      <div className="upload-dropzone-subtext">Click here or drag-and-drop to simulate OCR discrepancy analysis</div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
                      <h4 style={{ fontWeight: 700, marginBottom: '4px' }}>Audited Stockist Data Live</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Active file: <strong>{uploadedFile || 'invoices_reconciler_mock.pdf'}</strong>
                      </p>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button className="btn-export" onClick={handleClearData} style={{ color: '#EF4444', borderColor: '#EF4444' }}>
                          Clear Statements
                        </button>
                        <button className="btn-upload-primary" onClick={triggerFileSelect}>
                          Upload Another
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 9. Subscription & Billing Tab */}
          {activeTab === 'billing' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <div className="dashboard-viewport-title-row">
                <h1 className="dashboard-viewport-title">{getTabTitle()}</h1>
              </div>

              <div className="settings-card" style={{ maxWidth: '640px' }}>
                <h3 className="settings-section-title">Active Plan</h3>
                <div style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--divider-color)', background: 'var(--bg-color)', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>DashRx Pro Growth</h4>
                      <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Unlimited distributor invoice auditing, local demand tracking, and ledger reconciliation.</p>
                    </div>
                    <span className="badge-pill badge-pill-success" style={{ padding: '6px 12px' }}>Active Plan</span>
                  </div>
                  <div style={{ marginTop: '16px', fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
                    ₹1,499 <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>/ month (plus GST)</span>
                  </div>
                </div>

                <h3 className="settings-section-title">Billing History</h3>
                <div className="responsive-table-wrapper">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Invoice Date</th>
                        <th>Billing Cycle</th>
                        <th>Amount Paid</th>
                        <th>Receipt Download Options</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>01 May 2026</td>
                        <td>May 2026 - Present</td>
                        <td>₹1,499 + GST</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a href="#doc" style={{ fontWeight: 700, color: '#0078FF', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); downloadDoc(`DashRx_Receipt_May2026_${gstin}.doc`, getReceiptHTML('01 May 2026', 'May 2026 - Present', '₹1,768.82')); }}>Download .DOC</a>
                            <span style={{ color: 'var(--divider-color)' }}>|</span>
                            <a href="#pdf" style={{ fontWeight: 700, color: '#0078FF', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); printToPDF('DashRx Transaction Invoice', getReceiptHTML('01 May 2026', 'May 2026 - Present', '₹1,768.82')); }}>Download .PDF</a>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>01 Apr 2026</td>
                        <td>Apr 2026 - May 2026</td>
                        <td>₹1,499 + GST</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <a href="#doc" style={{ fontWeight: 700, color: '#0078FF', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); downloadDoc(`DashRx_Receipt_Apr2026_${gstin}.doc`, getReceiptHTML('01 Apr 2026', 'Apr 2026 - May 2026', '₹1,768.82')); }}>Download .DOC</a>
                            <span style={{ color: 'var(--divider-color)' }}>|</span>
                            <a href="#pdf" style={{ fontWeight: 700, color: '#0078FF', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); printToPDF('DashRx Transaction Invoice', getReceiptHTML('01 Apr 2026', 'Apr 2026 - May 2026', '₹1,768.82')); }}>Download .PDF</a>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
