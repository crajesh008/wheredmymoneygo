import { Card } from '@/components/ui/card';
import { Expense } from '@/hooks/useExpenses';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface InsightsPanelProps {
  expenses: Expense[];
}

export const InsightsPanel = ({ expenses }: InsightsPanelProps) => {
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (expenses.length > 0) {
      generateAIInsight();
    }
  }, [expenses.length]);

  const generateAIInsight = async () => {
    setIsLoading(true);
    try {
      const recentExpenses = expenses.slice(0, 10);
      
      const { data, error } = await supabase.functions.invoke('analyze-expenses', {
        body: { expenses: recentExpenses }
      });

      if (error) {
        if (error.message.includes('429')) {
          toast({
            title: "Rate limit reached",
            description: "Please try again in a moment.",
            variant: "destructive"
          });
          setInsight("You're tracking your expenses well! Keep it up to discover more insights.");
        } else if (error.message.includes('402')) {
          toast({
            title: "Credits needed",
            description: "Please add credits to continue using AI insights.",
            variant: "destructive"
          });
          setInsight("Add credits to unlock personalized AI insights about your spending.");
        } else {
          throw error;
        }
      } else if (data?.insight) {
        setInsight(data.insight);
      }
    } catch (error) {
      console.error('Error generating insight:', error);
      setInsight("Keep tracking your expenses to unlock personalized insights!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 shadow-soft bg-gradient-insight border-accent/30">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/20">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-accent-foreground animate-spin" />
          ) : (
            <Lightbulb className="w-5 h-5 text-accent-foreground" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-accent-foreground mb-2">💡 AI Insight</h3>
          <p className="text-accent-foreground/90">
            {isLoading ? 'Analyzing your spending patterns...' : insight || 'Add expenses to get personalized insights!'}
          </p>
        </div>
      </div>
    </Card>
  );
};
