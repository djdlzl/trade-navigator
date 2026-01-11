import { portfolioSummary } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
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
}

function StatCard({ icon: Icon, label, value, subValue, trend, iconColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-semibold font-mono mt-1">{value}</p>
            {subValue && (
              <p className={cn(
                "text-sm font-mono mt-0.5",
                trend === 'up' && "profit-text",
                trend === 'down' && "loss-text",
                trend === 'neutral' && "text-muted-foreground"
              )}>
                {subValue}
              </p>
            )}
          </div>
          <div className={cn("p-2 rounded-lg", iconColor || "bg-primary/10")}>
            <Icon className={cn("w-5 h-5", iconColor ? "text-white" : "text-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortfolioStats() {
  const { totalProfit, totalProfitRate, cashBalance, investedAmount } = portfolioSummary;
  const isPositive = totalProfit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Wallet}
        label="투자금액"
        value={formatCurrency(investedAmount) + "원"}
        iconColor="bg-chart-1"
      />
      <StatCard
        icon={TrendingUp}
        label="총 수익"
        value={`${isPositive ? '+' : ''}${formatCurrency(totalProfit)}원`}
        subValue={`${isPositive ? '+' : ''}${totalProfitRate.toFixed(2)}%`}
        trend={isPositive ? 'up' : 'down'}
        iconColor={isPositive ? "bg-success" : "bg-destructive"}
      />
      <StatCard
        icon={PiggyBank}
        label="예수금"
        value={formatCurrency(cashBalance) + "원"}
        iconColor="bg-chart-4"
      />
      <StatCard
        icon={BarChart3}
        label="운용 전략"
        value="6개"
        subValue="4개 활성"
        trend="neutral"
        iconColor="bg-chart-5"
      />
    </div>
  );
}
