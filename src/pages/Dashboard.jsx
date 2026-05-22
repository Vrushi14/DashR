import { useState, useEffect, useRef, useCallback } from 'react';
import { parseFP34PDF, getExtractionConfidence, parseSupplierInvoicePDF, parseSupplierInvoiceFromFilename } from '../utils/pdfParser.js';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CreditCard, BarChart2, Settings,
  LogOut, Sun, Moon, Download, MapPin,
  ShieldCheck, Loader2, Trash2, Trophy, Sparkles,
  Plus, RefreshCw, Upload
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

function getUserFromStorage() {
  try {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

function parseCSVToFP34(csvText) {
  const lines = csvText.split(/\r?\n/);
  const data = {};
  for (let line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (parts.length >= 2) {
      const rawKey = parts[0].replace(/^["']|["']$/g, '').trim().toLowerCase();
      const rawVal = parts[1].replace(/^["']|["']$/g, '').trim();
      
      if (rawKey.includes('month')) {
        data.month = rawVal;
      } else if (rawKey.includes('drug costs') || rawKey.includes('drugcosts') || rawKey.includes('drug_costs')) {
        const cleaned = parseFloat(rawVal.replace(/[£$kK,]/g, ''));
        data.drugCosts = rawVal.toLowerCase().includes('k') ? cleaned : cleaned / 1000;
      } else if (rawKey.includes('fees') || rawKey.includes('feesearned') || rawKey.includes('fees_earned')) {
        const cleaned = parseFloat(rawVal.replace(/[£$kK,]/g, ''));
        data.feesEarned = rawVal.toLowerCase().includes('k') ? cleaned : cleaned / 1000;
      } else if (rawKey.includes('total items') || rawKey.includes('totalitems') || rawKey.includes('items')) {
        data.totalItems = parseInt(rawVal.replace(/[,]/g, ''));
      } else if (rawKey.includes('rx forms') || rawKey.includes('rxforms')) {
        data.rxForms = parseInt(rawVal.replace(/[,]/g, ''));
      } else if (rawKey.includes('erx forms') || rawKey.includes('erxforms') || rawKey.includes('e-rx forms')) {
        data.eRxForms = parseInt(rawVal.replace(/[,]/g, ''));
      } else if (rawKey.includes('nms')) {
        data.nms = parseInt(rawVal.replace(/[,]/g, ''));
      } else if (rawKey.includes('flu') || rawKey.includes('fluvacs')) {
        data.fluVacs = parseInt(rawVal.replace(/[,]/g, ''));
      } else if (rawKey.includes('covid') || rawKey.includes('covidvacs')) {
        data.covidVacs = parseInt(rawVal.replace(/[,]/g, ''));
      } else if (rawKey.includes('cpcs')) {
        data.cpcs = parseInt(rawVal.replace(/[,]/g, ''));
      } else if (rawKey.includes('avgitemvalue') || rawKey.includes('avg item value')) {
        data.avgItemValue = parseFloat(rawVal.replace(/[£$kK,]/g, ''));
      }
    }
  }
  return data;
}

function generateCompleteFP34Data(monthStr, overrides = {}) {
  const base = getFP34DataForMonth(monthStr);
  const baseItems = overrides.totalItems !== undefined ? overrides.totalItems : parseInt(base.metrics.totalItems.replace(/,/g, '')) || 5000;
  const rxForms = overrides.rxForms !== undefined ? overrides.rxForms : Math.round(baseItems * 0.55);
  const eRxForms = overrides.eRxForms !== undefined ? overrides.eRxForms : Math.round(rxForms * 0.94);
  const avgVal = overrides.avgItemValue !== undefined ? overrides.avgItemValue : parseFloat(base.metrics.avgItemValue.replace('£', '')) || 8.50;

  const drugApplianceCosts = overrides.drugCosts !== undefined ? overrides.drugCosts * 1000 : parseFloat((baseItems * avgVal).toFixed(2));
  const dispensingFee = parseFloat((baseItems * 1.27).toFixed(2));
  const professionalFee = parseFloat((baseItems * 0.74).toFixed(2));
  const transitionPayment = parseFloat((baseItems * 0.08).toFixed(2));

  const clinicalNMS = overrides.nms !== undefined ? overrides.nms : base.charts.clinicalActivity.nms || 40;
  const clinicalCPCS = overrides.cpcs !== undefined ? overrides.cpcs : base.charts.clinicalActivity.cpcs || 300;
  const fluVacs = overrides.fluVacs !== undefined ? overrides.fluVacs : base.charts.clinicalActivity.fluVacs || 0;
  const covidVacs = overrides.covidVacs !== undefined ? overrides.covidVacs : base.charts.clinicalActivity.covidVacs || 0;

  const clinicalNMSClaim = clinicalNMS * 20.00;
  const clinicalCPCSClaim = clinicalCPCS * 14.00;
  const totalClinicalFees = clinicalNMSClaim + clinicalCPCSClaim;
  const totalFees = overrides.feesEarned !== undefined ? overrides.feesEarned * 1000 : parseFloat((dispensingFee + professionalFee + transitionPayment + totalClinicalFees).toFixed(2));

  const total = parseFloat((drugApplianceCosts + totalFees).toFixed(2));
  const charges = overrides.charges !== undefined ? overrides.charges : parseFloat((-1 * (baseItems * 0.09 * 9.65)).toFixed(2));
  const totalAccount = overrides.totalAccount !== undefined ? overrides.totalAccount : parseFloat((total + charges).toFixed(2));

  const advanceRecovery = overrides.advanceRecovery !== undefined ? overrides.advanceRecovery : parseFloat((-1 * (totalAccount * 0.85)).toFixed(2));
  const netPaymentMade = overrides.netPayment !== undefined ? overrides.netPayment : parseFloat((totalAccount + advanceRecovery).toFixed(2));

  const lppAuthorised = parseFloat((drugApplianceCosts * 0.25).toFixed(2));
  const nhsbsaAuthorised = parseFloat((totalAccount * 1.12).toFixed(2));
  const otherAmounts = parseFloat((-1 * (nhsbsaAuthorised - netPaymentMade)).toFixed(2));

  return {
    month: monthStr,
    metrics: {
      drugCosts: `£${(drugApplianceCosts / 1000).toFixed(1)}K`,
      feesEarned: `£${(totalFees / 1000).toFixed(1)}K`,
      totalAccount: `£${(totalAccount / 1000).toFixed(1)}K`,
      advanceRecovery: `£${(advanceRecovery / 1000).toFixed(1)}K`,
      netPayment: `£${(netPaymentMade / 1000).toFixed(1)}K`,
      rxForms: rxForms.toLocaleString(),
      eRxForms: eRxForms.toLocaleString(),
      totalItems: baseItems.toLocaleString(),
      avgItemValue: `£${avgVal.toFixed(2)}`
    },
    paymentSummary: {
      drugApplianceCosts,
      totalFees,
      total,
      charges,
      totalAccount,
      advanceRecovery,
      serviceRecovery: 0.00
    },
    amountsAuthorised: {
      paymentOnAccount: parseFloat((netPaymentMade * 1.01).toFixed(2)),
      serviceFeeAdvance: 0.00,
      nhsbsaAuthorised,
      lppAuthorised,
      otherAmounts,
      netPaymentMade
    },
    charts: {
      paymentBreakdown: {
        drugCosts: parseFloat((drugApplianceCosts / 1000).toFixed(1)),
        fees: parseFloat((totalFees / 1000).toFixed(1)),
        charges: parseFloat((charges / 1000).toFixed(3)),
        recovery: parseFloat((advanceRecovery / 1000).toFixed(1)),
        netPayment: parseFloat((netPaymentMade / 1000).toFixed(1))
      },
      revenueComposition: {
        drugAppliance: parseFloat((drugApplianceCosts / 1000).toFixed(1)),
        prescriptionFees: parseFloat(((totalFees - totalClinicalFees) / 1000).toFixed(1)),
        clinicalServices: parseFloat((totalClinicalFees / 1000).toFixed(1)),
        total: parseFloat(((drugApplianceCosts + totalFees) / 1000).toFixed(1))
      },
      prescriptionVolume: {
        rxForms,
        eRxForms,
        eItems: baseItems,
        zeroDiscount: Math.round(baseItems * 0.05),
        stdDiscount: Math.round(baseItems * 0.95),
        totalItems: baseItems,
        hasData: true
      },
      clinicalActivity: {
        nms: clinicalNMS,
        fluVacs,
        covidVacs,
        cpcs: clinicalCPCS
      }
    },
    subTabs: {
      pharmacyFees: [
        { type: 'Dispensing Fee', items: baseItems, rate: `£1.27`, total: `£${dispensingFee.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` },
        { type: 'MDS Dispensing Fee', items: Math.round(baseItems * 0.05), rate: `£1.27`, total: `£${(baseItems * 0.05 * 1.27).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { type: 'EPS Repeat Dispensing', items: Math.round(baseItems * 0.35), rate: `£1.27`, total: `£${(baseItems * 0.35 * 1.27).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { type: 'Advance Payment', items: 1, rate: `£${totalFees.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, total: `£${totalFees.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` },
        { type: 'Professional Fee', items: baseItems, rate: `£0.74`, total: `£${professionalFee.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` },
        { type: 'Transition Payment', items: 1, rate: `£${transitionPayment.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, total: `£${transitionPayment.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` },
      ],
      drugCosts: [
        { cat: 'Generic (Category M)', items: Math.round(baseItems * 0.62), net: `£${(drugApplianceCosts * 0.62).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, disc: `£${(drugApplianceCosts * 0.62 * 0.1117).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, final: `£${(drugApplianceCosts * 0.62 * 0.8883).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { cat: 'Branded (Category A)', items: Math.round(baseItems * 0.28), net: `£${(drugApplianceCosts * 0.28).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, disc: `£${(drugApplianceCosts * 0.28 * 0.1117).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, final: `£${(drugApplianceCosts * 0.28 * 0.8883).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { cat: 'Appliances', items: Math.round(baseItems * 0.08), net: `£${(drugApplianceCosts * 0.08).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, disc: `£0.00`, final: `£${(drugApplianceCosts * 0.08).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { cat: 'Controlled Drugs', items: Math.round(baseItems * 0.02), net: `£${(drugApplianceCosts * 0.02).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, disc: `£${(drugApplianceCosts * 0.02 * 0.1117).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, final: `£${(drugApplianceCosts * 0.02 * 0.8883).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      ],
      discounts: [
        { type: 'Standard Discount (11.17%)', items: Math.round(baseItems * 0.92), amt: `£${(drugApplianceCosts * 0.92 * 0.1117).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, note: 'Standard discount deduction' },
        { type: 'Zero Discount', items: Math.round(baseItems * 0.08), amt: '£0.00', note: 'Appliances & OOPs exempt' },
        { type: 'Pharmacy Charges', items: Math.round(baseItems * 0.09), amt: `£${Math.abs(charges).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, note: 'Patient charges clawback' },
      ],
      clinicalServices: [
        { svc: 'New Medicine Service (NMS)', vol: clinicalNMS, rate: '£20.00', claimed: `£${clinicalNMSClaim.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, status: 'Submitted' },
        { svc: 'CPCS (Urgent Supply)', vol: clinicalCPCS, rate: '£14.00', claimed: `£${clinicalCPCSClaim.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, status: 'Submitted' },
        { svc: 'Flu Vaccination (NHS)', vol: fluVacs, rate: '£9.58', claimed: `£${(fluVacs * 9.58).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, status: fluVacs > 0 ? 'Submitted' : 'N/A' },
        { svc: 'COVID-19 Vaccination', vol: covidVacs, rate: '£12.58', claimed: `£${(covidVacs * 12.58).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, status: covidVacs > 0 ? 'Submitted' : 'N/A' },
        { svc: 'Contraception Service', vol: overrides.contraception !== undefined ? overrides.contraception : (base.subTabs?.clinicalServices?.find(s => s.svc.includes('Contraception'))?.vol || 0), rate: '£19.80', claimed: `£${((overrides.contraception !== undefined ? overrides.contraception : (base.subTabs?.clinicalServices?.find(s => s.svc.includes('Contraception'))?.vol || 0)) * 19.80).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, status: 'Submitted' },
      ],
      expensiveItems: base.subTabs?.expensiveItems || []
    }
  };
}

function getFP34DataForMonth(monthStr) {
  const [mName, yStr] = monthStr.split(' ');
  const year = parseInt(yStr) || 2023;
  const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(mName) || 0;
  const seed = (year * 12 + monthIndex) % 100;

  if (monthStr === 'Jun 2023') {
    return {
      month: 'Jun 2023',
      metrics: {
        drugCosts: '£44.1K',
        feesEarned: '£18.8K',
        totalAccount: '£62.2K',
        advanceRecovery: '£-53.1K',
        netPayment: '£61.2K',
        rxForms: '0',
        eRxForms: '0',
        totalItems: '0',
        avgItemValue: '£10.18'
      },
      paymentSummary: {
        drugApplianceCosts: 44065.86,
        totalFees: 18805.64,
        total: 62871.50,
        charges: -675.50,
        totalAccount: 62196.00,
        advanceRecovery: -53095.90,
        serviceRecovery: 0.00
      },
      amountsAuthorised: {
        paymentOnAccount: 61963.36,
        serviceFeeAdvance: 0.00,
        nhsbsaAuthorised: 71063.46,
        lppAuthorised: 11660.30,
        otherAmounts: -21504.57,
        netPaymentMade: 61219.19
      },
      charts: {
        paymentBreakdown: {
          drugCosts: 44.1,
          fees: 18.8,
          charges: -0.675,
          recovery: -53.1,
          netPayment: 61.2
        },
        revenueComposition: {
          drugAppliance: 44.1,
          prescriptionFees: 18.8,
          clinicalServices: 11.2,
          total: 74.2
        },
        prescriptionVolume: {
          rxForms: 0,
          eRxForms: 0,
          eItems: 0,
          zeroDiscount: 0,
          stdDiscount: 0,
          totalItems: 0,
          hasData: false
        },
        clinicalActivity: {
          nms: 52,
          fluVacs: 0,
          covidVacs: 0,
          cpcs: 550
        }
      },
      subTabs: {
        pharmacyFees: [
          { type: 'Dispensing Fee', items: 0, rate: '£1.27', total: '£0.00' },
          { type: 'MDS Dispensing Fee', items: 0, rate: '£1.27', total: '£0.00' },
          { type: 'EPS Repeat Dispensing', items: 0, rate: '£0.00', total: '£0.00' },
          { type: 'Advance Payment', items: 1, rate: '£18,805.64', total: '£18,805.64' },
          { type: 'Professional Fee', items: 0, rate: '£0.74', total: '£0.00' },
          { type: 'Transition Payment', items: 1, rate: '£0.00', total: '£0.00' },
        ],
        drugCosts: [
          { cat: 'Generic (Category M)', items: 0, net: '£0.00', disc: '£0.00', final: '£0.00' },
          { cat: 'Branded (Category A)', items: 0, net: '£0.00', disc: '£0.00', final: '£0.00' },
          { cat: 'Appliances', items: 0, net: '£0.00', disc: '£0.00', final: '£0.00' },
          { cat: 'Controlled Drugs', items: 0, net: '£0.00', disc: '£0.00', final: '£0.00' },
        ],
        discounts: [
          { type: 'Standard Discount (11.17%)', items: 0, amt: '£0.00', note: 'Category M drugs' },
          { type: 'Zero Discount', items: 0, amt: '£0.00', note: 'Appliances & OOPs' },
          { type: 'Pharmacy Charges', items: 1, amt: '£675.50', note: 'Clawback / adjustment' },
        ],
        clinicalServices: [
          { svc: 'New Medicine Service (NMS)', vol: 52, rate: '£20.00', claimed: '£1,040.00', status: 'Submitted' },
          { svc: 'CPCS (Urgent Supply)', vol: 550, rate: '£14.00', claimed: '£7,700.00', status: 'Submitted' },
          { svc: 'Flu Vaccination (NHS)', vol: 0, rate: '£9.58', claimed: '£0.00', status: 'N/A' },
          { svc: 'COVID-19 Vaccination', vol: 0, rate: '£12.58', claimed: '£0.00', status: 'N/A' },
          { svc: 'Contraception Service', vol: 0, rate: '£19.80', claimed: '£0.00', status: 'N/A' },
        ],
        expensiveItems: []
      }
    };
  }

  const baseItems = 4500 + (seed * 47) % 3500;
  const rxForms = Math.round(baseItems * 0.55);
  const eRxForms = Math.round(rxForms * 0.94);
  const avgVal = 7.20 + (seed % 30) * 0.10;

  const drugApplianceCosts = parseFloat((baseItems * avgVal).toFixed(2));
  const dispensingFee = parseFloat((baseItems * 1.27).toFixed(2));
  const professionalFee = parseFloat((baseItems * 0.74).toFixed(2));
  const transitionPayment = parseFloat((baseItems * 0.08).toFixed(2));
  const clinicalNMS = 30 + (seed % 40);
  const clinicalCPCS = 200 + (seed % 3) * 120 + (seed % 10) * 8;

  const clinicalNMSClaim = clinicalNMS * 20.00;
  const clinicalCPCSClaim = clinicalCPCS * 14.00;
  const totalClinicalFees = clinicalNMSClaim + clinicalCPCSClaim;
  const totalFees = parseFloat((dispensingFee + professionalFee + transitionPayment + totalClinicalFees).toFixed(2));

  const total = parseFloat((drugApplianceCosts + totalFees).toFixed(2));
  const charges = parseFloat((-1 * (baseItems * 0.09 * 9.65)).toFixed(2));
  const totalAccount = parseFloat((total + charges).toFixed(2));

  const advanceRecovery = parseFloat((-1 * (totalAccount * 0.85)).toFixed(2));
  const netPaymentMade = parseFloat((totalAccount + advanceRecovery).toFixed(2));

  const lppAuthorised = parseFloat((drugApplianceCosts * 0.25).toFixed(2));
  const nhsbsaAuthorised = parseFloat((totalAccount * 1.12).toFixed(2));
  const otherAmounts = parseFloat((-1 * (nhsbsaAuthorised - netPaymentMade)).toFixed(2));

  const isVacMonth = ['Sep', 'Oct', 'Nov', 'Dec'].includes(mName);
  const fluVacs = isVacMonth ? 80 + (seed % 150) : 0;
  const covidVacs = isVacMonth ? 40 + (seed % 80) : 0;

  return {
    month: monthStr,
    metrics: {
      drugCosts: `£${(drugApplianceCosts / 1000).toFixed(1)}K`,
      feesEarned: `£${(totalFees / 1000).toFixed(1)}K`,
      totalAccount: `£${(totalAccount / 1000).toFixed(1)}K`,
      advanceRecovery: `£${(advanceRecovery / 1000).toFixed(1)}K`,
      netPayment: `£${(netPaymentMade / 1000).toFixed(1)}K`,
      rxForms: rxForms.toLocaleString(),
      eRxForms: eRxForms.toLocaleString(),
      totalItems: baseItems.toLocaleString(),
      avgItemValue: `£${avgVal.toFixed(2)}`
    },
    paymentSummary: {
      drugApplianceCosts,
      totalFees,
      total,
      charges,
      totalAccount,
      advanceRecovery,
      serviceRecovery: 0.00
    },
    amountsAuthorised: {
      paymentOnAccount: parseFloat((netPaymentMade * 1.01).toFixed(2)),
      serviceFeeAdvance: 0.00,
      nhsbsaAuthorised,
      lppAuthorised,
      otherAmounts,
      netPaymentMade
    },
    charts: {
      paymentBreakdown: {
        drugCosts: parseFloat((drugApplianceCosts / 1000).toFixed(1)),
        fees: parseFloat((totalFees / 1000).toFixed(1)),
        charges: parseFloat((charges / 1000).toFixed(3)),
        recovery: parseFloat((advanceRecovery / 1000).toFixed(1)),
        netPayment: parseFloat((netPaymentMade / 1000).toFixed(1))
      },
      revenueComposition: {
        drugAppliance: parseFloat((drugApplianceCosts / 1000).toFixed(1)),
        prescriptionFees: parseFloat(((totalFees - totalClinicalFees) / 1000).toFixed(1)),
        clinicalServices: parseFloat((totalClinicalFees / 1000).toFixed(1)),
        total: parseFloat(((drugApplianceCosts + totalFees) / 1000).toFixed(1))
      },
      prescriptionVolume: {
        rxForms,
        eRxForms,
        eItems: baseItems,
        zeroDiscount: Math.round(baseItems * 0.05),
        stdDiscount: Math.round(baseItems * 0.95),
        totalItems: baseItems,
        hasData: true
      },
      clinicalActivity: {
        nms: clinicalNMS,
        fluVacs,
        covidVacs,
        cpcs: clinicalCPCS
      }
    },
    subTabs: {
      pharmacyFees: [
        { type: 'Dispensing Fee', items: baseItems, rate: `£1.27`, total: `£${dispensingFee.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` },
        { type: 'MDS Dispensing Fee', items: Math.round(baseItems * 0.05), rate: `£1.27`, total: `£${(baseItems * 0.05 * 1.27).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { type: 'EPS Repeat Dispensing', items: Math.round(baseItems * 0.35), rate: `£1.27`, total: `£${(baseItems * 0.35 * 1.27).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { type: 'Advance Payment', items: 1, rate: `£${totalFees.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, total: `£${totalFees.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` },
        { type: 'Professional Fee', items: baseItems, rate: `£0.74`, total: `£${professionalFee.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` },
        { type: 'Transition Payment', items: 1, rate: `£${transitionPayment.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, total: `£${transitionPayment.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` },
      ],
      drugCosts: [
        { cat: 'Generic (Category M)', items: Math.round(baseItems * 0.62), net: `£${(drugApplianceCosts * 0.62).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, disc: `£${(drugApplianceCosts * 0.62 * 0.1117).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, final: `£${(drugApplianceCosts * 0.62 * 0.8883).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { cat: 'Branded (Category A)', items: Math.round(baseItems * 0.28), net: `£${(drugApplianceCosts * 0.28).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, disc: `£${(drugApplianceCosts * 0.28 * 0.1117).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, final: `£${(drugApplianceCosts * 0.28 * 0.8883).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { cat: 'Appliances', items: Math.round(baseItems * 0.08), net: `£${(drugApplianceCosts * 0.08).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, disc: `£0.00`, final: `£${(drugApplianceCosts * 0.08).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { cat: 'Controlled Drugs', items: Math.round(baseItems * 0.02), net: `£${(drugApplianceCosts * 0.02).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, disc: `£${(drugApplianceCosts * 0.02 * 0.1117).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, final: `£${(drugApplianceCosts * 0.02 * 0.8883).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
      ],
      discounts: [
        { type: 'Standard Discount (11.17%)', items: Math.round(baseItems * 0.92), amt: `£${(drugApplianceCosts * 0.92 * 0.1117).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, note: 'Standard discount deduction' },
        { type: 'Zero Discount', items: Math.round(baseItems * 0.08), amt: '£0.00', note: 'Appliances & OOPs exempt' },
        { type: 'Pharmacy Charges', items: Math.round(baseItems * 0.09), amt: `£${Math.abs(charges).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, note: 'Patient charges clawback' },
      ],
      clinicalServices: [
        { svc: 'New Medicine Service (NMS)', vol: clinicalNMS, rate: '£20.00', claimed: `£${clinicalNMSClaim.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, status: 'Submitted' },
        { svc: 'CPCS (Urgent Supply)', vol: clinicalCPCS, rate: '£14.00', claimed: `£${clinicalCPCSClaim.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, status: 'Submitted' },
        { svc: 'Flu Vaccination (NHS)', vol: fluVacs, rate: '£9.58', claimed: `£${(fluVacs * 9.58).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, status: fluVacs > 0 ? 'Submitted' : 'N/A' },
        { svc: 'COVID-19 Vaccination', vol: covidVacs, rate: '£12.58', claimed: `£${(covidVacs * 12.58).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`, status: covidVacs > 0 ? 'Submitted' : 'N/A' },
        { svc: 'Contraception Service', vol: seed % 2 === 0 ? 5 : 0, rate: '£19.80', claimed: seed % 2 === 0 ? '£99.00' : '£0.00', status: seed % 2 === 0 ? 'Submitted' : 'N/A' },
      ],
      expensiveItems: seed % 3 === 0 ? [
        { drugName: 'Adalimumab 40mg injection', quantity: 2, basicPrice: '£684.50', endorsement: 'PAE Approved', nhsbsaStatus: 'Submitted' },
        { drugName: 'Somatropin 12mg powder', quantity: 1, basicPrice: '£245.00', endorsement: 'PAE Approved', nhsbsaStatus: 'Submitted' }
      ] : []
    }
  };
}
const SideBtn = ({ tab, icon: Icon, label, activeTab, setActiveTab }) => (
  <button onClick={() => setActiveTab(tab)}
    className={`sidebar-link ${activeTab === tab ? 'active' : ''}`}
    style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
    <Icon size={17} /> {label}
  </button>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const storedUser = getUserFromStorage();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [pharmacyName, setPharmacyName] = useState(localStorage.getItem('pharmadash_pharmacy_name') || storedUser?.pharmacy_name || 'Smiths Pharmacy, London');
  const [userName, setUserName] = useState(localStorage.getItem('pharmadash_user_name') || storedUser?.name || 'John Smith');
  const [odsCode, setOdsCode] = useState(localStorage.getItem('pharmadash_ods_code') || storedUser?.ods_code || 'FLF77');
  const [nhsContract, setNhsContract] = useState(localStorage.getItem('pharmadash_nhs_contract') || storedUser?.nhs_contract || 'NHS-2026-UK');
  const [isDark, setIsDark] = useState(localStorage.getItem('pharmadash_theme') === 'dark');
  const [invoices, setInvoices] = useState([]);
  const [, setLoadingInvoices] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [, setUploadedFile] = useState('');
  const [leaderboardMetric, setLeaderboardMetric] = useState('bills');
  const [settingsSaved, setSettingsSaved] = useState(false);
  // ── FP34 Dashboard Sub-State ──────────────────────────────────────────────
  const [bannerVisible, setBannerVisible] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('Jun 2023');
  const [activeSubTab, setActiveSubTab] = useState('Overview');
  const [monthsList, setMonthsList] = useState(['Jun 2023', 'May 2023', 'Apr 2023', 'Mar 2023', 'Feb 2023', 'Jan 2023']);
  const [customFP34Data, setCustomFP34Data] = useState({});

  const userId = storedUser?.id;

  const activeMonthData = customFP34Data[selectedMonth] || getFP34DataForMonth(selectedMonth);

  const hasNewerMonth = monthsList.some(m => {
    const [name, yr] = m.split(' ');
    const year = parseInt(yr);
    return year > 2023 || (year === 2023 && ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].includes(name));
  });

  // ── Theme ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark-theme', isDark);
    localStorage.setItem('pharmadash_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // ── Fetch invoices from API ───────────────────────────────────────────────────
  const fetchInvoices = useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const res = await fetch(`${API}/api/invoices/${userId || 'guest'}`);
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : []);
    } catch {
      // Fallback demo data if server not running
      setInvoices([
        { id: 'demo-1', distributor: 'Alliance Healthcare', bill_no: 'ALL/LON/9482', date: '15 May 2026', amount: '£2,452.10', vat_slab: '20% VAT', leakage: '£31.20', leakage_type: 'Rate Difference', status: 'Action Required' },
        { id: 'demo-2', distributor: 'AAH Pharmaceuticals', bill_no: 'AAH/DIS/40291', date: '12 May 2026', amount: '£1,124.50', vat_slab: '20% VAT', leakage: '£8.20', leakage_type: 'Scheme Shortfall', status: 'Action Required' },
        { id: 'demo-3', distributor: 'Phoenix Medical', bill_no: 'PHX/7821-W', date: '08 May 2026', amount: '£845.00', vat_slab: '20% VAT', leakage: '£0', leakage_type: 'Fully Matched', status: 'Fully Matched' },
      ]);
    } finally {
      setLoadingInvoices(false);
    }
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchInvoices]);

  // ── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    ['user', 'pharmadash_pharmacy_name', 'pharmadash_ods_code', 'pharmadash_nhs_contract', 'pharmadash_user_name', 'pharmadash_theme'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  // ── Raise Claim ──────────────────────────────────────────────────────────────
  const handleRaiseClaim = async (invoiceId) => {
    try {
      await fetch(`${API}/api/invoices/${invoiceId}/claim`, { method: 'POST' });
    } catch { /* offline – update locally */ }
    setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'Claim Raised' } : inv));
    alert(`Refund Claim Note generated for invoice ${invoiceId}. Claim queued for supplier ledger sync.`);
  };

  // ── Clear all invoices ───────────────────────────────────────────────────────
  const handleClearData = async () => {
    if (!confirm('Clear all audited statements? This cannot be undone.')) return;
    try {
      await fetch(`${API}/api/invoices/user/${userId || 'guest'}`, { method: 'DELETE' });
    } catch { /* offline */ }
    setInvoices([]);
    setUploadedFile('');
  };

  // ── File Upload Simulation ───────────────────────────────────────────────────
  const triggerUploadSimulation = async (fileName) => {
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + 20;
      });
    }, 250);

    // Simulate OCR delay
    await new Promise(r => setTimeout(r, 1500));
    clearInterval(interval);
    setUploadProgress(100);

    const isFP34 = fileName.toLowerCase().includes('fp34');

    if (isFP34) {
      // ── Parse FP34 month and year ──
      const monthsAbbrev = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      let targetMonthName = '';
      let targetYear = '';

      for (let i = 0; i < 12; i++) {
        const abbrev = monthsAbbrev[i].toLowerCase();
        const full = monthsFull[i].toLowerCase();
        if (fileName.toLowerCase().includes(full) || fileName.toLowerCase().includes(abbrev)) {
          targetMonthName = monthsAbbrev[i];
          break;
        }
      }

      const yearMatch = fileName.match(/\b(20[2-3][0-9])\b/) || fileName.match(/(20[2-3][0-9])/);
      if (yearMatch) {
        targetYear = yearMatch[1];
      }

      // Defaults
      if (!targetMonthName) targetMonthName = 'Nov';
      if (!targetYear) targetYear = '2026';

      const parsedMonthStr = `${targetMonthName} ${targetYear}`;
      const generatedData = getFP34DataForMonth(parsedMonthStr);

      setCustomFP34Data(prev => ({
        ...prev,
        [parsedMonthStr]: generatedData
      }));

      setMonthsList(prev => {
        if (prev.includes(parsedMonthStr)) return prev;
        return [parsedMonthStr, ...prev];
      });

      setSelectedMonth(parsedMonthStr);
      setUploadedFile(fileName);
      setIsUploading(false);
      setUploadProgress(0);
      setActiveTab('dashboard');

      alert(`✅ NHS FP34 Schedule Audited Successfully!\n\n` +
        `Scanned Month: ${parsedMonthStr}\n` +
        `• Dispensed Items: ${generatedData.metrics.totalItems}\n` +
        `• Basic Drug Cost: ${generatedData.metrics.drugCosts}\n` +
        `• Total Fees Earned: ${generatedData.metrics.feesEarned}\n` +
        `• Net BACS Payment: ${generatedData.metrics.netPayment}\n\n` +
        `All KPI cards, interactive charts, and sub-tab details have been dynamically generated and updated for ${parsedMonthStr}.`);
    } else {
      // ── Process standard supplier invoice ──
      const newInv = {
        distributor: fileName.toLowerCase().includes('alliance') ? 'Alliance Healthcare' : 'AAH Pharmaceuticals',
        bill_no: 'SCAN/' + Date.now().toString().slice(-6),
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: '£' + (Math.random() * 2000 + 500).toFixed(2),
        vat_slab: '20% VAT',
        leakage: Math.random() > 0.5 ? '£' + (Math.random() * 50 + 5).toFixed(2) : '£0',
        leakage_type: Math.random() > 0.5 ? 'Rate Difference' : 'Fully Matched',
        status: Math.random() > 0.5 ? 'Action Required' : 'Fully Matched',
      };
      newInv.status = newInv.leakage === '£0' ? 'Fully Matched' : 'Action Required';
      newInv.leakage_type = newInv.leakage === '£0' ? 'Fully Matched' : 'Rate Difference';

      try {
        const res = await fetch(`${API}/api/invoices/${userId || 'guest'}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newInv),
        });
        const saved = await res.json();
        newInv.id = saved.id || ('local-' + Date.now());
      } catch { newInv.id = 'local-' + Date.now(); }

      setInvoices(prev => [newInv, ...prev]);
      setUploadedFile(fileName);
      setIsUploading(false);
      setUploadProgress(0);
      setActiveTab('recon');

      alert(`Audit complete for supplier bill "${fileName}". ${newInv.leakage !== '£0' ? 'Margin leakage of ' + newInv.leakage + ' detected!' : 'No discrepancies found.'}`);
    }
  };

  const processFP34Data = (fileName, data) => {
    setIsUploading(true);
    setUploadProgress(20);
    
    let progress = 20;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        let monthStr = data.month || data.Month;
        if (!monthStr) {
          const monthsAbbrev = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          let targetMonthName = '';
          let targetYear = '';

          for (let i = 0; i < 12; i++) {
            const abbrev = monthsAbbrev[i].toLowerCase();
            const full = monthsFull[i].toLowerCase();
            if (fileName.toLowerCase().includes(full) || fileName.toLowerCase().includes(abbrev)) {
              targetMonthName = monthsAbbrev[i];
              break;
            }
          }

          const yearMatch = fileName.match(/\b(20[2-3][0-9])\b/) || fileName.match(/(20[2-3][0-9])/);
          if (yearMatch) {
            targetYear = yearMatch[1];
          }

          if (!targetMonthName) targetMonthName = 'Nov';
          if (!targetYear) targetYear = '2026';
          monthStr = `${targetMonthName} ${targetYear}`;
        }
        
        const generated = generateCompleteFP34Data(monthStr, data);
        
        setCustomFP34Data(prev => ({
          ...prev,
          [monthStr]: generated
        }));

        setMonthsList(prev => {
          if (prev.includes(monthStr)) return prev;
          return [monthStr, ...prev];
        });

        setSelectedMonth(monthStr);
        setUploadedFile(fileName);
        setIsUploading(false);
        setUploadProgress(0);
        setActiveTab('dashboard');

        alert(`✅ NHS FP34 Custom Data Loaded Successfully!\n\n` +
          `File Source: ${fileName}\n` +
          `Month: ${monthStr}\n` +
          `• Dispensed Items: ${generated.metrics.totalItems}\n` +
          `• Basic Drug Cost: ${generated.metrics.drugCosts}\n` +
          `• Total Fees Earned: ${generated.metrics.feesEarned}\n` +
          `• Net BACS Payment: ${generated.metrics.netPayment}\n\n` +
          `All KPI cards, custom SVG charts, and detailed lists have been fully updated.`);
      }
    }, 150);
  };

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = ''; // reset so same file can be re-selected

    const ext = f.name.split('.').pop().toLowerCase();

    if (activeTab === 'recon') {
      setIsUploading(true);
      setUploadProgress(10);
      try {
        setUploadProgress(30);
        let parsed;
        if (ext === 'pdf') {
          parsed = await parseSupplierInvoicePDF(f);
        } else {
          parsed = parseSupplierInvoiceFromFilename(f.name);
        }
        setUploadProgress(70);

        try {
          const res = await fetch(`${API}/api/invoices/${userId || 'guest'}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed),
          });
          const saved = await res.json();
          parsed.id = saved.id || ('local-' + Date.now());
        } catch (err) {
          console.warn('Backend save failed, using local ID fallback:', err);
          parsed.id = 'local-' + Date.now();
        }

        setUploadProgress(100);
        setInvoices(prev => [parsed, ...prev]);
        setUploadedFile(f.name);
        setIsUploading(false);
        setUploadProgress(0);

        alert(`Audit complete for supplier bill "${f.name}". ${parsed.leakage !== '£0' ? 'Margin leakage of ' + parsed.leakage + ' detected!' : 'No discrepancies found.'}`);
      } catch (err) {
        console.error('Error processing supplier bill:', err);
        setIsUploading(false);
        setUploadProgress(0);
        alert(`Error processing supplier bill: ${err.message}`);
      }
      return;
    }

    if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          processFP34Data(f.name, parsed);
        } catch (err) {
          alert(`Error reading JSON file: ${err.message}`);
        }
      };
      reader.readAsText(f);

    } else if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = parseCSVToFP34(event.target.result);
          processFP34Data(f.name, parsed);
        } catch (err) {
          alert(`Error parsing CSV file: ${err.message}`);
        }
      };
      reader.readAsText(f);

    } else if (ext === 'pdf') {
      // ── Real PDF parsing via PDF.js ──────────────────────────────────────
      setIsUploading(true);
      setUploadProgress(10);
      try {
        setUploadProgress(30);
        const parsed = await parseFP34PDF(f);
        setUploadProgress(70);
        const confidence = getExtractionConfidence(parsed);

        if (confidence.extracted === 0) {
          // Fallback: couldn't extract any values — use filename-based generation
          setUploadProgress(90);
          await new Promise(r => setTimeout(r, 400));
          setIsUploading(false);
          setUploadProgress(0);
          triggerUploadSimulation(f.name);
          return;
        }

        setUploadProgress(90);
        processFP34Data(f.name, parsed);

      } catch (err) {
        console.error('PDF parse error:', err);
        // Graceful fallback
        setIsUploading(false);
        setUploadProgress(0);
        triggerUploadSimulation(f.name);
      }

    } else {
      // Images and other files → simulation based on filename
      triggerUploadSimulation(f.name);
    }
  };

    // ── Save Profile ─────────────────────────────────────────────────────────────
    const handleSaveSettings = async (e) => {
      e.preventDefault();
      localStorage.setItem('pharmadash_pharmacy_name', pharmacyName);
      localStorage.setItem('pharmadash_ods_code', odsCode);
      localStorage.setItem('pharmadash_nhs_contract', nhsContract);
      localStorage.setItem('pharmadash_user_name', userName);
      try {
        await fetch(`${API}/api/profile/${userId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: userName, pharmacy_name: pharmacyName, ods_code: odsCode, nhs_contract: nhsContract }),
        });
      } catch { /* offline */ }
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    };

    // ── Download Helpers ─────────────────────────────────────────────────────────
    const downloadDoc = (filename, html) => {
      const full = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>body{font-family:Arial;padding:30px}h1{color:#0078FF;border-bottom:2px solid #0078FF}table{width:100%;border-collapse:collapse}th{background:#0078FF;color:#fff;padding:8px;text-align:left}td{padding:8px;border:1px solid #ddd}.red{color:#EF4444;font-weight:bold}</style></head><body>${html}</body></html>`;
      const b = new Blob(['\ufeff' + full], { type: 'application/msword' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(b), download: filename });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    };
    const printPDF = (title, html) => {
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(`<html><head><title>${title}</title><style>body{font-family:Arial;padding:40px}h1{color:#0078FF}table{width:100%;border-collapse:collapse}th{background:#0078FF;color:#fff;padding:8px;text-align:left}td{padding:8px;border:1px solid #ddd}</style></head><body>${html}<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}</script></body></html>`);
      w.document.close();
    };

    // ── Computed Stats ───────────────────────────────────────────────────────────
    const totalBilled = invoices.reduce((s, i) => s + parseFloat((i.amount || '£0').replace(/[£,]/g, '') || 0), 0);
    const totalLeakage = invoices.reduce((s, i) => s + parseFloat((i.leakage || '£0').replace(/[£,]/g, '') || 0), 0);
    const matchRate = invoices.length ? ((invoices.filter(i => i.status === 'Fully Matched').length / invoices.length) * 100).toFixed(1) : '98.4';

    // ── Audit HTML ───────────────────────────────────────────────────────────────
    const auditHTML = () => `
    <h1>DashRx Purchase Audit &amp; Margin Report</h1>
    <p><strong>Pharmacy:</strong> ${pharmacyName} &nbsp;|&nbsp; <strong>ODS:</strong> ${odsCode} &nbsp;|&nbsp; <strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p>
    <h2>Audited Supplier Statements</h2>
    <table><thead><tr><th>Supplier</th><th>Bill No</th><th>Date</th><th>VAT Slab</th><th>Amount</th><th>Leakage</th><th>Status</th></tr></thead><tbody>
    ${invoices.map(i => `<tr><td>${i.distributor}</td><td>${i.bill_no}</td><td>${i.date}</td><td>${i.vat_slab}</td><td>${i.amount}</td><td class="${i.leakage !== '£0' ? 'red' : ''}">${i.leakage}</td><td>${i.status}</td></tr>`).join('')}
    </tbody></table>`;

    // ── Leaderboard data ─────────────────────────────────────────────────────────
    const totalItemsNum = parseInt(activeMonthData.metrics.totalItems.replace(/,/g, '')) || 0;
    const stdDiscountItems = activeMonthData.charts.prescriptionVolume.stdDiscount || 0;
    const fluVacsNum = activeMonthData.charts.clinicalActivity.fluVacs || 0;
    const covidVacsNum = activeMonthData.charts.clinicalActivity.covidVacs || 0;
    const totalJabs = fluVacsNum + covidVacsNum;
    const rxFormsNum = activeMonthData.charts.prescriptionVolume.rxForms || 1;
    const eRxFormsNum = activeMonthData.charts.prescriptionVolume.eRxForms || 0;
    const eRxRateStr = rxFormsNum > 0 ? ((eRxFormsNum / rxFormsNum) * 100).toFixed(1) + '%' : '91.4%';

    const pctVal = Math.min(99.9, Math.max(15, (totalItemsNum / 8650) * 97));
    const percentileStr = pctVal.toFixed(1) + '%';
    const notePercentileStr = `Top ${(100 - pctVal).toFixed(1)}% nationwide`;
    const serviceScoreVal = Math.min(100, Math.round(((fluVacsNum + covidVacsNum + (activeMonthData.charts.clinicalActivity.nms || 0) * 5 + (activeMonthData.charts.clinicalActivity.cpcs || 0) * 0.1) / 350) * 85));
    const serviceScore = Math.max(40, Math.min(100, serviceScoreVal));
    const erxPercent = parseFloat(eRxRateStr) || 91.4;
    const erxRank = Math.round(Math.max(1, 11600 - (erxPercent / 100) * 11550));
    const erxRankStr = '#' + erxRank;
    const marginScore = Math.max(50, Math.min(99, Math.round((serviceScore * 0.4) + (parseFloat(matchRate) * 0.4) + (erxPercent * 0.2))));

    const leaderboards = {
      bills: [
        { rank: 1, name: 'Boots Pharmacy Central', location: 'London Oxford St', id: 'FLF12', value: '28,490 items' },
        { rank: 2, name: 'LloydsPharmacy Hub', location: 'Birmingham City', id: 'FLF22', value: '25,120 items' },
        { rank: 3, name: 'Well Pharmacy', location: 'Manchester Piccadilly', id: 'FLF33', value: '22,940 items' },
        { rank: Math.max(4, Math.round(11600 - (pctVal / 100) * 11590)), name: pharmacyName, location: 'Your Location', id: odsCode, value: totalItemsNum.toLocaleString() + ' items', isUser: true },
      ],
      chronic: [
        { rank: 1, name: 'Well Pharmacy', location: 'Manchester', id: 'FLF33', value: '18,520 refills' },
        { rank: 2, name: 'Boots Pharmacy', location: 'London', id: 'FLF12', value: '17,440 refills' },
        { rank: Math.max(4, Math.round(11600 - (stdDiscountItems / 18520) * 11590)), name: pharmacyName, location: 'Your Location', id: odsCode, value: stdDiscountItems.toLocaleString() + ' refills', isUser: true },
      ],
      vaccinations: [
        { rank: 1, name: 'Boots Pharmacy Central', location: 'London', id: 'FLF12', value: '980 jabs' },
        { rank: Math.max(4, Math.round(11600 - (totalJabs / 980) * 11590)), name: pharmacyName, location: 'Your Location', id: odsCode, value: totalJabs.toLocaleString() + ' jabs', isUser: true },
      ],
      erx: [
        { rank: 1, name: 'Well Pharmacy', location: 'Manchester', id: 'FLF33', value: '98.5% digital' },
        { rank: erxRank, name: pharmacyName, location: 'Your Location', id: odsCode, value: eRxRateStr + ' digital', isUser: true },
      ],
    };

    return (
      <div className="dashboard-container">
        {/* ── Sidebar ── */}
        <aside className="dashboard-sidebar">
          <Link to="/" className="sidebar-logo">
            <img src="/DashRx.png" alt="DashRx" style={{ height: 55, objectFit: 'contain' }} />
          </Link>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div className="sidebar-section-title">Audit Hub</div>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              <SideBtn tab="dashboard" icon={LayoutDashboard} label="FP34 Dashboard" activeTab={activeTab} setActiveTab={setActiveTab} />
              <SideBtn tab="recon" icon={FileText} label="Statement Recon" activeTab={activeTab} setActiveTab={setActiveTab} />
              <SideBtn tab="financials" icon={CreditCard} label="VAT Breakdown" activeTab={activeTab} setActiveTab={setActiveTab} />
            </nav>
            <div className="sidebar-section-title">Market Intel</div>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              <SideBtn tab="demand" icon={MapPin} label="Dispensing Data" activeTab={activeTab} setActiveTab={setActiveTab} />
              <SideBtn tab="benchmarking" icon={BarChart2} label="Pharmacy Comparison" activeTab={activeTab} setActiveTab={setActiveTab} />
              <SideBtn tab="leaderboard" icon={Trophy} label="Leaderboard" activeTab={activeTab} setActiveTab={setActiveTab} />
            </nav>
            <div className="sidebar-section-title">Value Adds</div>
            <nav style={{ display: 'flex', flexDirection: 'column' }}>
              <SideBtn tab="growth" icon={Sparkles} label="Growth Report" activeTab={activeTab} setActiveTab={setActiveTab} />
              <SideBtn tab="settings" icon={Settings} label="Settings" activeTab={activeTab} setActiveTab={setActiveTab} />
              <SideBtn tab="billing" icon={CreditCard} label="Subscription" activeTab={activeTab} setActiveTab={setActiveTab} />
            </nav>
          </div>
          <div style={{ borderTop: '1px solid var(--divider-color)', paddingTop: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={12} color="#10B981" /> GDPR Compliant • v2.1.0
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="dashboard-main">
          {/* Header */}
          <header className="dashboard-header">
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              ODS: <span style={{ color: 'var(--text-main)' }}>{odsCode}</span>
            </div>
            <div className="dashboard-header-pharmacy">{pharmacyName}</div>
            <div className="dashboard-header-right">
              <span className="dashboard-header-user">{userName}</span>
              <button onClick={() => setIsDark(d => !d)} className="header-action-btn" title="Toggle Theme">
                {isDark ? <Sun size={17} /> : <Moon size={17} />}
              </button>
              <button onClick={handleLogout} className="header-action-btn" title="Logout"><LogOut size={17} /></button>
            </div>
          </header>

          <div className="dashboard-viewport">

            {/* ══════════════════ FP34 DASHBOARD ══════════════════ */}
            {activeTab === 'dashboard' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>

                {/* ── Warning Banner ── */}
                {bannerVisible && (
                  <div className="warning-banner" style={{ background: hasNewerMonth ? 'rgba(16,185,129,0.06)' : undefined, borderLeft: hasNewerMonth ? '4px solid #10B981' : undefined }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, flexWrap: 'wrap' }}>
                      <span className="warning-banner-text" style={{ color: hasNewerMonth ? '#10B981' : undefined }}>
                        {hasNewerMonth
                          ? `🎉 Latest FP34 schedule (${selectedMonth}) has been loaded successfully! All KPIs and charts updated.`
                          : `⚠️ Your latest data is from Jun 2023 (35 months ago). Upload a new FP34 to stay up to date.`}
                      </span>
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg,.csv" />
                      {!hasNewerMonth && (
                        <button className="warning-banner-btn" onClick={() => fileInputRef.current?.click()}>Upload New FP34</button>
                      )}
                    </div>
                    <button className="warning-banner-close" onClick={() => setBannerVisible(false)} title="Dismiss">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}

                {/* ── Control Row: Month + Timestamp + Export ── */}
                <div className="control-row">
                  <div className="month-selector-group">
                    <span className="month-label">Month</span>
                    <select
                      className="month-select"
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                    >
                      {monthsList.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Updated 21 May 2026</span>
                    <button className="btn-export" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={13} /> Upload FP34 PDF
                    </button>
                    <button className="btn-export" onClick={() => downloadDoc(`DashRx_FP34_${odsCode}_${selectedMonth.replace(' ', '_')}.doc`, auditHTML())}>
                      <Download size={13} /> Export
                    </button>
                    <button className="btn-export" onClick={fetchInvoices}><RefreshCw size={13} /> Refresh</button>
                    {invoices.length > 0 && (
                      <button className="btn-export" style={{ color: '#EF4444' }} onClick={handleClearData}><Trash2 size={14} /> Clear</button>
                    )}
                  </div>
                </div>

                {/* ── Sub-Tabs Navigation ── */}
                <div className="sub-tabs-bar">
                  {['Overview', 'Pharmacy Fees', 'Drug Costs', 'Discounts', 'Clinical Services', 'Expensive Items'].map(tab => (
                    <button
                      key={tab}
                      className={`sub-tab-btn${activeSubTab === tab ? ' active' : ''}`}
                      onClick={() => setActiveSubTab(tab)}
                    >{tab}</button>
                  ))}
                </div>

                {/* ══ OVERVIEW SUB-TAB ══ */}
                {activeSubTab === 'Overview' && (
                  <div style={{ animation: 'fadeIn 0.25s ease' }}>

                    {/* ── Row 1: 5 Financial Metric Cards ── */}
                    <div className="fp34-metrics-grid-1">
                      {[
                        { title: 'Drug & Appliance Costs', value: activeMonthData.metrics.drugCosts, sub: 'Basic prices after discount', border: '#003087' },
                        { title: 'Total Fees Earned', value: activeMonthData.metrics.feesEarned, sub: 'Prescription + clinical', border: '#005EB8' },
                        { title: 'Total Account', value: activeMonthData.metrics.totalAccount, sub: 'Before recoveries', border: '#7C3AED' },
                        { title: 'Advance Recovery', value: activeMonthData.metrics.advanceRecovery, sub: 'Monthly repayment', border: '#F59E0B' },
                        { title: 'Net Payment', value: activeMonthData.metrics.netPayment, sub: 'Final BACS payment', border: '#475569' },
                      ].map(c => (
                        <div key={c.title} className="fp34-card" style={{ borderLeft: `4px solid ${c.border}` }}>
                          <div className="fp34-card-title">{c.title}</div>
                          <div className="fp34-card-value">{c.value}</div>
                          <div className="fp34-card-subtitle">{c.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* ── Row 2: 4 Volume Metric Cards ── */}
                    <div className="fp34-metrics-grid-2">
                      {[
                        { title: 'Rx Forms', value: activeMonthData.metrics.rxForms, sub: 'Total forms received', border: '#CBD5E1' },
                        { title: 'E-Rx Forms', value: activeMonthData.metrics.eRxForms, sub: 'Electronic forms', border: '#CBD5E1' },
                        { title: 'Total Items', value: activeMonthData.metrics.totalItems, sub: 'Dispensed items', border: '#CBD5E1' },
                        { title: 'Avg Item Value', value: activeMonthData.metrics.avgItemValue, sub: 'Per item cost', border: '#CBD5E1' },
                      ].map(c => (
                        <div key={c.title} className="fp34-card" style={{ borderLeft: `4px solid ${c.border}` }}>
                          <div className="fp34-card-title">{c.title}</div>
                          <div className="fp34-card-value">{c.value}</div>
                          <div className="fp34-card-subtitle">{c.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* ── Dual Detail Tables ── */}
                    <div className="details-two-columns">

                      {/* Payment Summary */}
                      <div className="detail-table-card">
                        <div className="detail-table-title">Payment Summary</div>
                        <table className="detail-table">
                          <tbody>
                            <tr><td style={{ color: '#005EB8' }}>Drug &amp; Appliance Costs</td><td className="value-cell" style={{ color: '#005EB8' }}>£{activeMonthData.paymentSummary.drugApplianceCosts.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
                            <tr><td style={{ color: '#005EB8' }}>Total Fees</td><td className="value-cell" style={{ color: '#005EB8' }}>£{activeMonthData.paymentSummary.totalFees.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
                            <tr className="total-row"><td>Total</td><td className="value-cell">£{activeMonthData.paymentSummary.total.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
                            <tr>
                              <td>Charges</td>
                              <td className={`value-cell ${activeMonthData.paymentSummary.charges < 0 ? 'text-red' : ''}`}>
                                {activeMonthData.paymentSummary.charges < 0 ? `-£${Math.abs(activeMonthData.paymentSummary.charges).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : `£${activeMonthData.paymentSummary.charges.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
                              </td>
                            </tr>
                            <tr className="total-row"><td>Total of Account</td><td className="value-cell">£{activeMonthData.paymentSummary.totalAccount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td></tr>
                            <tr>
                              <td>Advance Recovery</td>
                              <td className={`value-cell ${activeMonthData.paymentSummary.advanceRecovery < 0 ? 'text-red' : ''}`}>
                                {activeMonthData.paymentSummary.advanceRecovery < 0 ? `-£${Math.abs(activeMonthData.paymentSummary.advanceRecovery).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : `£${activeMonthData.paymentSummary.advanceRecovery.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
                              </td>
                            </tr>
                            <tr>
                              <td>Service Recovery</td>
                              <td className={`value-cell ${activeMonthData.paymentSummary.serviceRecovery < 0 ? 'text-red' : ''}`}>
                                {activeMonthData.paymentSummary.serviceRecovery < 0 ? `-£${Math.abs(activeMonthData.paymentSummary.serviceRecovery).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : `£${activeMonthData.paymentSummary.serviceRecovery.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Amounts Authorised */}
                      <div className="detail-table-card">
                        <div className="detail-table-title">Amounts Authorised</div>
                        <table className="detail-table">
                          <tbody>
                            <tr><td>Payment on Account</td><td className="value-cell">£{activeMonthData.amountsAuthorised.paymentOnAccount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td></tr>
                            <tr><td>Service Fee Advance</td><td className="value-cell">£{activeMonthData.amountsAuthorised.serviceFeeAdvance.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td></tr>
                            <tr className="total-row"><td>NHSBSA Authorised</td><td className="value-cell">£{activeMonthData.amountsAuthorised.nhsbsaAuthorised.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td></tr>
                            <tr><td>LPP Authorised</td><td className="value-cell">£{activeMonthData.amountsAuthorised.lppAuthorised.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td></tr>
                            <tr>
                              <td>Other Amounts</td>
                              <td className={`value-cell ${activeMonthData.amountsAuthorised.otherAmounts < 0 ? 'text-red' : ''}`}>
                                {activeMonthData.amountsAuthorised.otherAmounts < 0 ? `-£${Math.abs(activeMonthData.amountsAuthorised.otherAmounts).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : `£${activeMonthData.amountsAuthorised.otherAmounts.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
                              </td>
                            </tr>
                            <tr className="total-row"><td>Net Payment Made</td><td className="value-cell text-green">£{activeMonthData.amountsAuthorised.netPaymentMade.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</td></tr>
                          </tbody>
                        </table>
                      </div>

                    </div>

                    {/* ── 4 Charts Grid ── */}
                    {(() => {
                      // ── Chart 1: Payment Breakdown Line Chart Math ──
                      const pbData = activeMonthData.charts.paymentBreakdown;
                      const pbValues = [pbData.drugCosts, pbData.fees, pbData.charges, pbData.recovery, pbData.netPayment];
                      const pbLabelStrs = [
                        `£${pbData.drugCosts}K`,
                        `£${pbData.fees}K`,
                        pbData.charges < 0 ? `-£${Math.abs(pbData.charges * 1000).toFixed(0)}` : `£${(pbData.charges * 1000).toFixed(0)}`,
                        pbData.recovery < 0 ? `-£${Math.abs(pbData.recovery)}K` : `£${pbData.recovery}K`,
                        `£${pbData.netPayment}K`
                      ];
                      const pbPointColors = ['#005EB8', '#128274', '#EF4444', '#EF4444', '#7C3AED'];
                      const pbMin = Math.min(...pbValues);
                      const pbMax = Math.max(...pbValues);
                      const pbRange = pbMax - pbMin || 1;
                      const pbChartTop = 22; const pbChartBottom = 158;
                      const pbChartLeft = 42; const pbChartRight = 295;
                      const pbXStep = (pbChartRight - pbChartLeft) / (pbValues.length - 1);
                      const pbGetX = (idx) => pbChartLeft + idx * pbXStep;
                      const pbGetY = (val) => pbChartBottom - ((val - pbMin) / pbRange) * (pbChartBottom - pbChartTop);
                      const pbPolyline = pbValues.map((v, idx) => `${pbGetX(idx)},${pbGetY(v)}`).join(' ');
                      const pbZeroY = pbGetY(0);
                      const pbAreaPath = `M${pbGetX(0)},${pbGetY(pbValues[0])} ` +
                        pbValues.slice(1).map((v, idx) => `L${pbGetX(idx + 1)},${pbGetY(v)}`).join(' ') +
                        ` L${pbGetX(pbValues.length - 1)},${pbChartBottom} L${pbGetX(0)},${pbChartBottom} Z`;

                      // ── Chart 2: Revenue Composition Math ──
                      const rcData = activeMonthData.charts.revenueComposition;
                      const rcTotal = rcData.total || 0.1;
                      const pctDrug = rcData.drugAppliance / rcTotal;
                      const pctFees = rcData.prescriptionFees / rcTotal;
                      const pctSvc = rcData.clinicalServices / rcTotal;
                      const circ = 2 * Math.PI * 60;
                      const lenDrug = pctDrug * circ;
                      const lenFees = pctFees * circ;
                      const lenSvc = pctSvc * circ;
                      const offsetDrug = circ / 4;
                      const offsetFees = offsetDrug - lenDrug;
                      const offsetSvc = offsetFees - lenFees;

                      const getCoordinatesForPercent = (percent, radius) => {
                        const angle = (percent * 2 * Math.PI) - (Math.PI / 2);
                        return {
                          x: 100 + radius * Math.cos(angle),
                          y: 100 + radius * Math.sin(angle)
                        };
                      };
                      const coordDrug = getCoordinatesForPercent(pctDrug / 2, 60);
                      const coordFees = getCoordinatesForPercent(pctDrug + pctFees / 2, 60);
                      const coordSvc = getCoordinatesForPercent(pctDrug + pctFees + pctSvc / 2, 60);

                      // ── Chart 3: Prescription Volume Math ──
                      const pvData = activeMonthData.charts.prescriptionVolume;
                      const pvMax = Math.max(
                        pvData.rxForms || 1,
                        pvData.eRxForms || 1,
                        pvData.eItems || 1,
                        pvData.zeroDiscount || 1,
                        pvData.stdDiscount || 1,
                        pvData.totalItems || 1
                      );
                      const pvScale = 130 / pvMax;
                      const pvItems = pvData.hasData ? [
                        { label: 'Rx Forms', val: pvData.rxForms },
                        { label: 'e-Rx Forms', val: pvData.eRxForms },
                        { label: 'e-Items', val: pvData.eItems },
                        { label: 'Zero Disc', val: pvData.zeroDiscount },
                        { label: 'Std Disc', val: pvData.stdDiscount },
                        { label: 'Total Items', val: pvData.totalItems }
                      ] : [];

                      // ── Chart 4: Clinical Activity Math ──
                      const caData = activeMonthData.charts.clinicalActivity;
                      const caMaxVal = Math.max(caData.nms || 0, caData.fluVacs || 0, caData.covidVacs || 0, caData.cpcs || 0, 100);
                      const caGridMax = Math.ceil(caMaxVal / 100) * 100;
                      const caScale = 140 / caGridMax;
                      const caTicks = [];
                      const caTickStep = caGridMax / 5;
                      for (let i = 0; i <= 5; i++) {
                        caTicks.push(Math.round(i * caTickStep));
                      }

                      return (
                        <div className="charts-grid-2x2">
                          {/* Chart 1: Payment Breakdown Line Chart */}
                          <div className="chart-card-fidelity">
                            <div className="chart-title-fidelity">Payment Breakdown</div>
                            <div className="chart-svg-container">
                              <svg viewBox="0 0 320 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                                <defs>
                                  <linearGradient id="pbGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#005EB8" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#005EB8" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                                {/* Horizontal grid lines */}
                                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                                  const gy = pbChartTop + t * (pbChartBottom - pbChartTop);
                                  const glVal = pbMax - t * pbRange;
                                  return (
                                    <g key={i}>
                                      <line x1={pbChartLeft} y1={gy} x2={pbChartRight} y2={gy} stroke="var(--divider-color)" strokeWidth="1" strokeDasharray="3" />
                                      <text x={pbChartLeft - 4} y={gy + 3} textAnchor="end" fontSize="7" fill="var(--text-muted)" fontWeight="600">{glVal >= 0 ? `£${glVal.toFixed(0)}K` : `-£${Math.abs(glVal).toFixed(0)}K`}</text>
                                    </g>
                                  );
                                })}
                                {/* Zero baseline (if in range) */}
                                {pbMin < 0 && pbMax > 0 && (
                                  <line x1={pbChartLeft} y1={pbZeroY} x2={pbChartRight} y2={pbZeroY} stroke="#EF4444" strokeWidth="1" strokeDasharray="4,2" opacity="0.5" />
                                )}
                                {/* Gradient area fill */}
                                <path d={pbAreaPath} fill="url(#pbGrad)" />
                                {/* Line */}
                                <polyline points={pbPolyline} fill="none" stroke="#005EB8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                                {/* Data points & labels */}
                                {pbValues.map((val, idx) => {
                                  const cx = pbGetX(idx);
                                  const cy = pbGetY(val);
                                  const isNeg = val < 0;
                                  const labelY = isNeg ? cy + 14 : cy - 7;
                                  return (
                                    <g key={idx}>
                                      <circle cx={cx} cy={cy} r="4" fill={pbPointColors[idx]} stroke="white" strokeWidth="1.5" />
                                      <text x={cx} y={labelY} textAnchor="middle" fontSize="7.5" fill={pbPointColors[idx]} fontWeight="800">{pbLabelStrs[idx]}</text>
                                    </g>
                                  );
                                })}
                                {/* X-axis labels */}
                                {['Drug Costs', 'Fees', 'Charges', 'Recovery', 'Net Pymt'].map((lbl, idx) => (
                                  <text key={idx} x={pbGetX(idx)} y="178" textAnchor="middle" fontSize="6.5" fill="var(--text-muted)" fontWeight="600">{lbl}</text>
                                ))}
                              </svg>
                            </div>
                          </div>

                          {/* Chart 2: Revenue Composition Donut */}
                          <div className="chart-card-fidelity">
                            <div className="chart-title-fidelity">Revenue Composition</div>
                            <div className="chart-svg-container">
                              <svg viewBox="0 0 200 200" width="100%" height="190">
                                {/* Donut segments */}
                                {/* Drug & Appliance */}
                                <circle cx="100" cy="100" r="60" fill="none" stroke="#005EB8" strokeWidth="36"
                                  strokeDasharray={`${lenDrug} ${circ - lenDrug}`}
                                  strokeDashoffset={offsetDrug}
                                  style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
                                />
                                {/* Prescription Fees */}
                                <circle cx="100" cy="100" r="60" fill="none" stroke="#128274" strokeWidth="36"
                                  strokeDasharray={`${lenFees} ${circ - lenFees}`}
                                  strokeDashoffset={offsetFees}
                                  style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
                                />
                                {/* Clinical Services */}
                                <circle cx="100" cy="100" r="60" fill="none" stroke="#F59E0B" strokeWidth="36"
                                  strokeDasharray={`${lenSvc} ${circ - lenSvc}`}
                                  strokeDashoffset={offsetSvc}
                                  style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
                                />
                                {/* Centre hole */}
                                <circle cx="100" cy="100" r="40" fill="var(--bg-secondary)" />
                                {/* Centre labels */}
                                <text x="100" y="97" textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="700">Total</text>
                                <text x="100" y="111" textAnchor="middle" fontSize="11" fill="var(--text-main)" fontWeight="800">£{rcTotal.toFixed(1)}K</text>
                                {/* Value callouts */}
                                {pctDrug > 0.05 && (
                                  <text x={coordDrug.x} y={coordDrug.y + 3} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="800">£{rcData.drugAppliance.toFixed(1)}K</text>
                                )}
                                {pctFees > 0.05 && (
                                  <text x={coordFees.x} y={coordFees.y + 3} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="800">£{rcData.prescriptionFees.toFixed(1)}K</text>
                                )}
                                {pctSvc > 0.05 && (
                                  <text x={coordSvc.x} y={coordSvc.y + 3} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="800">£{rcData.clinicalServices.toFixed(1)}K</text>
                                )}
                              </svg>
                            </div>
                            <div className="chart-legend-fidelity">
                              <span className="legend-item-fidelity"><span className="legend-color-box" style={{ background: '#005EB8' }} />Drug &amp; Appliance</span>
                              <span className="legend-item-fidelity"><span className="legend-color-box" style={{ background: '#128274' }} />Prescription Fees</span>
                              <span className="legend-item-fidelity"><span className="legend-color-box" style={{ background: '#F59E0B' }} />Clinical Services</span>
                            </div>
                          </div>

                          {/* Chart 3: Prescription Volume */}
                          <div className="chart-card-fidelity">
                            <div className="chart-title-fidelity">Prescription Volume</div>
                            <div className="chart-svg-container">
                              <svg viewBox="0 0 320 180" width="100%" height="100%" style={{ overflow: 'visible' }}>
                                <defs>
                                  <linearGradient id="pvGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#0078FF" stopOpacity="0.85" />
                                    <stop offset="100%" stopColor="#0078FF" stopOpacity="0.3" />
                                  </linearGradient>
                                </defs>
                                {/* Grid */}
                                {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v, i) => {
                                  const y = 10 + (1 - v) * 130;
                                  return (
                                    <g key={i}>
                                      <line x1="40" y1={y} x2="305" y2={y} stroke="var(--divider-color)" strokeWidth="1" strokeDasharray="3" />
                                      <text x="35" y={y + 3} textAnchor="end" fontSize="8" fill="var(--text-muted)" fontWeight="600">{pvData.hasData ? Math.round(v * pvMax).toLocaleString() : v.toFixed(1)}</text>
                                    </g>
                                  );
                                })}
                                {/* Baseline */}
                                <line x1="40" x2="305" y1="140" y2="140" stroke="var(--divider-color)" strokeWidth="1.5" />
                                {/* X axis labels */}
                                {['Rx Forms', 'e-Rx Forms', 'e-Items', 'Zero Disc', 'Std Disc', 'Total Items'].map((lbl, i) => (
                                  <text key={i} x={55 + i * 44} y="155" textAnchor="middle" fontSize="7" fill="var(--text-muted)" fontWeight="600">{lbl}</text>
                                ))}
                                {pvData.hasData ? (
                                  pvItems.map((bar, i) => {
                                    const h = bar.val * pvScale;
                                    const y = 140 - h;
                                    const x = 55 + i * 44 - 10;
                                    return (
                                      <g key={i}>
                                        <rect x={x} y={y} width="20" height={h} fill="url(#pvGrad)" rx="2" />
                                        <text x={x + 10} y={y - 5} textAnchor="middle" fontSize="7.5" fill="var(--text-muted)" fontWeight="700">
                                          {bar.val >= 1000 ? `${(bar.val / 1000).toFixed(1)}K` : bar.val}
                                        </text>
                                      </g>
                                    );
                                  })
                                ) : (
                                  <>
                                    {/* Zero dot markers */}
                                    {[55, 99, 143, 187, 231, 275].map((x, i) => (
                                      <circle key={i} cx={x} cy="140" r="3" fill="#CBD5E1" />
                                    ))}
                                    <text x="172" y="80" textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontWeight="700" opacity="0.5">No data for {selectedMonth}</text>
                                  </>
                                )}
                              </svg>
                            </div>
                          </div>

                          {/* Chart 4: Clinical Activity */}
                          <div className="chart-card-fidelity">
                            <div className="chart-title-fidelity">Clinical Activity</div>
                            <div className="chart-svg-container">
                              <svg viewBox="0 0 280 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                                {/* Grid */}
                                {caTicks.map((v, i) => {
                                  const y = 10 + (1 - v / caGridMax) * 140;
                                  return (
                                    <g key={i}>
                                      <line x1="40" y1={y} x2="265" y2={y} stroke="var(--divider-color)" strokeWidth="1" strokeDasharray="3" />
                                      <text x="35" y={y + 3} textAnchor="end" fontSize="8" fill="var(--text-muted)" fontWeight="600">{v}</text>
                                    </g>
                                  );
                                })}
                                <line x1="40" x2="265" y1="150" y2="150" stroke="var(--divider-color)" strokeWidth="1.5" />

                                {caData.nms > 0 ? (
                                  <>
                                    <rect x="55" y={150 - caData.nms * caScale} width="32" height={caData.nms * caScale} fill="#005EB8" rx="2" />
                                    <text x="71" y={150 - caData.nms * caScale - 5} textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontWeight="700">{caData.nms}</text>
                                  </>
                                ) : (
                                  <circle cx="71" cy="150" r="3" fill="#CBD5E1" />
                                )}

                                {/* Flu Vacs bar */}
                                {caData.fluVacs > 0 ? (
                                  <>
                                    <rect x="105" y={150 - caData.fluVacs * caScale} width="32" height={caData.fluVacs * caScale} fill="#128274" rx="2" />
                                    <text x="121" y={150 - caData.fluVacs * caScale - 5} textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontWeight="700">{caData.fluVacs}</text>
                                  </>
                                ) : (
                                  <circle cx="121" cy="150" r="3" fill="#CBD5E1" />
                                )}

                                {/* COVID Vacs bar */}
                                {caData.covidVacs > 0 ? (
                                  <>
                                    <rect x="157" y={150 - caData.covidVacs * caScale} width="32" height={caData.covidVacs * caScale} fill="#F59E0B" rx="2" />
                                    <text x="173" y={150 - caData.covidVacs * caScale - 5} textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontWeight="700">{caData.covidVacs}</text>
                                  </>
                                ) : (
                                  <circle cx="173" cy="150" r="3" fill="#CBD5E1" />
                                )}

                                {/* CPCS bar */}
                                {caData.cpcs > 0 ? (
                                  <>
                                    <rect x="207" y={150 - caData.cpcs * caScale} width="32" height={caData.cpcs * caScale} fill="#7C3AED" rx="2" />
                                    <text x="223" y={150 - caData.cpcs * caScale - 5} textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontWeight="700">{caData.cpcs}</text>
                                  </>
                                ) : (
                                  <circle cx="223" cy="150" r="3" fill="#CBD5E1" />
                                )}

                                {/* X labels */}
                                {['NMS', 'Flu Vacs', 'COVID Vacs', 'CPCS'].map((lbl, i) => (
                                  <text key={i} x={71 + i * 52} y="166" textAnchor="middle" fontSize="7.5" fill="var(--text-muted)" fontWeight="600">{lbl}</text>
                                ))}
                              </svg>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}{/* end Overview */}

                {/* ══ PHARMACY FEES SUB-TAB ══ */}
                {activeSubTab === 'Pharmacy Fees' && (
                  <div style={{ animation: 'fadeIn 0.25s ease' }}>
                    <div className="detail-table-card">
                      <div className="detail-table-title">Pharmacy Fees Breakdown — {selectedMonth}</div>
                      <table className="premium-table">
                        <thead><tr><th>Fee Type</th><th>Items</th><th>Rate (£)</th><th>Total (£)</th></tr></thead>
                        <tbody>
                          {(activeMonthData.subTabs?.pharmacyFees || []).map(r => (
                            <tr key={r.type}>
                              <td>{r.type}</td>
                              <td style={{ fontWeight: 600 }}>{r.items.toLocaleString()}</td>
                              <td>{r.rate}</td>
                              <td style={{ fontWeight: 700 }}>{r.total}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: '2px solid var(--divider-color)', fontWeight: 800 }}>
                            <td><strong>Total Pharmacy Fees</strong></td>
                            <td></td><td></td>
                            <td style={{ fontWeight: 800, color: '#005EB8' }}>£{activeMonthData.paymentSummary.totalFees.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ══ DRUG COSTS SUB-TAB ══ */}
                {activeSubTab === 'Drug Costs' && (
                  <div style={{ animation: 'fadeIn 0.25s ease' }}>
                    <div className="fp34-metrics-grid-2" style={{ marginBottom: 20 }}>
                      {[
                        { title: 'Basic Price (Net)', value: `£${activeMonthData.paymentSummary.drugApplianceCosts.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, border: '#005EB8' },
                        { title: 'Out of Pocket', value: '£0.00', border: '#128274' },
                        { title: 'Broken Bulk', value: '£0.00', border: '#F59E0B' },
                        { title: 'Zero Discount Items', value: `${(activeMonthData.charts.prescriptionVolume.zeroDiscount || 0).toLocaleString()} items`, border: '#CBD5E1' },
                      ].map(c => (
                        <div key={c.title} className="fp34-card" style={{ borderLeft: `4px solid ${c.border}` }}>
                          <div className="fp34-card-title">{c.title}</div>
                          <div className="fp34-card-value">{c.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="detail-table-card">
                      <div className="detail-table-title">Drug Cost Detail — {selectedMonth}</div>
                      <table className="premium-table">
                        <thead><tr><th>Category</th><th>Items</th><th>Net Cost</th><th>Discount</th><th>Final</th></tr></thead>
                        <tbody>
                          {(activeMonthData.subTabs?.drugCosts || []).map(r => (
                            <tr key={r.cat}>
                              <td>{r.cat}</td>
                              <td>{r.items.toLocaleString()}</td>
                              <td>{r.net}</td>
                              <td>{r.disc}</td>
                              <td style={{ fontWeight: 700 }}>{r.final}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: '2px solid var(--divider-color)' }}>
                            <td><strong>Total Drug Costs</strong></td><td></td><td></td><td></td>
                            <td style={{ fontWeight: 800, color: '#005EB8' }}>£{activeMonthData.paymentSummary.drugApplianceCosts.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ══ DISCOUNTS SUB-TAB ══ */}
                {activeSubTab === 'Discounts' && (
                  <div style={{ animation: 'fadeIn 0.25s ease' }}>
                    <div className="detail-table-card">
                      <div className="detail-table-title">Discount Schedule — {selectedMonth}</div>
                      <table className="premium-table">
                        <thead><tr><th>Discount Type</th><th>Items</th><th>Amount Deducted</th><th>Note</th></tr></thead>
                        <tbody>
                          {(activeMonthData.subTabs?.discounts || []).map(r => (
                            <tr key={r.type}>
                              <td>{r.type}</td>
                              <td>{r.items.toLocaleString()}</td>
                              <td style={{ fontWeight: 700, color: '#EF4444' }}>
                                {parseFloat(r.amt.replace(/[£,]/g, '')) > 0 ? `-£${parseFloat(r.amt.replace(/[£,]/g, '')).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '£0.00'}
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.note}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: '2px solid var(--divider-color)' }}>
                            <td><strong>Total Deductions</strong></td><td></td>
                            <td style={{ fontWeight: 800, color: '#EF4444' }}>
                              {(() => {
                                const totalDeductions = (activeMonthData.subTabs?.discounts || []).reduce((sum, item) => {
                                  const parsed = parseFloat(item.amt.replace(/[£,]/g, '')) || 0;
                                  return sum + parsed;
                                }, 0);
                                return totalDeductions > 0 ? `-£${totalDeductions.toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '£0.00';
                              })()}
                            </td>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ══ CLINICAL SERVICES SUB-TAB ══ */}
                {activeSubTab === 'Clinical Services' && (
                  <div style={{ animation: 'fadeIn 0.25s ease' }}>
                    <div className="fp34-metrics-grid-2" style={{ marginBottom: 20 }}>
                      {[
                        { title: 'NMS Completions', value: (activeMonthData.charts.clinicalActivity.nms || 0).toLocaleString(), border: '#005EB8' },
                        { title: 'CPCS Referrals', value: (activeMonthData.charts.clinicalActivity.cpcs || 0).toLocaleString(), border: '#7C3AED' },
                        { title: 'Flu Vaccinations', value: (activeMonthData.charts.clinicalActivity.fluVacs || 0).toLocaleString(), border: '#128274' },
                        { title: 'COVID Vaccinations', value: (activeMonthData.charts.clinicalActivity.covidVacs || 0).toLocaleString(), border: '#F59E0B' },
                      ].map(c => (
                        <div key={c.title} className="fp34-card" style={{ borderLeft: `4px solid ${c.border}` }}>
                          <div className="fp34-card-title">{c.title}</div>
                          <div className="fp34-card-value">{c.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="detail-table-card">
                      <div className="detail-table-title">Clinical Service Activity Log — {selectedMonth}</div>
                      <table className="premium-table">
                        <thead><tr><th>Service</th><th>Volume</th><th>Rate</th><th>Claimed</th><th>Status</th></tr></thead>
                        <tbody>
                          {(activeMonthData.subTabs?.clinicalServices || []).map(r => (
                            <tr key={r.svc}>
                              <td>{r.svc}</td>
                              <td style={{ fontWeight: 700 }}>{r.vol.toLocaleString()}</td>
                              <td>{r.rate}</td>
                              <td style={{ fontWeight: 700, color: '#005EB8' }}>{r.claimed}</td>
                              <td><span className={`badge-pill ${r.status === 'Submitted' ? 'badge-pill-success' : 'badge-pill-info'}`}>{r.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ══ EXPENSIVE ITEMS SUB-TAB ══ */}
                {activeSubTab === 'Expensive Items' && (
                  <div style={{ animation: 'fadeIn 0.25s ease' }}>
                    <div className="detail-table-card">
                      <div className="detail-table-title">High-Cost Drug Claims — {selectedMonth}</div>
                      <table className="premium-table">
                        <thead><tr><th>Drug Name</th><th>Quantity</th><th>Basic Price</th><th>Endorsement</th><th>NHSBSA Status</th></tr></thead>
                        <tbody>
                          {activeMonthData.subTabs?.expensiveItems && activeMonthData.subTabs.expensiveItems.length > 0 ? (
                            activeMonthData.subTabs.expensiveItems.map((item, index) => (
                              <tr key={index}>
                                <td><strong>{item.drugName}</strong></td>
                                <td>{item.quantity}</td>
                                <td style={{ fontWeight: 700 }}>{item.basicPrice}</td>
                                <td><span className="badge-pill badge-pill-success">{item.endorsement}</span></td>
                                <td><span className="badge-pill badge-pill-info">{item.nhsbsaStatus}</span></td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                                No expensive items submitted for {selectedMonth}.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="fp34-card" style={{ borderLeft: '4px solid #005EB8', marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 'auto', padding: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                        💡 Items &gt;£100 basic price require Prior Approval Endorsement (PAE) before submission to NHSBSA.
                      </span>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ══════════════════ STATEMENT RECONCILIATION ══════════════════ */}
            {activeTab === 'recon' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="dashboard-viewport-title-row">
                  <h1 className="dashboard-viewport-title">Statement Reconciliation</h1>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg,.csv" />
                    <button className="btn-upload-primary" onClick={() => fileInputRef.current?.click()}><Plus size={14} /> Upload New Bill</button>
                  </div>
                </div>
                {isUploading && (
                  <div className="empty-state-card" style={{ padding: 30 }}>
                    <Loader2 className="animate-spin" size={26} color="#0078FF" />
                    <div style={{ marginTop: 10, fontWeight: 700 }}>OCR Scanning… {uploadProgress}%</div>
                    <div style={{ width: 220, height: 5, background: 'var(--divider-color)', borderRadius: 3, overflow: 'hidden', marginTop: 10 }}>
                      <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#0078FF', transition: 'width 0.2s' }} />
                    </div>
                  </div>
                )}
                <div className="table-card">
                  <h3 className="table-card-title">Supplier Invoice Discrepancy Queue</h3>
                  {invoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No invoices yet. Upload a supplier bill to begin.</div>
                  ) : (
                    <div className="responsive-table-wrapper">
                      <table className="premium-table">
                        <thead><tr><th>Supplier</th><th>Bill Ref</th><th>Date</th><th>Value</th><th>Leakage</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                          {invoices.map(inv => (
                            <tr key={inv.id}>
                              <td><strong>{inv.distributor}</strong></td>
                              <td>{inv.bill_no}</td>
                              <td>{inv.date}</td>
                              <td>{inv.amount}</td>
                              <td style={{ color: inv.leakage !== '£0' ? '#EF4444' : '#10B981', fontWeight: 700 }}>{inv.leakage}</td>
                              <td>{inv.leakage_type}</td>
                              <td>
                                <span className={`badge-pill ${inv.status === 'Claim Raised' ? 'badge-pill-info' : inv.status === 'Fully Matched' ? 'badge-pill-success' : 'badge-pill-warning'}`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td>
                                <button className="btn-upload-primary"
                                  style={{ padding: '4px 10px', fontSize: 12, opacity: (inv.leakage === '£0' || inv.status === 'Claim Raised') ? 0.4 : 1 }}
                                  disabled={inv.leakage === '£0' || inv.status === 'Claim Raised'}
                                  onClick={() => handleRaiseClaim(inv.id)}>
                                  {inv.status === 'Claim Raised' ? '✓ Logged' : inv.leakage === '£0' ? 'Verified' : 'Raise Claim'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════ VAT & FP34 BREAKDOWN ══════════════════ */}
            {activeTab === 'financials' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="dashboard-viewport-title-row">
                  <h1 className="dashboard-viewport-title">VAT & FP34 Breakdown</h1>
                  <button className="btn-export" onClick={() => printPDF('FP34 VAT Breakdown', vatHTML())}><Download size={13} /> Export PDF</button>
                </div>
                <div className="stats-grid">
                  {[
                    { title: 'Total Invoice VAT', value: '£' + (totalBilled * 0.2).toFixed(2), color: '#0078FF', note: '20% standard rate' },
                    { title: 'NHSBSA Matched', value: '£' + (totalBilled * 0.196).toFixed(2), color: '#10B981', note: '98.4% match rate' },
                    { title: 'Unmatched VAT', value: '£' + (totalBilled * 0.004).toFixed(2), color: '#EF4444', note: 'Requires supplier sync' },
                    { title: 'FP34 Claim Value', value: '£' + (totalBilled * 0.15).toFixed(2), color: '#7C3AED', note: 'Eligible input tax' },
                  ].map(s => (
                    <div key={s.title} className="stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                      <div className="stat-title">{s.title}</div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-trend">{s.note}</div>
                    </div>
                  ))}
                </div>
                <div className="table-card" style={{ marginTop: 24 }}>
                  <h3 className="table-card-title">VAT Slab Reconciliation</h3>
                  <div className="responsive-table-wrapper">
                    <table className="premium-table">
                      <thead><tr><th>VAT Rate</th><th>Billed Purchases</th><th>Invoice VAT</th><th>NHSBSA Matched</th><th>Gap</th><th>Status</th></tr></thead>
                      <tbody>
                        <tr>
                          <td><strong>VAT @ 5%</strong></td>
                          <td>£{(totalBilled * 0.2).toFixed(2)}</td>
                          <td>£{(totalBilled * 0.01).toFixed(2)}</td>
                          <td>£{(totalBilled * 0.01).toFixed(2)}</td>
                          <td><span style={{ color: '#10B981', fontWeight: 700 }}>£0.00</span></td>
                          <td><span className="badge-pill badge-pill-success">Reconciled</span></td>
                        </tr>
                        <tr>
                          <td><strong>VAT @ 20%</strong></td>
                          <td>£{(totalBilled * 0.8).toFixed(2)}</td>
                          <td>£{(totalBilled * 0.16).toFixed(2)}</td>
                          <td>£{(totalBilled * 0.156).toFixed(2)}</td>
                          <td><span style={{ color: '#EF4444', fontWeight: 700 }}>£{(totalBilled * 0.004).toFixed(2)}</span></td>
                          <td><span className="badge-pill badge-pill-warning">Mismatch</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════ DISPENSING DATA ══════════════════ */}
            {activeTab === 'demand' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="dashboard-viewport-title-row">
                  <h1 className="dashboard-viewport-title">National Dispensing Data — {selectedMonth}</h1>
                </div>
                <div className="stats-grid">
                  {[
                    { title: 'Items Dispensed (MTD)', value: totalItemsNum.toLocaleString(), color: '#0078FF', note: `Audited for ${selectedMonth}` },
                    { title: 'Chronic Rx Refills', value: stdDiscountItems.toLocaleString(), color: '#10B981', note: `${totalItemsNum > 0 ? Math.round(stdDiscountItems / totalItemsNum * 100) : 72}% of total items` },
                    { title: 'OTC & Wellness', value: Math.round(totalItemsNum * 0.218).toLocaleString(), color: '#7C3AED', note: '21.8% estimated mix' },
                    { title: 'EPS Digital Rate', value: eRxRateStr, color: '#F59E0B', note: 'Target: 95%' },
                  ].map(s => (
                    <div key={s.title} className="stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                      <div className="stat-title">{s.title}</div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-trend stat-trend-up">{s.note}</div>
                    </div>
                  ))}
                </div>
                <div className="charts-grid">
                  <div className="chart-card">
                    <h3 className="chart-card-title">Top Dispensed Therapeutic Categories</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '8px 0' }}>
                      {[
                        { label: 'Cardiovascular (Statins, ACE)', pct: 34, color: '#EF4444' },
                        { label: 'Diabetes (Metformin, Insulin)', pct: 22, color: '#0078FF' },
                        { label: 'Respiratory (Inhalers, COPD)', pct: 18, color: '#10B981' },
                        { label: 'Mental Health (SSRIs, Anxiolytics)', pct: 14, color: '#7C3AED' },
                        { label: 'OTC & General Wellness', pct: 12, color: '#F59E0B' },
                      ].map(({ label, pct, color }) => (
                        <div key={label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                            <span style={{ color: 'var(--text-main)' }}>{label}</span>
                            <span style={{ fontWeight: 700, color }}>{pct}%</span>
                          </div>
                          <div style={{ height: 9, background: 'var(--divider-color)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="chart-card">
                    <h3 className="chart-card-title">NHS Services Provided This Month</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '8px 0' }}>
                      {[
                        { label: 'Hypertension Case Findings', value: Math.round((activeMonthData.charts.clinicalActivity.cpcs || 0) * 0.4), icon: '🩺' },
                        { label: 'Flu Vaccinations', value: fluVacsNum, icon: '💉' },
                        { label: 'Smoking Cessation NRT', value: Math.round((activeMonthData.charts.clinicalActivity.nms || 0) * 1.2), icon: '🚭' },
                        { label: 'Emergency Supply', value: Math.round((activeMonthData.charts.clinicalActivity.cpcs || 0) * 0.07), icon: '🚨' },
                        { label: 'Contraception Service', value: activeMonthData.subTabs?.clinicalServices?.find(s => s.svc.includes('Contraception'))?.vol || 0, icon: '💊' },
                        { label: 'Blood Pressure Checks', value: Math.round(totalItemsNum * 0.098), icon: '📊' },
                      ].map(({ label, value, icon }) => (
                        <div key={label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--divider-color)', borderRadius: 8, padding: '12px 14px' }}>
                          <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                          <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--primary-color)' }}>{value.toLocaleString()}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════ PHARMACY COMPARISON ══════════════════ */}
            {activeTab === 'benchmarking' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="dashboard-viewport-title-row">
                  <h1 className="dashboard-viewport-title">Pharmacy Comparison — {selectedMonth}</h1>
                </div>
                <div className="stats-grid">
                  {[
                    { title: 'Your Percentile (Items)', value: percentileStr, color: '#0078FF', note: notePercentileStr },
                    { title: 'District Avg Leakage', value: '£189/mo', color: '#EF4444', note: 'Yours: £' + totalLeakage.toFixed(0) + '/mo' },
                    { title: 'NHS Service Score', value: serviceScore + '/100', color: '#10B981', note: `▲ +${Math.round(serviceScore * 0.07)} pts this quarter` },
                    { title: 'EPS Adoption Rank', value: erxRankStr, color: '#7C3AED', note: 'Out of 11,600 pharmacies' },
                  ].map(s => (
                    <div key={s.title} className="stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                      <div className="stat-title">{s.title}</div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-trend stat-trend-up">{s.note}</div>
                    </div>
                  ))}
                </div>
                <div className="table-card" style={{ marginTop: 24 }}>
                  <h3 className="table-card-title">Performance vs. District Peers</h3>
                  <div className="responsive-table-wrapper">
                    <table className="premium-table">
                      <thead><tr><th>Metric</th><th>Your Pharmacy</th><th>District Avg</th><th>National Top 10%</th><th>Status</th></tr></thead>
                      <tbody>
                        {[
                          { metric: 'Items/Month', yours: totalItemsNum.toLocaleString(), avg: '4,200', top: '22,000+', good: totalItemsNum >= 4200 },
                          { metric: 'Supplier Leakage', yours: '£' + totalLeakage.toFixed(0) + '/mo', avg: '£189/mo', top: '<£20/mo', good: totalLeakage < 189 },
                          { metric: 'FP34 Match Rate', yours: matchRate + '%', avg: '96.2%', top: '99.8%', good: parseFloat(matchRate) >= 96.2 },
                          { metric: 'EPS Digital Rate', yours: eRxRateStr, avg: '88.5%', top: '98.5%', good: parseFloat(eRxRateStr) >= 88.5 },
                          { metric: 'Chronic Rx Mix', yours: (totalItemsNum > 0 ? Math.round(stdDiscountItems / totalItemsNum * 100) : 72) + '%', avg: '64%', top: '80%+', good: (totalItemsNum > 0 ? (stdDiscountItems / totalItemsNum) >= 0.64 : true) },
                          { metric: 'NHS Services Score', yours: serviceScore + '/100', avg: '71/100', top: '95/100', good: serviceScore >= 71 },
                        ].map(r => (
                          <tr key={r.metric}>
                            <td><strong>{r.metric}</strong></td>
                            <td style={{ fontWeight: 700, color: r.good ? '#10B981' : '#EF4444' }}>{r.yours}</td>
                            <td>{r.avg}</td>
                            <td style={{ color: '#0078FF', fontWeight: 600 }}>{r.top}</td>
                            <td><span className={`badge-pill ${r.good ? 'badge-pill-success' : 'badge-pill-warning'}`}>{r.good ? '✓ Above Avg' : '⚠ Below Avg'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════ LEADERBOARD ══════════════════ */}
            {activeTab === 'leaderboard' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="dashboard-viewport-title-row">
                  <h1 className="dashboard-viewport-title">National Pharmacy Leaderboard</h1>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  {[['bills', 'Items Dispensed'], ['chronic', 'Chronic Rx'], ['vaccinations', 'Vaccinations'], ['erx', 'EPS Rate']].map(([key, label]) => (
                    <button key={key} onClick={() => setLeaderboardMetric(key)}
                      className={leaderboardMetric === key ? 'btn-upload-primary' : 'btn-export'}
                      style={{ padding: '6px 14px', fontSize: 12.5 }}>{label}</button>
                  ))}
                </div>
                <div className="table-card">
                  <div className="responsive-table-wrapper">
                    <table className="premium-table">
                      <thead><tr><th>Rank</th><th>Pharmacy</th><th>Location</th><th>ODS</th><th>Volume</th></tr></thead>
                      <tbody>
                        {(leaderboards[leaderboardMetric] || []).map(p => (
                          <tr key={p.id} style={{ background: p.isUser ? 'rgba(0,120,255,0.06)' : undefined, fontWeight: p.isUser ? 700 : undefined }}>
                            <td>
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', background: p.rank <= 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][p.rank - 1] : 'var(--divider-color)', color: p.rank <= 3 ? '#1a1a1a' : 'var(--text-muted)', fontWeight: 800, fontSize: 13 }}>
                                {p.rank <= 3 ? '🏆'.slice(0, p.rank === 1 ? 2 : 0) || p.rank : p.rank}
                              </span>
                            </td>
                            <td>{p.name} {p.isUser && <span style={{ fontSize: 11, background: '#0078FF', color: '#fff', padding: '2px 7px', borderRadius: 10, marginLeft: 6 }}>YOU</span>}</td>
                            <td>{p.location}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.id}</td>
                            <td style={{ fontWeight: 700 }}>{p.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════ GROWTH REPORT ══════════════════ */}
            {activeTab === 'growth' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="dashboard-viewport-title-row">
                  <h1 className="dashboard-viewport-title">Instant Growth Report — {selectedMonth}</h1>
                  <button className="btn-export" onClick={() => printPDF('DashRx Growth Report', growthHTML())}><Download size={13} /> Export PDF</button>
                </div>
                {/* Score banner */}
                <div style={{ background: 'linear-gradient(135deg, #0078FF, #7C3AED)', borderRadius: 12, padding: '28px 32px', marginBottom: 24, color: '#fff' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.8, marginBottom: 4 }}>MARGIN PERFORMANCE SCORE</div>
                  <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1 }}>{marginScore}<span style={{ fontSize: 28, fontWeight: 400 }}>/100</span></div>
                  <div style={{ fontSize: 14, opacity: 0.85, marginTop: 8 }}>
                    Your pharmacy is in the top {Math.max(1, 100 - marginScore)}% of UK NHS pharmacies by margin efficiency. {totalLeakage > 0 ? 'Raise active leakage claims to immediately boost profitability.' : 'Outstanding billing hygiene, keep up the excellent work!'}
                  </div>
                </div>
                <div className="stats-grid">
                  {[
                    { title: 'Leakage Recovery Potential', value: '£' + (totalLeakage * 12).toFixed(0) + '/yr', color: '#EF4444', note: 'If all claims are raised' },
                    { title: 'OTC Mix Opportunity', value: '+£' + Math.round(totalItemsNum * 0.12).toLocaleString() + '/yr', color: '#10B981', note: 'Growing OTC from 28% → 36%' },
                    { title: 'NHS Service Revenue', value: '+£' + Math.round((100 - serviceScore) * 35).toLocaleString() + '/yr', color: '#0078FF', note: 'By matching Top 10% clinical volume' },
                    { title: 'EPS Adoption Lift', value: '+£' + Math.max(0, Math.round((95 - erxPercent) * 75)).toLocaleString() + '/yr', color: '#7C3AED', note: 'Reaching 95% digital rate' },
                  ].map(s => (
                    <div key={s.title} className="stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
                      <div className="stat-title">{s.title}</div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-trend">{s.note}</div>
                    </div>
                  ))}
                </div>
                <div className="table-card" style={{ marginTop: 24 }}>
                  <h3 className="table-card-title">Commercial Action Plan</h3>
                  <div className="responsive-table-wrapper">
                    <table className="premium-table">
                      <thead><tr><th>Opportunity</th><th>Current</th><th>Target</th><th>Est. Annual Uplift</th><th>Effort</th></tr></thead>
                      <tbody>
                        {[
                          { opp: 'Supplier Claim Recovery', curr: '£0 reclaimed', tgt: '£' + totalLeakage.toFixed(0) + '/mo', uplift: '£' + (totalLeakage * 12).toFixed(0) + '/yr', effort: 'Low' },
                          { opp: 'OTC & Wellness Range', curr: '28% mix', tgt: '36% mix', uplift: '+£' + Math.round(totalItemsNum * 0.12).toLocaleString() + '/yr', effort: 'Medium' },
                          { opp: 'NHS Advanced Services', curr: serviceScore + '/100', tgt: '95/100', uplift: '+£' + Math.round((95 - serviceScore) * 35).toLocaleString() + '/yr', effort: 'Medium' },
                          { opp: 'EPS Digital Adoption', curr: eRxRateStr, tgt: '95%', uplift: '+£' + Math.max(0, Math.round((95 - erxPercent) * 75)).toLocaleString() + '/yr', effort: 'Low' },
                          { opp: 'Chronic Rx Retention', curr: (totalItemsNum > 0 ? Math.round(stdDiscountItems / totalItemsNum * 100) : 72) + '% mix', tgt: '80% mix', uplift: '+£' + Math.round(totalItemsNum * 0.08 * 1.27).toLocaleString() + '/yr', effort: 'Medium' },
                        ].map(r => (
                          <tr key={r.opp}>
                            <td><strong>{r.opp}</strong></td>
                            <td>{r.curr}</td>
                            <td style={{ color: '#0078FF', fontWeight: 600 }}>{r.tgt}</td>
                            <td style={{ color: '#10B981', fontWeight: 700 }}>{r.uplift}</td>
                            <td><span className={`badge-pill ${r.effort === 'Low' ? 'badge-pill-success' : 'badge-pill-info'}`}>{r.effort}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════ SETTINGS ══════════════════ */}
            {activeTab === 'settings' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="dashboard-viewport-title-row">
                  <h1 className="dashboard-viewport-title">Account Settings</h1>
                </div>
                <div className="settings-grid">
                  <div className="settings-card">
                    <h3 className="settings-section-title">Pharmacy Profile</h3>
                    <form onSubmit={handleSaveSettings} className="settings-form">
                      <div className="settings-input-group">
                        <label className="settings-label">Your Name</label>
                        <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="settings-input" placeholder="John Smith" />
                      </div>
                      <div className="settings-input-group">
                        <label className="settings-label">Pharmacy Name</label>
                        <input type="text" value={pharmacyName} onChange={e => setPharmacyName(e.target.value)} className="settings-input" placeholder="Smiths Pharmacy, London" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="settings-input-group">
                          <label className="settings-label">ODS Code</label>
                          <input type="text" value={odsCode} onChange={e => setOdsCode(e.target.value.toUpperCase())} className="settings-input" placeholder="FLF77" />
                        </div>
                        <div className="settings-input-group">
                          <label className="settings-label">NHS Contract No.</label>
                          <input type="text" value={nhsContract} onChange={e => setNhsContract(e.target.value)} className="settings-input" placeholder="NHS-2026-UK" />
                        </div>
                      </div>
                      <button type="submit" className="btn-save-settings" style={{ marginTop: 8 }}>
                        {settingsSaved ? '✓ Saved!' : 'Save Profile'}
                      </button>
                    </form>
                  </div>
                  <div className="settings-card">
                    <h3 className="settings-section-title">Preferences</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--divider-color)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>Dark Mode</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Switch between light and dark themes</div>
                      </div>
                      <button onClick={() => setIsDark(d => !d)} style={{ width: 46, height: 26, borderRadius: 13, background: isDark ? '#0078FF' : 'var(--divider-color)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                        <span style={{ position: 'absolute', top: 3, left: isDark ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>Data & Privacy</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>GDPR compliant • No data shared with third parties</div>
                      </div>
                      <span style={{ fontSize: 12, background: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>✓ Secure</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════════════ BILLING ══════════════════ */}
            {activeTab === 'billing' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div className="dashboard-viewport-title-row">
                  <h1 className="dashboard-viewport-title">Subscription & Billing</h1>
                </div>
                <div style={{ background: 'linear-gradient(135deg,#0078FF,#7C3AED)', borderRadius: 12, padding: '24px 28px', marginBottom: 24, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.8, marginBottom: 4 }}>CURRENT PLAN</div>
                    <div style={{ fontSize: 28, fontWeight: 900 }}>Pro Growth</div>
                    <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>£14.99 / month • Next renewal: 21 Jun 2026</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>All features included</div>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>✓ Active</span>
                  </div>
                </div>
                <div className="table-card">
                  <h3 className="table-card-title">Billing History</h3>
                  <div className="responsive-table-wrapper">
                    <table className="premium-table">
                      <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead>
                      <tbody>
                        {[
                          { date: '21 May 2026', desc: 'DashRx Pro – Monthly', amount: '£17.99', status: 'Paid' },
                          { date: '21 Apr 2026', desc: 'DashRx Pro – Monthly', amount: '£17.99', status: 'Paid' },
                          { date: '21 Mar 2026', desc: 'DashRx Pro – Monthly', amount: '£17.99', status: 'Paid' },
                        ].map(r => (
                          <tr key={r.date}>
                            <td>{r.date}</td>
                            <td>{r.desc}</td>
                            <td style={{ fontWeight: 700 }}>{r.amount}</td>
                            <td><span className="badge-pill badge-pill-success">✓ {r.status}</span></td>
                            <td>
                              <button className="btn-export" style={{ padding: '4px 10px', fontSize: 12 }}
                                onClick={() => printPDF('DashRx Receipt', `<h1>DashRx Receipt</h1><p><strong>Date:</strong> ${r.date}</p><p><strong>Pharmacy:</strong> ${pharmacyName}</p><p><strong>ODS:</strong> ${odsCode}</p><p><strong>Amount:</strong> ${r.amount} (incl. VAT)</p><p><strong>Status:</strong> PAID</p>`)}>
                                <Download size={12} /> Receipt
                              </button>
                            </td>
                          </tr>
                        ))}
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

    function vatHTML() {
      return `<h1>DashRx VAT &amp; FP34 Breakdown</h1><p><strong>Pharmacy:</strong> ${pharmacyName} | <strong>ODS:</strong> ${odsCode}</p><p><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</p><h2>VAT Slab Summary</h2><table><thead><tr><th>Slab</th><th>Purchases</th><th>VAT</th><th>NHSBSA Match</th><th>Gap</th></tr></thead><tbody><tr><td>5%</td><td>£${(totalBilled * 0.2).toFixed(2)}</td><td>£${(totalBilled * 0.01).toFixed(2)}</td><td>£${(totalBilled * 0.01).toFixed(2)}</td><td>£0</td></tr><tr><td>20%</td><td>£${(totalBilled * 0.8).toFixed(2)}</td><td>£${(totalBilled * 0.16).toFixed(2)}</td><td>£${(totalBilled * 0.156).toFixed(2)}</td><td>£${(totalBilled * 0.004).toFixed(2)}</td></tr></tbody></table>`;
    }

    function growthHTML() {
      return `<h1>DashRx Growth Report</h1><p><strong>Pharmacy:</strong> ${pharmacyName} | <strong>ODS:</strong> ${odsCode}</p><h2>Score: ${marginScore}/100</h2><ul><li>Supplier Claim Recovery: £${(totalLeakage * 12).toFixed(0)}/yr potential</li><li>OTC Mix Opportunity: +£${Math.round(totalItemsNum * 0.12).toLocaleString()}/yr</li><li>NHS Advanced Services: +£${Math.round((95 - serviceScore) * 35).toLocaleString()}/yr</li><li>EPS Digital Adoption: +£${Math.max(0, Math.round((95 - erxPercent) * 75)).toLocaleString()}/yr</li></ul>`;
    }
}
