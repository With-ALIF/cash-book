import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useExpenses, CATEGORY_LABELS, ExpenseCategory } from '@/hooks/useExpenses';
import { useBudget } from '@/hooks/useBudget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Filter, Calendar, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

const MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export default function Reports() {
  const now = new Date();
  const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
  
  const [selectedMonth, setSelectedMonth] = useState(bdTime.getUTCMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(bdTime.getUTCFullYear());
  const [filterDate, setFilterDate] = useState('');
  const [activeTab, setActiveTab] = useState('expenses');
  
  const { expenses, totalExpenses } = useExpenses(selectedMonth, selectedYear);
  const { budget, budgetHistory } = useBudget(selectedMonth, selectedYear);

  const years = Array.from({ length: 5 }, (_, i) => bdTime.getUTCFullYear() - i);

  const filteredExpenses = useMemo(() => {
    if (!filterDate) return expenses;
    return expenses.filter(exp => exp.expense_date === filterDate);
  }, [expenses, filterDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const downloadExpensesPDF = async () => {
    const total = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    const categoryTotals: Partial<Record<ExpenseCategory, number>> = {};
    
    filteredExpenses.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
    });
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>খরচ রিপোর্ট</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Noto Sans Bengali', sans-serif;
            padding: 20px;
            color: #1f2937;
            background: #ffffff;
            line-height: 1.6;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .header {
            text-align: center;
            padding: 30px 20px;
            border-bottom: 3px solid #16a34a;
            margin-bottom: 30px;
          }

          .header h1 {
            color: #16a34a;
            font-size: clamp(20px, 5vw, 28px);
            margin: 0 0 10px 0;
            font-weight: 700;
          }

          .header .subtitle {
            color: #6b7280;
            font-size: clamp(12px, 3vw, 14px);
            margin-top: 5px;
          }

          .filter-info {
            margin: 0 0 25px 0;
            padding: 12px 16px;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 8px;
            font-size: clamp(11px, 2.5vw, 13px);
            color: #374151;
            border: 1px solid #d1d5db;
            word-wrap: break-word;
          }

          .filter-info strong {
            color: #16a34a;
            margin-right: 8px;
            display: block;
            margin-bottom: 5px;
          }

          .summary-cards {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            margin: 25px 0;
          }

          .summary-card {
            flex: 1;
            min-width: 0;
            background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .summary-card.expense {
            border-color: #fca5a5;
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          }

          .summary-card.count {
            border-color: #a5b4fc;
            background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
          }

          .summary-card .label {
            font-size: clamp(11px, 2.5vw, 13px);
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: block;
          }

          .summary-card .value {
            font-size: clamp(18px, 4vw, 24px);
            font-weight: 700;
            margin: 5px 0;
            word-wrap: break-word;
          }

          .summary-card.expense .value {
            color: #dc2626;
          }

          .summary-card.count .value {
            color: #4f46e5;
          }

          .entry-count {
            text-align: center;
            margin: 20px 0;
            padding: 12px;
            background: #f9fafb;
            border-radius: 6px;
            font-size: clamp(12px, 3vw, 14px);
            color: #6b7280;
          }

          .entry-count strong {
            color: #16a34a;
            font-size: clamp(16px, 3.5vw, 18px);
          }

          .category-breakdown {
            margin: 25px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
            border-radius: 10px;
            border: 1px solid #e5e7eb;
          }

          .category-breakdown h3 {
            font-size: clamp(14px, 3vw, 18px);
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          }

          .category-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-top: 15px;
          }

          .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
          }

          .category-name {
            font-size: clamp(12px, 2.5vw, 14px);
            color: #6b7280;
            font-weight: 500;
          }

          .category-amount {
            font-size: clamp(12px, 2.5vw, 14px);
            font-weight: 700;
            color: #dc2626;
          }

          .table-wrapper {
            overflow-x: auto;
            margin-top: 20px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
            min-width: 600px;
          }
          
          th {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 14px 12px;
            text-align: left;
            font-weight: 600;
            font-size: clamp(11px, 2.5vw, 14px);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: clamp(12px, 2.8vw, 14px);
            word-wrap: break-word;
          }
          
          tr:nth-child(even) {
            background-color: #f9fafb;
          }

          tr:hover {
            background-color: #f3f4f6;
          }
          
          .amount {
            text-align: right;
            font-weight: 700;
            color: #dc2626;
            font-size: clamp(13px, 3vw, 15px);
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: clamp(11px, 2.5vw, 13px);
          }

          @media (max-width: 768px) {
            body {
              padding: 10px;
            }

            .header {
              padding: 20px 10px;
            }

            .summary-cards {
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .summary-card {
              padding: 15px;
            }

            table {
              font-size: 12px;
            }

            th, td {
              padding: 8px 6px;
            }
          }
          
          @media print {
            body { 
              padding: 20px;
            }
            .summary-cards { 
              page-break-inside: avoid;
            }
            table { 
              page-break-inside: auto;
            }
            tr { 
              page-break-inside: avoid;
              page-break-after: auto;
            }
            .table-wrapper {
              overflow-x: visible;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>খরচ রিপোর্ট</h1>
            <div class="subtitle">${MONTHS_BN[selectedMonth - 1]} ${selectedYear} | তৈরি: ${format(new Date(), 'd MMMM yyyy, h:mm a', { locale: bn })}</div>
          </div>
        
          ${filterDate ? `
            <div class="filter-info">
              <strong>প্রয়োগকৃত ফিল্টার:</strong>
              <div>
                তারিখ: ${format(new Date(filterDate), 'd MMM yyyy', { locale: bn })}
              </div>
            </div>
          ` : ''}

          <div class="summary-cards">
            <div class="summary-card expense">
              <span class="label">মোট খরচ</span>
              <div class="value">${formatCurrency(total)}</div>
            </div>
            <div class="summary-card count">
              <span class="label">মোট এন্ট্রি</span>
              <div class="value">${filteredExpenses.length}টি</div>
            </div>
          </div>

          <div class="category-breakdown">
            <h3>ক্যাটাগরি অনুযায়ী খরচ</h3>
            <div class="category-grid">
              ${Object.entries(categoryTotals)
                .filter(([_, amount]) => amount > 0)
                .map(([category, amount]) => `
                  <div class="category-item">
                    <span class="category-name">${CATEGORY_LABELS[category as ExpenseCategory]}</span>
                    <span class="category-amount">${formatCurrency(amount)}</span>
                  </div>
                `).join('')}
            </div>
          </div>
        
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>ক্যাটাগরি</th>
                  <th>বিবরণ</th>
                  <th style="text-align: right;">পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                ${filteredExpenses.map(exp => `
                  <tr>
                    <td>${format(new Date(exp.expense_date), 'dd/MM/yyyy')}</td>
                    <td>${CATEGORY_LABELS[exp.category]}</td>
                    <td>${exp.description || '-'}</td>
                    <td class="amount">${formatCurrency(Number(exp.amount))}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        
          <div class="footer">
            <strong>ক্যাশ বুক</strong> | ${new Date().getFullYear()} 
          </div>
        </div>
        
        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  const downloadBudgetPDF = async () => {
    const totalBudget = budget?.amount || 0;
    const remaining = totalBudget - totalExpenses;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>বাজেট রিপোর্ট</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Noto Sans Bengali', sans-serif;
            padding: 20px;
            color: #1f2937;
            background: #ffffff;
            line-height: 1.6;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .header {
            text-align: center;
            padding: 30px 20px;
            border-bottom: 3px solid #16a34a;
            margin-bottom: 30px;
          }

          .header h1 {
            color: #16a34a;
            font-size: clamp(20px, 5vw, 28px);
            margin: 0 0 10px 0;
            font-weight: 700;
          }

          .header .subtitle {
            color: #6b7280;
            font-size: clamp(12px, 3vw, 14px);
            margin-top: 5px;
          }

          .summary-cards {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            margin: 25px 0;
          }

          .summary-card {
            flex: 1;
            min-width: 0;
            background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .summary-card.budget {
            border-color: #86efac;
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          }

          .summary-card.expense {
            border-color: #fca5a5;
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          }

          .summary-card.remaining {
            border-color: #a5b4fc;
            background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
          }

          .summary-card .label {
            font-size: clamp(11px, 2.5vw, 13px);
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: block;
          }

          .summary-card .value {
            font-size: clamp(18px, 4vw, 24px);
            font-weight: 700;
            margin: 5px 0;
            word-wrap: break-word;
          }

          .summary-card.budget .value {
            color: #16a34a;
          }

          .summary-card.expense .value {
            color: #dc2626;
          }

          .summary-card.remaining .value {
            color: ${remaining >= 0 ? '#16a34a' : '#dc2626'};
          }

          .section-title {
            font-size: clamp(16px, 3.5vw, 20px);
            font-weight: 700;
            color: #1f2937;
            margin: 30px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
          }

          .table-wrapper {
            overflow-x: auto;
            margin-top: 20px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
            min-width: 600px;
          }
          
          th {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 14px 12px;
            text-align: left;
            font-weight: 600;
            font-size: clamp(11px, 2.5vw, 14px);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: clamp(12px, 2.8vw, 14px);
            word-wrap: break-word;
          }
          
          tr:nth-child(even) {
            background-color: #f9fafb;
          }

          tr:hover {
            background-color: #f3f4f6;
          }
          
          .amount {
            text-align: right;
            font-weight: 700;
            color: #16a34a;
            font-size: clamp(13px, 3vw, 15px);
          }
          
          .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: clamp(11px, 2.5vw, 13px);
          }

          @media (max-width: 768px) {
            body {
              padding: 10px;
            }

            .header {
              padding: 20px 10px;
            }

            .summary-cards {
              grid-template-columns: 1fr;
              gap: 10px;
            }

            .summary-card {
              padding: 15px;
            }

            table {
              font-size: 12px;
            }

            th, td {
              padding: 8px 6px;
            }
          }
          
          @media print {
            body { 
              padding: 20px;
            }
            .summary-cards { 
              page-break-inside: avoid;
            }
            table { 
              page-break-inside: auto;
            }
            tr { 
              page-break-inside: avoid;
              page-break-after: auto;
            }
            .table-wrapper {
              overflow-x: visible;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>বাজেট রিপোর্ট</h1>
            <div class="subtitle">${MONTHS_BN[selectedMonth - 1]} ${selectedYear} | তৈরি: ${format(new Date(), 'd MMMM yyyy, h:mm a', { locale: bn })}</div>
          </div>

          <div class="summary-cards">
            <div class="summary-card budget">
              <span class="label">মোট বাজেট</span>
              <div class="value">${formatCurrency(totalBudget)}</div>
            </div>
            <div class="summary-card expense">
              <span class="label">মোট খরচ</span>
              <div class="value">${formatCurrency(totalExpenses)}</div>
            </div>
            <div class="summary-card remaining">
              <span class="label">অবশিষ্ট</span>
              <div class="value">${formatCurrency(remaining)}</div>
            </div>
          </div>

          <h2 class="section-title">বাজেট যোগের ইতিহাস</h2>
        
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>বিবরণ</th>
                  <th style="text-align: right;">পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                ${(budgetHistory || []).map(item => `
                  <tr>
                    <td>${format(new Date(item.budget_date), 'dd/MM/yyyy')}</td>
                    <td>${item.description || '-'}</td>
                    <td class="amount">+${formatCurrency(Number(item.amount))}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        
          <div class="footer">
            <strong>ক্যাশ বুক</strong> | ${new Date().getFullYear()} 
          </div>
        </div>
        
        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">রিপোর্ট</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              ফিল্টার
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm">মাস</Label>
                <Select 
                  value={String(selectedMonth)} 
                  onValueChange={(v) => setSelectedMonth(Number(v))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS_BN.map((month, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">বছর</Label>
                <Select 
                  value={String(selectedYear)} 
                  onValueChange={(v) => setSelectedYear(Number(v))}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">নির্দিষ্ট তারিখ</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
              </div>
            </div>

            {filterDate && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFilterDate('')}
                className="mt-3 text-xs sm:text-sm"
              >
                ফিল্টার মুছুন
              </Button>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expenses" className="text-sm">খরচ রিপোর্ট</TabsTrigger>
            <TabsTrigger value="budget" className="text-sm">বাজেট রিপোর্ট</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={downloadExpensesPDF} className="gap-2 text-sm" size="sm">
                <Download className="w-4 h-4" />
                PDF ডাউনলোড
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">মোট খরচ</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0))}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">মোট এন্ট্রি</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {filteredExpenses.length}টি
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">তারিখ</TableHead>
                      <TableHead className="text-xs sm:text-sm">ক্যাটাগরি</TableHead>
                      <TableHead className="text-xs sm:text-sm">বিবরণ</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">পরিমাণ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8 text-sm">
                          কোনো খরচ পাওয়া যায়নি
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="text-xs sm:text-sm">
                            {format(new Date(expense.expense_date), 'd MMM yyyy', { locale: bn })}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            {CATEGORY_LABELS[expense.category]}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{expense.description || '-'}</TableCell>
                          <TableCell className="text-right font-medium text-red-600 text-xs sm:text-sm">
                            {formatCurrency(Number(expense.amount))}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={downloadBudgetPDF} className="gap-2 text-sm" size="sm">
                <Download className="w-4 h-4" />
                PDF ডাউনলোড
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-2 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">মোট বাজেট</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 break-words">
                    {formatCurrency(budget?.amount || 0)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-2 border-red-200">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">মোট খরচ</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 break-words">
                    {formatCurrency(totalExpenses)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className={`bg-gradient-to-br border-2 ${(budget?.amount || 0) - totalExpenses >= 0 ? 'from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200' : 'from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200'}`}>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">অবশিষ্ট</p>
                  <p className={`text-xl sm:text-2xl font-bold break-words ${(budget?.amount || 0) - totalExpenses >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                    {formatCurrency((budget?.amount || 0) - totalExpenses)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">বাজেট যোগের ইতিহাস</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">তারিখ</TableHead>
                      <TableHead className="text-xs sm:text-sm">বিবরণ</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">পরিমাণ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!budgetHistory || budgetHistory.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8 text-sm">
                          কোনো বাজেট যোগ করা হয়নি
                        </TableCell>
                      </TableRow>
                    ) : (
                      budgetHistory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-xs sm:text-sm">
                            {format(new Date(item.budget_date), 'd MMM yyyy', { locale: bn })}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm">{item.description || '-'}</TableCell>
                          <TableCell className="text-right font-medium text-green-600 text-xs sm:text-sm">
                            +{formatCurrency(Number(item.amount))}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}