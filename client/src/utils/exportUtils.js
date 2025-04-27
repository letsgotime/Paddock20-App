import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Exports the content of an HTML element to a PDF document
 * @param {string} elementId - The ID of the HTML element to export
 * @param {string} filename - The name of the PDF file (without extension)
 * @param {string} logoPath - Optional path to a logo to include on the PDF
 * @returns {Promise<void>}
 */
export async function exportToPDF(elementId, filename = 'export', logoPath = null) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }
    
    // Announce to screen readers
    const announcer = document.getElementById('aria-live-announcer') || document.createElement('div');
    if (!document.getElementById('aria-live-announcer')) {
      announcer.id = 'aria-live-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcer);
    }
    announcer.textContent = 'Generating PDF export. Please wait...';
    
    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable if images from other domains are used
      logging: false,
      backgroundColor: '#111111',
    });
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Set PDF metadata
    pdf.setProperties({
      title: filename,
      creator: 'ApexVault™ Systems',
      author: 'GoTime Motorsports',
    });
    
    // Calculate dimensions to fit the canvas to the PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add logo if provided
    if (logoPath) {
      try {
        const logo = new Image();
        logo.src = logoPath;
        await new Promise((resolve) => {
          logo.onload = resolve;
          logo.onerror = resolve;
        });
        
        // Add logo at the top right of the first page
        pdf.addImage(logo, 'PNG', 150, 10, 40, 20);
      } catch (err) {
        console.warn('Logo could not be added to PDF:', err.message);
      }
    }
    
    // Add data export timestamp
    const timestamp = new Date().toLocaleString();
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on: ${timestamp}`, 20, 10);
    
    // Add the captured canvas to the PDF
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 30, imgWidth, imgHeight);
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
    
    // Announce completion to screen readers
    announcer.textContent = 'PDF export complete. File has been downloaded.';
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    
    // Announce error to screen readers
    const announcer = document.getElementById('aria-live-announcer');
    if (announcer) {
      announcer.textContent = `PDF export failed: ${error.message}. Please try again.`;
    }
    
    return false;
  }
}

/**
 * Exports the content of an HTML element to a CSV file for Google Sheets
 * @param {string} elementId - The ID of the HTML element containing a table to export
 * @param {string} filename - The name of the CSV file (without extension)
 * @returns {Promise<void>}
 */
export async function exportToCSV(elementId, filename = 'export') {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }
    
    // Announce to screen readers
    const announcer = document.getElementById('aria-live-announcer') || document.createElement('div');
    if (!document.getElementById('aria-live-announcer')) {
      announcer.id = 'aria-live-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcer);
    }
    announcer.textContent = 'Generating CSV export. Please wait...';
    
    // Find all tables in the element
    const tables = element.querySelectorAll('table');
    if (tables.length === 0) {
      throw new Error('No tables found in the specified element');
    }
    
    // Use the first table
    const table = tables[0];
    
    // Extract headers
    const headers = [];
    const headerCells = table.querySelectorAll('thead th');
    if (headerCells.length > 0) {
      headerCells.forEach(cell => {
        headers.push(cell.textContent.trim().replace(/,/g, ' '));
      });
    } else {
      // If no thead, use the first row as headers
      const firstRow = table.querySelector('tr');
      if (firstRow) {
        const firstRowCells = firstRow.querySelectorAll('td, th');
        firstRowCells.forEach(cell => {
          headers.push(cell.textContent.trim().replace(/,/g, ' '));
        });
      }
    }
    
    // Start with headers
    let csvContent = headers.join(',') + '\\n';
    
    // Extract data rows
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const rowData = [];
      const cells = row.querySelectorAll('td');
      cells.forEach(cell => {
        // Replace commas with spaces to avoid CSV issues
        rowData.push(cell.textContent.trim().replace(/,/g, ' '));
      });
      csvContent += rowData.join(',') + '\\n';
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Announce completion to screen readers
    announcer.textContent = 'CSV export complete. File has been downloaded.';
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    
    // Announce error to screen readers
    const announcer = document.getElementById('aria-live-announcer');
    if (announcer) {
      announcer.textContent = `CSV export failed: ${error.message}. Please try again.`;
    }
    
    return false;
  }
}

/**
 * Generates an export formatted for Google Docs (HTML)
 * @param {string} elementId - The ID of the HTML element to export
 * @param {string} filename - The name of the HTML file (without extension)
 * @returns {Promise<void>}
 */
export async function exportForGoogleDocs(elementId, filename = 'export') {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }
    
    // Announce to screen readers
    const announcer = document.getElementById('aria-live-announcer') || document.createElement('div');
    if (!document.getElementById('aria-live-announcer')) {
      announcer.id = 'aria-live-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcer);
    }
    announcer.textContent = 'Generating HTML export for Google Docs. Please wait...';
    
    // Clone the element to avoid modifying the original
    const elementClone = element.cloneNode(true);
    
    // Create a simplified HTML document with basic styling
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1, h2, h3, h4 { margin-top: 20px; color: #222; }
        .export-timestamp { color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>${filename}</h1>
      <p class="export-timestamp">Generated on: ${new Date().toLocaleString()}</p>
      <div class="content">
        ${elementClone.innerHTML}
      </div>
    </body>
    </html>
    `;
    
    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Announce completion to screen readers
    announcer.textContent = 'HTML export complete. File has been downloaded. You can now import this into Google Docs.';
    
    return true;
  } catch (error) {
    console.error('Error exporting for Google Docs:', error);
    
    // Announce error to screen readers
    const announcer = document.getElementById('aria-live-announcer');
    if (announcer) {
      announcer.textContent = `HTML export failed: ${error.message}. Please try again.`;
    }
    
    return false;
  }
}