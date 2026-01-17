import { useState } from "react";
import { useStrategies, useUpdateStrategy, useEmergencyStop, Strategy } from "@/hooks/useStrategies";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle, Settings2, TrendingUp, TrendingDown, StopCircle, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { AddStrategyDialog } from "@/components/strategies/AddStrategyDialog";

export default function Strategies() {
  const { data: strategies, isLoading } = useStrategies();
  const updateStrategy = useUpdateStrategy();
  const emergencyStop = useEmergencyStop();
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [localParams, setLocalParams] = useState<{ take_profit: number; stop_loss: number }>({ take_profit: 0, stop_loss: 0 });
  const [isApplying, setIsApplying] = useState(false);

  const selectedStrategy = strategies?.find(s => s.id === selectedStrategyId) || strategies?.[0];

  // Update local params when selected strategy changes
  const handleSelectStrategy = (strategy: Strategy) => {
    setSelectedStrategyId(strategy.id);
    setLocalParams({
      take_profit: strategy.take_profit || 0,
      stop_loss: strategy.stop_loss || 0,
    });
  };

  const handleToggleStrategy = (id: string, active: boolean) => {
    updateStrategy.mutate({
      id,
      updates: { status: active ? 'active' : 'paused' },
    });
  };

  const handleParamChange = (field: 'take_profit' | 'stop_loss', value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalParams(prev => ({ ...prev, [field]: numValue }));
  };

  const handleEmergencyStop = () => {
    emergencyStop.mutate();
  };

  const handleApplyToLive = async () => {
    if (!selectedStrategy) return;

    setIsApplying(true);

    try {
      await updateStrategy.mutateAsync({
        id: selectedStrategy.id,
        updates: {
          take_profit: localParams.take_profit,
          stop_loss: localParams.stop_loss,
        },
      });

      setIsApplying(false);
      toast.success("파라미터가 저장되었습니다");
    } catch (error) {
      setIsApplying(false);
      toast.error("파라미터 저장 중 오류가 발생했습니다");
    }
  };

  const handleSaveParams = () => {
    if (!selectedStrategy) return;

    updateStrategy.mutate({
      id: selectedStrategy.id,
      updates: {
        take_profit: localParams.take_profit,
        stop_loss: localParams.stop_loss,
      },
    });
  };

  // Initialize local params when strategies load
  if (strategies && strategies.length > 0 && !selectedStrategyId) {
    handleSelectStrategy(strategies[0]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">전략 관리</h1>
          <p className="text-muted-foreground mt-1">전략 파라미터를 수정하고 실행 상태를 관리하세요</p>
        </div>
        <div className="flex items-center gap-3">
          <AddStrategyDialog />
          <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              className="gap-2"
              disabled={emergencyStop.isPending}
            >
              <StopCircle className="w-5 h-5" />
              긴급 정지
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                긴급 정지 확인
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium text-foreground">
                모든 전략을 즉시 중지하시겠습니까?
              </AlertDialogDescription>
              <AlertDialogDescription className="text-sm">
                이 작업은 다음을 수행합니다:
              </AlertDialogDescription>
              <div className="text-sm text-muted-foreground space-y-1 pl-4">
                <div>• 실행 중인 모든 전략 즉시 중지</div>
              </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleEmergencyStop}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                긴급 정지 실행
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-semibold">전략 목록</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : strategies && strategies.length > 0 ? (
            strategies.map((strategy) => {
              const isActive = strategy.status === 'active';
              const hasError = strategy.status === 'error';
              const isPositive = (strategy.profit_rate || 0) >= 0;
              const isSelected = selectedStrategy?.id === strategy.id;

              return (
                <Card
                  key={strategy.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    isSelected && "ring-2 ring-primary",
                    hasError && "border-warning/50"
                  )}
                  onClick={() => handleSelectStrategy(strategy)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "status-indicator",
                          isActive && "status-active",
                          strategy.status === 'paused' && "status-inactive",
                          hasError && "status-error"
                        )} />
                        <div>
                          <p className="font-medium">{strategy.name}</p>
                          <p className="text-sm text-muted-foreground">{strategy.description || '설명 없음'}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 font-mono font-medium",
                        isPositive ? "profit-text" : "loss-text"
                      )}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {isPositive ? "+" : ""}{(strategy.profit_rate || 0).toFixed(2)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              등록된 전략이 없습니다
            </div>
          )}
        </div>

        {/* Strategy Detail */}
        <div className="lg:col-span-2">
          {selectedStrategy ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{selectedStrategy.name}</CardTitle>
                      <CardDescription>{selectedStrategy.description || '설명 없음'}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={selectedStrategy.status === 'active' ? 'default' : selectedStrategy.status === 'error' ? 'destructive' : 'secondary'}>
                      {selectedStrategy.status === 'active' ? '활성' : selectedStrategy.status === 'error' ? '오류' : '일시정지'}
                    </Badge>
                    <Switch
                      checked={selectedStrategy.status === 'active'}
                      onCheckedChange={(checked) => handleToggleStrategy(selectedStrategy.id, checked)}
                      disabled={selectedStrategy.status === 'error' || updateStrategy.isPending}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedStrategy.status === 'error' && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/30">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium text-warning">전략 오류</p>
                      <p className="text-sm text-muted-foreground">전략 상태를 확인해주세요</p>
                    </div>
                  </div>
                )}

                {/* Parameters Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="takeProfit">익절가 (%)</Label>
                    <Input
                      id="takeProfit"
                      type="number"
                      step="0.1"
                      value={localParams.take_profit}
                      onChange={(e) => handleParamChange('take_profit', e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">목표 수익률 도달 시 자동 청산</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stopLoss">손절가 (%)</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      step="0.1"
                      value={localParams.stop_loss}
                      onChange={(e) => handleParamChange('stop_loss', e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">손실 한도 초과 시 자동 청산</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">포지션 크기</p>
                    <p className="font-mono font-medium mt-1">{selectedStrategy.position_size || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">익절</p>
                    <p className="font-mono font-medium mt-1">{selectedStrategy.take_profit || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">손절</p>
                    <p className="font-mono font-medium mt-1">{selectedStrategy.stop_loss || 0}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">수익률</p>
                    <p className={cn(
                      "font-mono font-medium mt-1",
                      (selectedStrategy.profit_rate || 0) >= 0 ? "profit-text" : "loss-text"
                    )}>
                      {(selectedStrategy.profit_rate || 0) >= 0 ? "+" : ""}{(selectedStrategy.profit_rate || 0).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setLocalParams({
                        take_profit: selectedStrategy.take_profit || 0,
                        stop_loss: selectedStrategy.stop_loss || 0,
                      });
                    }}
                  >
                    초기화
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSaveParams}
                    disabled={updateStrategy.isPending}
                  >
                    설정 저장
                  </Button>
                  <Button
                    onClick={handleApplyToLive}
                    disabled={isApplying || updateStrategy.isPending}
                    className="gap-2"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        적용 중...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Apply to Live
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Settings2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">전략을 선택하여 상세 설정을 확인하세요</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
