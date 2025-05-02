import React from 'react';
import { useLocation, Link } from 'wouter';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  path: string;
  label: string;
}

const ContextualBreadcrumbs: React.FC = () => {
  const [location] = useLocation();
  
  // Define breadcrumb mappings for all supported routes
  const routeMappings: Record<string, BreadcrumbItem[]> = {
    '/': [],
    '/new-weather-center': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/new-weather-center', label: 'Weather Center' }
    ],
    '/weather': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/weather', label: 'Weather' }
    ],
    '/garage-vault': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/garage-vault', label: 'Garage Vault' }
    ],
    '/manifestation-station': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/manifestation-station', label: 'Manifestation Station' }
    ],
    '/drive-journal': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/drive-journal', label: 'Drive Journal' }
    ],
    '/route-planner': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/new-weather-center', label: 'Weather Center' },
      { path: '/route-planner', label: 'Fun Drive Planner' }
    ],
    '/juicebox': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/juicebox', label: 'Juice Box' }
    ],
    '/vehicle-mods': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/garage-vault', label: 'Garage Vault' },
      { path: '/vehicle-mods', label: 'Vehicle Mods' }
    ],
    '/mood-energy-tracker': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/mood-energy-tracker', label: 'Mood & Energy Tracker' }
    ],
    '/seasonal-checklist': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/garage-vault', label: 'Garage Vault' },
      { path: '/seasonal-checklist', label: 'Seasonal Checklist' }
    ],
    '/membership': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/membership', label: 'Paddock20 Membership' }
    ],
    '/chat-feed': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/chat-feed', label: 'Paddock20 Chat' }
    ],
    '/gloss-reset': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/juicebox', label: 'Juice Box' },
      { path: '/gloss-reset', label: 'Gloss Reset Program' }
    ],
    '/juice-loadouts': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/juicebox', label: 'Juice Box' },
      { path: '/juice-loadouts', label: 'Product Loadouts' }
    ],
    '/gloss-growth': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/juicebox', label: 'Juice Box' },
      { path: '/gloss-growth', label: 'Gloss Growth Tracker' }
    ],
    '/juicebox-videos': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/juicebox', label: 'Juice Box' },
      { path: '/juicebox-videos', label: 'Video Library' }
    ],
    '/dashboard': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/dashboard', label: 'Dashboard' }
    ],
    '/user-dashboard': [
      { path: '/', label: 'Paddock20 Home' },
      { path: '/user-dashboard', label: 'User Dashboard' }
    ]
  };
  
  // Get breadcrumbs for the current path
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    // First try exact match
    if (routeMappings[location]) {
      return routeMappings[location];
    }
    
    // Try to match the start of the path
    for (const [path, breadcrumbs] of Object.entries(routeMappings)) {
      if (path !== '/' && location.startsWith(path)) {
        return breadcrumbs;
      }
    }
    
    // Default: generate breadcrumbs from URL segments
    const segments = location.split('/').filter(Boolean);
    
    // Always make sure the Home breadcrumb goes to the main Paddock20 homepage
    // Use explicit home label for consistency
    const result: BreadcrumbItem[] = [{ path: '/', label: 'Paddock20 Home' }];
    
    let pathSoFar = '';
    segments.forEach((segment) => {
      // Strip off any query parameters for the breadcrumb display
      const cleanSegment = segment.split('?')[0]; 
      pathSoFar += `/${cleanSegment}`;
      
      const label = cleanSegment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      result.push({ path: pathSoFar, label });
    });
    
    return result;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  // Don't render if we're on the home page or have only one breadcrumb
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
                breadcrumb.path === '/' ? (
                  // Special handling for Home link to ensure it always goes to main homepage
                  <a 
                    href="/"
                    className="hover:text-blue-200 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = '/';
                    }}
                  >
                    {breadcrumb.label}
                  </a>
                ) : (
                  <Link 
                    to={breadcrumb.path}
                    className="hover:text-blue-200 transition-colors"
                  >
                    {breadcrumb.label}
                  </Link>
                )
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ContextualBreadcrumbs;