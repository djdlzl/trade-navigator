import { useTradeLogs, TradeLog } from "@/hooks/useTradeLogs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FileText, ArrowUpCircle, ArrowDownCircle, CheckCircle, XCircle, Clock, Info } from "lucide-react";

function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

export default function TradeLogs() {
  const { data: logs, isLoading } = useTradeLogs(100);

  // Calculate stats
  const stats = {
    total: logs?.length || 0,
    trade: logs?.filter(l => l.category === 'Trade').length || 0,
    strategy: logs?.filter(l => l.category === 'Strategy').length || 0,
    errors: logs?.filter(l => l.level === 'ERROR').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">매매 로그</h1>
        <p className="text-muted-foreground mt-1">전체 매매 내역과 시스템 로그를 확인하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">전체 로그</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-xl font-semibold font-mono">{stats.total}건</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <ArrowUpCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">거래</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-xl font-semibold font-mono">{stats.trade}건</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Info className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">전략</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-xl font-semibold font-mono">{stats.strategy}건</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">오류</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-xl font-semibold font-mono">{stats.errors}건</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            로그 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead>시간</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>레벨</TableHead>
                    <TableHead>메시지</TableHead>
                    <TableHead>사유</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const isError = log.level === 'ERROR';
                    const timestamp = new Date(log.timestamp).toLocaleString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    });

                    return (
                      <TableRow key={log.id} className={cn(isError && "bg-destructive/5")}>
                        <TableCell className="font-mono text-sm">{timestamp}</TableCell>
                        <TableCell>
                          <Badge variant={
                            log.category === 'Trade' ? 'default' :
                            log.category === 'Strategy' ? 'secondary' : 'outline'
                          } className={cn(
                            log.category === 'Trade' && "bg-success hover:bg-success/90",
                            log.category === 'Strategy' && "bg-warning hover:bg-warning/90 text-warning-foreground"
                          )}>
                            {log.category === 'Trade' ? '거래' :
                             log.category === 'Strategy' ? '전략' : '시스템'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.level === 'INFO' && (
                            <Badge variant="outline" className="gap-1 text-muted-foreground">
                              <CheckCircle className="w-3 h-3" />
                              정보
                            </Badge>
                          )}
                          {log.level === 'WARN' && (
                            <Badge variant="outline" className="gap-1 text-warning border-warning/30">
                              <Clock className="w-3 h-3" />
                              경고
                            </Badge>
                          )}
                          {log.level === 'ERROR' && (
                            <Badge variant="outline" className="gap-1 text-destructive border-destructive/30">
                              <XCircle className="w-3 h-3" />
                              오류
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md truncate">{log.message}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {log.reason || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              로그가 없습니다
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
