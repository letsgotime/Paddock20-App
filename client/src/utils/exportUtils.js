import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Export an element to PDF
 * @param {HTMLElement} element - The element to export
 * @param {string} filename - The filename to save as
 */
export const exportToPdf = async (element, filename = 'export.pdf') => {
  try {
    // Get the element dimensions
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow images from other domains
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
  }
};

/**
 * Export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {string} filename - The filename to save as
 */
export const exportToCsv = (data, filename = 'export.csv') => {
  try {
    if (!data || !data.length) return;
    
    // Get headers from the first item
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => {
        return headers.map(header => {
          // Handle special characters, quotes, commas, etc.
          let cell = row[header]?.toString() || '';
          if (cell.includes(',') || cell.includes('"') || cell.includes("'")) {
            cell = `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',');
      })
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

/**
 * Print an element
 * @param {HTMLElement} element - The element to print
 */
export const printElement = (element) => {
  try {
    const printWindow = window.open('', '_blank');
    
    // Create a style element to maintain styles
    const style = document.createElement('style');
    style.innerHTML = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('');
        } catch (e) {
          // Stylesheet from another domain will throw an error
          return '';
        }
      })
      .join('\n');
    
    // Clone the element
    const clonedElement = element.cloneNode(true);
    
    // Set up the print window content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print</title>
          ${style.outerHTML}
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          ${clonedElement.outerHTML}
        </body>
      </html>
    `);
    
    // Close document for writing to avoid memory leaks
    printWindow.document.close();
    
    // Wait for page to load before printing
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = function() {
        printWindow.close();
      };
    };
  } catch (error) {
    console.error('Error printing element:', error);
  }
};