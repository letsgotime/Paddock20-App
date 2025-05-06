import React, { useState } from 'react';
import { DownloadCloud, FileJson, FileText, Share2, Mail, FileSpreadsheet, Printer, Smartphone } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportOptionsProps {
  contentRef: React.RefObject<HTMLElement>;
  data?: any;
  title: string;
  pageName: string;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({ contentRef, data, title, pageName }) => {
  const [showOptions, setShowOptions] = useState(false);

  const exportToJSON = () => {
    if (!data) return;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageName.toLowerCase().replace(/\s+/g, '-')}_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!data || !Array.isArray(data)) return;
    
    // Convert JSON to CSV
    const replacer = (key: string, value: any) => value === null ? '' : value;
    const header = Object.keys(data[0]);
    const csv = [
      header.join(','), // header row
      ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageName.toLowerCase().replace(/\s+/g, '-')}_export_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!contentRef.current) return;
    
    html2canvas(contentRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${pageName.toLowerCase().replace(/\s+/g, '-')}_export_${Date.now()}.pdf`);
    });
  };

  const printContent = () => {
    if (!contentRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${title} - Print</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .print-container { padding: 20px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1>${title}</h1>
            <div>${contentRef.current.innerHTML}</div>
          </div>
          <div class="no-print">
            <button onclick="window.print()" style="padding: 10px; margin: 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Print Document
            </button>
          </div>
          <script>
            setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const shareContent = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out my ${pageName} from Paddock20`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Web Share API not supported in your browser. Try using the export options instead.');
    }
  };

  const sendByEmail = () => {
    const subject = encodeURIComponent(`Paddock20 - ${title}`);
    const body = encodeURIComponent(`Check out my ${pageName} from Paddock20: ${window.location.href}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareToDevice = () => {
    // Generate QR code or deep link
    alert('Scan QR code on your device to view this content in the Paddock20 mobile app');
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
      >
        <DownloadCloud size={18} />
        <span>Export Options</span>
      </button>
      
      {showOptions && (
        <div className="absolute right-0 top-12 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl min-w-60 overflow-hidden">
          <div className="p-2 bg-gray-800 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300">{title} Export</h3>
          </div>
          
          <div className="p-2">
            <div className="grid grid-cols-1 gap-1">
              <button 
                onClick={exportToJSON}
                className="flex items-center gap-2 hover:bg-gray-800 text-white p-2 rounded-md text-sm transition-colors w-full text-left"
                disabled={!data}
              >
                <FileJson size={16} />
                <span>Export as JSON</span>
              </button>
              
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 hover:bg-gray-800 text-white p-2 rounded-md text-sm transition-colors w-full text-left"
                disabled={!data || !Array.isArray(data)}
              >
                <FileSpreadsheet size={16} />
                <span>Export as CSV</span>
              </button>
              
              <button 
                onClick={exportToPDF}
                className="flex items-center gap-2 hover:bg-gray-800 text-white p-2 rounded-md text-sm transition-colors w-full text-left"
              >
                <FileText size={16} />
                <span>Export as PDF</span>
              </button>
              
              <button 
                onClick={printContent}
                className="flex items-center gap-2 hover:bg-gray-800 text-white p-2 rounded-md text-sm transition-colors w-full text-left"
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
              
              <div className="my-1 border-t border-gray-700"></div>
              
              <button 
                onClick={shareContent}
                className="flex items-center gap-2 hover:bg-gray-800 text-white p-2 rounded-md text-sm transition-colors w-full text-left"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
              
              <button 
                onClick={sendByEmail}
                className="flex items-center gap-2 hover:bg-gray-800 text-white p-2 rounded-md text-sm transition-colors w-full text-left"
              >
                <Mail size={16} />
                <span>Send by Email</span>
              </button>
              
              <button 
                onClick={shareToDevice}
                className="flex items-center gap-2 hover:bg-gray-800 text-white p-2 rounded-md text-sm transition-colors w-full text-left"
              >
                <Smartphone size={16} />
                <span>Share to Device</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportOptions;