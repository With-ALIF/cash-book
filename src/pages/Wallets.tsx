import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useWallets, WalletType } from '@/hooks/useWallets';
import { useWalletTransactions } from '@/hooks/useWalletTransactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, Trash2, Edit, History, Download, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  bank: 'ব্যাংক',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
  rocket: 'রকেট',
  custom: 'কাস্টম',
};

const WALLET_TYPE_COLORS: Record<WalletType, string> = {
  bank: 'bg-blue-500',
  bkash: 'bg-pink-500',
  nagad: 'bg-orange-500',
  rocket: 'bg-purple-500',
  custom: 'bg-green-500',
};

export default function Wallets() {
  const { wallets, addWallet, updateWallet, deleteWallet, isLoading } = useWallets();
  const { transactions, addTransaction, deleteTransaction } = useWalletTransactions();
  
  const [addWalletOpen, setAddWalletOpen] = useState(false);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  
  const [walletType, setWalletType] = useState<WalletType>('bank');
  const [walletName, setWalletName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => {
    const now = new Date();
    const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    return format(bdTime, 'yyyy-MM-dd');
  });

  const [filterWalletId, setFilterWalletId] = useState<string>('all');
  const [filterTransactionType, setFilterTransactionType] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const handleAddWallet = () => {
    if (!walletName.trim()) return;
    
    addWallet({
      wallet_type: walletType,
      wallet_name: walletName.trim(),
      initial_balance: Number(initialBalance) || 0,
    });
    
    setWalletName('');
    setInitialBalance('');
    setWalletType('bank');
    setAddWalletOpen(false);
  };

  const handleAddTransaction = () => {
    if (!selectedWallet || !transactionAmount) return;
    
    addTransaction({
      wallet_id: selectedWallet,
      transaction_type: transactionType,
      amount: Number(transactionAmount),
      description: transactionDescription.trim() || null,
      transaction_date: transactionDate,
    });
    
    setTransactionAmount('');
    setTransactionDescription('');
    setTransactionOpen(false);
  };

  const walletBalances = useMemo(() => {
    const balances: Record<string, number> = {};
    
    wallets.forEach(wallet => {
      balances[wallet.id] = wallet.initial_balance;
    });
    
    transactions.forEach(txn => {
      if (txn.transaction_type === 'deposit') {
        balances[txn.wallet_id] = (balances[txn.wallet_id] || 0) + Number(txn.amount);
      } else {
        balances[txn.wallet_id] = (balances[txn.wallet_id] || 0) - Number(txn.amount);
      }
    });
    
    return balances;
  }, [wallets, transactions]);

  const totalDeposit = useMemo(() => {
    const transactionDeposits = transactions
      .filter(t => t.transaction_type === 'deposit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const initialBalances = wallets.reduce((sum, w) => sum + Number(w.initial_balance), 0);
    
    return transactionDeposits + initialBalances;
  }, [transactions, wallets]);

  const totalWithdraw = useMemo(() => {
    return transactions
      .filter(t => t.transaction_type === 'withdraw')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const totalBalance = Object.values(walletBalances).reduce((sum, val) => sum + val, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const displayTransactions = useMemo(() => {
    const initialBalanceEntries = wallets
      .filter(w => w.initial_balance > 0)
      .map(w => ({
        id: `initial-${w.id}`,
        wallet_id: w.id,
        transaction_type: 'deposit' as const,
        amount: w.initial_balance,
        description: 'প্রাথমিক ব্যালেন্স',
        transaction_date: w.created_at || '2000-01-01',
        created_at: w.created_at || '2000-01-01',
        isInitialBalance: true,
      }));

    let allEntries = [...initialBalanceEntries, ...transactions];

    if (filterWalletId !== 'all') {
      allEntries = allEntries.filter(t => t.wallet_id === filterWalletId);
    }

    if (filterTransactionType !== 'all') {
      allEntries = allEntries.filter(t => t.transaction_type === filterTransactionType);
    }

    if (filterStartDate) {
      allEntries = allEntries.filter(t => t.transaction_date >= filterStartDate);
    }
    if (filterEndDate) {
      allEntries = allEntries.filter(t => t.transaction_date <= filterEndDate);
    }

    return allEntries.sort((a, b) => 
      new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );
  }, [transactions, wallets, filterWalletId, filterTransactionType, filterStartDate, filterEndDate]);

  const downloadTransactionsPDF = () => {
    const filteredDeposit = displayTransactions
      .filter(t => t.transaction_type === 'deposit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const filteredWithdraw = displayTransactions
      .filter(t => t.transaction_type === 'withdraw')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netAmount = filteredDeposit - filteredWithdraw;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ওয়ালেট লেনদেন রিপোর্ট</title>
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

          .summary-card.deposit {
            border-color: #86efac;
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          }

          .summary-card.withdraw {
            border-color: #fca5a5;
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          }

          .summary-card.net {
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

          .summary-card.deposit .value {
            color: #16a34a;
          }

          .summary-card.withdraw .value {
            color: #dc2626;
          }

          .summary-card.net .value {
            color: #4f46e5;
          }

          .transaction-count {
            text-align: center;
            margin: 20px 0;
            padding: 12px;
            background: #f9fafb;
            border-radius: 6px;
            font-size: clamp(12px, 3vw, 14px);
            color: #6b7280;
          }

          .transaction-count strong {
            color: #16a34a;
            font-size: clamp(16px, 3.5vw, 18px);
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
          
          .amount-deposit {
            text-align: right;
            font-weight: 700;
            color: #16a34a;
            font-size: clamp(13px, 3vw, 15px);
          }

          .amount-withdraw {
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
            <h1>ওয়ালেট লেনদেন রিপোর্ট</h1>
            <div class="subtitle">তৈরি: ${format(new Date(), 'd MMMM yyyy, h:mm a', { locale: bn })}</div>
          </div>
        
          ${filterWalletId !== 'all' || filterTransactionType !== 'all' || filterStartDate || filterEndDate ? `
            <div class="filter-info">
              <strong>প্রয়োগকৃত ফিল্টার:</strong>
              <div>
                ${filterWalletId !== 'all' ? `ওয়ালেট: ${wallets.find(w => w.id === filterWalletId)?.wallet_name}<br>` : ''}
                ${filterTransactionType !== 'all' ? `ধরন: ${filterTransactionType === 'deposit' ? 'জমা' : 'উত্তোলন'}<br>` : ''}
                ${filterStartDate ? `শুরু: ${format(new Date(filterStartDate), 'd MMM yyyy', { locale: bn })}<br>` : ''}
                ${filterEndDate ? `শেষ: ${format(new Date(filterEndDate), 'd MMM yyyy', { locale: bn })}` : ''}
              </div>
            </div>
          ` : ''}

          <div class="summary-cards">
            ${filterTransactionType === 'deposit' ? `
              <div class="summary-card deposit">
                <span class="label">মোট জমা</span>
                <div class="value">${formatCurrency(filteredDeposit)}</div>
              </div>
            ` : filterTransactionType === 'withdraw' ? `
              <div class="summary-card withdraw">
                <span class="label">মোট উত্তোলন</span>
                <div class="value">${formatCurrency(filteredWithdraw)}</div>
              </div>
            ` : `
              <div class="summary-card deposit">
                <span class="label">মোট জমা</span>
                <div class="value">${formatCurrency(filteredDeposit)}</div>
              </div>
              <div class="summary-card withdraw">
                <span class="label">মোট উত্তোলন</span>
                <div class="value">${formatCurrency(filteredWithdraw)}</div>
              </div>
              <div class="summary-card net">
                <span class="label">নিট পরিমাণ</span>
                <div class="value">${formatCurrency(netAmount)}</div>
              </div>
            `}
          </div>
        
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>তারিখ</th>
                  <th>ওয়ালেট</th>
                  <th>ধরন</th>
                  <th>বিবরণ</th>
                  <th style="text-align: right;">পরিমাণ</th>
                </tr>
              </thead>
              <tbody>
                ${displayTransactions.map(txn => {
                  const wallet = wallets.find(w => w.id === txn.wallet_id);
                  return `
                    <tr>
                      <td>${format(new Date(txn.transaction_date), 'dd/MM/yyyy')}</td>
                      <td>${wallet?.wallet_name || 'N/A'}</td>
                      <td>${txn.transaction_type === 'deposit' ? 'জমা' : 'উত্তোলন'}</td>
                      <td>${txn.description || '-'}</td>
                      <td class="amount-${txn.transaction_type}">
                        ${txn.transaction_type === 'deposit' ? '+' : '-'}${formatCurrency(Number(txn.amount))}
                      </td>
                    </tr>
                  `;
                }).join('')}
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

  const clearFilters = () => {
    setFilterWalletId('all');
    setFilterTransactionType('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">ওয়ালেট</h1>
          <Dialog open={addWalletOpen} onOpenChange={setAddWalletOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                নতুন ওয়ালেট
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>নতুন ওয়ালেট যোগ করুন</DialogTitle>
                <DialogDescription>
                  ব্যাংক, মোবাইল ব্যাংকিং বা কাস্টম ওয়ালেট যোগ করুন
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>ওয়ালেট ধরন</Label>
                  <Select value={walletType} onValueChange={(v) => setWalletType(v as WalletType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(WALLET_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ওয়ালেট নাম</Label>
                  <Input
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder="যেমন: DBBL, Personal বিকাশ"
                  />
                </div>
                <div className="space-y-2">
                  <Label>প্রাথমিক ব্যালেন্স</Label>
                  <Input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <Button onClick={handleAddWallet} className="w-full">
                  যোগ করুন
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Wallet className="w-5 h-5" />
              আর্থিক সারসংক্ষেপ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-800">
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">মোট জমা</p>
                <p className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300 break-words">
                  {formatCurrency(totalDeposit)}
                </p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border-2 border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">মোট উত্তোলন</p>
                <p className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300 break-words">
                  {formatCurrency(totalWithdraw)}
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">বর্তমান ব্যালেন্স</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300 break-words">
                  {formatCurrency(totalBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {wallets.length}টি ওয়ালেট
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {wallets.map((wallet) => {
            const walletTransactions = transactions.filter(t => t.wallet_id === wallet.id);
            const walletDeposits = walletTransactions.filter(t => t.transaction_type === 'deposit').reduce((sum, t) => sum + Number(t.amount), 0);
            const walletWithdraws = walletTransactions.filter(t => t.transaction_type === 'withdraw').reduce((sum, t) => sum + Number(t.amount), 0);
            
            return (
              <Card key={wallet.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${WALLET_TYPE_COLORS[wallet.wallet_type]}`} />
                <CardHeader>
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-base gap-2">
                    <span className="break-words">{wallet.wallet_name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {WALLET_TYPE_LABELS[wallet.wallet_type]}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ব্যালেন্স</p>
                    <p className="text-xl sm:text-2xl font-bold break-words">
                      {formatCurrency(walletBalances[wallet.id] || 0)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">জমা</p>
                      <p className="text-sm font-semibold text-green-600 break-words">
                        +{formatCurrency(wallet.initial_balance + walletDeposits)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">উত্তোলন</p>
                      <p className="text-sm font-semibold text-red-600 break-words">
                        -{formatCurrency(walletWithdraws)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setSelectedWallet(wallet.id);
                        setTransactionType('deposit');
                        setTransactionOpen(true);
                      }}
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      জমা
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setSelectedWallet(wallet.id);
                        setTransactionType('withdraw');
                        setTransactionOpen(true);
                      }}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      উত্তোলন
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="sm:flex-none"
                      onClick={() => {
                        if (confirm('এই ওয়ালেট মুছে ফেলতে চান?')) {
                          deleteWallet(wallet.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={transactionOpen} onOpenChange={setTransactionOpen}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>
                {transactionType === 'deposit' ? 'টাকা জমা করুন' : 'টাকা উত্তোলন করুন'}
              </DialogTitle>
              <DialogDescription className="break-words">
                {wallets.find(w => w.id === selectedWallet)?.wallet_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>পরিমাণ</Label>
                <Input
                  type="number"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              
      <div className="space-y-2">
        <Label>তারিখ</Label>
          <Input  type="date" value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)} />
      </div>
      
<Button onClick={handleAddTransaction} className="w-full">
{transactionType === 'deposit' ? 'জমা করুন' : 'উত্তোলন করুন'}
</Button>
</div>
</DialogContent>
</Dialog>
<Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <History className="w-5 h-5" />
            লেনদেন ইতিহাস
          </CardTitle>
          <Button 
            onClick={downloadTransactionsPDF} 
            variant="outline" 
            size="sm"
            className="gap-2 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            PDF ডাউনলোড
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="w-4 h-4" />
              ফিল্টার করুন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">ওয়ালেট</Label>
                <Select value={filterWalletId} onValueChange={setFilterWalletId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ওয়ালেট</SelectItem>
                    {wallets.map(wallet => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.wallet_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">লেনদেনের ধরন</Label>
                <Select value={filterTransactionType} onValueChange={setFilterTransactionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ধরন</SelectItem>
                    <SelectItem value="deposit">জমা</SelectItem>
                    <SelectItem value="withdraw">উত্তোলন</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">শুরুর তারিখ</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">শেষ তারিখ</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {(filterWalletId !== 'all' || filterTransactionType !== 'all' || filterStartDate || filterEndDate) && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {displayTransactions.length}টি লেনদেন পাওয়া গেছে
                </p>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                  ফিল্টার রিসেট করুন
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              সব
            </TabsTrigger>
            <TabsTrigger value="deposit" className="text-xs sm:text-sm">জমা</TabsTrigger>
            <TabsTrigger value="withdraw" className="text-xs sm:text-sm">উত্তোলন</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-3 sm:space-y-4">
            {displayTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                কোনো লেনদেন নেই
              </p>
            ) : (
              <div className="space-y-3">
                {displayTransactions.map((txn) => {
                  const wallet = wallets.find(w => w.id === txn.wallet_id);
                  const isInitial = 'isInitialBalance' in txn && txn.isInitialBalance;
                  return (
                    <div
                      key={txn.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        {txn.transaction_type === 'deposit' ? (
                          <ArrowDownCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1 sm:mt-0" />
                        ) : (
                          <ArrowUpCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1 sm:mt-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium break-words">{wallet?.wallet_name}</p>
                          {txn.description && (
                            <p className="text-sm text-muted-foreground break-words">{txn.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(txn.transaction_date), 'd MMM yyyy', { locale: bn })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <p className={`font-bold text-lg sm:text-base break-words ${txn.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.transaction_type === 'deposit' ? '+' : '-'}
                          {formatCurrency(Number(txn.amount))}
                        </p>
                        {!isInitial && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm('এই লেনদেন মুছে ফেলতে চান?')) {
                                deleteTransaction(txn.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="deposit" className="space-y-3 sm:space-y-4">
            {displayTransactions.filter(t => t.transaction_type === 'deposit').length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                কোনো জমা লেনদেন নেই
              </p>
            ) : (
              <div className="space-y-3">
                {displayTransactions.filter(t => t.transaction_type === 'deposit').map((txn) => {
                  const wallet = wallets.find(w => w.id === txn.wallet_id);
                  const isInitial = 'isInitialBalance' in txn && txn.isInitialBalance;
                  return (
                    <div
                      key={txn.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <ArrowDownCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1 sm:mt-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium break-words">{wallet?.wallet_name}</p>
                          {txn.description && (
                            <p className="text-sm text-muted-foreground break-words">{txn.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(txn.transaction_date), 'd MMM yyyy', { locale: bn })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <p className="font-bold text-lg sm:text-base text-green-600 break-words">
                          +{formatCurrency(Number(txn.amount))}
                        </p>
                        {!isInitial && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm('এই লেনদেন মুছে ফেলতে চান?')) {
                                deleteTransaction(txn.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
          <TabsContent value="withdraw" className="space-y-3 sm:space-y-4">
            {displayTransactions.filter(t => t.transaction_type === 'withdraw').length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                কোনো উত্তোলন লেনদেন নেই
              </p>
            ) : (
              <div className="space-y-3">
                {displayTransactions.filter(t => t.transaction_type === 'withdraw').map((txn) => {
                  const wallet = wallets.find(w => w.id === txn.wallet_id);
                  return (
                    <div
                      key={txn.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border gap-3"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <ArrowUpCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1 sm:mt-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium break-words">{wallet?.wallet_name}</p>
                          {txn.description && (
                            <p className="text-sm text-muted-foreground break-words">{txn.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(txn.transaction_date), 'd MMM yyyy', { locale: bn })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <p className="font-bold text-lg sm:text-base text-red-600 break-words">
                          -{formatCurrency(Number(txn.amount))}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm('এই লেনদেন মুছে ফেলতে চান?')) {
                              deleteTransaction(txn.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </div>
</Layout>
  );
};