import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Package, Calendar, MapPin } from 'lucide-react';

interface DonationCardProps {
  id: string;
  donorName?: string;
  ngoName: string;
  type: 'money' | 'item';
  amount?: number;
  itemName?: string;
  count?: number;
  status: 'pending' | 'distributed';
  orphanageName?: string;
  createdAt: string;
  showDonor?: boolean;
}

export const DonationCard = ({ 
  donorName, 
  ngoName, 
  type, 
  amount, 
  itemName, 
  count, 
  status, 
  orphanageName, 
  createdAt,
  showDonor = false
}: DonationCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'distributed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            {type === 'money' ? (
              <DollarSign className="h-4 w-4 text-success" />
            ) : (
              <Package className="h-4 w-4 text-primary" />
            )}
            {type === 'money' ? `$${amount}` : `${itemName} (${count})`}
          </CardTitle>
          <Badge className={getStatusColor()}>
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {createdAt}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {showDonor && donorName && (
          <CardDescription className="mb-2">
            From: <span className="font-medium">{donorName}</span>
          </CardDescription>
        )}
        <CardDescription className="mb-2">
          NGO: <span className="font-medium">{ngoName}</span>
        </CardDescription>
        {status === 'distributed' && orphanageName && (
          <div className="flex items-center gap-1 text-sm text-success">
            <MapPin className="h-3 w-3" />
            Distributed to {orphanageName}
          </div>
        )}
      </CardContent>
    </Card>
  );
};