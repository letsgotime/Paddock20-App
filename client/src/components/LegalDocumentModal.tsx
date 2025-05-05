import React from 'react';
import { X } from 'lucide-react';

interface LegalDocumentModalProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  title,
  content,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with F1 carbon fiber styling */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Carbon fiber texture overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply"
          style={{ 
            backgroundImage: `url('/assets/Stock Photos/F1/carbon-fiber-texture-dark.png')`,
          }}
        />
      </div>
      
      {/* Modal content */}
      <div 
        className="relative w-full max-w-3xl max-h-[80vh] overflow-auto rounded-xl border border-gray-800 bg-black/90 backdrop-blur-md shadow-2xl"
        style={{
          boxShadow: '0 0 40px rgba(8, 197, 25, 0.15), 0 0 20px rgba(25, 130, 252, 0.15)'
        }}
      >
        {/* F1-inspired racing stripes */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#08c519]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1982FC]"></div>
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#1982FC]"></div>
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-[#08c519]"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 
            className="text-xl font-bold text-white tracking-wide"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            <span className="text-[#1982FC]">PADDOCK</span>
            <span className="text-[#08c519]">20</span> {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>
        
        {/* Document content */}
        <div className="p-6">
          <div 
            className="prose prose-invert max-w-none text-gray-300"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        
        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-[#1982FC]/80 to-[#08c519]/80 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalDocumentModal;