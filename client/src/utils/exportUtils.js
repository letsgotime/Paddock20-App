import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Common function to prepare HTML content for export
const captureHtmlSection = async (sectionId) => {
  const announcer = document.getElementById('announcer');
  if (announcer) {
    announcer.textContent = "Preparing content for export. This may take a moment...";
  }
  
  try {
    const input = document.getElementById(sectionId);
    if (!input) {
      throw new Error(`Element with ID '${sectionId}' not found`);
    }
    
    // Capture the section as canvas
    const canvas = await html2canvas(input, {
      scale: 2, // Higher quality
      useCORS: true, // Allow cross-origin images
      allowTaint: true,
      backgroundColor: '#000000', // Match dark background
    });
    
    return canvas;
  } catch (error) {
    console.error('Error capturing content:', error);
    if (announcer) {
      announcer.textContent = `Error preparing content: ${error.message}`;
    }
    throw error;
  }
};

// Export to PDF with high-quality formatting and logo
export const exportToPDF = async (sectionId, title, logoPath = '/assets/Logos/GoTime-White.png') => {
  const announcer = document.getElementById('announcer');
  if (announcer) {
    announcer.textContent = "Creating PDF export. This may take a moment...";
  }
  
  try {
    const canvas = await captureHtmlSection(sectionId);
    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF with A4 dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add the logo
    // Create an Image object to get dimensions
    const img = new Image();
    img.src = logoPath;
    
    // Use a placeholder size initially
    const logoWidth = 40;
    const logoHeight = 15;
    const logoX = 10;
    const logoY = 10;

    // Add logo
    pdf.addImage(logoPath, 'PNG', logoX, logoY, logoWidth, logoHeight);
    
    // Add title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(127, 200, 68); // GoTime green
    pdf.text(title, pdfWidth / 2, logoY + logoHeight + 10, { align: 'center' });
    
    // Add generation info
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150); // Gray
    const dateStr = new Date().toLocaleDateString();
    pdf.text(`Generated on: ${dateStr}`, pdfWidth / 2, logoY + logoHeight + 20, { align: 'center' });
    
    // Now add the main content
    const imgProps = pdf.getImageProperties(imgData);
    const contentImgWidth = pdfWidth - 20;
    // Calculate height to maintain aspect ratio
    const contentImgHeight = (imgProps.height * contentImgWidth) / imgProps.width;
    
    // Start the content below the header with some margin
    const contentStartY = logoY + logoHeight + 30;
    
    // Handle if content is too large for one page
    if (contentImgHeight > pdfHeight - contentStartY - 20) {
      // Content needs multiple pages
      const pageHeight = pdfHeight - contentStartY - 20;
      let remainingHeight = contentImgHeight;
      let sourceY = 0;
      
      while (remainingHeight > 0) {
        // Calculate height for this page
        const heightOnThisPage = Math.min(remainingHeight, pageHeight);
        
        // Calculate the portion of the image to use for this page
        const sourceHeight = (heightOnThisPage / contentImgHeight) * imgProps.height;
        
        // Add this portion of the image
        pdf.addImage(
          imgData, 
          'PNG', 
          10, // x
          contentStartY, // y
          contentImgWidth, // width
          heightOnThisPage, // height on page
          '', // alias
          'FAST', // compression
          0, // rotation
          sourceY, // source X (typically 0)
          0, // source Y (will vary based on page)
          imgProps.width, // source width
          sourceHeight // source height for this page
        );
        
        remainingHeight -= heightOnThisPage;
        sourceY += sourceHeight;
        
        // Add footer
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        const pageFooter = '© GoTime Motorsports - ApexVault™ - Confidential Vehicle Information';
        pdf.text(pageFooter, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
        
        // If there's more content, add a new page
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    } else {
      // Content fits on one page
      pdf.addImage(imgData, 'PNG', 10, contentStartY, contentImgWidth, contentImgHeight);
      
      // Add footer
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      const pageFooter = '© GoTime Motorsports - ApexVault™ - Confidential Vehicle Information';
      pdf.text(pageFooter, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
    }
    
    // Save the PDF
    const fileName = title.replace(/\s+/g, '-').toLowerCase() + '.pdf';
    pdf.save(fileName);
    
    // Notify user
    if (announcer) {
      announcer.textContent = "PDF export completed successfully.";
    }
    
    return true;
  } catch (error) {
    console.error('Error creating PDF:', error);
    if (announcer) {
      announcer.textContent = `Error creating PDF: ${error.message}`;
    }
    return false;
  }
};

// Export to CSV (for Google Sheets import)
export const exportToCSV = async (sectionId, title) => {
  const announcer = document.getElementById('announcer');
  if (announcer) {
    announcer.textContent = "Creating CSV for Google Sheets. This may take a moment...";
  }
  
  try {
    const section = document.getElementById(sectionId);
    if (!section) {
      throw new Error(`Element with ID '${sectionId}' not found`);
    }
    
    // Extract data from the section
    // This is a simple example - you'll need to adapt this based on your specific content structure
    const rows = [];
    
    // First, add a title row with the current date
    rows.push([`${title} - Generated on ${new Date().toLocaleDateString()}`]);
    rows.push(['']); // Empty row for spacing
    
    // For demonstration, we'll extract data from paragraphs and headings
    // Add header row based on what type of content we're dealing with
    if (sectionId === 'garageVaultSection') {
      // For Garage Vault, create a header row with vehicle details
      rows.push(['Vehicle', 'VIN', 'Tire Pressure (F)', 'Tire Pressure (R)', 'Torque Spec', 'Mileage', 'Service History']);
      
      // Extract data from each vehicle card
      const vehicleCards = section.querySelectorAll('.apex-card');
      vehicleCards.forEach(card => {
        const vehicleName = card.querySelector('h3')?.textContent.trim() || 'N/A';
        
        // Get all text paragraphs
        const textElements = card.querySelectorAll('p');
        let vin = 'N/A';
        let tirePressureFront = 'N/A';
        let tirePressureRear = 'N/A';
        let torqueSpec = 'N/A';
        let mileage = 'N/A';
        let serviceHistory = 'N/A';
        
        // Extract data from paragraphs based on their content
        textElements.forEach(p => {
          const text = p.textContent.trim();
          if (text.startsWith('VIN:')) vin = text.replace('VIN:', '').trim().split(' ')[0];
          if (text.startsWith('Tire Pressure (F):')) tirePressureFront = text.replace('Tire Pressure (F):', '').trim();
          if (text.startsWith('Tire Pressure (R):')) tirePressureRear = text.replace('Tire Pressure (R):', '').trim();
          if (text.startsWith('Torque Spec:')) torqueSpec = text.replace('Torque Spec:', '').trim();
          if (text.startsWith('Mileage:')) mileage = text.replace('Mileage:', '').trim();
          if (text.startsWith('Service History:')) serviceHistory = text.replace('Service History:', '').trim();
        });
        
        rows.push([vehicleName, vin, tirePressureFront, tirePressureRear, torqueSpec, mileage, serviceHistory]);
      });
    } else if (sectionId === 'juiceBoxSection') {
      // For JuiceBox, create a header row with product details
      rows.push(['Product', 'Category', 'Price', 'Rating', 'Description']);
      
      // Extract data from each product card
      const productCards = section.querySelectorAll('.product-card');
      productCards.forEach(card => {
        const productName = card.querySelector('.product-name')?.textContent.trim() || 'N/A';
        const category = card.querySelector('.product-category')?.textContent.trim() || 'N/A';
        const price = card.querySelector('.product-price')?.textContent.trim() || 'N/A';
        const rating = card.querySelector('.product-rating')?.textContent.trim() || 'N/A';
        const description = card.querySelector('.product-description')?.textContent.trim() || 'N/A';
        
        rows.push([productName, category, price, rating, description]);
      });
    } else {
      // Generic approach for other sections
      // Get all headings and their subsequent paragraphs
      const headings = section.querySelectorAll('h2, h3, h4, h5, h6');
      
      if (headings.length > 0) {
        // If there are headings, organize content by them
        headings.forEach(heading => {
          rows.push([heading.textContent.trim()]);
          
          let nextElement = heading.nextElementSibling;
          while (nextElement && !nextElement.matches('h2, h3, h4, h5, h6')) {
            if (nextElement.tagName === 'P') {
              rows.push(['', nextElement.textContent.trim()]);
            }
            nextElement = nextElement.nextElementSibling;
          }
          
          // Add a blank row after each section
          rows.push(['']);
        });
      } else {
        // No headings, just extract all paragraphs
        const paragraphs = section.querySelectorAll('p');
        paragraphs.forEach(p => {
          rows.push([p.textContent.trim()]);
        });
      }
    }
    
    // Convert rows to CSV format
    let csvContent = '';
    rows.forEach(row => {
      // Escape commas, quotes, etc. in cell values
      const escapedRow = row.map(cell => {
        // If cell contains commas, quotes, or newlines, wrap in quotes
        if (cell && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          // Replace quotes with double quotes
          return `"${cell.replace(/"/g, '""')}"`;
        }
        return cell;
      });
      
      csvContent += escapedRow.join(',') + '\n';
    });
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '-').toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    
    // Append to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Notify user
    if (announcer) {
      announcer.textContent = "CSV export for Google Sheets completed successfully.";
    }
    
    return true;
  } catch (error) {
    console.error('Error creating CSV:', error);
    if (announcer) {
      announcer.textContent = `Error creating CSV: ${error.message}`;
    }
    return false;
  }
};

// Export HTML for Google Docs import
export const exportForGoogleDocs = async (sectionId, title) => {
  const announcer = document.getElementById('announcer');
  if (announcer) {
    announcer.textContent = "Creating HTML for Google Docs. This may take a moment...";
  }
  
  try {
    const section = document.getElementById(sectionId);
    if (!section) {
      throw new Error(`Element with ID '${sectionId}' not found`);
    }
    
    // Clone the section to manipulate for export
    const clonedSection = section.cloneNode(true);
    
    // Add title and header
    const exportContainer = document.createElement('div');
    
    // Add logo placeholder for Google Docs
    const header = document.createElement('div');
    header.style.textAlign = 'center';
    header.style.marginBottom = '20px';
    
    const logoPlaceholder = document.createElement('div');
    logoPlaceholder.innerHTML = '[GOTIME MOTORSPORTS LOGO]';
    logoPlaceholder.style.fontWeight = 'bold';
    logoPlaceholder.style.color = '#7FC844';
    header.appendChild(logoPlaceholder);
    
    const titleElement = document.createElement('h1');
    titleElement.textContent = title;
    titleElement.style.color = '#7FC844';
    header.appendChild(titleElement);
    
    const dateElement = document.createElement('p');
    dateElement.textContent = `Generated on: ${new Date().toLocaleDateString()}`;
    dateElement.style.color = '#999';
    header.appendChild(dateElement);
    
    exportContainer.appendChild(header);
    exportContainer.appendChild(clonedSection);
    
    // Add footer
    const footer = document.createElement('div');
    footer.style.textAlign = 'center';
    footer.style.marginTop = '20px';
    footer.style.fontStyle = 'italic';
    footer.style.fontSize = '8pt';
    footer.style.color = '#666';
    footer.textContent = '© GoTime Motorsports - ApexVault™ - Confidential Vehicle Information';
    exportContainer.appendChild(footer);
    
    // Get HTML content
    const htmlContent = exportContainer.innerHTML;
    
    // Create a Blob with the HTML content
    const blob = new Blob([
      '<!DOCTYPE html><html><head><title>' + title + '</title><meta charset="utf-8"></head><body>' +
      htmlContent +
      '</body></html>'
    ], { type: 'text/html' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '-').toLowerCase()}.html`);
    link.style.visibility = 'hidden';
    
    // Append to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Notify user
    if (announcer) {
      announcer.textContent = "HTML export for Google Docs completed successfully. Open this file in Google Docs to import.";
    }
    
    return true;
  } catch (error) {
    console.error('Error creating HTML for Google Docs:', error);
    if (announcer) {
      announcer.textContent = `Error creating HTML for Google Docs: ${error.message}`;
    }
    return false;
  }
};