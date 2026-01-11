import { portfolioSummary, apiStatus } from "@/data/mockData";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface StatusIndicatorProps {
  status: 'connected' | 'error' | 'disconnected';
  label: string;
}

function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50">
      {status === 'connected' && (
        <Wifi className="w-4 h-4 text-success" />
      )}
      {status === 'error' && (
        <AlertTriangle className="w-4 h-4 text-warning" />
      )}
      {status === 'disconnected' && (
        <WifiOff className="w-4 h-4 text-destructive" />
      )}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
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

      {/* Right: API Status */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">API 상태</span>
        <StatusIndicator status={apiStatus.kiwoom} label="키움" />
        <StatusIndicator status={apiStatus.koreaInvest} label="한투" />
        <StatusIndicator status={apiStatus.samsung} label="삼성" />
      </div>
    </header>
  );
}
