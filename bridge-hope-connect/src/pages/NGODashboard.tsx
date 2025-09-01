import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { RequestCard } from '@/components/cards/RequestCard';
import { DonationCard } from '@/components/cards/DonationCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ngoService, OrphanageRequest, MatchedDonation, DistributionRecord } from '@/services/ngoService';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { Inbox, Heart, History, User, TrendingUp } from 'lucide-react';

const NGODashboard = () => {
  const [requests, setRequests] = useState<OrphanageRequest[]>([]);
  const [donations, setDonations] = useState<MatchedDonation[]>([]);
  const [distributionHistory, setDistributionHistory] = useState<DistributionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const user = authService.getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (user) {
        const [requestsData, donationsData, historyData] = await Promise.all([
          ngoService.getRequests(user.id),
          ngoService.getDonations(user.id),
          ngoService.getDistributionHistory(user.id)
        ]);
        setRequests(requestsData);
        setDonations(donationsData);
        setDistributionHistory(historyData);
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

  const handleDistribution = async (donationId: string, orphanageName: string, action: 'accept' | 'reject') => {
    try {
      if (user) {
        await ngoService.distributeDonation(user.id, donationId, orphanageName, action);
        toast({
          title: action === 'accept' ? 'Donation Accepted' : 'Donation Rejected',
          description: `The donation has been ${action}ed for ${orphanageName}`,
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process distribution',
        variant: 'destructive',
      });
    }
  };

  const totalRequests = requests.length;
  const totalDonations = donations.length;
  const acceptedDistributions = distributionHistory.filter(d => d.status === 'accepted').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="NGO Dashboard" userName={user?.name} />
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
      <Navbar title="NGO Dashboard" userName={user?.name} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold text-primary">{totalRequests}</p>
              </div>
              <Inbox className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Donations Received</p>
                <p className="text-2xl font-bold text-success">{totalDonations}</p>
              </div>
              <Heart className="h-8 w-8 text-success" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Distributed</p>
                <p className="text-2xl font-bold text-secondary">{acceptedDistributions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total History</p>
                <p className="text-2xl font-bold text-muted-foreground">{distributionHistory.length}</p>
              </div>
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Request Log</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="history">Distribution History</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Orphanage Requests</h2>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No requests yet</p>
                  <p className="text-sm text-muted-foreground">Orphanages will submit their needs here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requests.map((request) => (
                    <RequestCard
                      key={request.id}
                      id={request.id}
                      orphanageName={request.orphanageName}
                      type={request.type}
                      amount={request.amount}
                      itemName={request.itemName}
                      count={request.count}
                      createdAt={request.createdAt}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="donations" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Received Donations</h2>
              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No donations yet</p>
                  <p className="text-sm text-muted-foreground">Donors will contribute to your NGO here</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {donations.map((donation) => (
                    <Card key={donation.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Donation from {donation.donorName}
                          </h3>
                          <p className="text-muted-foreground">
                            {donation.type === 'money' 
                              ? `$${donation.amount}` 
                              : `${donation.itemName} (${donation.count})`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-medium">Matched Orphanages:</h4>
                        {donation.matchedOrphanages.map((orphanage, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span>{orphanage}</span>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleDistribution(donation.donationId, orphanage, 'accept')}
                              >
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDistribution(donation.donationId, orphanage, 'reject')}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Distribution History</h2>
              {distributionHistory.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No distribution history yet</p>
                  <p className="text-sm text-muted-foreground">Completed distributions will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {distributionHistory.map((record) => (
                    <Card key={record.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-sm">
                            {record.type === 'money' 
                              ? `$${record.amount}` 
                              : `${record.itemName} (${record.count})`
                            }
                          </h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            record.status === 'accepted' 
                              ? 'bg-success text-success-foreground' 
                              : 'bg-destructive text-destructive-foreground'
                          }`}>
                            {record.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          From: {record.donorName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          To: {record.orphanageName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {record.distributedAt}
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
                  NGO Profile
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
                <div>
                  <label className="text-sm font-medium">Experience</label>
                  <p className="text-muted-foreground">{user?.experience || 'No experience specified'}</p>
                </div>
                <Button variant="outline" className="mt-4">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NGODashboard;