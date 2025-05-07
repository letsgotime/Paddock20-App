/**
 * UserProfileCard Component
 * Displays user profile information with role-based display options
 * Used in various parts of the application where user info is needed
 */
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Mail, Settings, Star } from 'lucide-react';
import UserRoleBadge from './UserRoleBadge';
import { 
  useAuth, 
  usePermissions, 
  AuthPermission,
  AuthRole,
  User
} from '@/auth';

interface UserProfileCardProps {
  user?: User;
  variant?: 'default' | 'compact' | 'expanded';
  className?: string;
  showManageButton?: boolean;
  onManageClick?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user: propUser,
  variant = 'default',
  className = '',
  showManageButton = false,
  onManageClick
}) => {
  // Use provided user or current authenticated user
  const { user: authUser } = useAuth();
  const user = propUser || authUser;
  
  // Check permissions for customizing the display
  const { 
    hasPermission, 
    isPremium,
    isAdmin 
  } = usePermissions();
  
  // Don't render if no user data available
  if (!user) return null;
  
  // Format join date
  const joinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Unknown';
  
  // Generate avatar fallback (initials)
  const getInitials = () => {
    const username = user.username || '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    
    if (username) {
      return username.slice(0, 2).toUpperCase();
    }
    
    return 'P2';
  };
  
  // Render compact card
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <Avatar className="h-10 w-10 border border-carolina-blue">
          <AvatarImage src={user.profileImageUrl || ''} alt={user.username} />
          <AvatarFallback className="bg-zinc-800 text-carolina-blue">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <p className="font-medium text-white leading-none">{user.username}</p>
          <div className="mt-1">
            <UserRoleBadge role={user.role} showIcon={false} />
          </div>
        </div>
      </div>
    );
  }
  
  // Render expanded card
  if (variant === 'expanded') {
    return (
      <Card className={`bg-zinc-900 border-carolina-blue ${className}`}>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-carolina-blue">
                <AvatarImage src={user.profileImageUrl || ''} alt={user.username} />
                <AvatarFallback className="bg-zinc-800 text-carolina-blue text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 className="text-2xl font-bold text-white font-orbitron">{user.username}</h3>
                <div className="flex items-center mt-1 space-x-2">
                  <UserRoleBadge role={user.role} large />
                  
                  {isPremium && (
                    <Badge className="bg-amber-600">
                      <Star className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {showManageButton && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-carolina-blue border-carolina-blue"
                onClick={onManageClick}
              >
                <Settings className="h-4 w-4 mr-1" />
                Manage
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 gap-4">
            {(user.firstName || user.lastName) && (
              <div>
                <p className="text-zinc-400 text-sm">Full Name</p>
                <p className="text-white">{`${user.firstName || ''} ${user.lastName || ''}`.trim()}</p>
              </div>
            )}
            
            <div>
              <p className="text-zinc-400 text-sm">Email</p>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-carolina-blue mr-2" />
                <p className="text-white">{user.email}</p>
              </div>
            </div>
            
            <div>
              <p className="text-zinc-400 text-sm">Joined</p>
              <div className="flex items-center">
                <CalendarDays className="h-4 w-4 text-carolina-blue mr-2" />
                <p className="text-white">{joinDate}</p>
              </div>
            </div>
            
            {/* Display subscription info for premium users */}
            {isPremium && user.subscriptionTier && (
              <div>
                <p className="text-zinc-400 text-sm">Subscription</p>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-amber-500 mr-2" />
                  <p className="text-white capitalize">{user.subscriptionTier} Plan</p>
                  
                  {user.subscriptionExpiresAt && (
                    <Badge className="ml-2 bg-zinc-700 text-xs">
                      Expires {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Show admin-only information */}
            {isAdmin && (
              <div>
                <p className="text-zinc-400 text-sm">User ID</p>
                <p className="text-white font-mono text-sm">{user.id}</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter>
          {hasPermission(AuthPermission.MANAGE_OWN_PROFILE) && (
            <Button 
              variant="outline" 
              className="w-full border-carolina-blue text-carolina-blue"
              onClick={onManageClick}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }
  
  // Render default card
  return (
    <Card className={`bg-zinc-900 border-carolina-blue overflow-hidden ${className}`}>
      <div className="h-12 bg-gradient-to-r from-carolina-blue to-gotime-green opacity-50" />
      
      <div className="px-4 pb-4 -mt-6">
        <Avatar className="h-12 w-12 border-2 border-carolina-blue bg-zinc-900">
          <AvatarImage src={user.profileImageUrl || ''} alt={user.username} />
          <AvatarFallback className="bg-zinc-800 text-carolina-blue">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="mt-2">
          <h3 className="text-lg font-bold text-white">{user.username}</h3>
          
          <div className="flex items-center mt-1 space-x-2">
            <UserRoleBadge role={user.role} />
            
            {isPremium && (
              <Badge className="bg-amber-600">Premium</Badge>
            )}
          </div>
          
          <p className="text-zinc-400 text-sm mt-2">
            Joined {joinDate}
          </p>
        </div>
        
        {showManageButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3 border-carolina-blue text-carolina-blue"
            onClick={onManageClick}
          >
            Manage Profile
          </Button>
        )}
      </div>
    </Card>
  );
};

export default UserProfileCard;