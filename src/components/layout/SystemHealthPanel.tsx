import { SystemHealthMetrics, EngineProcess } from "@/hooks/useSystemHealth";
import { Server, Cpu, MemoryStick } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface SystemHealthPanelProps {
    healthData: SystemHealthMetrics;
}

function ProcessIndicator({ process }: { process: EngineProcess }) {
    const statusColor = {
        running: "bg-success",
        stopped: "bg-muted-foreground",
        error: "bg-destructive"
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-default">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        statusColor[process.status],
                        process.status === 'running' && "animate-pulse"
                    )} />
                    <span className="text-xs text-muted-foreground">{process.name}</span>
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                <div className="space-y-1">
                    <p className="font-medium">{process.name}</p>
                    <p>상태: {process.status === 'running' ? '실행 중' : process.status === 'stopped' ? '정지' : '오류'}</p>
                    <p>마지막 응답: {process.lastHeartbeat}</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

function ResourceMeter({ 
    icon: Icon, 
    label, 
    value, 
    max 
}: { 
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    max: string;
}) {
    const percentage = Math.min(value, 100);
    const isHigh = percentage > 80;
    const isMedium = percentage > 50;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-default">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="w-16">
                        <Progress 
                            value={percentage} 
                            className={cn(
                                "h-1.5",
                                isHigh && "[&>div]:bg-destructive",
                                isMedium && !isHigh && "[&>div]:bg-warning"
                            )}
                        />
                    </div>
                    <span className={cn(
                        "text-xs font-mono",
                        isHigh ? "text-destructive" : isMedium ? "text-warning" : "text-muted-foreground"
                    )}>
                        {percentage.toFixed(0)}%
                    </span>
                </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                <p>{label}: {percentage.toFixed(1)}% / {max}</p>
            </TooltipContent>
        </Tooltip>
    );
}

export function SystemHealthPanel({ healthData }: SystemHealthPanelProps) {
    const { engine, serverLoad } = healthData;

    const engineStatusColor = {
        running: "text-success",
        stopped: "text-muted-foreground",
        error: "text-destructive"
    };

    const engineStatusText = {
        running: "정상",
        stopped: "정지",
        error: "오류"
    };

    return (
        <div className="flex items-center gap-6">
            {/* Engine Status */}
            <div className="flex items-center gap-3">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 cursor-default">
                            <Server className={cn("w-4 h-4", engineStatusColor[engine.status])} />
                            <span className={cn("text-sm font-medium", engineStatusColor[engine.status])}>
                                엔진 {engineStatusText[engine.status]}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>매매 엔진 상태</p>
                    </TooltipContent>
                </Tooltip>

                <div className="h-6 w-px bg-border" />

                {/* Process Indicators */}
                <div className="flex items-center gap-3">
                    {engine.processes.map((process) => (
                        <ProcessIndicator key={process.id} process={process} />
                    ))}
                </div>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Server Resources */}
            <div className="flex items-center gap-4">
                <ResourceMeter 
                    icon={Cpu} 
                    label="CPU" 
                    value={serverLoad.cpuUsage} 
                    max="100%"
                />
                <ResourceMeter 
                    icon={MemoryStick} 
                    label="메모리" 
                    value={serverLoad.memoryUsage} 
                    max={serverLoad.totalMemory}
                />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground cursor-default">
                            Uptime: {serverLoad.uptime}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>서버 가동 시간</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}
