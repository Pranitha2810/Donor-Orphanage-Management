import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Package, Calendar, Home } from 'lucide-react';

interface RequestCardProps {
  id: string;
  orphanageName: string;
  ngoName?: string;
  type: 'money' | 'item';
  amount?: number;
  itemName?: string;
  count?: number;
  status?: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const RequestCard = ({ 
  id,
  orphanageName, 
  ngoName,
  type, 
  amount, 
  itemName, 
  count, 
  status = 'pending',
  createdAt,
  showActions = false,
  onAccept,
  onReject
}: RequestCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'accepted':
        return 'bg-success text-success-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
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
        <div className="flex items-center gap-2 mb-3">
          <Home className="h-4 w-4 text-primary" />
          <CardDescription>
            <span className="font-medium">{orphanageName}</span>
          </CardDescription>
        </div>
        {ngoName && (
          <CardDescription className="mb-3">
            NGO: <span className="font-medium">{ngoName}</span>
          </CardDescription>
        )}
        {showActions && status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => onAccept?.(id)}
              className="flex-1"
            >
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onReject?.(id)}
              className="flex-1"
            >
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};