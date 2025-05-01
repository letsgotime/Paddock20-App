import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ArrowRight, Home, Menu, Grid, X } from 'lucide-react';

/**
 * TileNavigation - Component for providing navigation options when in expanded/fullscreen views
 * Can be used to navigate between related data sections or return to main views
 */
function TileNavigation({
  prevLink,
  nextLink,
  homeLink = '/',
  prevLabel,
  nextLabel,
  onClose,
  showMenu = false,
  menuItems = [],
  currentSection,
  relatedSections = [],
  className = '',
  variant = 'default' // 'default', 'minimal', 'full'
}) {
  // Choose the appropriate layout based on variant
  const renderNavigation = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="flex justify-between items-center">
            <button 
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            
            <Link href={homeLink}>
              <a className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200">
                <Home size={18} />
              </a>
            </Link>
          </div>
        );
        
      case 'full':
        return (
          <div className="flex flex-col space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
                
                <Link href={homeLink}>
                  <a className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200">
                    <Home size={18} />
                  </a>
                </Link>
              </div>
              
              {showMenu && (
                <div className="relative group">
                  <button className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200">
                    <Menu size={18} />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      {menuItems.map((item, index) => (
                        <Link key={index} href={item.link}>
                          <a className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                            {item.label}
                          </a>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {relatedSections.length > 0 && (
              <div className="bg-gray-900/60 rounded-md border border-gray-700 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-700 text-xs text-gray-400">
                  Related Sections
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0">
                  {relatedSections.map((section, index) => (
                    <Link key={index} href={section.link}>
                      <a className={`px-3 py-2 text-sm text-center hover:bg-gray-700 transition-colors ${
                        currentSection === section.id ? 'bg-gray-700 text-blue-400' : 'text-gray-300'
                      }`}>
                        {section.label}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'default':
      default:
        return (
          <div className="flex justify-between items-center">
            {prevLink ? (
              <Link href={prevLink}>
                <a className="flex items-center px-3 py-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-sm">
                  <ArrowLeft size={16} className="mr-1" />
                  {prevLabel || 'Previous'}
                </a>
              </Link>
            ) : (
              <div></div>
            )}
            
            <div className="flex items-center space-x-2">
              <Link href={homeLink}>
                <a className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200">
                  <Home size={18} />
                </a>
              </Link>
              
              {showMenu && menuItems.length > 0 && (
                <div className="relative group">
                  <button className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200">
                    <Grid size={18} />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      {menuItems.map((item, index) => (
                        <Link key={index} href={item.link}>
                          <a className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white">
                            {item.label}
                          </a>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {onClose && (
                <button 
                  onClick={onClose}
                  className="p-2 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            {nextLink ? (
              <Link href={nextLink}>
                <a className="flex items-center px-3 py-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-gray-200 text-sm">
                  {nextLabel || 'Next'}
                  <ArrowRight size={16} className="ml-1" />
                </a>
              </Link>
            ) : (
              <div></div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`${className}`}>
      {renderNavigation()}
    </div>
  );
}

export default TileNavigation;