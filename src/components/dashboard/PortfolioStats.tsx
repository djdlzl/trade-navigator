import { usePortfolioSummary } from "@/hooks/useHoldings";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, PiggyBank, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCurrency(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(2)}억`;
  }
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(1)}천만`;
  }
  if (num >= 10000) {
    return `${Math.round(num / 10000)}만`;
  }
  return new Intl.NumberFormat('ko-KR').format(num);
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  iconColor?: string;
  isLoading?: boolean;
}

function StatCard({ icon: Icon, label, value, subValue, trend, iconColor, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-lg font-semibold font-mono mt-0.5 leading-tight">{value}</p>
            {subValue && (
              <p className={cn(
                "text-xs font-mono mt-0.5 leading-tight",
                trend === 'up' && "profit-text",
                trend === 'down' && "loss-text",
                trend === 'neutral' && "text-muted-foreground"
              )}>
                {subValue}
              </p>
            )}
          </div>
          <div className={cn("p-1.5 rounded-lg", iconColor || "bg-primary/10")}>
            <Icon className={cn("w-4 h-4", iconColor ? "text-white" : "text-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortfolioStats() {
  const { data: summary, isLoading } = usePortfolioSummary();

  const isPositive = (summary?.totalProfit || 0) >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Wallet}
        label="투자금액"
        value={formatCurrency(summary?.investedAmount || 0) + "원"}
        iconColor="bg-chart-1"
        isLoading={isLoading}
      />
      <StatCard
        icon={TrendingUp}
        label="총 수익"
        value={`${isPositive ? '+' : ''}${formatCurrency(summary?.totalProfit || 0)}원`}
        subValue={`${isPositive ? '+' : ''}${(summary?.totalProfitRate || 0).toFixed(2)}%`}
        trend={isPositive ? 'up' : 'down'}
        iconColor={isPositive ? "bg-success" : "bg-destructive"}
        isLoading={isLoading}
      />
      <StatCard
        icon={PiggyBank}
        label="예수금"
        value={formatCurrency(summary?.cashBalance || 0) + "원"}
        iconColor="bg-chart-4"
        isLoading={isLoading}
      />
      <StatCard
        icon={BarChart3}
        label="운용 전략"
        value={`${summary?.totalStrategies || 0}개`}
        subValue={`${summary?.activeStrategies || 0}개 활성`}
        trend="neutral"
        iconColor="bg-chart-5"
        isLoading={isLoading}
      />
    </div>
  );
}
