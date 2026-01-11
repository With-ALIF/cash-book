import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useBudget } from '@/hooks/useBudget';
import { useExpenses, CATEGORY_LABELS, CATEGORY_COLORS, ExpenseCategory } from '@/hooks/useExpenses';
import { AlertTriangle } from 'lucide-react';

export default function BudgetPieChart() {
  const { budget } = useBudget();
  const { expenses, totalExpenses } = useExpenses();
  
  const budgetAmount = budget?.amount ? Number(budget.amount) : 0;
  const isOverBudget = totalExpenses > budgetAmount && budgetAmount > 0;

  // Category-wise expense data
  const categoryData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
    });

    return Object.entries(categoryTotals).map(([category, total]) => ({
      name: CATEGORY_LABELS[category as ExpenseCategory],
      value: total,
      color: CATEGORY_COLORS[category as ExpenseCategory],
    }));
  }, [expenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (categoryData.length === 0) {
    return (
      <div className="stat-card h-[350px] flex items-center justify-center">
        <p className="text-muted-foreground">খরচ যোগ করুন ক্যাটাগরি চার্ট দেখতে</p>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">ক্যাটাগরি ভিত্তিক খরচ</h3>
        {isOverBudget && (
          <div className="flex items-center gap-1 text-destructive text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>বাজেট অতিক্রম!</span>
          </div>
        )}
      </div>
      
      {/* Budget limit indicator */}
      {budgetAmount > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <div className="flex justify-between text-sm mb-1">
            <span>বাজেট লিমিট</span>
            <span className={isOverBudget ? 'text-destructive font-semibold' : ''}>
              {formatCurrency(totalExpenses)} / {formatCurrency(budgetAmount)}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${Math.min((totalExpenses / budgetAmount) * 100, 100)}%` }}
            />
          </div>
          {isOverBudget && (
            <p className="text-xs text-destructive mt-1">
              {formatCurrency(totalExpenses - budgetAmount)} অতিরিক্ত খরচ
            </p>
          )}
        </div>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))',
            }}
            labelStyle={{ color: 'hsl(var(--card-foreground))' }}
          />
          <Legend 
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
