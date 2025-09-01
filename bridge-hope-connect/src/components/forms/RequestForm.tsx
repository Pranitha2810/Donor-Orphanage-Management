import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orphanageService } from '@/services/orphanageService';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  ngoId: string;
  ngoName: string;
  onSuccess?: () => void;
}

export const RequestForm = ({ isOpen, onClose, ngoId, ngoName, onSuccess }: RequestFormProps) => {
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

      const requestData = {
        ngoId,
        ngoName,
        type,
        ...(type === 'money' 
          ? { amount: parseFloat(amount) }
          : { itemName, count: parseInt(count) }
        ),
      };

      await orphanageService.createRequest(user.id, requestData);

      toast({
        title: 'Request submitted successfully!',
        description: `Your request for ${type === 'money' ? '$' + amount : itemName} has been sent to ${ngoName}.`,
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
        description: error instanceof Error ? error.message : 'Failed to submit request',
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
          <DialogTitle>Request from {ngoName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Request Type</Label>
            <Select value={type} onValueChange={(value: 'money' | 'item') => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select request type" />
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
                placeholder="Enter amount needed"
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
                <Label htmlFor="count">Quantity Needed</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  placeholder="Enter quantity needed"
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
            <Button type="submit" variant="request" disabled={loading} className="flex-1">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};