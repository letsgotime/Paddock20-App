import React, { useState, useEffect } from 'react';
import { useAuth0Management } from '@/services/auth0Management';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BetaTester {
  user_id: string;
  email: string;
  name: string;
  nickname: string;
  created_at: string;
  last_login: string;
}

/**
 * Admin panel for approving beta tester applications
 */
const BetaTesterApprovalPanel = () => {
  const [pendingTesters, setPendingTesters] = useState<BetaTester[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState<Record<string, boolean>>({});
  const { getPendingBetaTesters, approveBetaTester } = useAuth0Management();
  const { toast } = useToast();
  
  // Load pending beta testers on component mount
  useEffect(() => {
    fetchPendingTesters();
  }, []);
  
  // Function to load pending beta testers
  const fetchPendingTesters = async () => {
    try {
      setLoading(true);
      const result = await getPendingBetaTesters();
      setPendingTesters(result.users || []);
    } catch (error) {
      console.error('Error fetching pending beta testers:', error);
      toast({
        title: 'Failed to Load',
        description: 'Could not load pending beta testers. Check your admin permissions.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to approve a beta tester
  const handleApprove = async (userId: string) => {
    try {
      // Mark this user as being processed
      setProcessingUsers(prev => ({ ...prev, [userId]: true }));
      
      // Call API to approve beta tester
      await approveBetaTester(userId);
      
      // Remove approved tester from the list
      setPendingTesters(prev => prev.filter(user => user.user_id !== userId));
      
      toast({
        title: 'Tester Approved',
        description: 'Beta tester has been approved and email notification sent.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error approving beta tester:', error);
      toast({
        title: 'Approval Failed',
        description: 'Could not approve beta tester. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Clear processing state
      setProcessingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[#1982FC]">Beta Tester Approval</CardTitle>
        <CardDescription>
          Manage pending beta tester applications and approve premium access
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="w-full py-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#1982FC]" />
          </div>
        ) : pendingTesters.length === 0 ? (
          <div className="w-full py-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-[#08c519]/50 mb-3" />
            <p className="text-gray-400">No pending beta tester applications</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingTesters.map((tester) => (
                <TableRow key={tester.user_id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{tester.name || tester.nickname}</span>
                      <span className="text-sm text-gray-400">{tester.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-[#1982FC]/10 hover:bg-[#1982FC]/20 text-[#1982FC]">
                      {formatDate(tester.created_at)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(tester.user_id)}
                      disabled={processingUsers[tester.user_id]}
                      className="bg-gradient-to-r from-[#1982FC] to-[#08c519] hover:bg-gradient-to-r hover:from-[#1982FC]/90 hover:to-[#08c519]/90 text-white"
                    >
                      {processingUsers[tester.user_id] ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      <CardFooter className="justify-between">
        <p className="text-sm text-gray-400">
          Approving grants lifetime premium access
        </p>
        <Button 
          variant="outline" 
          onClick={fetchPendingTesters}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Refresh'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BetaTesterApprovalPanel;