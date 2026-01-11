import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Get current month/year in BD timezone
function getBDMonthYear() {
  const now = new Date();
  // BD is UTC+6
  const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
  return {
    month: bdTime.getUTCMonth() + 1,
    year: bdTime.getUTCFullYear(),
  };
}

export function useBudget(month?: number, year?: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { month: currentMonth, year: currentYear } = getBDMonthYear();
  
  const targetMonth = month ?? currentMonth;
  const targetYear = year ?? currentYear;

  // Get total budget from budget_history
  const { data: budgetHistory = [], isLoading } = useQuery({
    queryKey: ['budget_history', user?.id, targetMonth, targetYear],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('budget_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', targetMonth)
        .eq('year', targetYear)
        .order('budget_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const totalBudget = budgetHistory.reduce((sum, item) => sum + Number(item.amount), 0);

  const setBudgetMutation = useMutation({
    mutationFn: async (params: { amount: number; description?: string; budget_date: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get month/year from budget_date
      const date = new Date(params.budget_date);
      const itemMonth = date.getMonth() + 1;
      const itemYear = date.getFullYear();
      
      const { error } = await supabase
        .from('budget_history')
        .insert({
          user_id: user.id,
          amount: params.amount,
          description: params.description || null,
          budget_date: params.budget_date,
          month: itemMonth,
          year: itemYear,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_history'] });
      toast({
        title: "সফল!",
        description: "বাজেট যোগ হয়েছে",
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

  const updateBudgetMutation = useMutation({
    mutationFn: async (params: { id: string; amount: number; description?: string; budget_date: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Get month/year from budget_date
      const date = new Date(params.budget_date);
      const itemMonth = date.getMonth() + 1;
      const itemYear = date.getFullYear();
      
      const { error } = await supabase
        .from('budget_history')
        .update({
          amount: params.amount,
          description: params.description || null,
          budget_date: params.budget_date,
          month: itemMonth,
          year: itemYear,
        })
        .eq('id', params.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_history'] });
      toast({
        title: "সফল!",
        description: "বাজেট আপডেট হয়েছে",
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

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('budget_history')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_history'] });
      toast({
        title: "সফল!",
        description: "বাজেট মুছে ফেলা হয়েছে",
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

  const handleUpdateBudget = (id: string, data: { amount: number; description?: string; budget_date: string }) => {
    updateBudgetMutation.mutate({ id, ...data });
  };

  return {
    budget: { amount: totalBudget },
    budgetHistory,
    isLoading,
    setBudget: setBudgetMutation.mutate,
    isSettingBudget: setBudgetMutation.isPending,
    updateBudget: handleUpdateBudget,
    isUpdatingBudget: updateBudgetMutation.isPending,
    deleteBudget: deleteBudgetMutation.mutate,
    isDeletingBudget: deleteBudgetMutation.isPending,
    currentMonth: targetMonth,
    currentYear: targetYear,
  };
}
