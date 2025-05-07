/**
 * Utility functions for exporting data in different formats
 */

/**
 * Export an HTML element to PDF
 * @param {HTMLElement} element - The element to export
 * @param {string} filename - The filename for the PDF
 */
export const exportToPdf = (element, filename) => {
  // This is a stub implementation
  // In a real implementation, we would use a library like html2pdf.js or jspdf
  console.log(`Exporting element to PDF: ${filename}`);
  alert(`PDF export functionality will be implemented with jsPDF.`);
};

/**
 * Export data to CSV format
 * @param {Array<Array<string>>} data - The data to export in format [[header1, header2], [value1, value2]]
 * @param {string} filename - The filename for the CSV
 */
export const exportToCsv = (data, filename) => {
  try {
    // Convert the data to CSV format
    const csvContent = data.map(row => row.join(',')).join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up the download
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Add to the DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    alert('Failed to export data to CSV. Please try again.');
  }
};

/**
 * Print an HTML element
 * @param {HTMLElement} element - The element to print
 */
export const printElement = (element) => {
  try {
    // Create a new window
    const printWindow = window.open('', '_blank');
    
    // Add the element's HTML to the new window with some basic styling
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .print-content {
              max-width: 800px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    
    // Print and close the window
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  } catch (error) {
    console.error('Error printing element:', error);
    alert('Failed to print. Please try again.');
  }
};