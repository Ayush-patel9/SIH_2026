/**
 * clauseExport.ts
 * Export utilities for NIT tender specification documents.
 */

export function downloadTXT(clauseText: string, isNumber: string = 'IS_STANDARD'): void {
  const blob = new Blob([clauseText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = isNumber.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `NIT_Clause_${safeName}_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadPrintableHTML(
  clauseText: string,
  isNumber: string = 'IS_STANDARD',
  auditHash?: string
): void {
  const highlighted = clauseText.replace(
    /\[FILL: ([^\]]+)\]/g,
    '<mark style="background: #FEF3C7; border: 1px dashed #E0982B; padding: 0 4px; font-weight: bold;">[$1]</mark>'
  );

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>NIT Technical Specification — ${isNumber}</title>
  <style>
    @media print {
      body { margin: 0; padding: 15mm; }
      .no-print { display: none; }
    }
    body {
      font-family: "Times New Roman", Times, Georgia, serif;
      max-width: 800px;
      margin: 30px auto;
      padding: 20px;
      color: #111827;
      font-size: 11pt;
      line-height: 1.6;
    }
    .gov-header {
      text-align: center;
      border-bottom: 2px solid #111827;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .gov-header h1 {
      font-size: 15pt;
      margin: 0 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .gov-header p {
      margin: 0;
      font-size: 10pt;
      color: #4B5563;
    }
    pre {
      font-family: inherit;
      white-space: pre-wrap;
      word-wrap: break-word;
      line-height: 1.55;
    }
    .footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #D1D5DB;
      font-size: 9pt;
      color: #6B7280;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="gov-header">
    <h1>Government of India — Public Procurement Schedule</h1>
    <p>Official Technical Specification Clause • Verified by ManakAI Intelligence Engine</p>
  </div>
  <pre>${highlighted}</pre>
  <div class="footer">
    <span>SHA-256 Audit Seal: ${auditHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
    <span>Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</span>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = isNumber.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `NIT_Clause_${safeName}_Memorandum.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printClause(
  clauseText: string,
  isNumber: string = 'IS_STANDARD',
  auditHash?: string
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open the print dialog.');
    return;
  }

  const highlighted = clauseText.replace(
    /\[FILL: ([^\]]+)\]/g,
    '<mark style="background: #FEF3C7; border: 1px dashed #E0982B; padding: 0 4px; font-weight: bold;">[$1]</mark>'
  );

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>NIT Technical Specification — ${isNumber}</title>
  <style>
    body {
      font-family: "Times New Roman", Times, serif;
      padding: 20px 30px;
      color: #000;
      font-size: 11pt;
      line-height: 1.6;
    }
    .gov-header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
      margin-bottom: 16px;
    }
    pre {
      font-family: inherit;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      margin-top: 24px;
      padding-top: 8px;
      border-top: 1px solid #999;
      font-size: 9pt;
      color: #444;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="gov-header">
    <h2 style="margin: 0 0 4px 0; text-transform: uppercase;">Government of India — Public Procurement Schedule</h2>
    <div style="font-size: 10pt;">Technical Specification Memorandum • Verified by ManakAI Standards Intelligence</div>
  </div>
  <pre>${highlighted}</pre>
  <div class="footer">
    <span>Audit Hash: ${auditHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</span>
    <span>Printed: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`);
  printWindow.document.close();
}
