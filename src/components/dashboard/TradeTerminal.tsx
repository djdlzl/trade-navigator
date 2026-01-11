import { useEffect, useRef, useState } from "react";
import { categorizedTradeLogs, CategorizedTradeLog, backendStatus } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Terminal, ArrowUpCircle, ArrowDownCircle, AlertCircle, WifiOff, Settings, TrendingUp, ArrowUpDown } from "lucide-react";

function formatCurrency(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

interface LogEntryProps {
  log: CategorizedTradeLog;
}

function getCategoryIcon(category: CategorizedTradeLog['category']) {
  switch (category) {
    case 'System':
      return Settings;
    case 'Strategy':
      return TrendingUp;
    case 'Trade':
      return ArrowUpDown;
    default:
      return Settings;
  }
}

function getCategoryColor(category: CategorizedTradeLog['category']) {
  switch (category) {
    case 'System':
      return 'text-blue-400';
    case 'Strategy':
      return 'text-yellow-400';
    case 'Trade':
      return 'text-green-400';
    default:
      return 'text-blue-400';
  }
}

function LogEntry({ log }: LogEntryProps) {
  const { timestamp, strategy, action, ticker, stockName, quantity, price, status, message, reason, category } = log;
  const isBuy = action === 'buy';
  const isFailed = status === 'failed';
  const CategoryIcon = getCategoryIcon(category);
  const categoryColor = getCategoryColor(category);

  // Handle different log types based on category
  if (category === 'System') {
    return (
      <div className={cn(
        "flex items-start gap-1.5 py-1 animate-slide-up text-xs leading-tight",
        isFailed ? "log-error" : "log-success"
      )}>
        <span className="text-terminal-warning/80 flex-shrink-0">[{timestamp}]</span>
        <CategoryIcon className={cn("w-3 h-3 flex-shrink-0 mt-0.5", categoryColor)} />
        <span className="flex-1">
          <span className={cn("font-medium", categoryColor)}>[시스템]</span>{" "}
          <span className="text-white">{message}</span>
        </span>
      </div>
    );
  }

  if (category === 'Strategy') {
    return (
      <div className={cn(
        "flex items-start gap-1.5 py-1 animate-slide-up text-xs leading-tight",
        isFailed ? "log-error" : "log-success"
      )}>
        <span className="text-terminal-warning/80 flex-shrink-0">[{timestamp}]</span>
        <CategoryIcon className={cn("w-3 h-3 flex-shrink-0 mt-0.5", categoryColor)} />
        <span className="flex-1">
          <span className={cn("font-medium", categoryColor)}>[전략]</span>{" "}
          <span className="text-white">{message}</span>
        </span>
      </div>
    );
  }

  // Trade category - enhanced formatting with reason emphasis
  return (
    <div className={cn(
      "flex items-start gap-1.5 py-1 animate-slide-up text-xs leading-tight",
      isFailed ? "log-error" : "log-success"
    )}>
      <span className="text-terminal-warning/80 flex-shrink-0">[{timestamp}]</span>
      {isFailed ? (
        <AlertCircle className="w-3 h-3 text-terminal-error flex-shrink-0 mt-0.5" />
      ) : (
        <CategoryIcon className={cn("w-3 h-3 flex-shrink-0 mt-0.5", categoryColor)} />
      )}
      <span className="flex-1">
        {/* Reason - 매매 근거 강조 with cyan highlighting */}
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
  const [logs, setLogs] = useState<CategorizedTradeLog[]>(categorizedTradeLogs.slice(0, 12));
  const [isConnected, setIsConnected] = useState(backendStatus.isConnected);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate incoming logs
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) return;

      const randomLog = categorizedTradeLogs[Math.floor(Math.random() * categorizedTradeLogs.length)];
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
        "border-b pb-2 px-4 pt-3 transition-colors duration-300",
        isConnected
          ? "border-white/10"
          : "border-red-900/50"
      )}>
        <div className="flex items-center gap-2">
          <Terminal className={cn(
            "w-4 h-4",
            isConnected ? "text-terminal-text" : "text-red-400"
          )} />
          <CardTitle className="text-white text-sm font-medium">실시간 매매 로그</CardTitle>
          <div className="ml-auto flex items-center gap-1">
            {isConnected ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-terminal-text animate-pulse-glow" />
                <span className="text-xs text-terminal-text/80">LIVE</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-400" />
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
              <WifiOff className="w-8 h-8 text-red-400 mx-auto mb-2 animate-pulse" />
              <p className="text-red-300 font-medium text-sm">매매 백엔드 연결이 끊어졌습니다</p>
              <p className="text-red-400/70 text-xs mt-1">재연결 시도 중...</p>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className={cn(
            "terminal-log h-56 overflow-y-auto p-3 scrollbar-thin transition-all duration-300",
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
