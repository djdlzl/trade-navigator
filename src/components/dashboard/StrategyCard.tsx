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
      <CardHeader className="pb-2 px-3 pt-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "status-indicator",
                isActive && "status-active",
                status === 'paused' && "status-inactive",
                hasError && "status-error"
              )} />
              <CardTitle className="text-sm font-semibold leading-tight">{name}</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{description}</p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => onToggle(id, checked)}
            disabled={hasError}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-3 pb-3">
        {/* Return Rate */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">수익률</span>
          <div className={cn(
            "flex items-center gap-1 font-mono font-semibold text-base",
            isPositive ? "profit-text" : "loss-text"
          )}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? "+" : ""}{returnRate.toFixed(2)}%
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs">
            <Activity className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">거래</span>
            <span className="font-mono font-medium ml-auto">{dailyTrades}건</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">마지막</span>
            <span className="font-mono text-xs ml-auto">{lastTrade.split(' ')[1]}</span>
          </div>
        </div>

        {/* Account Badge */}
        <div className="flex items-center justify-between pt-1.5 border-t border-border">
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
