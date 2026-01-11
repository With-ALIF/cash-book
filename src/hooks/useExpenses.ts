import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type ExpenseCategory = 'food' | 'transport' | 'shopping' | 'bills' | 'health' | 'education' | 'entertainment' | 'other';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  expense_date: string;
  created_at: string;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: 'খাবার',
  transport: 'যাতায়াত',
  shopping: 'শপিং',
  bills: 'বিল',
  health: 'স্বাস্থ্য',
  education: 'শিক্ষা',
  entertainment: 'বিনোদন',
  other: 'অন্যান্য',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: 'hsl(14, 85%, 55%)',
  transport: 'hsl(210, 85%, 55%)',
  shopping: 'hsl(280, 70%, 60%)',
  bills: 'hsl(45, 90%, 50%)',
  health: 'hsl(0, 70%, 55%)',
  education: 'hsl(200, 75%, 50%)',
  entertainment: 'hsl(320, 70%, 55%)',
  other: 'hsl(160, 15%, 50%)',
};

export function useExpenses(month?: number, year?: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current month/year in BD timezone if not provided
  const getBDMonthYear = () => {
    const now = new Date();
    const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
    return {
      month: bdTime.getUTCMonth() + 1,
      year: bdTime.getUTCFullYear(),
    };
  };

  const { month: currentMonth, year: currentYear } = getBDMonthYear();
  const targetMonth = month ?? currentMonth;
  const targetYear = year ?? currentYear;

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses', user?.id, targetMonth, targetYear],
    queryFn: async () => {
      if (!user) return [];
      
      const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
      const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
        .order('expense_date', { ascending: false });
      
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: {
      amount: number;
      category: ExpenseCategory;
      description?: string;
      expense_date: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: expense.amount,
          category: expense.category,
          description: expense.description || null,
          expense_date: expense.expense_date,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "সফল!",
        description: "খরচ যোগ হয়েছে",
      });
    },
    onError: (error) => {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (params: {
      id: string;
      amount: number;
      category: ExpenseCategory;
      description?: string;
      expense_date: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('expenses')
        .update({
          amount: params.amount,
          category: params.category,
          description: params.description || null,
          expense_date: params.expense_date,
        })
        .eq('id', params.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "সফল!",
        description: "খরচ আপডেট হয়েছে",
      });
    },
    onError: (error) => {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "সফল!",
        description: "খরচ মুছে ফেলা হয়েছে",
      });
    },
    onError: (error) => {
      toast({
        title: "ত্রুটি",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const handleUpdateExpense = (id: string, data: { amount: number; category: ExpenseCategory; description?: string; expense_date: string }) => {
    updateExpenseMutation.mutate({ id, ...data });
  };

  return {
    expenses,
    isLoading,
    addExpense: addExpenseMutation.mutate,
    updateExpense: handleUpdateExpense,
    deleteExpense: deleteExpenseMutation.mutate,
    isAddingExpense: addExpenseMutation.isPending,
    isUpdatingExpense: updateExpenseMutation.isPending,
    totalExpenses,
    currentMonth: targetMonth,
    currentYear: targetYear,
  };
}
