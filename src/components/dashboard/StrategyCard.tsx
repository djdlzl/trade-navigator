import { Strategy } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Activity, Clock, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface StrategyCardProps {
  strategy: Strategy;
  onToggle: (id: string, active: boolean) => void;
}

export function StrategyCard({ strategy, onToggle }: StrategyCardProps) {
  const { id, name, description, returnRate, status, account, lastTrade, dailyTrades } = strategy;
  const isPositive = returnRate >= 0;
  const isActive = status === 'active';
  const hasError = status === 'error';

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      hasError && "border-warning/50 bg-warning/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                "status-indicator",
                isActive && "status-active",
                status === 'paused' && "status-inactive",
                hasError && "status-error"
              )} />
              <CardTitle className="text-base font-semibold">{name}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => onToggle(id, checked)}
            disabled={hasError}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Return Rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">수익률</span>
          <div className={cn(
            "flex items-center gap-1 font-mono font-semibold text-lg",
            isPositive ? "profit-text" : "loss-text"
          )}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {isPositive ? "+" : ""}{returnRate.toFixed(2)}%
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">거래</span>
            <span className="font-mono font-medium ml-auto">{dailyTrades}건</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">마지막</span>
            <span className="font-mono text-xs ml-auto">{lastTrade.split(' ')[1]}</span>
          </div>
        </div>

        {/* Account Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">{account}</span>
          {hasError && (
            <div className="flex items-center gap-1 text-warning text-xs font-medium">
              <AlertTriangle className="w-3 h-3" />
              연결 오류
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
