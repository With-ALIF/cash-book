import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBudget } from '@/hooks/useBudget';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import EditBudgetDialog from './EditBudgetDialog';

export default function BudgetHistoryList() {
  const { budgetHistory, deleteBudget, updateBudget, isUpdatingBudget, isLoading } = useBudget();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold mb-4">বাজেট তালিকা</h3>
      
      {budgetHistory.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          এই মাসে কোনো বাজেট নেই
        </p>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {budgetHistory.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div>
                <p className="font-semibold text-success">
                  +{formatCurrency(Number(item.amount))}
                </p>
                {item.description && (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.budget_date), 'd MMM yyyy', { locale: bn })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <EditBudgetDialog 
                  budget={item}
                  onUpdate={updateBudget}
                  isUpdating={isUpdatingBudget}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteBudget(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
