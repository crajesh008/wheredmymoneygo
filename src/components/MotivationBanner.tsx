import { Card } from '@/components/ui/card';
import { getMotivationalMessage } from '@/utils/insights';
import { Sparkles } from 'lucide-react';

export const MotivationBanner = () => {
  const message = getMotivationalMessage();

  return (
    <Card className="p-4 shadow-soft bg-gradient-to-r from-success/10 to-primary/10 border-success/30">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-success/20">
          <Sparkles className="w-5 h-5 text-success" />
        </div>
        <p className="text-foreground font-medium">{message}</p>
      </div>
    </Card>
  );
};
