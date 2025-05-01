import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  path: string;
  label: string;
}

const ContextualBreadcrumbs: React.FC = () => {
  const location = useLocation();
  
  // Get breadcrumb items based on current path
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const { pathname } = location;
    
    // Don't show breadcrumbs on home page
    if (pathname === '/') {
      return [];
    }
    
    // Define custom breadcrumb hierarchies
    const customHierarchies: Record<string, BreadcrumbItem[]> = {
      '/new-weather-center': [
        { path: '/', label: 'Home' },
        { path: '/new-weather-center', label: 'Weather Center' }
      ],
      '/garage-vault': [
        { path: '/', label: 'Home' },
        { path: '/garage-vault', label: 'Garage Vault' }
      ],
      '/manifestation-station': [
        { path: '/', label: 'Home' },
        { path: '/manifestation-station', label: 'Manifestation Station' }
      ],
      '/drive-journal': [
        { path: '/', label: 'Home' },
        { path: '/drive-journal', label: 'Drive Journal' }
      ],
      '/route-planner': [
        { path: '/', label: 'Home' },
        { path: '/new-weather-center', label: 'Weather Center' },
        { path: '/route-planner', label: 'Route Planner' }
      ],
      '/juicebox': [
        { path: '/', label: 'Home' },
        { path: '/juicebox', label: 'Juice Box' }
      ],
      '/vehicle-mods': [
        { path: '/', label: 'Home' },
        { path: '/garage-vault', label: 'Garage Vault' },
        { path: '/vehicle-mods', label: 'Vehicle Mods' }
      ],
      '/mood-energy-tracker': [
        { path: '/', label: 'Home' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/mood-energy-tracker', label: 'Mood & Energy Tracker' }
      ]
    };
    
    // Check if there's a custom hierarchy for this exact path
    for (const [path, breadcrumbs] of Object.entries(customHierarchies)) {
      if (pathname === path || (path !== '/' && pathname.startsWith(path))) {
        return breadcrumbs;
      }
    }
    
    // Default: generate breadcrumbs from the path segments
    const pathSegments = pathname.split('/').filter(segment => segment);
    
    const breadcrumbs: BreadcrumbItem[] = [
      { path: '/', label: 'Home' }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({ path: currentPath, label });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbItems();
  
  // Don't render if there are no breadcrumbs (home page) or only one item
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav aria-label="Breadcrumbs" className="text-xs text-blue-300/60 px-4 pt-20 pb-2 max-w-screen-2xl mx-auto">
      <ol className="flex flex-wrap items-center">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={breadcrumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 mx-1 text-blue-400/40" />
              )}
              
              {isLast ? (
                <span className="font-medium text-blue-300/80" aria-current="page">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link 
                  to={breadcrumb.path}
                  className="hover:text-blue-200 transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ContextualBreadcrumbs;