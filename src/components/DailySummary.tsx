import { useMemo } from 'react';
import { Calendar, TrendingDown, ShoppingBag, Utensils, Car, FileText, Heart, GraduationCap, Gamepad2, MoreHorizontal } from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { format, isToday, isYesterday, subDays, startOfDay, endOfDay } from 'date-fns';
import { bn } from 'date-fns/locale';

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  food: { label: 'খাবার', icon: Utensils, color: 'text-orange-500 bg-orange-500/10' },
  transport: { label: 'যাতায়াত', icon: Car, color: 'text-blue-500 bg-blue-500/10' },
  shopping: { label: 'শপিং', icon: ShoppingBag, color: 'text-pink-500 bg-pink-500/10' },
  bills: { label: 'বিল', icon: FileText, color: 'text-yellow-500 bg-yellow-500/10' },
  health: { label: 'স্বাস্থ্য', icon: Heart, color: 'text-red-500 bg-red-500/10' },
  education: { label: 'শিক্ষা', icon: GraduationCap, color: 'text-indigo-500 bg-indigo-500/10' },
  entertainment: { label: 'বিনোদন', icon: Gamepad2, color: 'text-purple-500 bg-purple-500/10' },
  other: { label: 'অন্যান্য', icon: MoreHorizontal, color: 'text-gray-500 bg-gray-500/10' },
};

export default function DailySummary() {
  const { expenses, isLoading } = useExpenses();

  const dailyData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    // Group expenses by date
    const grouped: Record<string, typeof expenses> = {};
    
    expenses.forEach(expense => {
      const dateKey = expense.expense_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(expense);
    });

    // Get last 7 days
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dayExpenses = grouped[dateKey] || [];
      const total = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      
      // Group by category
      const categoryTotals: Record<string, number> = {};
      dayExpenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
      });

      days.push({
        date: dateKey,
        displayDate: getDisplayDate(date),
        total,
        count: dayExpenses.length,
        categories: categoryTotals,
        expenses: dayExpenses,
      });
    }

    return days;
  }, [expenses]);

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
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const todayData = dailyData[0];

  return (
    <div className="space-y-4">
      {/* Today's Summary Card */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">আজকের খরচ</h3>
              <p className="text-xs text-muted-foreground">{format(new Date(), 'd MMMM, yyyy', { locale: bn })}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(todayData?.total || 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              {todayData?.count || 0}টি খরচ
            </p>
          </div>
        </div>

        {/* Today's Category Breakdown */}
        {todayData && Object.keys(todayData.categories).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(todayData.categories).map(([category, amount]) => {
              const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
              const Icon = config.icon;
              return (
                <div 
                  key={category}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground truncate">{config.label}</p>
                    <p className="text-sm font-medium">৳{amount.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">আজ কোনো খরচ নেই</p>
          </div>
        )}
      </div>

      {/* Last 7 Days Summary */}
      <div className="stat-card">
        <h3 className="font-semibold mb-4">গত ৭ দিনের সামারি</h3>
        <div className="space-y-2">
          {dailyData.map((day, index) => (
            <div 
              key={day.date}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                index === 0 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  index === 0 ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <span className="text-sm font-medium">
                    {format(new Date(day.date + 'T00:00:00'), 'd')}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">{day.displayDate}</p>
                  <p className="text-xs text-muted-foreground">{day.count}টি খরচ</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${day.total > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {day.total > 0 ? formatCurrency(day.total) : '—'}
                </p>
                {day.total > 0 && Object.keys(day.categories).length > 0 && (
                  <div className="flex gap-1 justify-end mt-1">
                    {Object.keys(day.categories).slice(0, 3).map(cat => {
                      const config = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
                      const Icon = config.icon;
                      return (
                        <div 
                          key={cat}
                          className={`w-5 h-5 rounded flex items-center justify-center ${config.color}`}
                        >
                          <Icon className="w-3 h-3" />
                        </div>
                      );
                    })}
                    {Object.keys(day.categories).length > 3 && (
                      <span className="text-xs text-muted-foreground">+{Object.keys(day.categories).length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getDisplayDate(date: Date): string {
  if (isToday(date)) return 'আজ';
  if (isYesterday(date)) return 'গতকাল';
  return format(date, 'EEEE', { locale: bn });
}
