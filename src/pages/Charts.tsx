import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useExpenses, CATEGORY_LABELS, CATEGORY_COLORS, ExpenseCategory } from '@/hooks/useExpenses';
import { useBudgetHistory } from '@/hooks/useBudgetHistory';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  format, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  eachDayOfInterval, parseISO
} from 'date-fns';
import { bn } from 'date-fns/locale';
import { Calendar, X } from 'lucide-react';

type ViewType = 'month' | 'week' | 'day' | 'custom';

const MONTHS_BN = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন',
  'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

export default function Charts() {
  const { expenses, currentMonth, currentYear } = useExpenses();
  const { totalBudget } = useBudgetHistory();
  const [viewType, setViewType] = useState<ViewType>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const filteredExpenses = useMemo(() => {
    if (viewType !== 'custom' || !customStartDate || !customEndDate) return expenses;
    return expenses.filter(exp => exp.expense_date >= customStartDate && exp.expense_date <= customEndDate);
  }, [expenses, viewType, customStartDate, customEndDate]);

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    filteredExpenses.forEach(exp => {
      totals[exp.category] = (totals[exp.category] || 0) + Number(exp.amount);
    });
    
    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(totals).map(([category, value]) => ({
      name: CATEGORY_LABELS[category as ExpenseCategory],
      value: value,
      percentage: total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0,
      color: CATEGORY_COLORS[category as ExpenseCategory],
    }));
  }, [filteredExpenses]);

  const barData = useMemo(() => {
    const now = new Date();
    const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    let interval;

    if (viewType === 'month') {
      interval = {
        start: startOfMonth(new Date(currentYear, currentMonth - 1)),
        end: endOfMonth(new Date(currentYear, currentMonth - 1)),
      };
    } else if (viewType === 'week') {
      interval = {
        start: startOfWeek(bdTime, { weekStartsOn: 6 }),
        end: endOfWeek(bdTime, { weekStartsOn: 6 }),
      };
    } else if (viewType === 'custom' && customStartDate && customEndDate) {
      interval = {
        start: parseISO(customStartDate),
        end: parseISO(customEndDate),
      };
    } else if (viewType === 'day') {
      return [{
        date: format(bdTime, 'd MMM', { locale: bn }),
        amount: filteredExpenses
          .filter(exp => exp.expense_date === format(bdTime, 'yyyy-MM-dd'))
          .reduce((s, e) => s + Number(e.amount), 0),
      }];
    } else {
      return [];
    }

    return eachDayOfInterval(interval).map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return {
        date: format(day, 'd MMM', { locale: bn }),
        amount: filteredExpenses
          .filter(exp => exp.expense_date === dateStr)
          .reduce((s, e) => s + Number(e.amount), 0),
      };
    });
  }, [filteredExpenses, viewType, currentMonth, currentYear, customStartDate, customEndDate]);

  const budgetChartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;
      if (m <= 0) {
        m += 12;
        y -= 1;
      }
      data.push({
        month: MONTHS_BN[m - 1],
        budget: m === currentMonth && y === currentYear ? totalBudget : 0,
      });
    }
    return data;
  }, [totalBudget, currentMonth, currentYear]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value);

  const totalExpensesInRange = useMemo(
    () => filteredExpenses.reduce((s, e) => s + Number(e.amount), 0),
    [filteredExpenses]
  );

  const handleClearCustomDates = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    setViewType('month');
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{data.name}</p>
          <p className="text-primary font-bold">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-full overflow-x-hidden">
        <h1 className="text-2xl font-bold">চার্ট বিশ্লেষণ</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              কাস্টম তারিখ নির্বাচন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>শুরুর তারিখ</Label>
                <Input type="date" value={customStartDate} onChange={e => {
                  setCustomStartDate(e.target.value);
                  if (e.target.value && customEndDate) setViewType('custom');
                }} />
              </div>
              <div className="space-y-2">
                <Label>শেষ তারিখ</Label>
                <Input type="date" value={customEndDate} onChange={e => {
                  setCustomEndDate(e.target.value);
                  if (customStartDate && e.target.value) setViewType('custom');
                }} />
              </div>
              <div className="flex items-end">
                {customStartDate && customEndDate && (
                  <Button variant="outline" onClick={handleClearCustomDates} className="w-full gap-2">
                    <X className="w-4 h-4" />
                    রিসেট করুন
                  </Button>
                )}
              </div>
            </div>

            {viewType === 'custom' && customStartDate && customEndDate && (
              <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium">
                  নির্বাচিত সময়সীমা: {format(parseISO(customStartDate), 'd MMMM yyyy', { locale: bn })} - {format(parseISO(customEndDate), 'd MMMM yyyy', { locale: bn })}
                </p>
                <p className="text-lg font-bold mt-2">
                  মোট খরচ: {formatCurrency(totalExpensesInRange)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">
                ক্যাটাগরি অনুসারে খরচ
                {viewType === 'custom' && ' (কাস্টম রেঞ্জ)'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {categoryData.length > 0 ? (
                <>
                  <div className="w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categoryData.map(cat => (
                      <div key={cat.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(cat.value)}</p>
                          <p className="text-xs font-semibold text-primary">{cat.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  কোনো ডেটা নেই
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-lg">
                  দৈনিক খরচ
                  {viewType === 'custom' && ' (কাস্টম রেঞ্জ)'}
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant={viewType === 'day' ? 'default' : 'outline'} onClick={() => setViewType('day')}>আজ</Button>
                  <Button size="sm" variant={viewType === 'week' ? 'default' : 'outline'} onClick={() => setViewType('week')}>সপ্তাহ</Button>
                  <Button size="sm" variant={viewType === 'month' ? 'default' : 'outline'} onClick={() => setViewType('month')}>মাস</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {barData.length > 0 ? (
                <div className="w-full h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={-45} textAnchor="end" height={70} />
                      <YAxis tickFormatter={v => `৳${v}`} width={50} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  কোনো ডেটা নেই
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">বাজেট গ্রাফ (গত ৬ মাস)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="w-full h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={v => `৳${v}`} width={50} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}