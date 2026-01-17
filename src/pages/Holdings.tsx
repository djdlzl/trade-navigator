import { useState, useMemo } from "react";
import { useHoldings, useAccounts, useSyncHoldings, HoldingWithProfit } from "@/hooks/useHoldings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, Filter, RefreshCw, CloudDownload } from "lucide-react";

function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

function formatCurrency(num: number): string {
  if (Math.abs(num) >= 100000000) {
    return `${(num / 100000000).toFixed(2)}억`;
  }
  if (Math.abs(num) >= 10000) {
    return `${(num / 10000).toFixed(0)}만`;
  }
  return formatNumber(num);
}

export default function Holdings() {
  const [selectedAccount, setSelectedAccount] = useState("all");
  const { data: holdings, isLoading, refetch } = useHoldings();
  const accounts = useAccounts();
  const syncHoldings = useSyncHoldings();

  const filteredHoldings = useMemo(() => {
    if (!holdings) return [];
    if (selectedAccount === "all") return holdings;
    return holdings.filter(h => h.account_name === selectedAccount);
  }, [selectedAccount, holdings]);

  const totalStats = useMemo(() => {
    const totalValue = filteredHoldings.reduce((acc, h) => acc + h.totalValue, 0);
    const totalProfit = filteredHoldings.reduce((acc, h) => acc + h.profitAmount, 0);
    const totalCost = filteredHoldings.reduce((acc, h) => acc + (h.avg_price * h.quantity), 0);
    const profitRate = totalCost > 0 ? ((totalProfit / totalCost) * 100) : 0;
    return { totalValue, totalProfit, profitRate };
  }, [filteredHoldings]);

  const handleSync = () => {
    syncHoldings.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">통합 잔고</h1>
          <p className="text-muted-foreground mt-1">전 계좌 보유 종목 현황을 확인하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncHoldings.isPending}
            className="gap-2"
          >
            {syncHoldings.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CloudDownload className="w-4 h-4" />
            )}
            증권사 연동
          </Button>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="계좌 선택" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">평가금액</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-32" />
                ) : (
                  <p className="text-xl font-semibold font-mono">{formatCurrency(totalStats.totalValue)}원</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                totalStats.totalProfit >= 0 ? "bg-success/10" : "bg-destructive/10"
              )}>
                {totalStats.totalProfit >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">평가손익</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-32" />
                ) : (
                  <p className={cn(
                    "text-xl font-semibold font-mono",
                    totalStats.totalProfit >= 0 ? "profit-text" : "loss-text"
                  )}>
                    {totalStats.totalProfit >= 0 ? "+" : ""}{formatCurrency(totalStats.totalProfit)}원
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                totalStats.profitRate >= 0 ? "bg-success/10" : "bg-destructive/10"
              )}>
                {totalStats.profitRate >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-success" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">수익률</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <p className={cn(
                    "text-xl font-semibold font-mono",
                    totalStats.profitRate >= 0 ? "profit-text" : "loss-text"
                  )}>
                    {totalStats.profitRate >= 0 ? "+" : ""}{totalStats.profitRate.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            보유 종목 ({filteredHoldings.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredHoldings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>종목명</TableHead>
                    <TableHead>계좌</TableHead>
                    <TableHead className="text-right">수량</TableHead>
                    <TableHead className="text-right">평균단가</TableHead>
                    <TableHead className="text-right">현재가</TableHead>
                    <TableHead className="text-right">평가손익</TableHead>
                    <TableHead className="text-right">수익률</TableHead>
                    <TableHead className="text-right">비중</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHoldings.map((holding) => {
                    const isPositive = (holding.profit_rate || 0) >= 0;
                    return (
                      <TableRow key={holding.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{holding.stock_name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{holding.stock_code}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{holding.account_name}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(holding.quantity)}</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(holding.avg_price)}원</TableCell>
                        <TableCell className="text-right font-mono">{formatNumber(holding.current_price)}원</TableCell>
                        <TableCell className={cn("text-right font-mono", isPositive ? "profit-text" : "loss-text")}>
                          {isPositive ? "+" : ""}{formatCurrency(holding.profitAmount)}원
                        </TableCell>
                        <TableCell className={cn("text-right font-mono font-medium", isPositive ? "profit-text" : "loss-text")}>
                          {isPositive ? "+" : ""}{(holding.profit_rate || 0).toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${Math.min(holding.weight || 0, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-mono text-muted-foreground w-12 text-right">
                              {(holding.weight || 0).toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              보유 종목이 없습니다
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
