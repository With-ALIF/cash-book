import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type WalletType = 'bank' | 'bkash' | 'nagad' | 'rocket' | 'custom';

export interface Wallet {
  id: string;
  user_id: string;
  wallet_type: WalletType;
  wallet_name: string;
  initial_balance: number;
  created_at: string;
  updated_at: string;
}

export function useWallets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['wallets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Wallet[];
    },
    enabled: !!user,
  });

  const addWalletMutation = useMutation({
    mutationFn: async (wallet: {
      wallet_type: WalletType;
      wallet_name: string;
      initial_balance: number;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          wallet_type: wallet.wallet_type,
          wallet_name: wallet.wallet_name,
          initial_balance: wallet.initial_balance,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: "সফল!",
        description: "ওয়ালেট যোগ হয়েছে",
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

  const updateWalletMutation = useMutation({
    mutationFn: async (params: {
      id: string;
      wallet_name?: string;
      initial_balance?: number;
    }) => {
      const { error } = await supabase
        .from('wallets')
        .update({
          wallet_name: params.wallet_name,
          initial_balance: params.initial_balance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast({
        title: "সফল!",
        description: "ওয়ালেট আপডেট হয়েছে",
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

  const deleteWalletMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('wallets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet_transactions'] });
      toast({
        title: "সফল!",
        description: "ওয়ালেট মুছে ফেলা হয়েছে",
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
    wallets,
    isLoading,
    addWallet: addWalletMutation.mutate,
    updateWallet: updateWalletMutation.mutate,
    deleteWallet: deleteWalletMutation.mutate,
    isAddingWallet: addWalletMutation.isPending,
    isUpdatingWallet: updateWalletMutation.isPending,
    isDeletingWallet: deleteWalletMutation.isPending,
  };
}