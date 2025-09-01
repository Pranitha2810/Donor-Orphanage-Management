import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { NGOCard } from '@/components/cards/NGOCard';
import { DonationCard } from '@/components/cards/DonationCard';
import { DonationForm } from '@/components/forms/DonationForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { donationService, NGO, Donation } from '@/services/donationService';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { Heart, TrendingUp, History, Gift } from 'lucide-react';

const DonorDashboard = () => {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [selectedNGO, setSelectedNGO] = useState<{ id: string; name: string }>({ id: '', name: '' });

  const user = authService.getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ngosData, donationsData] = await Promise.all([
        donationService.getNGOs(),
        user ? donationService.getDonations(user.id) : Promise.resolve([])
      ]);
      setNgos(ngosData);
      setDonations(donationsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = (ngoId: string, ngoName: string) => {
    setSelectedNGO({ id: ngoId, name: ngoName });
    setShowDonationForm(true);
  };

  const handleDonationSuccess = () => {
    fetchData(); // Refresh donations
  };

  const totalDonated = donations.reduce((sum, donation) => {
    return sum + (donation.amount || 0);
  }, 0);

  const pendingDonations = donations.filter(d => d.status === 'pending').length;
  const distributedDonations = donations.filter(d => d.status === 'distributed').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Donor Dashboard" userName={user?.name} />
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
      <Navbar title="Donor Dashboard" userName={user?.name} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Donated</p>
                <p className="text-2xl font-bold text-success">${totalDonated}</p>
              </div>
              <Gift className="h-8 w-8 text-success" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Donations</p>
                <p className="text-2xl font-bold text-primary">{donations.length}</p>
              </div>
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-warning">{pendingDonations}</p>
              </div>
              <History className="h-8 w-8 text-warning" />
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Distributed</p>
                <p className="text-2xl font-bold text-secondary">{distributedDonations}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="ngos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ngos">Available NGOs</TabsTrigger>
            <TabsTrigger value="history">Donation History</TabsTrigger>
            <TabsTrigger value="impact">Donation Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="ngos" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Partner NGOs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ngos.map((ngo) => (
                  <NGOCard
                    key={ngo.id}
                    id={ngo.id}
                    name={ngo.name}
                    description={ngo.description}
                    experience={ngo.experience}
                    onAction={handleDonate}
                    actionLabel="Donate"
                    actionVariant="donate"
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Your Donation History</h2>
              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">No donations yet</p>
                  <p className="text-sm text-muted-foreground">Start making a difference by donating to an NGO!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {donations.map((donation) => (
                    <DonationCard key={donation.id} {...donation} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Track Your Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {donations
                  .filter(d => d.status === 'distributed')
                  .map((donation) => (
                    <DonationCard key={donation.id} {...donation} />
                  ))}
                {donations.filter(d => d.status === 'distributed').length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">No distributed donations yet</p>
                    <p className="text-sm text-muted-foreground">Your donations are being processed by NGOs</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DonationForm
        isOpen={showDonationForm}
        onClose={() => setShowDonationForm(false)}
        ngoId={selectedNGO.id}
        ngoName={selectedNGO.name}
        onSuccess={handleDonationSuccess}
      />
    </div>
  );
};

export default DonorDashboard;