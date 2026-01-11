import { portfolioSummary, apiStatus, engineProcesses, serverResource, backendStatus } from "@/data/mockData";
import { Wifi, WifiOff, AlertTriangle, Server, Cpu, MemoryStick, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

function formatCurrency(num: number): string {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}억`;
  }
  if (num >= 10000) {
    return `${(num / 10000).toFixed(0)}만`;
  }
  return formatNumber(num);
}

interface StatusIndicatorProps {
  status: 'connected' | 'error' | 'disconnected';
  label: string;
}

function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/50">
      {status === 'connected' && (
        <Wifi className="w-4 h-4 text-success" />
      )}
      {status === 'error' && (
        <AlertTriangle className="w-4 h-4 text-warning" />
      )}
      {status === 'disconnected' && (
        <WifiOff className="w-4 h-4 text-destructive" />
      )}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

interface EngineLEDProps {
  status: 'running' | 'stopped' | 'error';
  name: string;
}

function EngineLED({ status, name }: EngineLEDProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-full cursor-pointer transition-all",
            status === 'running' && "bg-success shadow-[0_0_8px_hsl(var(--success)/0.6)] animate-pulse",
            status === 'stopped' && "bg-muted-foreground",
            status === 'error' && "bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.6)] animate-pulse"
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {status === 'running' ? '정상 실행 중' : status === 'error' ? '오류 발생' : '정지됨'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

function ServerResourceWidget() {
  const { cpuUsage, memoryUsage, memoryTotal } = serverResource;
  const memoryPercent = (memoryUsage / memoryTotal) * 100;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-secondary/50 cursor-pointer">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
            <span className={cn(
              "text-xs font-mono font-medium",
              cpuUsage > 80 ? "text-destructive" : cpuUsage > 60 ? "text-warning" : "text-foreground"
            )}>
              {cpuUsage.toFixed(1)}%
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <MemoryStick className="w-3.5 h-3.5 text-muted-foreground" />
            <span className={cn(
              "text-xs font-mono font-medium",
              memoryPercent > 80 ? "text-destructive" : memoryPercent > 60 ? "text-warning" : "text-foreground"
            )}>
              {memoryUsage.toFixed(1)}G
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="w-48">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>CPU 사용량</span>
              <span className="font-mono">{cpuUsage.toFixed(1)}%</span>
            </div>
            <Progress value={cpuUsage} className="h-1.5" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>메모리 사용량</span>
              <span className="font-mono">{memoryUsage.toFixed(1)}G / {memoryTotal}G</span>
            </div>
            <Progress value={memoryPercent} className="h-1.5" />
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function EngineStatusWidget() {
  const runningCount = engineProcesses.filter(p => p.status === 'running').length;
  const hasError = engineProcesses.some(p => p.status === 'error');

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-secondary/50">
      <div className="flex items-center gap-1.5">
        <Server className={cn(
          "w-4 h-4",
          hasError ? "text-warning" : "text-success"
        )} />
        <span className="text-sm font-medium">엔진</span>
      </div>
      <div className="flex items-center gap-1">
        {engineProcesses.map((process) => (
          <EngineLED key={process.id} status={process.status} name={process.name} />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {runningCount}/{engineProcesses.length}
      </span>
    </div>
  );
}

function BackendConnectionStatus() {
  const { isConnected, latency } = backendStatus;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md",
          isConnected ? "bg-secondary/50" : "bg-destructive/20"
        )}>
          <Activity className={cn(
            "w-4 h-4",
            isConnected ? "text-success" : "text-destructive"
          )} />
          <span className="text-sm font-medium">백엔드</span>
          {isConnected && (
            <span className="text-xs font-mono text-muted-foreground">{latency}ms</span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isConnected ? '매매 백엔드 연결됨' : '매매 백엔드 연결 끊김'}</p>
        {isConnected && <p className="text-xs text-muted-foreground">응답 지연: {latency}ms</p>}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppHeader() {
  const { totalAssets, todayProfit, todayProfitRate } = portfolioSummary;
  const isPositive = todayProfit >= 0;

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Left: Portfolio Summary */}
      <div className="flex items-center gap-8">
        <div className="flex flex-col">
          <span className="stat-label">총 자산</span>
          <span className="stat-value">{formatCurrency(totalAssets)}원</span>
        </div>
        <div className="h-10 w-px bg-border" />
        <div className="flex flex-col">
          <span className="stat-label">당일 수익</span>
          <div className="flex items-baseline gap-2">
            <span className={cn("stat-value", isPositive ? "profit-text" : "loss-text")}>
              {isPositive ? "+" : ""}{formatCurrency(todayProfit)}원
            </span>
            <span className={cn("text-sm font-mono font-medium", isPositive ? "profit-text" : "loss-text")}>
              ({isPositive ? "+" : ""}{todayProfitRate.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Right: System Status */}
      <div className="flex items-center gap-2">
        {/* Server Resources */}
        <ServerResourceWidget />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Backend Connection */}
        <BackendConnectionStatus />
        
        {/* Engine Status */}
        <EngineStatusWidget />
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* API Status */}
        <span className="text-sm text-muted-foreground">API</span>
        <StatusIndicator status={apiStatus.kiwoom} label="키움" />
        <StatusIndicator status={apiStatus.koreaInvest} label="한투" />
        <StatusIndicator status={apiStatus.samsung} label="삼성" />
      </div>
    </header>
  );
}
