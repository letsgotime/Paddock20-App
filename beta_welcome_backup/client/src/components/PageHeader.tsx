import React from 'react';
import BackButton from './BackButton';
import { MoreHorizontal, Share2, Download, Printer } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showExportOptions?: boolean;
  onExport?: (type: 'pdf' | 'csv' | 'print') => void;
  actionButtons?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  showExportOptions = false,
  onExport,
  actionButtons,
  className = ''
}) => {
  return (
    <header className={`flex flex-col space-y-2 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <BackButton 
              className="h-10 w-10 sm:h-10 sm:w-auto sm:px-4 py-2"
              showLabel={false}
              color="dark"
            />
          )}
          <h1 className="text-2xl sm:text-3xl font-orbitron text-blue-400">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {showExportOptions && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-lg bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-gray-900 border border-gray-800">
                <div className="space-y-1">
                  <button 
                    onClick={() => onExport && onExport('pdf')} 
                    className="w-full flex items-center p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span>Export as PDF</span>
                  </button>
                  <button 
                    onClick={() => onExport && onExport('csv')} 
                    className="w-full flex items-center p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span>Export as CSV</span>
                  </button>
                  <button 
                    onClick={() => onExport && onExport('print')} 
                    className="w-full flex items-center p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    <span>Print</span>
                  </button>
                  <button 
                    className="w-full flex items-center p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    <span>Share</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {actionButtons}
        </div>
      </div>
      
      {subtitle && (
        <p className="text-gray-400 text-sm sm:text-base">{subtitle}</p>
      )}
    </header>
  );
};

export default PageHeader;