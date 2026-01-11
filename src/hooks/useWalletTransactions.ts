import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  transaction_type: 'deposit' | 'withdraw';
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
}

export function useWalletTransactions(walletId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['wallet_transactions', user?.id, walletId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('wallet_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (walletId) {
        query = query.eq('wallet_id', walletId);
      } else {
        // Get all transactions for user's wallets
        const { data: wallets } = await supabase
          .from('wallets')
          .select('id')
          .eq('user_id', user.id);
        
        if (wallets && wallets.length > 0) {
          const walletIds = wallets.map(w => w.id);
          query = query.in('wallet_id', walletIds);
        } else {
          return [];
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as WalletTransaction[];
    },
    enabled: !!user,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: {
      wallet_id: string;
      transaction_type: 'deposit' | 'withdraw';
      amount: number;
      description?: string | null;
      transaction_date: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: transaction.wallet_id,
          transaction_type: transaction.transaction_type,
          amount: transaction.amount,
          description: transaction.description || null,
          transaction_date: transaction.transaction_date,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet_transactions'] });
      toast({
        title: "সফল!",
        description: "লেনদেন যোগ হয়েছে",
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

  const updateTransactionMutation = useMutation({
    mutationFn: async (params: {
      id: string;
      amount?: number;
      description?: string | null;
      transaction_date?: string;
    }) => {
      const { error } = await supabase
        .from('wallet_transactions')
        .update({
          amount: params.amount,
          description: params.description,
          transaction_date: params.transaction_date,
        })
        .eq('id', params.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet_transactions'] });
      toast({
        title: "সফল!",
        description: "লেনদেন আপডেট হয়েছে",
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

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wallet_transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet_transactions'] });
      toast({
        title: "সফল!",
        description: "লেনদেন মুছে ফেলা হয়েছে",
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

  return {
    transactions,
    isLoading,
    addTransaction: addTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    isAddingTransaction: addTransactionMutation.isPending,
    isUpdatingTransaction: updateTransactionMutation.isPending,
    isDeletingTransaction: deleteTransactionMutation.isPending,
  };
}