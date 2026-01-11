import { useState } from "react";
import { strategies as initialStrategies, Strategy } from "@/data/mockData";
import { StrategyCard } from "@/components/dashboard/StrategyCard";
import { TradeTerminal } from "@/components/dashboard/TradeTerminal";
import { ProfitChart } from "@/components/dashboard/ProfitChart";
import { PortfolioStats } from "@/components/dashboard/PortfolioStats";

export default function Dashboard() {
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);

  const handleToggleStrategy = (id: string, active: boolean) => {
    setStrategies(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: active ? 'active' : 'paused' as const }
          : s
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-muted-foreground mt-1">전략 상태 및 실시간 매매 현황을 확인하세요</p>
      </div>

      {/* Portfolio Stats */}
      <PortfolioStats />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <ProfitChart />
        </div>
        {/* Terminal */}
        <div className="lg:col-span-1">
          <TradeTerminal />
        </div>
      </div>

      {/* Strategy Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">실행 중인 전략</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onToggle={handleToggleStrategy}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
