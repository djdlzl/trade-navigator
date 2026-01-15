import { useStrategies, useToggleStrategy, Strategy } from "@/hooks/useStrategies";
import { StrategyCard } from "@/components/dashboard/StrategyCard";
import { TradeTerminal } from "@/components/dashboard/TradeTerminal";
import { ProfitChart } from "@/components/dashboard/ProfitChart";
import { PortfolioStats } from "@/components/dashboard/PortfolioStats";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: strategies, isLoading } = useStrategies();
  const toggleStrategy = useToggleStrategy();

  const handleToggleStrategy = (id: string, active: boolean) => {
    toggleStrategy(id, active);
  };

  return (
    <div className="space-y-4">
      {/* Page Title - Reduced spacing */}
      <div>
        <h1 className="text-xl font-bold">대시보드</h1>
        <p className="text-muted-foreground text-sm mt-0.5">전략 상태 및 실시간 매매 현황을 확인하세요</p>
      </div>

      {/* Portfolio Stats at Top - Full Width */}
      <PortfolioStats />

      {/* Main Grid - ProfitChart (2/3) and TradeTerminal (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart - 2/3 ratio */}
        <div className="lg:col-span-2">
          <ProfitChart />
        </div>
        {/* Terminal - 1/3 ratio */}
        <div className="lg:col-span-1">
          <TradeTerminal />
        </div>
      </div>

      {/* Strategy Cards - Reduced spacing */}
      <div>
        <h2 className="text-base font-semibold mb-3">실행 중인 전략</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : strategies && strategies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onToggle={handleToggleStrategy}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            등록된 전략이 없습니다. 전략 관리에서 새 전략을 추가하세요.
          </div>
        )}
      </div>
    </div>
  );
}
