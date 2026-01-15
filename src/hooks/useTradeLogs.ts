import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface TradeLog {
  id: string;
  category: string;
  level: string;
  message: string;
  reason: string | null;
  strategy_id: string | null;
  timestamp: string;
  user_id: string;
}

export function useTradeLogs(limit: number = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trade_logs', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('trade_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as TradeLog[];
    },
    enabled: !!user,
  });
}

export function useRealtimeTradeLogs(limit: number = 20) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<TradeLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Initial fetch
  const { data: initialLogs, isLoading } = useTradeLogs(limit);

  useEffect(() => {
    if (initialLogs) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('trade_logs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trade_logs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newLog = payload.new as TradeLog;
          setLogs(prev => [newLog, ...prev].slice(0, limit));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, limit]);

  return { logs, isLoading, isConnected };
}

// For backward compatibility with existing UI
export interface CategorizedTradeLog {
  id: string;
  timestamp: string;
  category: 'System' | 'Strategy' | 'Trade';
  strategy: string;
  action: 'buy' | 'sell';
  ticker: string;
  stockName: string;
  quantity: number;
  price: number;
  status: 'success' | 'pending' | 'failed';
  message: string;
  reason: string | null;
}

export function transformToLegacyFormat(log: TradeLog): CategorizedTradeLog {
  // Parse the message to extract trade details
  const category = log.category as 'System' | 'Strategy' | 'Trade';
  const timestamp = new Date(log.timestamp).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Default values - in production, these would be parsed from the message or stored separately
  return {
    id: log.id,
    timestamp,
    category,
    strategy: 'Unknown',
    action: 'buy',
    ticker: '',
    stockName: '',
    quantity: 0,
    price: 0,
    status: log.level === 'ERROR' ? 'failed' : 'success',
    message: log.message,
    reason: log.reason,
  };
}
