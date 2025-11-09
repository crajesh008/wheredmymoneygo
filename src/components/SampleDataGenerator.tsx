import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateSampleData } from '@/utils/sampleData';
import { toast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

export const SampleDataGenerator = ({ onGenerated }: { onGenerated: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const count = await generateSampleData();
      toast({
        title: "Sample data generated! ✨",
        description: `Added ${count} expenses from the past 6 months`,
      });
      onGenerated();
    } catch (error) {
      toast({
        title: "Error generating data",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleGenerate}
      disabled={loading}
      className="gap-2"
    >
      <Sparkles className="w-4 h-4" />
      {loading ? 'Generating...' : 'Generate Sample Data'}
    </Button>
  );
};