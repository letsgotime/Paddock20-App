import React from 'react';
import { X } from 'lucide-react';

interface LegalDocumentModalProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
  callback?: () => void;
  isBetaModal?: boolean;
  onBetaTesterRequest?: (isTester: boolean) => void;
}

const LegalDocumentModal: React.FC<LegalDocumentModalProps> = ({
  title,
  content,
  isOpen,
  onClose,
  callback,
  isBetaModal = false,
  onBetaTesterRequest
}) => {
  const [requestTesterAccess, setRequestTesterAccess] = React.useState(false);
  
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
        className="relative w-full max-w-3xl max-h-[calc(100vh-40px)] overflow-hidden rounded-xl border border-gray-800 bg-black/90 backdrop-blur-md shadow-2xl"
        style={{
          boxShadow: '0 0 40px rgba(8, 197, 25, 0.15), 0 0 20px rgba(25, 130, 252, 0.15)',
          margin: '20px'
        }}
      >
        {/* F1-inspired racing stripes */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#08c519]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1982FC]"></div>
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#1982FC]"></div>
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-[#08c519]"></div>
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black/90 backdrop-blur-md">
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
        <div className="p-6 bg-gradient-to-b from-[#1982FC]/10 to-[#08c519]/10 border-y border-gray-800 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          <div 
            className="prose prose-invert max-w-none text-gray-300"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
        
        {/* Beta Tester Option - Only shown for beta agreement */}
        {isBetaModal && (
          <div className="px-6 py-4 bg-[#1982FC]/10 border-t border-gray-800">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="beta-tester-request"
                checked={requestTesterAccess}
                onChange={(e) => setRequestTesterAccess(e.target.checked)}
                className="w-5 h-5 rounded border-gray-600 text-[#08c519] focus:ring-[#1982FC]"
              />
              <label htmlFor="beta-tester-request" className="text-gray-300">
                <span className="font-semibold text-[#1982FC]">Request Beta Tester status</span>
                <span className="block text-sm text-gray-400 mt-1">
                  Beta Users can use Paddock20 while it's in development. Beta Testers help improve the platform by providing structured feedback and participating in testing sessions (requires admin approval).
                </span>
              </label>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 text-gray-300 font-medium rounded-md border border-gray-700 hover:bg-gray-700 transition-all"
          >
            Back to Registration
          </button>
          
          <button
            onClick={() => {
              if (callback) callback();
              if (isBetaModal && onBetaTesterRequest) {
                onBetaTesterRequest(requestTesterAccess);
              }
              onClose();
            }}
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