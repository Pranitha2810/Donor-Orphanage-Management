import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { NGOCard } from '@/components/cards/NGOCard';
import { RequestCard } from '@/components/cards/RequestCard';
import { RequestForm } from '@/components/forms/RequestForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { orphanageService, OrphanageRequestHistory, AcceptedRequest } from '@/services/orphanageService';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { Building2, Send, CheckCircle, User, TrendingUp } from 'lucide-react';

const OrphanageDashboard = () => {
  const [ngos, setNgos] = useState<any[]>([]);
  const [requestHistory, setRequestHistory] = useState<OrphanageRequestHistory[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<AcceptedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState<{ id: string; name: string }>({ id: '', name: '' });

  const user = authService.getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user) {
        const [ngosData, historyData, acceptedData] = await Promise.all([
          orphanageService.getNGOs(),
          orphanageService.getRequestHistory(user.id),
          orphanageService.getAcceptedRequests(user.id)
        ]);
        setNgos(ngosData);
        setRequestHistory(historyData);
        setAcceptedRequests(acceptedData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = (ngoId: string, ngoName: string) => {
    setSelectedNGO({ id: ngoId, name: ngoName });
    setShowRequestForm(true);
  };

  const handleRequestSuccess = () => {
    fetchData(); // Refresh request history
  };

  const totalRequests = requestHistory.length;
  const pendingRequests = requestHistory.filter(r => r.status === 'pending').length;
  const acceptedRequestsCount = acceptedRequests.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Orphanage Dashboard" userName={user?.name} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Orphanage Dashboard" userName={user?.name} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-primary">{totalRequests}</p>
              </div>
              <Send className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{pendingRequests}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-warning" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-success">{acceptedRequestsCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Partner NGOs</p>
                <p className="text-2xl font-bold text-secondary">{ngos.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-secondary" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="ngos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ngos">Partner NGOs</TabsTrigger>
            <TabsTrigger value="history">Request History</TabsTrigger>
            <TabsTrigger value="accepted">Accepted Requests</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="ngos" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Partner NGOs</h2>
              {ngos.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No NGOs available</p>
                  <p className="text-sm text-muted-foreground">NGOs will appear here once they register</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ngos.map((ngo) => (
                    <NGOCard
                      key={ngo.id}
                      id={ngo.id}
                      name={ngo.name}
                      description={ngo.description}
                      experience={ngo.experience}
                      onAction={handleRequest}
                      actionLabel="Request Support"
                      actionVariant="request"
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Request History</h2>
              {requestHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No requests sent yet</p>
                  <p className="text-sm text-muted-foreground">Start by requesting support from an NGO</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requestHistory.map((request) => (
                    <RequestCard
                      key={request.id}
                      id={request.id}
                      orphanageName={request.orphanageName}
                      ngoName={request.ngoName}
                      type={request.type}
                      amount={request.amount}
                      itemName={request.itemName}
                      count={request.count}
                      status={request.status}
                      createdAt={request.createdAt}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="accepted" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Accepted Requests</h2>
              {acceptedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No accepted requests yet</p>
                  <p className="text-sm text-muted-foreground">Accepted requests will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {acceptedRequests.map((request) => (
                    <Card key={request.id} className="p-4 border-success">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-sm">
                            {request.type === 'money' 
                              ? `$${request.amount}` 
                              : `${request.itemName} (${request.count})`
                            }
                          </h3>
                          <span className="px-2 py-1 rounded text-xs bg-success text-success-foreground">
                            Accepted
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          NGO: {request.ngoName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Donor: {request.donorName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Accepted: {request.acceptedAt}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Orphanage Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Organization Name</label>
                  <p className="text-lg">{user?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-muted-foreground">{user?.description || 'No description provided'}</p>
                </div>
                <Button variant="outline" className="mt-4">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <RequestForm
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        ngoId={selectedNGO.id}
        ngoName={selectedNGO.name}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
};

export default OrphanageDashboard;