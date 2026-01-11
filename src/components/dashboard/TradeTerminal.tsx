import { useEffect, useRef, useState } from "react";
import { tradeLogs, TradeLog } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Terminal, ArrowUpCircle, ArrowDownCircle, AlertCircle } from "lucide-react";

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

interface LogEntryProps {
  log: TradeLog;
}

function LogEntry({ log }: LogEntryProps) {
  const { timestamp, strategy, action, ticker, stockName, quantity, price, status, message } = log;
  const isBuy = action === 'buy';
  const isFailed = status === 'failed';

  return (
    <div className={cn(
      "flex items-start gap-2 py-1.5 animate-slide-up",
      isFailed ? "log-error" : "log-success"
    )}>
      <span className="text-terminal-warning/80 flex-shrink-0">[{timestamp}]</span>
      {isFailed ? (
        <AlertCircle className="w-4 h-4 text-terminal-error flex-shrink-0 mt-0.5" />
      ) : isBuy ? (
        <ArrowUpCircle className="w-4 h-4 text-terminal-text flex-shrink-0 mt-0.5" />
      ) : (
        <ArrowDownCircle className="w-4 h-4 text-terminal-warning flex-shrink-0 mt-0.5" />
      )}
      <span className="flex-1">
        <span className="text-white/60">[{strategy}]</span>{" "}
        <span className={isBuy ? "text-terminal-text" : "text-terminal-warning"}>
          {isBuy ? "매수" : "매도"}
        </span>{" "}
        <span className="text-white">{stockName}</span>
        <span className="text-white/60">({ticker})</span>{" "}
        <span className="text-white">{quantity}주</span>{" "}
        <span className="text-white/60">@</span>
        <span className="text-white">{formatCurrency(price)}원</span>
        {isFailed && (
          <span className="text-terminal-error ml-2">⚠ {message}</span>
        )}
      </span>
    </div>
  );
}

export function TradeTerminal() {
  const [logs, setLogs] = useState<TradeLog[]>(tradeLogs.slice(0, 8));
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate incoming logs
  useEffect(() => {
    const interval = setInterval(() => {
      const randomLog = tradeLogs[Math.floor(Math.random() * tradeLogs.length)];
      const newLog = {
        ...randomLog,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          hour12: false 
        }),
      };
      setLogs(prev => [newLog, ...prev].slice(0, 20));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-terminal-bg border-terminal-bg overflow-hidden">
      <CardHeader className="border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-terminal-text" />
          <CardTitle className="text-white text-base font-medium">실시간 매매 로그</CardTitle>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-terminal-text animate-pulse-glow" />
            <span className="text-xs text-terminal-text/80">LIVE</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={containerRef}
          className="terminal-log h-64 overflow-y-auto p-4 scrollbar-thin"
        >
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
