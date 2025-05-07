import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import AuthStatus from './AuthStatus';
import { useNativeAuth } from '@/hooks/useNativeAuth';

export default function AppHeader({ className }: { className?: string }) {
  const [location] = useLocation();
  const { isAuthenticated } = useNativeAuth();
  
  // Don't show navigation links on auth page or when not authenticated
  const showNavigation = location !== '/auth' && isAuthenticated;
  
  return (
    <header className={cn("bg-black/90 text-white border-b border-[#1982FC]/50 px-4 py-3", className)}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/">
            <div className="text-xl font-bold tracking-widest uppercase font-['Orbitron'] cursor-pointer">
              <span className="text-[#1982FC]">PADDOCK</span><span className="text-[#08c519]">20</span>
            </div>
          </Link>
          
          {/* Main navigation - only show on larger screens when authenticated and not on auth page */}
          {showNavigation && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/">
                <span className="text-white/80 hover:text-white transition-colors">Dashboard</span>
              </Link>
              <Link href="/weather-paddock">
                <span className="text-white/80 hover:text-white transition-colors">Weather Paddock</span>
              </Link>
              <Link href="/garage-vault">
                <span className="text-white/80 hover:text-white transition-colors">Garage Vault</span>
              </Link>
              <Link href="/drive-journal">
                <span className="text-white/80 hover:text-white transition-colors">Drive Journal</span>
              </Link>
              <Link href="/podium-pursuit">
                <span className="text-white/80 hover:text-white transition-colors">Podium Pursuit</span>
              </Link>
            </nav>
          )}
        </div>
        
        {/* Auth status and user menu */}
        <div className="flex items-center gap-2">
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}