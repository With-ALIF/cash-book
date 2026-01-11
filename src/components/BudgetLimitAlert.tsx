import { useEffect, useState } from 'react';
import { AlertTriangle, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface BudgetLimitAlertProps {
  totalBudget: number;
  totalExpenses: number;
}

export default function BudgetLimitAlert({ totalBudget, totalExpenses }: BudgetLimitAlertProps) {
  const { toast } = useToast();
  const [budgetLimit, setBudgetLimit] = useState<number>(0);
  const [warningThreshold, setWarningThreshold] = useState<number>(80);
  const [showAlert, setShowAlert] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempLimit, setTempLimit] = useState('');
  const [tempThreshold, setTempThreshold] = useState('80');

  // Load settings from localStorage
  useEffect(() => {
    const savedLimit = localStorage.getItem('budget-limit');
    const savedThreshold = localStorage.getItem('budget-warning-threshold');
    
    if (savedLimit) {
      setBudgetLimit(Number(savedLimit));
      setTempLimit(savedLimit);
    }
    if (savedThreshold) {
      setWarningThreshold(Number(savedThreshold));
      setTempThreshold(savedThreshold);
    }
  }, []);

  // Check if should show alert
  useEffect(() => {
    if (budgetLimit <= 0 || alertDismissed) {
      setShowAlert(false);
      return;
    }

    const percentUsed = (totalExpenses / budgetLimit) * 100;
    
    if (percentUsed >= 100) {
      setShowAlert(true);
      // Show toast notification when limit exceeded
      toast({
        title: "⚠️ বাজেট লিমিট অতিক্রম!",
        description: `আপনার খরচ বাজেট লিমিট (৳${budgetLimit.toLocaleString('bn-BD')}) অতিক্রম করেছে`,
        variant: "destructive",
      });
    } else if (percentUsed >= warningThreshold) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  }, [totalExpenses, budgetLimit, warningThreshold, alertDismissed, toast]);

  const handleSaveSettings = () => {
    const limit = Number(tempLimit);
    const threshold = Number(tempThreshold);
    
    if (limit > 0) {
      setBudgetLimit(limit);
      localStorage.setItem('budget-limit', String(limit));
    }
    
    if (threshold > 0 && threshold <= 100) {
      setWarningThreshold(threshold);
      localStorage.setItem('budget-warning-threshold', String(threshold));
    }
    
    setAlertDismissed(false);
    setDialogOpen(false);
    
    toast({
      title: "সেটিংস সংরক্ষিত",
      description: "বাজেট লিমিট সেটিংস আপডেট হয়েছে",
    });
  };

  const handleClearLimit = () => {
    setBudgetLimit(0);
    setTempLimit('');
    localStorage.removeItem('budget-limit');
    setShowAlert(false);
    setDialogOpen(false);
    
    toast({
      title: "লিমিট সরানো হয়েছে",
      description: "বাজেট লিমিট মুছে ফেলা হয়েছে",
    });
  };

  const percentUsed = budgetLimit > 0 ? (totalExpenses / budgetLimit) * 100 : 0;
  const isExceeded = percentUsed >= 100;
  const isWarning = percentUsed >= warningThreshold && percentUsed < 100;

  return (
    <>
      {/* Settings Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            বাজেট লিমিট
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>বাজেট লিমিট সেটিংস</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>মাসিক বাজেট লিমিট (টাকা)</Label>
              <Input
                type="number"
                placeholder="যেমন: 50000"
                value={tempLimit}
                onChange={(e) => setTempLimit(e.target.value)}
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                এই লিমিট অতিক্রম করলে সতর্কতা দেখাবে
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>সতর্কতা থ্রেশহোল্ড (%)</Label>
              <Input
                type="number"
                placeholder="80"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(e.target.value)}
                min="1"
                max="100"
              />
              <p className="text-xs text-muted-foreground">
                এই শতাংশ পৌঁছালে সতর্কতা দেখাবে (ডিফল্ট: ৮০%)
              </p>
            </div>

            {budgetLimit > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  বর্তমান লিমিট: <span className="font-medium text-foreground">৳{budgetLimit.toLocaleString('bn-BD')}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  ব্যবহৃত: <span className={`font-medium ${isExceeded ? 'text-destructive' : isWarning ? 'text-warning' : 'text-foreground'}`}>
                    {Math.round(percentUsed)}%
                  </span>
                </p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleSaveSettings} className="flex-1">
                সংরক্ষণ করুন
              </Button>
              {budgetLimit > 0 && (
                <Button variant="outline" onClick={handleClearLimit}>
                  লিমিট সরান
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Banner */}
      {showAlert && !alertDismissed && (
        <div className={`relative p-4 rounded-lg border ${
          isExceeded 
            ? 'bg-destructive/10 border-destructive/30' 
            : 'bg-warning/10 border-warning/30'
        }`}>
          <button
            onClick={() => setAlertDismissed(true)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-background/50 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
              isExceeded ? 'text-destructive' : 'text-warning'
            }`} />
            <div>
              <h4 className={`font-medium ${
                isExceeded ? 'text-destructive' : 'text-warning'
              }`}>
                {isExceeded ? 'বাজেট লিমিট অতিক্রম!' : 'বাজেট সতর্কতা'}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {isExceeded 
                  ? `আপনার খরচ (৳${totalExpenses.toLocaleString('bn-BD')}) বাজেট লিমিট (৳${budgetLimit.toLocaleString('bn-BD')}) অতিক্রম করেছে`
                  : `আপনি বাজেট লিমিটের ${Math.round(percentUsed)}% ব্যবহার করেছেন`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
