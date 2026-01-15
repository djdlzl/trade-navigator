import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface EngineProcess {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastHeartbeat: string;
}

export interface SystemHealthMetrics {
  engine: {
    status: 'running' | 'stopped' | 'error';
    processes: EngineProcess[];
  };
  serverLoad: {
    cpuUsage: number;
    memoryUsage: number;
    totalMemory: string;
    uptime: string;
  };
}

export function useSystemHealth() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['system_health', user?.id],
    queryFn: async (): Promise<SystemHealthMetrics> => {
      // In production, this would call your backend API
      // For now, we'll check if user_settings has a backend_url configured
      if (!user) {
        return getDefaultHealthData();
      }

      const { data: settings } = await supabase
        .from('user_settings')
        .select('backend_url')
        .eq('user_id', user.id)
        .single();

      // If no backend URL, return default data
      if (!settings?.backend_url) {
        return getDefaultHealthData();
      }

      // In production, you would call the backend health endpoint here
      // try {
      //   const response = await fetch(`${settings.backend_url}/health`);
      //   return await response.json();
      // } catch (error) {
      //   return getDefaultHealthData();
      // }

      return getDefaultHealthData();
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

function getDefaultHealthData(): SystemHealthMetrics {
  return {
    engine: {
      status: 'stopped',
      processes: [
        { id: '1', name: '매매 엔진', status: 'stopped', lastHeartbeat: '-' },
        { id: '2', name: '데이터 수집', status: 'stopped', lastHeartbeat: '-' },
        { id: '3', name: '리스크 관리', status: 'stopped', lastHeartbeat: '-' },
      ],
    },
    serverLoad: {
      cpuUsage: 0,
      memoryUsage: 0,
      totalMemory: '0 GB',
      uptime: '연결 대기',
    },
  };
}
