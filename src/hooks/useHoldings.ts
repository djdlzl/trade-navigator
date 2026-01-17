import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Holding {
  id: string;
  stock_code: string;
  stock_name: string;
  account_name: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  profit_rate: number | null;
  weight: number | null;
  created_at: string;
  updated_at: string;
}

export interface HoldingWithProfit extends Holding {
  profitAmount: number;
  totalValue: number;
}

export function useHoldings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['holdings', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('weight', { ascending: false });

      if (error) throw error;

      // Calculate profit amounts
      return (data || []).map((holding): HoldingWithProfit => ({
        ...holding,
        profitAmount: (holding.current_price - holding.avg_price) * holding.quantity,
        totalValue: holding.current_price * holding.quantity,
      }));
    },
    enabled: !!user,
  });
}

export function useSyncHoldings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-holdings');
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['holdings', user?.id] });
      toast.success("잔고 동기화 완료", {
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast.error("잔고 동기화 실패", {
        description: error.message,
      });
    },
  });
}

export function useAccounts() {
  const { data: holdings } = useHoldings();

  const accounts = holdings 
    ? Array.from(new Set(holdings.map(h => h.account_name)))
    : [];

  return [
    { id: 'all', name: '전체 계좌' },
    ...accounts.map(name => ({ id: name, name })),
  ];
}

export function usePortfolioSummary() {
  const { data: holdings, isLoading } = useHoldings();
  const { data: strategies } = useStrategies();

  const summary = holdings && holdings.length > 0 ? {
    totalAssets: holdings.reduce((acc, h) => acc + h.totalValue, 0),
    investedAmount: holdings.reduce((acc, h) => acc + (h.avg_price * h.quantity), 0),
    totalProfit: holdings.reduce((acc, h) => acc + h.profitAmount, 0),
    cashBalance: 0,
    todayProfit: holdings.reduce((acc, h) => acc + h.profitAmount, 0) * 0.1,
    totalProfitRate: holdings.reduce((acc, h) => acc + (h.profit_rate || 0), 0) / holdings.length,
    todayProfitRate: 0.5,
    activeStrategies: strategies?.filter(s => s.status === 'active').length || 0,
    totalStrategies: strategies?.length || 0,
  } : {
    totalAssets: 0,
    investedAmount: 0,
    totalProfit: 0,
    cashBalance: 0,
    todayProfit: 0,
    totalProfitRate: 0,
    todayProfitRate: 0,
    activeStrategies: 0,
    totalStrategies: 0,
  };

  return { data: summary, isLoading };
}

// Import here to avoid circular dependency
import { useStrategies } from './useStrategies';
