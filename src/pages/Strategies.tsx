import { useState } from "react";
import { strategies as initialStrategies, Strategy } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Settings2, TrendingUp, TrendingDown, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Strategies() {
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(strategies[0]);
  const { toast } = useToast();

  const handleToggleStrategy = (id: string, active: boolean) => {
    setStrategies(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, status: active ? 'active' : 'paused' as const }
          : s
      )
    );
    if (selectedStrategy?.id === id) {
      setSelectedStrategy(prev => prev ? { ...prev, status: active ? 'active' : 'paused' as const } : null);
    }
  };

  const handleParamChange = (field: 'takeProfitPercent' | 'stopLossPercent', value: string) => {
    if (!selectedStrategy) return;
    const numValue = parseFloat(value) || 0;
    
    setSelectedStrategy(prev => prev ? { ...prev, [field]: numValue } : null);
    setStrategies(prev =>
      prev.map(s =>
        s.id === selectedStrategy.id
          ? { ...s, [field]: numValue }
          : s
      )
    );
  };

  const handleEmergencyStop = () => {
    setStrategies(prev =>
      prev.map(s => ({ ...s, status: 'paused' as const }))
    );
    if (selectedStrategy) {
      setSelectedStrategy({ ...selectedStrategy, status: 'paused' });
    }
    toast({
      title: "긴급 정지 실행",
      description: "모든 전략이 중지되었습니다.",
      variant: "destructive",
    });
  };

  const handleSaveParams = () => {
    toast({
      title: "설정 저장 완료",
      description: `${selectedStrategy?.name} 전략 파라미터가 업데이트되었습니다.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">전략 관리</h1>
          <p className="text-muted-foreground mt-1">전략 파라미터를 수정하고 실행 상태를 관리하세요</p>
        </div>
        <Button
          variant="destructive"
          size="lg"
          onClick={handleEmergencyStop}
          className="gap-2"
        >
          <StopCircle className="w-5 h-5" />
          긴급 정지
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strategy List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-semibold">전략 목록</h2>
          {strategies.map((strategy) => {
            const isActive = strategy.status === 'active';
            const hasError = strategy.status === 'error';
            const isPositive = strategy.returnRate >= 0;
            const isSelected = selectedStrategy?.id === strategy.id;

            return (
              <Card
                key={strategy.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isSelected && "ring-2 ring-primary",
                  hasError && "border-warning/50"
                )}
                onClick={() => setSelectedStrategy(strategy)}
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
                        <p className="text-sm text-muted-foreground">{strategy.account}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 font-mono font-medium",
                      isPositive ? "profit-text" : "loss-text"
                    )}>
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {isPositive ? "+" : ""}{strategy.returnRate.toFixed(2)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
                      <CardDescription>{selectedStrategy.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={selectedStrategy.status === 'active' ? 'default' : selectedStrategy.status === 'error' ? 'destructive' : 'secondary'}>
                      {selectedStrategy.status === 'active' ? '활성' : selectedStrategy.status === 'error' ? '오류' : '일시정지'}
                    </Badge>
                    <Switch
                      checked={selectedStrategy.status === 'active'}
                      onCheckedChange={(checked) => handleToggleStrategy(selectedStrategy.id, checked)}
                      disabled={selectedStrategy.status === 'error'}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedStrategy.status === 'error' && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/30">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium text-warning">API 연결 오류</p>
                      <p className="text-sm text-muted-foreground">증권사 API 연결을 확인해주세요</p>
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
                      value={selectedStrategy.takeProfitPercent}
                      onChange={(e) => handleParamChange('takeProfitPercent', e.target.value)}
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
                      value={selectedStrategy.stopLossPercent}
                      onChange={(e) => handleParamChange('stopLossPercent', e.target.value)}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">손실 한도 초과 시 자동 청산</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm text-muted-foreground">연결 계좌</p>
                    <p className="font-medium mt-1">{selectedStrategy.account}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">오늘 거래</p>
                    <p className="font-mono font-medium mt-1">{selectedStrategy.dailyTrades}건</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">마지막 거래</p>
                    <p className="font-mono text-sm mt-1">{selectedStrategy.lastTrade}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">수익률</p>
                    <p className={cn(
                      "font-mono font-medium mt-1",
                      selectedStrategy.returnRate >= 0 ? "profit-text" : "loss-text"
                    )}>
                      {selectedStrategy.returnRate >= 0 ? "+" : ""}{selectedStrategy.returnRate.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">초기화</Button>
                  <Button onClick={handleSaveParams}>설정 저장</Button>
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
