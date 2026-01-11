import { useState } from "react";
import { tradeLogs } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FileText, ArrowUpCircle, ArrowDownCircle, CheckCircle, XCircle, Clock } from "lucide-react";

function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

export default function TradeLogs() {
  // Expand logs for demo
  const expandedLogs = [...tradeLogs, ...tradeLogs, ...tradeLogs].map((log, index) => ({
    ...log,
    id: `${log.id}-${index}`,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">매매 로그</h1>
        <p className="text-muted-foreground mt-1">전체 매매 내역을 확인하세요</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">총 거래</p>
              <p className="text-xl font-semibold font-mono">{expandedLogs.length}건</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <ArrowUpCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">매수</p>
              <p className="text-xl font-semibold font-mono">{expandedLogs.filter(l => l.action === 'buy').length}건</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <ArrowDownCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">매도</p>
              <p className="text-xl font-semibold font-mono">{expandedLogs.filter(l => l.action === 'sell').length}건</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">실패</p>
              <p className="text-xl font-semibold font-mono">{expandedLogs.filter(l => l.status === 'failed').length}건</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            거래 내역
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>시간</TableHead>
                  <TableHead>전략</TableHead>
                  <TableHead>구분</TableHead>
                  <TableHead>종목명</TableHead>
                  <TableHead className="text-right">수량</TableHead>
                  <TableHead className="text-right">가격</TableHead>
                  <TableHead className="text-right">거래대금</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expandedLogs.map((log) => {
                  const isBuy = log.action === 'buy';
                  const isFailed = log.status === 'failed';
                  const totalAmount = log.price * log.quantity;

                  return (
                    <TableRow key={log.id} className={cn(isFailed && "bg-destructive/5")}>
                      <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                      <TableCell>
                        <span className="text-sm">{log.strategy}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isBuy ? "default" : "secondary"} className={cn(
                          "gap-1",
                          isBuy ? "bg-success hover:bg-success/90" : "bg-warning hover:bg-warning/90 text-warning-foreground"
                        )}>
                          {isBuy ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                          {isBuy ? "매수" : "매도"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.stockName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{log.ticker}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(log.quantity)}</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(log.price)}원</TableCell>
                      <TableCell className="text-right font-mono">{formatNumber(totalAmount)}원</TableCell>
                      <TableCell>
                        {log.status === 'success' && (
                          <Badge variant="outline" className="gap-1 text-success border-success/30">
                            <CheckCircle className="w-3 h-3" />
                            완료
                          </Badge>
                        )}
                        {log.status === 'pending' && (
                          <Badge variant="outline" className="gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            대기
                          </Badge>
                        )}
                        {log.status === 'failed' && (
                          <Badge variant="outline" className="gap-1 text-destructive border-destructive/30">
                            <XCircle className="w-3 h-3" />
                            실패
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
