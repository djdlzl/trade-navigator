import { SystemHealthMetrics, EngineProcess } from "@/data/mockData";
import { Server, Cpu, MemoryStick } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface SystemHealthPanelProps {
    healthData: SystemHealthMetrics;
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
                        status === 'running' && "bg-green-500 shadow-green-500/60 animate-pulse",
                        status === 'stopped' && "bg-muted-foreground",
                        status === 'error' && "bg-destructive shadow-destructive/60 animate-pulse"
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

interface ResourceBarProps {
    label: string;
    value: number;
    max?: number;
    unit: string;
    icon: React.ComponentType<{ className?: string }>;
    thresholds?: {
        warning: number;
        critical: number;
    };
}

function ResourceBar({ label, value, max, unit, icon: Icon, thresholds = { warning: 60, critical: 80 } }: ResourceBarProps) {
    const percentage = max ? (value / max) * 100 : value;
    const displayValue = max ? `${value.toFixed(1)}${unit} / ${max}${unit}` : `${value.toFixed(1)}${unit}`;

    const getColorClass = (percent: number) => {
        if (percent > thresholds.critical) return "text-destructive";
        if (percent > thresholds.warning) return "text-yellow-500";
        return "text-foreground";
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-pointer">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className={cn("text-xs font-mono font-medium", getColorClass(percentage))}>
                        {max ? `${value.toFixed(1)}${unit}` : `${value.toFixed(1)}${unit}`}
                    </span>
                </div>
            </TooltipTrigger>
            <TooltipContent className="w-48">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span>{label}</span>
                        <span className="font-mono">{displayValue}</span>
                    </div>
                    <Progress
                        value={percentage}
                        className={cn(
                            "h-1.5",
                            percentage > thresholds.critical && "[&>div]:bg-destructive",
                            percentage > thresholds.warning && percentage <= thresholds.critical && "[&>div]:bg-yellow-500"
                        )}
                    />
                    <div className="text-xs text-muted-foreground">
                        임계치: 경고 {thresholds.warning}% / 위험 {thresholds.critical}%
                    </div>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

export function SystemHealthPanel({ healthData }: SystemHealthPanelProps) {
    const { engineStatus, serverLoad } = healthData;
    const runningCount = engineStatus.processes.filter(p => p.status === 'running').length;
    const hasError = engineStatus.processes.some(p => p.status === 'error');
    const memoryPercent = (serverLoad.memoryUsage / serverLoad.memoryTotal) * 100;

    // Determine overall engine status color
    const getEngineStatusColor = () => {
        if (hasError) return "text-destructive";
        if (runningCount > 0) return "text-green-500";
        return "text-muted-foreground";
    };

    return (
        <div className="flex items-center gap-3">
            {/* Server Resources */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-secondary/50">
                <ResourceBar
                    label="CPU 사용량"
                    value={serverLoad.cpuUsage}
                    unit="%"
                    icon={Cpu}
                    thresholds={{ warning: 60, critical: 80 }}
                />
                <div className="w-px h-4 bg-border" />
                <ResourceBar
                    label="메모리 사용량"
                    value={serverLoad.memoryUsage}
                    max={serverLoad.memoryTotal}
                    unit="G"
                    icon={MemoryStick}
                    thresholds={{ warning: 60, critical: 80 }}
                />
            </div>

            <div className="w-px h-6 bg-border" />

            {/* Engine Status */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-md bg-secondary/50">
                <div className="flex items-center gap-1.5">
                    <Server className={cn("w-4 h-4", getEngineStatusColor())} />
                    <span className="text-sm font-medium">엔진</span>
                </div>
                <div className="flex items-center gap-1">
                    {engineStatus.processes.map((process) => (
                        <EngineLED key={process.id} status={process.status} name={process.name} />
                    ))}
                </div>
                <span className="text-xs text-muted-foreground">
                    {runningCount}/{engineStatus.processes.length}
                </span>
            </div>
        </div>
    );
}