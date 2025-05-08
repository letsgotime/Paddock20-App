/**
 * UserRoleBadge Component
 * Displays a badge indicating the user's role within the PADDOCK20 ecosystem
 */
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldCheck, 
  Award, 
  User, 
  Star, 
  Users, 
  WrenchIcon 
} from 'lucide-react';
import { AuthRole } from '@/auth';

interface UserRoleBadgeProps {
  role?: AuthRole;
  showIcon?: boolean;
  large?: boolean;
}

// Badge configuration based on user role
const roleBadgeConfig: Record<AuthRole, {
  label: string;
  color: string;
  icon: React.ReactNode;
}> = {
  [AuthRole.DRIVER]: {
    label: 'Driver',
    color: 'bg-zinc-700',
    icon: <User className="h-3 w-3" />
  },
  [AuthRole.TEAM_MANAGER]: {
    label: 'Team Manager',
    color: 'bg-purple-700',
    icon: <Users className="h-3 w-3" />
  },
  [AuthRole.RACE_ENGINEER]: {
    label: 'Race Engineer',
    color: 'bg-carolina-blue',
    icon: <WrenchIcon className="h-3 w-3" />
  },
  [AuthRole.TEAM_PRINCIPAL]: {
    label: 'Team Principal',
    color: 'bg-red-700',
    icon: <ShieldCheck className="h-3 w-3" />
  },
  [AuthRole.BETA_TESTER]: {
    label: 'Beta Tester',
    color: 'bg-amber-600',
    icon: <Star className="h-3 w-3" />
  }
};

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ 
  role = AuthRole.DRIVER,
  showIcon = true,
  large = false
}) => {
  const config = roleBadgeConfig[role] || roleBadgeConfig[AuthRole.DRIVER];
  
  const className = `${config.color} ${large ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'}`;
  
  return (
    <Badge className={className}>
      {showIcon && (
        <span className="mr-1">
          {config.icon}
        </span>
      )}
      {config.label}
    </Badge>
  );
};

export default UserRoleBadge;