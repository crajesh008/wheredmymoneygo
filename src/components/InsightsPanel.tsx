import { Card } from '@/components/ui/card';
import { Expense } from '@/hooks/useExpenses';
import { generateInsight } from '@/utils/insights';
import { Lightbulb } from 'lucide-react';

interface InsightsPanelProps {
  expenses: Expense[];
}

export const InsightsPanel = ({ expenses }: InsightsPanelProps) => {
  const insight = generateInsight(expenses);

  return (
    <Card className="p-6 shadow-soft bg-gradient-insight border-accent/30">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-accent/20">
          <Lightbulb className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-accent-foreground mb-2">💡 Insight</h3>
          <p className="text-accent-foreground/90">{insight}</p>
        </div>
      </div>
    </Card>
  );
};
