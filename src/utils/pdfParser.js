/**
 * DashRx PDF Parser
 * Uses PDF.js (loaded from CDN) to extract text from FP34 NHS Schedule PDFs
 * and parse them into structured data for the dashboard charts.
 */

let pdfjsLib = null;

/**
 * Lazily load PDF.js from CDN once.
 */
async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;

  return new Promise((resolve, reject) => {
    // Check if already loaded via window
    if (window.pdfjsLib) {
      pdfjsLib = window.pdfjsLib;
      resolve(pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      pdfjsLib = window.pdfjsLib;
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js from CDN'));
    document.head.appendChild(script);
  });
}

/**
 * Extract all text content from a PDF File object.
 * Returns a single string with all pages concatenated.
 */
async function extractTextFromPDF(file) {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}

/**
 * Clean a currency string and return a float value.
 * e.g. "£44,065.86" → 44065.86
 */
function parseCurrency(str) {
  if (!str) return null;
  const cleaned = str.replace(/[£,\s]/g, '').replace(/\(([^)]+)\)/, '-$1');
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

/**
 * Find a numeric value near a keyword in text.
 * Searches forward from keyword position.
 */
function findValueNear(text, keyword, searchForward = 150) {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(keyword.toLowerCase());
  if (idx === -1) return null;

  const slice = text.slice(idx, idx + searchForward);
  // Match currency patterns: £44,065.86 or 44,065.86 or -£53,095.90
  const matches = slice.match(/[-]?\s*£?\s*([\d,]+\.?\d*)/g);
  if (!matches || matches.length === 0) return null;

  for (const m of matches) {
    const val = parseCurrency(m);
    if (val !== null && Math.abs(val) > 0) return val;
  }
  return null;
}

/**
 * Find all numeric values near a keyword.
 */
function findAllValuesNear(text, keyword, searchForward = 200) {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(keyword.toLowerCase());
  if (idx === -1) return [];

  const slice = text.slice(idx, idx + searchForward);
  const matches = slice.match(/[-]?\s*£?\s*([\d,]+\.?\d*)/g) || [];
  return matches.map(m => parseCurrency(m)).filter(v => v !== null);
}

/**
 * Parse month/year from text.
 * Looks for patterns like "June 2023", "Jun 2023", "06/2023", etc.
 */
function parseMonthYear(text) {
  const monthsMap = {
    january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr',
    may: 'May', june: 'Jun', july: 'Jul', august: 'Aug',
    september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec',
    jan: 'Jan', feb: 'Feb', mar: 'Mar', apr: 'Apr',
    jun: 'Jun', jul: 'Jul', aug: 'Aug',
    sep: 'Sep', oct: 'Oct', nov: 'Nov', dec: 'Dec'
  };

  // Try "Month YYYY" pattern
  const longMatch = text.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(20\d{2})\b/i);
  if (longMatch) {
    const abbrev = monthsMap[longMatch[1].toLowerCase()];
    return `${abbrev} ${longMatch[2]}`;
  }

  // Try "Mon YYYY" pattern
  const shortMatch = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(20\d{2})\b/i);
  if (shortMatch) {
    const abbrev = monthsMap[shortMatch[1].toLowerCase()];
    return `${abbrev} ${shortMatch[2]}`;
  }

  // Try "MM/YYYY" pattern
  const numMatch = text.match(/\b(0[1-9]|1[0-2])\/(20\d{2})\b/);
  if (numMatch) {
    const monthIdx = parseInt(numMatch[1]) - 1;
    const abbrevs = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${abbrevs[monthIdx]} ${numMatch[2]}`;
  }

  return null;
}

/**
 * Main FP34 PDF parser.
 * Extracts all key financial values from the NHS NHSBSA FP34 Schedule of Payments.
 *
 * @param {File} file - The uploaded PDF file
 * @returns {Object} Parsed FP34 data object compatible with generateCompleteFP34Data()
 */
export async function parseFP34PDF(file) {
  const text = await extractTextFromPDF(file);

  // ── Month Detection ──────────────────────────────────────────────────────────
  const month = parseMonthYear(text) || parseMonthYear(file.name);

  // ── Drug & Appliance Costs ────────────────────────────────────────────────────
  const drugCosts =
    findValueNear(text, 'drug and appliance costs') ||
    findValueNear(text, 'drug & appliance costs') ||
    findValueNear(text, 'basic prices') ||
    findValueNear(text, 'drug costs');

  // ── Fees Earned ───────────────────────────────────────────────────────────────
  const feesEarned =
    findValueNear(text, 'total fees') ||
    findValueNear(text, 'fees earned') ||
    findValueNear(text, 'pharmacy fees');

  // ── Total of Account ─────────────────────────────────────────────────────────
  const totalAccount =
    findValueNear(text, 'total of account') ||
    findValueNear(text, 'total account');

  // ── Advance Recovery ─────────────────────────────────────────────────────────
  const advanceRecovery =
    findValueNear(text, 'advance recovery') ||
    findValueNear(text, 'advance payment recovery') ||
    findValueNear(text, 'recovery');

  // ── Net Payment ──────────────────────────────────────────────────────────────
  const netPayment =
    findValueNear(text, 'net payment made') ||
    findValueNear(text, 'net payment') ||
    findValueNear(text, 'bacs payment');

  // ── Volume Metrics ────────────────────────────────────────────────────────────
  const totalItemsRaw =
    findValueNear(text, 'total items') ||
    findValueNear(text, 'items dispensed') ||
    findValueNear(text, 'number of items');
  const totalItems = totalItemsRaw ? Math.round(Math.abs(totalItemsRaw)) : null;

  const rxFormsRaw =
    findValueNear(text, 'prescription forms') ||
    findValueNear(text, 'rx forms') ||
    findValueNear(text, 'number of forms');
  const rxForms = rxFormsRaw ? Math.round(Math.abs(rxFormsRaw)) : null;

  const eRxFormsRaw =
    findValueNear(text, 'electronic prescription') ||
    findValueNear(text, 'eps forms') ||
    findValueNear(text, 'e-rx');
  const eRxForms = eRxFormsRaw ? Math.round(Math.abs(eRxFormsRaw)) : null;

  // ── Clinical Services ─────────────────────────────────────────────────────────
  const nms =
    findValueNear(text, 'new medicine service') ||
    findValueNear(text, 'nms') ;

  const cpcs =
    findValueNear(text, 'cpcs') ||
    findValueNear(text, 'community pharmacist consultation') ||
    findValueNear(text, 'urgent supply');

  const fluVacs =
    findValueNear(text, 'flu vaccination') ||
    findValueNear(text, 'influenza vaccination') ||
    findValueNear(text, 'flu jab');

  const covidVacs =
    findValueNear(text, 'covid') ||
    findValueNear(text, 'covid-19 vaccination') ||
    findValueNear(text, 'coronavirus vaccination');

  // ── Charges / Discounts ────────────────────────────────────────────────────────
  const charges =
    findValueNear(text, 'charges') ||
    findValueNear(text, 'patient charges') ||
    findValueNear(text, 'prescription charges');

  // ── Average Item Value ──────────────────────────────────────────────────────────
  let avgItemValue = null;
  if (drugCosts && totalItems && totalItems > 0) {
    avgItemValue = drugCosts / totalItems;
  }

  // ── Build result ─────────────────────────────────────────────────────────────
  const result = {
    month: month || undefined,
    _rawText: text.slice(0, 2000), // First 2000 chars for debugging
    _extractedFields: {
      drugCosts, feesEarned, totalAccount, advanceRecovery, netPayment,
      totalItems, rxForms, eRxForms, nms, cpcs, fluVacs, covidVacs,
      charges, avgItemValue
    }
  };

  // Convert to the format expected by generateCompleteFP34Data overrides
  if (drugCosts) result.drugCosts = drugCosts / 1000; // Convert to K
  if (feesEarned) result.feesEarned = feesEarned / 1000;
  if (totalItems) result.totalItems = totalItems;
  if (rxForms) result.rxForms = rxForms;
  if (eRxForms) result.eRxForms = eRxForms;
  if (nms) result.nms = Math.round(Math.abs(nms));
  if (cpcs) result.cpcs = Math.round(Math.abs(cpcs));
  if (fluVacs) result.fluVacs = Math.round(Math.abs(fluVacs));
  if (covidVacs) result.covidVacs = Math.round(Math.abs(covidVacs));
  if (avgItemValue) result.avgItemValue = avgItemValue;
  if (charges) result.charges = charges;
  if (totalAccount) result.totalAccount = totalAccount;
  if (advanceRecovery) result.advanceRecovery = advanceRecovery;
  if (netPayment) result.netPayment = netPayment;

  return result;
}

/**
 * Count how many fields were successfully extracted.
 */
export function getExtractionConfidence(parsedData) {
  const fields = parsedData._extractedFields || {};
  const extracted = Object.values(fields).filter(v => v !== null && v !== undefined).length;
  const total = Object.keys(fields).length;
  return {
    extracted,
    total,
    percent: Math.round((extracted / total) * 100),
    hasMonth: !!parsedData.month,
    hasDrugCosts: !!fields.drugCosts,
    hasItems: !!fields.totalItems,
    hasFees: !!fields.feesEarned,
  };
}
