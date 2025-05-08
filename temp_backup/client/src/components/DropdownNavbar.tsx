import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  Car, Cloud, Calendar, Book, Map, 
  Settings, Award, User, Package, 
  BarChart3, ShoppingCart, Wrench, FileSpreadsheet,
  X, LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNativeAuth } from "@/hooks/useNativeAuth";

interface DropdownNavbarProps {
  isOpen: boolean;
  onClose: () => void;
  demoMode?: boolean;
}

const DropdownNavbar = ({ isOpen, onClose, demoMode = false }: DropdownNavbarProps) => {
  const [location, navigate] = useLocation();
  const { logout } = useNativeAuth();
  
  // Handle navigation with closing menu
  const navigateTo = (path: string) => {
    navigate(path);
    onClose();
  };

  // Group menu items by category
  const menuGroups = [
    {
      title: "Main",
      items: [
        { 
          name: "Dashboard", 
          path: demoMode ? "/demo" : "/dashboard", 
          icon: <BarChart3 className="h-4 w-4 mr-2" /> 
        },
        { 
          name: "Garage Vault", 
          path: "/garage", 
          icon: <Car className="h-4 w-4 mr-2" /> 
        },
        { 
          name: "Weather Paddock", 
          path: "/weather-paddock", 
          icon: <Cloud className="h-4 w-4 mr-2" /> 
        },
        { 
          name: "Drive Journal", 
          path: "/drive-journal", 
          icon: <Book className="h-4 w-4 mr-2" /> 
        },
        { 
          name: "Route Planner", 
          path: "/route-planner", 
          icon: <Map className="h-4 w-4 mr-2" /> 
        },
      ]
    },
    {
      title: "Premium Features",
      items: [
        { 
          name: "Podium Pursuit", 
          path: "/podium-pursuit", 
          icon: <Award className="h-4 w-4 mr-2" /> 
        },
        { 
          name: "Manifestation Station", 
          path: "/manifestation-station", 
          icon: <FileSpreadsheet className="h-4 w-4 mr-2" /> 
        },
        { 
          name: "Juice Box", 
          path: "/juicebox", 
          icon: <Package className="h-4 w-4 mr-2" /> 
        },
        { 
          name: "Tires & Timepieces", 
          path: "/tires-timepieces", 
          icon: <ShoppingCart className="h-4 w-4 mr-2" /> 
        },
      ]
    },
    {
      title: "Account",
      items: [
        { 
          name: "Profile", 
          path: "/settings", 
          icon: <User className="h-4 w-4 mr-2" /> 
        },
        { 
          name: "Connect Vehicle", 
          path: "/connect-vehicle", 
          icon: <Wrench className="h-4 w-4 mr-2" /> 
        },
        { 
          name: "Settings", 
          path: "/settings", 
          icon: <Settings className="h-4 w-4 mr-2" /> 
        },
      ]
    }
  ];

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-y-auto">
      <div className="relative w-full max-w-md mx-auto bg-[#1a1a1a] min-h-screen shadow-xl border-r border-[#333]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <h2 className="text-xl font-bold text-white font-orbitron">
            <span className="text-[#1982FC]">PADDOCK</span>
            <span className="text-[#08c519]">20</span>
          </h2>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Menu items */}
        <div className="p-4">
          {menuGroups.map((group, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">
                {group.title}
              </h3>
              
              <div className="space-y-1">
                {group.items.map((item, itemIndex) => (
                  <Button
                    key={itemIndex}
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start text-left ${
                      location === item.path 
                        ? 'bg-[#1982FC]/20 text-[#1982FC]' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => navigateTo(item.path)}
                  >
                    {item.icon}
                    {item.name}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          
          {/* Logout button */}
          {!demoMode && (
            <div className="mt-8">
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  logout();
                  navigate('/auth');
                  onClose();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
          
          {/* Demo mode exit button */}
          {demoMode && (
            <div className="mt-8">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  navigate('/auth');
                  onClose();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Exit Demo Mode
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropdownNavbar;