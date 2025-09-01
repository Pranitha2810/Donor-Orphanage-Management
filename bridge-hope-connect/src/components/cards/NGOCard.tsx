import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar } from 'lucide-react';

interface NGOCardProps {
  id: string;
  name: string;
  description: string;
  experience: string;
  onAction: (id: string, name: string) => void;
  actionLabel: string;
  actionVariant?: 'donate' | 'request' | 'default';
}

export const NGOCard = ({ 
  id, 
  name, 
  description, 
  experience, 
  onAction, 
  actionLabel, 
  actionVariant = 'default' 
}: NGOCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            {name}
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {experience}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onAction(id, name)}
          className="w-full"
          variant={actionVariant === 'donate' ? 'donate' : actionVariant === 'request' ? 'request' : 'default'}
        >
          {actionLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};