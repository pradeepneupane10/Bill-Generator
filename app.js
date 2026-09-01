/**
 * Nepal Petrol Bill - Multi-Template Tax Invoice Generator (Himal & Banglamukhi)
 */

// Fuel Presets Database
const FUEL_PRESETS = {
  Petrol: { hscode: '2710.12.10', name: 'Petrol', nameCaps: 'PETROL', defaultRate: 200.00 },
  Diesel: { hscode: '2710.19.10', name: 'Diesel', nameCaps: 'DIESEL', defaultRate: 165.00 },
  'Auto LPG': { hscode: '2711.12.00', name: 'Auto LPG', nameCaps: 'AUTO LPG', defaultRate: 140.00 },
  Custom: { hscode: '', name: 'Fuel', nameCaps: 'FUEL', defaultRate: 200.00 }
};

// Preset Templates
const TEMPLATES = {
  himal: {
    name: 'Himal Enterprises',
    stationName: 'HIMAL ENTERPRISES',
    stationAddress: 'CHA.NA. PA-06, CHECKPOST, KATHMANDU',
    stationPhone: '',
    stationEmail: 'himalenterprises2021@gmail.com',
    stationPan: '500011548',
    invNumber: '848',
    buyerName: 'CASH( C. G. Communications Ltd.)',
    buyerPan: '301512183',
    buyerAddress: '',
    buyerMobile: '',
    vehicleNo: '',
    invoiceDate: '08/08/2026',
    invoiceMiti: '2083/4/23',
    invoiceTime: '2026-08-08 13:47:44',
    preparedByName: 'Administrator Admin',
    paperTheme: 'pink'
  },
  banglamukhi: {
    name: 'Banglamukhi Oil Store',
    stationName: 'BANGLAMUKHI OIL STORE PRIVATE LIMITED',
    stationAddress: 'Sanobhadyang, Kathmandu',
    stationPhone: '9745694481',
    stationEmail: 'Bangalamukhioilstore@gmail.com',
    stationPan: '610152898',
    invNumber: 'TI681-MMX-83/84',
    buyerName: 'CG Communications',
    buyerPan: '301512183',
    buyerAddress: 'Thapathali, Kathmandu',
    buyerMobile: '9707051000',
    vehicleNo: '',
    paymentMode: 'cash',
    dueDate: '0 Days',
    invoiceDate: '31/08/2026',
    invoiceMiti: '15/05/2083 09:41',
    invoiceTime: '2026-08-31 09:41:00',
    preparedByName: '',
    paperTheme: 'white'
  }
};

// Global State
const state = {
  template: 'himal', // 'himal' or 'banglamukhi'
  fuelType: 'Petrol',
  hscode: '2710.12.10',
  particulars: 'Petrol',
  particularsCaps: 'PETROL',
  retailRate: 200.00, // NPR per Liter inclusive of 13% VAT
  baseRate: 176.99115044, // Rate exclusive of VAT (retailRate / 1.13)
  calcMode: 'qty', // 'qty' or 'amount'
  qty: 10.00,
  unit: 'LTRS',
  discount: 0.00,
  basicAmount: 1769.91,
  taxableAmount: 1769.91,
  vatAmount: 230.09,
  netAmount: 2000.00,
  layout: 'landscape-2up',
  copyTagMode: 'none',
  // Metadata
  invNumber: '848',
  buyerName: 'CASH( C. G. Communications Ltd.)',
  buyerPan: '301512183',
  vehicleNo: '',
  buyerAddress: '',
  buyerMobile: '',
  paymentMode: 'cash',
  dueDate: '0 Days',
  invoiceDate: '08/08/2026',
  invoiceMiti: '2083/4/23',
  invoiceTime: '2026-08-08 13:47:44',
  preparedByName: 'Administrator Admin',
  stationName: 'HIMAL ENTERPRISES',
  stationAddress: 'CHA.NA. PA-06, CHECKPOST, KATHMANDU',
  stationEmail: 'himalenterprises2021@gmail.com',
  stationPhone: '',
  stationPan: '500011548',
  remarks: ''
};

// Format Number with commas
function formatCurrency(val, decimals = 2) {
  if (isNaN(val) || val === null) return '0.00';
  const parts = Number(val).toFixed(decimals).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// Convert Number to Words (Nepal Standard)
function numberToWords(amount, allCaps = false) {
  if (isNaN(amount) || amount <= 0) return allCaps ? 'NRS ZERO ONLY' : 'NRS Zero And Zero Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n) {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  }

  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paisa = Math.round((rounded - rupees) * 100);

  let rupeesStr = '';
  let temp = rupees;

  if (temp >= 10000000) {
    rupeesStr += convertGroup(Math.floor(temp / 10000000)) + ' Crore ';
    temp %= 10000000;
  }
  if (temp >= 100000) {
    rupeesStr += convertGroup(Math.floor(temp / 100000)) + ' Lakh ';
    temp %= 100000;
  }
  if (temp >= 1000) {
    rupeesStr += convertGroup(Math.floor(temp / 1000)) + ' Thousand ';
    temp %= 1000;
  }
  if (temp > 0) {
    rupeesStr += convertGroup(temp);
  }

  rupeesStr = rupeesStr.trim() || 'Zero';

  let words = '';
  if (allCaps) {
    words = `${rupeesStr.toUpperCase()}`;
    if (paisa > 0) {
      words += ` AND ${convertGroup(paisa).toUpperCase()} PAISA ONLY`;
    } else {
      words += ' ONLY';
    }
  } else {
    words = `NRS ${rupeesStr}`;
    if (paisa > 0) {
      words += ` And ${convertGroup(paisa)} Paisa Only`;
    } else {
      words += ' And Zero Only';
    }
  }

  return words;
}

// Perform calculations
function recalculate(source = 'qty') {
  const vatRate = 0.13;
  const retail = parseFloat(state.retailRate) || 0;
  
  // Base Rate before 13% VAT
  state.baseRate = retail > 0 ? (retail / 1.13) : 0;

  if (state.calcMode === 'amount' && source === 'amount') {
    const targetNet = parseFloat(document.getElementById('inputTotalAmount').value) || 0;
    state.netAmount = targetNet;
    state.taxableAmount = targetNet / 1.13;
    state.vatAmount = targetNet - state.taxableAmount;
    state.discount = parseFloat(document.getElementById('inputDiscount').value) || 0;
    state.basicAmount = state.taxableAmount + state.discount;
    state.qty = state.baseRate > 0 ? (state.basicAmount / state.baseRate) : 0;

    document.getElementById('inputQty').value = state.qty.toFixed(3);
  } else {
    const qty = parseFloat(document.getElementById('inputQty').value) || 0;
    state.qty = qty;
    state.discount = parseFloat(document.getElementById('inputDiscount').value) || 0;
    
    state.basicAmount = qty * state.baseRate;
    state.taxableAmount = Math.max(0, state.basicAmount - state.discount);
    state.vatAmount = state.taxableAmount * vatRate;
    state.netAmount = state.taxableAmount + state.vatAmount;

    document.getElementById('inputTotalAmount').value = state.netAmount.toFixed(2);
  }

  updateAllUI();
}

// Render 9 Boxed PAN digits
function renderPanBoxes(panNumber) {
  const clean = String(panNumber || '').replace(/\D/g, '').padEnd(9, ' ');
  let html = '';
  for (let i = 0; i < 9; i++) {
    const ch = clean[i] || '&nbsp;';
    html += `<div class="b-pan-box">${ch}</div>`;
  }
  const box1 = document.getElementById('stationPanBoxes1');
  const box2 = document.getElementById('stationPanBoxes2');
  if (box1) box1.innerHTML = html;
  if (box2) box2.innerHTML = html;
}

// Update all UI elements
function updateAllUI() {
  document.getElementById('calculatedBaseRate').textContent = state.baseRate.toFixed(4);

  // Sync state to all elements with data-sync
  document.querySelectorAll('[data-sync="stationName"]').forEach(el => el.textContent = state.stationName);
  document.querySelectorAll('[data-sync="stationAddress"]').forEach(el => el.textContent = state.stationAddress);
  document.querySelectorAll('[data-sync="stationPhone"]').forEach(el => el.textContent = state.stationPhone);
  document.querySelectorAll('[data-sync="stationEmail"]').forEach(el => el.textContent = state.stationEmail);
  document.querySelectorAll('[data-sync="stationPan"]').forEach(el => el.textContent = state.stationPan);

  document.querySelectorAll('[data-sync="invNo"]').forEach(el => el.textContent = state.invNumber);
  document.querySelectorAll('[data-sync="buyer"]').forEach(el => el.textContent = state.buyerName);
  document.querySelectorAll('[data-sync="pan"]').forEach(el => el.textContent = state.buyerPan);
  document.querySelectorAll('[data-sync="address"]').forEach(el => el.textContent = state.buyerAddress);
  document.querySelectorAll('[data-sync="vehicle"]').forEach(el => el.textContent = state.vehicleNo);
  document.querySelectorAll('[data-sync="paymentMode"]').forEach(el => el.textContent = state.paymentMode);
  document.querySelectorAll('[data-sync="dueDate"]').forEach(el => el.textContent = state.dueDate);
  document.querySelectorAll('[data-sync="date"]').forEach(el => el.textContent = state.invoiceDate);
  document.querySelectorAll('[data-sync="miti"]').forEach(el => el.textContent = state.invoiceMiti);
  document.querySelectorAll('[data-sync="buyerMobile"]').forEach(el => el.textContent = state.buyerMobile);

  document.querySelectorAll('[data-sync="hscode"]').forEach(el => el.textContent = state.hscode);
  document.querySelectorAll('[data-sync="particulars"]').forEach(el => {
    el.textContent = state.template === 'banglamukhi' ? (state.particularsCaps || state.particulars.toUpperCase()) : state.particulars;
  });
  document.querySelectorAll('[data-sync="qty"]').forEach(el => {
    el.textContent = state.template === 'banglamukhi' ? state.qty.toFixed(3) : state.qty.toFixed(2);
  });
  document.querySelectorAll('[data-sync="unit"]').forEach(el => el.textContent = state.unit);
  document.querySelectorAll('[data-sync="rate"]').forEach(el => {
    el.textContent = state.template === 'banglamukhi' ? state.baseRate.toFixed(2) : state.baseRate.toFixed(4);
  });
  document.querySelectorAll('[data-sync="disc"]').forEach(el => el.textContent = state.discount > 0 ? state.discount.toFixed(2) : '0.00');
  document.querySelectorAll('[data-sync="itemAmount"]').forEach(el => el.textContent = formatCurrency(state.basicAmount));

  document.querySelectorAll('[data-sync="totalQty"]').forEach(el => {
    el.textContent = state.template === 'banglamukhi' ? state.qty.toFixed(3) : state.qty.toFixed(2);
  });
  document.querySelectorAll('[data-sync="tableTotalAmount"]').forEach(el => el.textContent = formatCurrency(state.basicAmount));

  document.querySelectorAll('[data-sync="inWords"]').forEach(el => el.textContent = numberToWords(state.netAmount, false));
  document.querySelectorAll('[data-sync="inWordsCaps"]').forEach(el => el.textContent = numberToWords(state.netAmount, true));
  document.querySelectorAll('[data-sync="remarks"]').forEach(el => el.textContent = state.remarks);

  document.querySelectorAll('[data-sync="basicAmount"]').forEach(el => el.textContent = formatCurrency(state.basicAmount));
  document.querySelectorAll('[data-sync="discountAmount"]').forEach(el => el.textContent = state.discount > 0 ? formatCurrency(state.discount) : '0.00');
  document.querySelectorAll('[data-sync="taxableAmount"]').forEach(el => el.textContent = formatCurrency(state.taxableAmount));
  document.querySelectorAll('[data-sync="vatAmount"]').forEach(el => el.textContent = formatCurrency(state.vatAmount));
  document.querySelectorAll('[data-sync="netAmount"]').forEach(el => el.textContent = formatCurrency(state.netAmount));

  document.querySelectorAll('[data-sync="generatedTime"]').forEach(el => el.textContent = state.invoiceTime);
  document.querySelectorAll('[data-sync="preparedByName"]').forEach(el => el.textContent = state.preparedByName);

  renderPanBoxes(state.stationPan);
  updateCopyTags();
}

function updateCopyTags() {
  const tag1 = document.getElementById('copyTag1');
  const tag2 = document.getElementById('copyTag2');
  if (state.copyTagMode === 'copies') {
    tag1.textContent = '[ CUSTOMER COPY ]';
    tag2.textContent = '[ OFFICE COPY ]';
  } else if (state.copyTagMode === 'custom') {
    tag1.textContent = '[ ORIGINAL ]';
    tag2.textContent = '[ DUPLICATE ]';
  } else {
    tag1.textContent = '';
    tag2.textContent = '';
  }
}

// Switch between templates (Himal vs Banglamukhi)
function switchTemplate(tplKey) {
  state.template = tplKey;
  const printSheet = document.getElementById('printSheet');
  
  if (tplKey === 'banglamukhi') {
    printSheet.classList.remove('format-himal');
    printSheet.classList.add('format-banglamukhi');
    loadTemplateDefaults(TEMPLATES.banglamukhi);
  } else {
    printSheet.classList.remove('format-banglamukhi');
    printSheet.classList.add('format-himal');
    loadTemplateDefaults(TEMPLATES.himal);
  }

  recalculate();
}

function loadTemplateDefaults(tpl) {
  state.stationName = tpl.stationName;
  state.stationAddress = tpl.stationAddress;
  state.stationPhone = tpl.stationPhone;
  state.stationEmail = tpl.stationEmail;
  state.stationPan = tpl.stationPan;
  state.invNumber = tpl.invNumber;
  state.buyerName = tpl.buyerName;
  state.buyerPan = tpl.buyerPan;
  state.buyerAddress = tpl.buyerAddress;
  state.buyerMobile = tpl.buyerMobile;
  state.vehicleNo = tpl.vehicleNo;
  state.invoiceDate = tpl.invoiceDate;
  state.invoiceMiti = tpl.invoiceMiti;
  state.invoiceTime = tpl.invoiceTime;
  state.preparedByName = tpl.preparedByName;
  if (tpl.paymentMode) state.paymentMode = tpl.paymentMode;
  if (tpl.dueDate) state.dueDate = tpl.dueDate;

  // Sync inputs
  document.getElementById('stationName').value = state.stationName;
  document.getElementById('stationAddress').value = state.stationAddress;
  document.getElementById('stationPhone').value = state.stationPhone;
  document.getElementById('stationEmail').value = state.stationEmail;
  document.getElementById('stationPan').value = state.stationPan;
  document.getElementById('invNumber').value = state.invNumber;
  document.getElementById('buyerName').value = state.buyerName;
  document.getElementById('buyerPan').value = state.buyerPan;
  document.getElementById('buyerAddress').value = state.buyerAddress;
  document.getElementById('buyerMobile').value = state.buyerMobile;
  document.getElementById('vehicleNo').value = state.vehicleNo;
  document.getElementById('invoiceMiti').value = state.invoiceMiti;
  document.getElementById('invoiceTime').value = state.invoiceTime;
  if (document.getElementById('paymentMode')) document.getElementById('paymentMode').value = state.paymentMode;
  if (document.getElementById('dueDate')) document.getElementById('dueDate').value = state.dueDate;

  // Apply paper color
  if (tpl.paperTheme === 'white') {
    document.getElementById('btnWhiteTheme').click();
  } else {
    document.getElementById('btnPinkTheme').click();
  }
}

// Download PDF
function downloadAsPDF() {
  const element = document.getElementById('printSheet');
  const invNo = state.invNumber || 'bill';
  const isLandscape = state.layout === 'landscape-2up';

  const btn = document.getElementById('btnDownloadPdf');
  const originalText = btn.textContent;
  btn.textContent = '⏳ Generating PDF...';
  btn.disabled = true;

  const opt = {
    margin: isLandscape ? [4, 4, 4, 4] : [8, 8, 8, 8],
    filename: `Petrol_Tax_Invoice_${invNo}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2.5, 
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: isLandscape ? 'landscape' : 'portrait' 
    }
  };

  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(element).save().then(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }).catch(err => {
      console.error(err);
      alert('Opening Print Dialog...');
      window.print();
      btn.textContent = originalText;
      btn.disabled = false;
    });
  } else {
    window.print();
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

// Setup Event Listeners
function setupBindings() {
  // Template Select handler
  document.getElementById('templateSelect').addEventListener('change', (e) => {
    switchTemplate(e.target.value);
  });

  const fieldMap = [
    { input: 'invNumber', stateKey: 'invNumber' },
    { input: 'buyerName', stateKey: 'buyerName' },
    { input: 'buyerPan', stateKey: 'buyerPan' },
    { input: 'vehicleNo', stateKey: 'vehicleNo' },
    { input: 'buyerAddress', stateKey: 'buyerAddress' },
    { input: 'buyerMobile', stateKey: 'buyerMobile' },
    { input: 'paymentMode', stateKey: 'paymentMode' },
    { input: 'dueDate', stateKey: 'dueDate' },
    { input: 'invoiceMiti', stateKey: 'invoiceMiti' },
    { input: 'invoiceTime', stateKey: 'invoiceTime' },
    { input: 'stationName', stateKey: 'stationName' },
    { input: 'stationAddress', stateKey: 'stationAddress' },
    { input: 'stationPhone', stateKey: 'stationPhone' },
    { input: 'stationEmail', stateKey: 'stationEmail' },
    { input: 'stationPan', stateKey: 'stationPan' }
  ];

  fieldMap.forEach(({ input, stateKey }) => {
    const el = document.getElementById(input);
    if (el) {
      el.addEventListener('input', (e) => {
        state[stateKey] = e.target.value;
        updateAllUI();
      });
    }
  });

  // Direct editing of contenteditable elements
  document.addEventListener('input', (e) => {
    const syncTarget = e.target.getAttribute('data-sync');
    if (syncTarget) {
      const val = e.target.textContent;
      const syncMap = {
        stationName: 'stationName',
        stationAddress: 'stationAddress',
        stationPhone: 'stationPhone',
        stationEmail: 'stationEmail',
        stationPan: 'stationPan',
        invNo: 'invNumber',
        buyer: 'buyerName',
        pan: 'buyerPan',
        address: 'buyerAddress',
        vehicle: 'vehicleNo',
        paymentMode: 'paymentMode',
        dueDate: 'dueDate',
        date: 'invoiceDate',
        miti: 'invoiceMiti',
        buyerMobile: 'buyerMobile',
        generatedTime: 'invoiceTime',
        preparedByName: 'preparedByName',
        remarks: 'remarks'
      };

      if (syncMap[syncTarget]) {
        state[syncMap[syncTarget]] = val;
        const mappedInput = document.getElementById(syncMap[syncTarget]);
        if (mappedInput) mappedInput.value = val;
      }
    }
  });

  // Table direct edits
  document.addEventListener('blur', (e) => {
    const syncTarget = e.target.getAttribute('data-sync');
    if (syncTarget === 'qty') {
      const val = parseFloat(e.target.textContent.replace(/,/g, '')) || 0;
      document.getElementById('inputQty').value = val;
      recalculate('qty');
    } else if (syncTarget === 'rate') {
      const base = parseFloat(e.target.textContent.replace(/,/g, '')) || 0;
      const retail = base * 1.13;
      state.retailRate = retail;
      document.getElementById('retailRate').value = retail.toFixed(2);
      recalculate('qty');
    }
  }, true);

  // Date picker handler
  const dateInput = document.getElementById('invoiceDate');
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.value = `${yyyy}-${mm}-${dd}`;

  dateInput.addEventListener('change', (e) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-');
      state.invoiceDate = `${d}/${m}/${y}`;
      updateAllUI();
    }
  });

  // Fuel Type Dropdown
  document.getElementById('fuelType').addEventListener('change', (e) => {
    const val = e.target.value;
    state.fuelType = val;
    if (FUEL_PRESETS[val]) {
      const preset = FUEL_PRESETS[val];
      state.hscode = preset.hscode;
      state.particulars = preset.name;
      state.particularsCaps = preset.nameCaps;
      if (preset.defaultRate) {
        state.retailRate = preset.defaultRate;
        document.getElementById('retailRate').value = preset.defaultRate.toFixed(2);
      }
    }
    recalculate();
  });

  // Retail Rate Input
  document.getElementById('retailRate').addEventListener('input', (e) => {
    state.retailRate = parseFloat(e.target.value) || 0;
    recalculate();
  });

  // Calc Mode change
  document.querySelectorAll('input[name="calcMode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.calcMode = e.target.value;
      if (state.calcMode === 'qty') {
        document.getElementById('qtyFieldGroup').classList.remove('hidden');
        document.getElementById('amountFieldGroup').classList.add('hidden');
      } else {
        document.getElementById('qtyFieldGroup').classList.add('hidden');
        document.getElementById('amountFieldGroup').classList.remove('hidden');
      }
      recalculate(state.calcMode);
    });
  });

  // Quantity input
  document.getElementById('inputQty').addEventListener('input', () => {
    recalculate('qty');
  });

  // Total Amount input
  document.getElementById('inputTotalAmount').addEventListener('input', () => {
    recalculate('amount');
  });

  // Discount input
  document.getElementById('inputDiscount').addEventListener('input', () => {
    recalculate(state.calcMode);
  });

  // Layout switcher
  const printSheet = document.getElementById('printSheet');
  const btnPrint = document.getElementById('btnPrint');
  const btnDownloadPdf = document.getElementById('btnDownloadPdf');

  document.querySelectorAll('input[name="printLayout"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.layout = e.target.value;
      if (state.layout === 'landscape-2up') {
        printSheet.classList.add('landscape-mode');
        printSheet.classList.remove('portrait-mode');
        btnPrint.textContent = '🖨️ Print (Landscape)';
        btnDownloadPdf.textContent = '📥 Download PDF (A4 Landscape)';
        updatePrintPageStyle('landscape');
      } else {
        printSheet.classList.remove('landscape-mode');
        printSheet.classList.add('portrait-mode');
        btnPrint.textContent = '🖨️ Print (Portrait)';
        btnDownloadPdf.textContent = '📥 Download PDF (Portrait)';
        updatePrintPageStyle('portrait');
      }
    });
  });

  // Copy Tag dropdown
  document.getElementById('copyLabelMode').addEventListener('change', (e) => {
    state.copyTagMode = e.target.value;
    updateCopyTags();
  });

  // Paper Theme Switching
  const btnPink = document.getElementById('btnPinkTheme');
  const btnWhite = document.getElementById('btnWhiteTheme');

  btnPink.addEventListener('click', () => {
    document.querySelectorAll('.bill-page').forEach(el => {
      el.classList.add('pink-paper');
      el.classList.remove('white-paper');
    });
    btnPink.classList.add('active');
    btnWhite.classList.remove('active');
  });

  btnWhite.addEventListener('click', () => {
    document.querySelectorAll('.bill-page').forEach(el => {
      el.classList.remove('pink-paper');
      el.classList.add('white-paper');
    });
    btnWhite.classList.add('active');
    btnPink.classList.remove('active');
  });

  // Download PDF button
  btnDownloadPdf.addEventListener('click', () => {
    downloadAsPDF();
  });

  // Print button
  btnPrint.addEventListener('click', () => {
    window.print();
  });

  // Reset button
  document.getElementById('btnReset').addEventListener('click', () => {
    const curTpl = state.template || 'himal';
    switchTemplate(curTpl);
  });
}

function updatePrintPageStyle(orientation) {
  let styleEl = document.getElementById('dynamicPrintPageStyle');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicPrintPageStyle';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `@media print { @page { size: A4 ${orientation}; margin: 4mm 6mm; } }`;
}

// Initial Boot
window.addEventListener('DOMContentLoaded', () => {
  setupBindings();
  updatePrintPageStyle('landscape');
  recalculate();
});
