import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { donationService } from '@/services/donationService';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

interface DonationFormProps {
  isOpen: boolean;
  onClose: () => void;
  ngoId: string;
  ngoName: string;
  onSuccess?: () => void;
}

export const DonationForm = ({ isOpen, onClose, ngoId, ngoName, onSuccess }: DonationFormProps) => {
  const [type, setType] = useState<'money' | 'item'>('money');
  const [amount, setAmount] = useState('');
  const [itemName, setItemName] = useState('');
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const donationData = {
        donorId: user.id,
        donorName: user.name,
        ngoId,
        ngoName,
        type,
        ...(type === 'money' 
          ? { amount: parseFloat(amount) }
          : { itemName, count: parseInt(count) }
        ),
      };

      await donationService.createDonation(donationData);

      toast({
        title: 'Donation submitted successfully!',
        description: `Your ${type === 'money' ? '$' + amount : itemName} donation to ${ngoName} has been recorded.`,
      });

      onClose();
      onSuccess?.();
      
      // Reset form
      setAmount('');
      setItemName('');
      setCount('');
      setType('money');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit donation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Donate to {ngoName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Donation Type</Label>
            <Select value={type} onValueChange={(value: 'money' | 'item') => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select donation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="money">Money</SelectItem>
                <SelectItem value="item">Item</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === 'money' ? (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input
                  id="itemName"
                  type="text"
                  placeholder="e.g., Books, School Supplies"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="count">Quantity</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="donate" disabled={loading} className="flex-1">
              {loading ? 'Processing...' : 'Donate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};