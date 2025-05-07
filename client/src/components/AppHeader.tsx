import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import AuthStatus from './AuthStatus';
import { useNativeAuth } from '@/hooks/useNativeAuth';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AppHeader({ className }: { className?: string }) {
  const [location] = useLocation();
  const { isAuthenticated } = useNativeAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
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
          
          {/* Removed the horizontal navigation links as requested */}
        </div>
        
        {/* Auth status and menu button */}
        <div className="flex items-center gap-2">
          {isAuthenticated && location !== '/auth' && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-[#1982FC] hover:text-white hover:bg-[#1982FC]/20"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <AuthStatus />
        </div>
      </div>
      
      {/* We can implement the mobile menu later if needed */}
    </header>
  );
}