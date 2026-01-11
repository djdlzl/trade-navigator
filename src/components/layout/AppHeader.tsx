import { portfolioSummary, systemHealthData } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { SystemHealthPanel } from "./SystemHealthPanel";

function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

function formatCurrency(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}억`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(0)}만`;
  }
  return formatNumber(num);
}

export function AppHeader() {
  const { totalAssets, todayProfit, todayProfitRate } = portfolioSummary;
  const isPositive = todayProfit >= 0;

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Left: Portfolio Summary */}
      <div className="flex items-center gap-8">
        <div className="flex flex-col">
          <span className="stat-label">총 자산</span>
          <span className="stat-value">{formatCurrency(totalAssets)}원</span>
        </div>
        <div className="h-10 w-px bg-border" />
        <div className="flex flex-col">
          <span className="stat-label">당일 수익</span>
          <div className="flex items-baseline gap-2">
            <span className={cn("stat-value", isPositive ? "profit-text" : "loss-text")}>
              {isPositive ? "+" : ""}{formatCurrency(todayProfit)}원
            </span>
            <span className={cn("text-sm font-mono font-medium", isPositive ? "profit-text" : "loss-text")}>
              ({isPositive ? "+" : ""}{todayProfitRate.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Right: System Health Panel */}
      <SystemHealthPanel healthData={systemHealthData} />
    </header>
  );
}