import { useState, useEffect } from 'react';
import { Pencil, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Expense, ExpenseCategory, CATEGORY_LABELS } from '@/hooks/useExpenses';

interface EditExpenseDialogProps {
  expense: Expense;
  onUpdate: (id: string, data: { amount: number; category: ExpenseCategory; description?: string; expense_date: string }) => void;
  isUpdating?: boolean;
}

export default function EditExpenseDialog({ expense, onUpdate, isUpdating }: EditExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [description, setDescription] = useState(expense.description || '');
  const [expenseDate, setExpenseDate] = useState(expense.expense_date);

  useEffect(() => {
    if (open) {
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setDescription(expense.description || '');
      setExpenseDate(expense.expense_date);
    }
  }, [open, expense]);

  const handleUpdate = () => {
    if (amount && Number(amount) > 0 && expenseDate) {
      onUpdate(expense.id, {
        amount: Number(amount),
        category,
        description: description || undefined,
        expense_date: expenseDate,
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>খরচ সম্পাদনা করুন</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>তারিখ</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>পরিমাণ</Label>
            <Input
              type="number"
              placeholder="পরিমাণ লিখুন"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
          </div>
          <div className="space-y-2">
            <Label>ক্যাটাগরি</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>বিবরণ (ঐচ্ছিক)</Label>
            <Textarea
              placeholder="বিবরণ লিখুন..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || !amount || !expenseDate}
            className="w-full"
          >
            আপডেট করুন
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
