import { useEffect, useRef, useState } from "react";
import { tradeLogs, TradeLog, backendStatus } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Terminal, ArrowUpCircle, ArrowDownCircle, AlertCircle, WifiOff } from "lucide-react";

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

interface LogEntryProps {
  log: TradeLog;
}

function LogEntry({ log }: LogEntryProps) {
  const { timestamp, strategy, action, ticker, stockName, quantity, price, status, message, reason } = log;
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
        {/* Reason - 매매 근거 강조 */}
        {reason && (
          <span className="text-cyan-400 font-medium">[{reason}]</span>
        )}{" "}
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
  const [isConnected, setIsConnected] = useState(backendStatus.isConnected);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate incoming logs
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) return;
      
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
  }, [isConnected]);

  // Simulate connection status changes (for demo)
  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance of disconnection for demo
      if (Math.random() < 0.1) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 3000);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={cn(
      "overflow-hidden transition-colors duration-300",
      isConnected 
        ? "bg-terminal-bg border-terminal-bg" 
        : "bg-[hsl(0_50%_12%)] border-[hsl(0_50%_20%)]"
    )}>
      <CardHeader className={cn(
        "border-b pb-3 transition-colors duration-300",
        isConnected 
          ? "border-white/10" 
          : "border-red-900/50"
      )}>
        <div className="flex items-center gap-2">
          <Terminal className={cn(
            "w-5 h-5",
            isConnected ? "text-terminal-text" : "text-red-400"
          )} />
          <CardTitle className="text-white text-base font-medium">실시간 매매 로그</CardTitle>
          <div className="ml-auto flex items-center gap-1.5">
            {isConnected ? (
              <>
                <div className="w-2 h-2 rounded-full bg-terminal-text animate-pulse-glow" />
                <span className="text-xs text-terminal-text/80">LIVE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-medium animate-pulse">연결 끊김</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        {/* Disconnection Warning Overlay */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-950/50 backdrop-blur-sm z-10">
            <div className="text-center">
              <WifiOff className="w-10 h-10 text-red-400 mx-auto mb-2 animate-pulse" />
              <p className="text-red-300 font-medium">매매 백엔드 연결이 끊어졌습니다</p>
              <p className="text-red-400/70 text-sm mt-1">재연결 시도 중...</p>
            </div>
          </div>
        )}
        <div 
          ref={containerRef}
          className={cn(
            "terminal-log h-64 overflow-y-auto p-4 scrollbar-thin transition-all duration-300",
            !isConnected && "opacity-30"
          )}
        >
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
