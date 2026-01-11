import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExpenses, CATEGORY_LABELS, ExpenseCategory } from '@/hooks/useExpenses';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import EditExpenseDialog from './EditExpenseDialog';

const CATEGORY_BG: Record<ExpenseCategory, string> = {
  food: 'bg-category-food/10 text-category-food',
  transport: 'bg-category-transport/10 text-category-transport',
  shopping: 'bg-category-shopping/10 text-category-shopping',
  bills: 'bg-category-bills/10 text-category-bills',
  health: 'bg-category-health/10 text-category-health',
  education: 'bg-category-education/10 text-category-education',
  entertainment: 'bg-category-entertainment/10 text-category-entertainment',
  other: 'bg-category-other/10 text-category-other',
};

export default function RecentExpenses() {
  const { expenses, deleteExpense, updateExpense, isUpdatingExpense, isLoading } = useExpenses();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const recentExpenses = expenses.slice(0, 10);

  if (isLoading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <h3 className="text-lg font-semibold mb-4">সাম্প্রতিক খরচ</h3>
      
      {recentExpenses.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          এখনো কোনো খরচ নেই
        </p>
      ) : (
        <div className="space-y-3">
          {recentExpenses.map((expense) => (
            <div 
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <span className={`category-badge ${CATEGORY_BG[expense.category]}`}>
                  {CATEGORY_LABELS[expense.category]}
                </span>
                <div>
                  {expense.description && (
                    <p className="text-sm font-medium">{expense.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(expense.expense_date), 'd MMM yyyy', { locale: bn })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-destructive">
                  -{formatCurrency(Number(expense.amount))}
                </span>
                <EditExpenseDialog
                  expense={expense}
                  onUpdate={updateExpense}
                  isUpdating={isUpdatingExpense}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteExpense(expense.id)}
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
