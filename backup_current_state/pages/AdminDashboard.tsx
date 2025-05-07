import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  UserCog, 
  Shield, 
  Activity, 
  AlertCircle, 
  Lock, 
  Unlock, 
  Edit, 
  Trash2, 
  Search,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  RefreshCw,
  Calendar,
  UserPlus
} from 'lucide-react';
import { useLocation } from 'wouter';

// Admin dashboard interface
interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: 'active' | 'pending' | 'suspended' | 'locked';
  lastLogin?: string;
  createdAt: string;
  onboardingCompleted?: boolean;
}

interface LoginActivity {
  id: number;
  userId: number;
  username: string;
  timestamp: string;
  status: 'success' | 'failed';
  ipAddress: string;
  device: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  onboardingCompletedPercentage: number;
  premiumUsers: number;
  suspendedUsers: number;
}

// Mock data - replace with API call for real data
const mockUsers: AdminUser[] = [
  {
    id: 2,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    status: 'active',
    lastLogin: '2025-05-06T14:30:00Z',
    createdAt: '2025-05-01T10:00:00Z',
    onboardingCompleted: true
  },
  {
    id: 3,
    username: 'adminuser',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active',
    lastLogin: '2025-05-07T09:15:00Z',
    createdAt: '2025-04-15T08:00:00Z',
    onboardingCompleted: true
  }
];

const mockLoginActivity: LoginActivity[] = [
  {
    id: 1,
    userId: 2,
    username: 'testuser',
    timestamp: '2025-05-06T14:30:00Z',
    status: 'success',
    ipAddress: '192.168.1.100',
    device: 'Chrome / macOS'
  },
  {
    id: 2,
    userId: 3,
    username: 'adminuser',
    timestamp: '2025-05-07T09:15:00Z',
    status: 'success',
    ipAddress: '192.168.1.101',
    device: 'Firefox / Windows'
  },
  {
    id: 3,
    userId: 2,
    username: 'testuser',
    timestamp: '2025-05-05T11:45:00Z',
    status: 'failed',
    ipAddress: '192.168.1.102',
    device: 'Safari / iOS'
  }
];

const mockUserStats: UserStats = {
  totalUsers: 2,
  activeUsers: 2,
  newUsersToday: 0,
  onboardingCompletedPercentage: 100,
  premiumUsers: 0,
  suspendedUsers: 0
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Main component
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [users, setUsers] = useState<AdminUser[]>(mockUsers);
  const [loginActivity, setLoginActivity] = useState<LoginActivity[]>(mockLoginActivity);
  const [userStats, setUserStats] = useState<UserStats>(mockUserStats);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUserDetails, setShowUserDetails] = useState<boolean>(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Function to load data from API
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Replace these mock calls with actual API calls
      // const response = await fetch('/api/admin/users');
      // const data = await response.json();
      // setUsers(data.users);
      
      // For now using mock data
      setTimeout(() => {
        setUsers(mockUsers);
        setLoginActivity(mockLoginActivity);
        setUserStats(mockUserStats);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  // Load data on initial render
  useEffect(() => {
    loadData();
  }, []);

  // Select user for detailed view
  const handleSelectUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  // Update user role
  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/admin/users/${userId}/role`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ role: newRole })
      // });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast({
        title: 'Role Updated',
        description: `User role has been updated to ${newRole}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update user status
  const handleUpdateUserStatus = async (userId: number, newStatus: 'active' | 'pending' | 'suspended' | 'locked') => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/admin/users/${userId}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast({
        title: 'Status Updated',
        description: `User status has been updated to ${newStatus}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // User status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      active: 'bg-green-500 hover:bg-green-600',
      pending: 'bg-yellow-500 hover:bg-yellow-600',
      suspended: 'bg-red-500 hover:bg-red-600',
      locked: 'bg-gray-500 hover:bg-gray-600'
    };
    
    const variant = status as keyof typeof variants;
    
    return (
      <Badge className={variants[variant]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-['Open_Sans']">
      {/* Admin Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1982FC] tracking-wide font-['Orbitron']">
          PADDOCK<span className="text-[#08c519]">20</span> ADMIN
        </h1>
        <p className="text-gray-400 mt-2">Complete control over your automotive ecosystem</p>
      </div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Sidebar - Navigation */}
        <Card className="xl:col-span-1 bg-zinc-900 border-[#1982FC]">
          <CardHeader>
            <CardTitle className="flex items-center text-[#1982FC]">
              <UserCog className="mr-2" /> Admin Control
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              <Button 
                variant="ghost" 
                className={`w-full justify-start pl-6 py-6 ${activeTab === 'overview' ? 'bg-zinc-800 text-[#1982FC]' : 'text-gray-300'}`}
                onClick={() => setActiveTab('overview')}
              >
                <BarChart3 className="mr-2 h-5 w-5" /> Overview
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start pl-6 py-6 ${activeTab === 'users' ? 'bg-zinc-800 text-[#1982FC]' : 'text-gray-300'}`}
                onClick={() => setActiveTab('users')}
              >
                <User className="mr-2 h-5 w-5" /> Users
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start pl-6 py-6 ${activeTab === 'activity' ? 'bg-zinc-800 text-[#1982FC]' : 'text-gray-300'}`}
                onClick={() => setActiveTab('activity')}
              >
                <Activity className="mr-2 h-5 w-5" /> Login Activity
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start pl-6 py-6 ${activeTab === 'permissions' ? 'bg-zinc-800 text-[#1982FC]' : 'text-gray-300'}`}
                onClick={() => setActiveTab('permissions')}
              >
                <Shield className="mr-2 h-5 w-5" /> Permissions
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start pl-6 py-6 text-gray-300"
                onClick={() => navigate('/')}
              >
                <RefreshCw className="mr-2 h-5 w-5" /> Back to App
              </Button>
            </nav>
          </CardContent>
        </Card>
        
        {/* Main Content Area */}
        <Card className={`${showUserDetails ? 'xl:col-span-2' : 'xl:col-span-3'} bg-zinc-900 border-[#1982FC]`}>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-4">
            <CardTitle className="text-xl font-medium">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'activity' && 'Login Activity'}
              {activeTab === 'permissions' && 'Role Permissions'}
            </CardTitle>
            
            {/* Action buttons */}
            <div className="flex space-x-2 mt-2 sm:mt-0">
              {activeTab === 'users' && (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Search users..."
                    className="pl-8 bg-zinc-800 border-zinc-700 focus:border-[#1982FC]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              <Button 
                onClick={loadData} 
                variant="outline" 
                size="icon"
                disabled={isLoading}
                className="border-zinc-700 text-white hover:bg-zinc-800"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {/* Dashboard Overview */}
            {activeTab === 'overview' && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats.totalUsers}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-zinc-400">Active Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats.activeUsers}</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-zinc-400">New Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats.newUsersToday}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-zinc-400">Onboarding Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats.onboardingCompletedPercentage}%</div>
                      <div className="w-full bg-zinc-700 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-[#08c519] h-2.5 rounded-full" 
                          style={{ width: `${userStats.onboardingCompletedPercentage}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-zinc-400">Premium Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{userStats.premiumUsers}</div>
                      <div className="text-sm text-zinc-400 mt-1">
                        {(userStats.premiumUsers / (userStats.totalUsers || 1) * 100).toFixed(1)}% of total
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-4">
                        {loginActivity.slice(0, 5).map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-4">
                            <div className={`mt-0.5 rounded-full p-1 ${activity.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                              {activity.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {activity.username}
                                <span className={`ml-2 text-xs rounded-full px-2 py-0.5 ${activity.status === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                  {activity.status}
                                </span>
                              </p>
                              <p className="text-xs text-zinc-400">
                                {formatDate(activity.timestamp)} • {activity.device}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Users Tab */}
            {activeTab === 'users' && (
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <Table>
                  <TableHeader className="bg-zinc-800">
                    <TableRow>
                      <TableHead className="text-zinc-400">Username</TableHead>
                      <TableHead className="text-zinc-400">Email</TableHead>
                      <TableHead className="text-zinc-400">Role</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Last Login</TableHead>
                      <TableHead className="text-zinc-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow 
                          key={user.id} 
                          className="hover:bg-zinc-800 cursor-pointer"
                          onClick={() => handleSelectUser(user)}
                        >
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge className={user.role === 'admin' ? 'bg-[#1982FC]' : 'bg-zinc-600'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={user.status} />
                          </TableCell>
                          <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectUser(user);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.status === 'active' ? (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-zinc-400 hover:text-red-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateUserStatus(user.id, 'suspended');
                                  }}
                                >
                                  <Lock className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8 text-zinc-400 hover:text-green-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateUserStatus(user.id, 'active');
                                  }}
                                >
                                  <Unlock className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                          {searchQuery ? 'No users matching your search' : 'No users found'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
            
            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <Table>
                  <TableHeader className="bg-zinc-800">
                    <TableRow>
                      <TableHead className="text-zinc-400">Username</TableHead>
                      <TableHead className="text-zinc-400">Time</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">IP Address</TableHead>
                      <TableHead className="text-zinc-400">Device</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginActivity.map((activity) => (
                      <TableRow key={activity.id} className="hover:bg-zinc-800">
                        <TableCell className="font-medium">{activity.username}</TableCell>
                        <TableCell>{formatDate(activity.timestamp)}</TableCell>
                        <TableCell>
                          <Badge className={activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'}>
                            {activity.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{activity.ipAddress}</TableCell>
                        <TableCell>{activity.device}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
            
            {/* Permissions Tab */}
            {activeTab === 'permissions' && (
              <div className="p-6">
                <Card className="bg-zinc-800 border-zinc-700 mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">Role Permissions</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Configure what each user role can access and modify
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[200px]">Permission</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Editor</TableHead>
                          <TableHead>Admin</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>View user data</TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Edit own profile</TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Edit other users</TableCell>
                          <TableCell><Switch disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Create content</TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Manage system</TableCell>
                          <TableCell><Switch disabled /></TableCell>
                          <TableCell><Switch disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>View analytics</TableCell>
                          <TableCell><Switch disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Manage permissions</TableCell>
                          <TableCell><Switch disabled /></TableCell>
                          <TableCell><Switch disabled /></TableCell>
                          <TableCell><Switch checked disabled /></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-[#1982FC] hover:bg-blue-600 text-white">
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-xl">Create New Role</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Define custom roles with specific permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role-name">Role Name</Label>
                        <Input
                          id="role-name"
                          placeholder="e.g. Moderator"
                          className="bg-zinc-700 border-zinc-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role-description">Description</Label>
                        <Input
                          id="role-description"
                          placeholder="Role description"
                          className="bg-zinc-700 border-zinc-600"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Base Permissions On</Label>
                      <Select>
                        <SelectTrigger className="bg-zinc-700 border-zinc-600">
                          <SelectValue placeholder="Select a base role" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="bg-[#1982FC] hover:bg-blue-600 text-white">
                      Create Role
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* User Detail Panel (visible when a user is selected) */}
        {showUserDetails && selectedUser && (
          <Card className="xl:col-span-1 bg-zinc-900 border-[#1982FC]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium">User Details</CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowUserDetails(false)}
                className="text-zinc-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </CardHeader>
            
            <CardContent className="pt-4">
              <div className="flex flex-col items-center mb-6">
                <div className="bg-[#1982FC] rounded-full p-8 mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-xl font-bold">{selectedUser.username}</h3>
                <p className="text-zinc-400">{selectedUser.email}</p>
                <div className="mt-2">
                  <Badge className={selectedUser.role === 'admin' ? 'bg-[#1982FC]' : 'bg-zinc-600'}>
                    {selectedUser.role}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Account Information</h4>
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Full Name</span>
                        <span>{selectedUser.firstName} {selectedUser.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Status</span>
                        <StatusBadge status={selectedUser.status} />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Created</span>
                        <span>{formatDate(selectedUser.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Last Login</span>
                        <span>{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Onboarding</span>
                        <span>{selectedUser.onboardingCompleted ? 'Completed' : 'Incomplete'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">User Management</h4>
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="user-role">Role</Label>
                        <Select defaultValue={selectedUser.role} onValueChange={(value) => handleUpdateUserRole(selectedUser.id, value)}>
                          <SelectTrigger className="bg-zinc-700 border-zinc-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="user-status">Status</Label>
                        <Select defaultValue={selectedUser.status} onValueChange={(value: any) => handleUpdateUserStatus(selectedUser.id, value)}>
                          <SelectTrigger className="bg-zinc-700 border-zinc-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="locked">Locked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-[#1982FC] hover:bg-blue-600 text-white" 
                    onClick={() => {
                      // Navigate to edit user page
                      // navigate(`/admin/users/${selectedUser.id}/edit`);
                      toast({
                        title: "Feature Coming Soon",
                        description: "Full user editing will be available in the next update",
                      });
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit User
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Are you sure?",
                        description: "This action cannot be undone. Please confirm via the upcoming dialog.",
                        variant: "destructive",
                      });
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}