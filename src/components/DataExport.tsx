import { Button } from '@/components/ui/button';
import { Expense } from '@/hooks/useExpenses';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DataExportProps {
  expenses: Expense[];
}

export const DataExport = ({ expenses }: DataExportProps) => {
  const exportToCSV = () => {
    if (expenses.length === 0) {
      toast({
        title: "No data to export",
        description: "Add some expenses first!",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Date', 'Category', 'Amount', 'Mood', 'Note'];
    const rows = expenses.map(exp => [
      exp.date,
      exp.category,
      exp.amount.toString(),
      exp.mood,
      exp.note.replace(/,/g, ';') // Replace commas in notes
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful! 📊",
      description: `Exported ${expenses.length} expenses to CSV`,
    });
  };

  const exportToJSON = () => {
    if (expenses.length === 0) {
      toast({
        title: "No data to export",
        description: "Add some expenses first!",
        variant: "destructive"
      });
      return;
    }

    const jsonContent = JSON.stringify(expenses, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful! 📊",
      description: `Exported ${expenses.length} expenses to JSON`,
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
        <Download className="w-4 h-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={exportToJSON} className="gap-2">
        <Download className="w-4 h-4" />
        Export JSON
      </Button>
    </div>
  );
};