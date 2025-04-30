/**
 * Utility functions for exporting and printing data
 */

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Export a component to PDF format
 * @param {HTMLElement} element - The DOM element to export
 * @param {string} filename - The filename for the PDF
 */
export const exportToPdf = async (element, filename = "export.pdf") => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    return false;
  }
};

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {string} filename - The filename for the CSV
 */
export const exportToCsv = (data, filename = "export.csv") => {
  try {
    if (!data || !data.length) {
      throw new Error("No data to export");
    }
    
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Convert data to CSV format
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        const escaped = String(value).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    // Create and download CSV file
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    return false;
  }
};

/**
 * Print the content of a specific element
 * @param {HTMLElement} element - The DOM element to print
 * @param {string} title - The title for the print page
 */
export const printElement = (element, title = "Print") => {
  try {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: 'Open Sans', Arial, sans-serif;
              color: #333;
              padding: 20px;
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: 'Orbitron', 'Segoe UI', Tahoma, sans-serif;
              color: #20B2AA;
            }
            .print-content {
              max-width: 100%;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-content">${element.innerHTML}</div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Start printing after content has loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    return true;
  } catch (error) {
    console.error("Error printing element:", error);
    return false;
  }
};

export default {
  exportToPdf,
  exportToCsv,
  printElement
};