import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Strategy {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'paused' | 'error';
  profit_rate: number | null;
  take_profit: number | null;
  stop_loss: number | null;
  position_size: number | null;
  created_at: string;
  updated_at: string;
}

export function useStrategies() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['strategies', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('trading_strategies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Strategy[];
    },
    enabled: !!user,
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Strategy> }) => {
      const { data, error } = await supabase
        .from('trading_strategies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies', user?.id] });
    },
    onError: (error) => {
      toast.error("전략 업데이트 실패", {
        description: error.message,
      });
    },
  });
}

export function useToggleStrategy() {
  const updateStrategy = useUpdateStrategy();

  return (id: string, active: boolean) => {
    updateStrategy.mutate({
      id,
      updates: { status: active ? 'active' : 'paused' },
    });
  };
}

export function useEmergencyStop() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('trading_strategies')
        .update({ status: 'paused' })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategies', user?.id] });
      toast.error("긴급 정지 실행", {
        description: "모든 전략이 중단되었습니다.",
      });
    },
    onError: (error) => {
      toast.error("긴급 정지 실패", {
        description: error.message,
      });
    },
  });
}
