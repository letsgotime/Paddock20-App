import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  User,
  Calendar,
  Mail,
  Clock,
  Zap,
  ClipboardCheck
} from "lucide-react";

interface BetaTester {
  user_id: string;
  email: string;
  name: string;
  nickname: string;
  created_at: string;
  last_login: string;
  user_metadata?: {
    betaTesterStatus: 'pending' | 'approved' | 'rejected';
    betaProgram: 'user' | 'tester';
    betaAgreements?: {
      terms: boolean;
      nda: boolean;
      feedback: boolean;
    };
    betaRequestDate?: string;
  };
}

/**
 * Admin panel for approving beta tester applications
 */
const BetaTesterApprovalPanel: React.FC = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(true);
  const [pendingTesters, setPendingTesters] = useState<BetaTester[]>([]);
  const [approvedTesters, setApprovedTesters] = useState<BetaTester[]>([]);
  const [processingUsers, setProcessingUsers] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch beta testers on component mount
  useEffect(() => {
    fetchBetaTesters();
  }, []);

  // Function to fetch beta testers from the API
  const fetchBetaTesters = async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "read:users"
      });

      // Fetch beta tester lists
      const pendingResponse = await fetch("/api/auth0/beta-testers/pending", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const approvedResponse = await fetch("/api/auth0/beta-testers/approved", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!pendingResponse.ok || !approvedResponse.ok) {
        throw new Error("Failed to fetch beta testers");
      }

      const pendingData = await pendingResponse.json();
      const approvedData = await approvedResponse.json();

      setPendingTesters(pendingData.users || []);
      setApprovedTesters(approvedData.users || []);
    } catch (error) {
      console.error("Error fetching beta testers:", error);
      toast({
        title: "Failed to load beta testers",
        description: "There was an error loading the beta tester list.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to approve a beta tester
  const approveBetaTester = async (userId: string) => {
    setProcessingUsers(prev => [...prev, userId]);
    try {
      const token = await getAccessTokenSilently({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "update:users"
      });

      const response = await fetch(`/api/admin/approve-beta-tester/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to approve beta tester");
      }

      // Update the lists
      const updatedPending = pendingTesters.filter(user => user.user_id !== userId);
      const approvedUser = pendingTesters.find(user => user.user_id === userId);
      
      if (approvedUser) {
        setApprovedTesters(prev => [...prev, approvedUser]);
      }
      
      setPendingTesters(updatedPending);
      
      toast({
        title: "Beta Tester Approved",
        description: "The user has been granted beta access.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error approving beta tester:", error);
      toast({
        title: "Approval Failed",
        description: "There was an error approving the beta tester.",
        variant: "destructive"
      });
    } finally {
      setProcessingUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Function to reject a beta tester
  const rejectBetaTester = async (userId: string) => {
    setProcessingUsers(prev => [...prev, userId]);
    try {
      const token = await getAccessTokenSilently({
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: "update:users"
      });

      const response = await fetch(`/api/admin/reject-beta-tester/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to reject beta tester");
      }

      // Update the pending list
      setPendingTesters(prev => prev.filter(user => user.user_id !== userId));
      
      toast({
        title: "Beta Tester Rejected",
        description: "The user's beta request has been declined.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error rejecting beta tester:", error);
      toast({
        title: "Rejection Failed",
        description: "There was an error rejecting the beta tester.",
        variant: "destructive"
      });
    } finally {
      setProcessingUsers(prev => prev.filter(id => id !== userId));
    }
  };

  // Function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Render the beta tester lists
  const renderBetaTesters = (testers: BetaTester[], isPending: boolean) => {
    if (testers.length === 0) {
      return (
        <div className="py-10 text-center">
          <p className="text-gray-400">
            {isPending 
              ? "No pending beta testers found."
              : "No approved beta testers found."}
          </p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-900/50">
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Beta Program</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Login</TableHead>
            {isPending && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {testers.map(user => (
            <TableRow key={user.user_id}>
              <TableCell>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#4B9CD3]" />
                    <span className="font-medium text-white">{user.name || user.nickname || "Unnamed User"}</span>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{user.user_id}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#4B9CD3]" />
                  <span>{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.user_metadata?.betaProgram === 'tester' ? (
                    <>
                      <Zap className="h-4 w-4 text-[#08c519]" />
                      <Badge variant="outline" className="bg-green-900/20 border-green-500/30 text-green-500">
                        Beta Tester
                      </Badge>
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="h-4 w-4 text-[#4B9CD3]" />
                      <Badge variant="outline" className="bg-blue-900/20 border-[#4B9CD3]/30 text-[#4B9CD3]">
                        Beta User
                      </Badge>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#08c519]" />
                  <span>{formatDate(user.created_at)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#4B9CD3]" />
                  <span>{formatDate(user.last_login)}</span>
                </div>
              </TableCell>
              {isPending && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border border-green-600/30 hover:bg-green-900/20 text-green-500 hover:text-green-400"
                      onClick={() => approveBetaTester(user.user_id)}
                      disabled={processingUsers.includes(user.user_id)}
                    >
                      {processingUsers.includes(user.user_id) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border border-red-600/30 hover:bg-red-900/20 text-red-500 hover:text-red-400"
                      onClick={() => rejectBetaTester(user.user_id)}
                      disabled={processingUsers.includes(user.user_id)}
                    >
                      {processingUsers.includes(user.user_id) ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      Reject
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className="bg-black border-gray-800">
      <CardHeader className="bg-gray-900/30 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-[#4B9CD3] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#08c519]"></span>
              Beta Tester Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Approve or reject beta access requests
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="text-[#4B9CD3] border-[#4B9CD3]/30"
            onClick={fetchBetaTesters}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Refreshing...
              </>
            ) : (
              <>Refresh</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/30 mb-4">
            <TabsTrigger 
              value="pending"
              className="data-[state=active]:bg-[#4B9CD3]/20 data-[state=active]:text-[#4B9CD3]"
            >
              <Badge 
                variant="outline" 
                className="ml-2 bg-blue-900/20 border-[#4B9CD3]/30 text-[#4B9CD3]"
              >
                {pendingTesters.length}
              </Badge>
              <span className="ml-2">Pending Requests</span>
            </TabsTrigger>
            <TabsTrigger 
              value="approved"
              className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-500"
            >
              <Badge 
                variant="outline" 
                className="ml-2 bg-green-900/20 border-green-500/30 text-green-500"
              >
                {approvedTesters.length}
              </Badge>
              <span className="ml-2">Approved Testers</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="rounded-md bg-gray-950/50 border border-gray-800 p-4">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-[#4B9CD3]" />
                <span className="ml-3 text-gray-400">Loading pending beta testers...</span>
              </div>
            ) : (
              renderBetaTesters(pendingTesters, true)
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="rounded-md bg-gray-950/50 border border-gray-800 p-4">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                <span className="ml-3 text-gray-400">Loading approved beta testers...</span>
              </div>
            ) : (
              renderBetaTesters(approvedTesters, false)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BetaTesterApprovalPanel;