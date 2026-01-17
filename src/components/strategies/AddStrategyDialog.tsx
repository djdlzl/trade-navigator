import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Plus, Server, Key, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface AddStrategyDialogProps {
  onSuccess?: () => void;
}

export function AddStrategyDialog({ onSuccess }: AddStrategyDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Strategy info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [positionSize, setPositionSize] = useState("10");
  const [takeProfit, setTakeProfit] = useState("5");
  const [stopLoss, setStopLoss] = useState("3");

  // Backend connection
  const [backendUrl, setBackendUrl] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [brokerageType, setBrokerageType] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [heartbeat, setHeartbeat] = useState(true);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPositionSize("10");
    setTakeProfit("5");
    setStopLoss("3");
    setBackendUrl("");
    setAuthToken("");
    setBrokerageType("");
    setApiKey("");
    setApiSecret("");
    setAccountNumber("");
    setAutoReconnect(true);
    setHeartbeat(true);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("로그인이 필요합니다");
      return;
    }

    if (!name.trim()) {
      toast.error("전략 이름을 입력해주세요");
      return;
    }

    if (!backendUrl.trim()) {
      toast.error("백엔드 서버 URL을 입력해주세요");
      return;
    }

    setIsLoading(true);

    try {
      // Create the strategy
      const { data: strategy, error: strategyError } = await supabase
        .from("trading_strategies")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim() || null,
          position_size: parseFloat(positionSize) || 10,
          take_profit: parseFloat(takeProfit) || 5,
          stop_loss: parseFloat(stopLoss) || 3,
          status: "paused",
        })
        .select()
        .single();

      if (strategyError) throw strategyError;

      // Update or create user_settings with backend connection info
      const { error: settingsError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          backend_url: backendUrl.trim(),
          brokerage_type: brokerageType || null,
          api_key_encrypted: apiKey || null,
          api_secret_encrypted: apiSecret || null,
          account_number: accountNumber || null,
        }, {
          onConflict: "user_id",
        });

      if (settingsError) throw settingsError;

      toast.success("전략이 추가되었습니다", {
        description: "백엔드 연결 설정이 저장되었습니다.",
      });

      queryClient.invalidateQueries({ queryKey: ["strategies"] });
      resetForm();
      setOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error adding strategy:", error);
      toast.error("전략 추가 실패", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          전략 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            새 전략 추가 및 백엔드 연결
          </DialogTitle>
          <DialogDescription>
            매매 전략을 추가하고 백엔드 트레이딩 시스템에 연결합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Strategy Info Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground">전략 정보</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="strategy-name">전략 이름 *</Label>
                <Input
                  id="strategy-name"
                  placeholder="예: 모멘텀 전략"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="strategy-desc">설명</Label>
                <Textarea
                  id="strategy-desc"
                  placeholder="전략에 대한 간단한 설명"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position-size">포지션 크기 (%)</Label>
                  <Input
                    id="position-size"
                    type="number"
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="take-profit">익절가 (%)</Label>
                  <Input
                    id="take-profit"
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stop-loss">손절가 (%)</Label>
                  <Input
                    id="stop-loss"
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Backend Connection Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Server className="w-4 h-4" />
              매매 백엔드 연결
            </h3>
            
            {/* Info box */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border text-sm">
              <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="text-muted-foreground">
                매매 백엔드 서버에 연결하여 실시간 거래를 수행합니다.
                입력된 API 키는 암호화되어 저장됩니다.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backend-url">백엔드 서버 URL *</Label>
                <Input
                  id="backend-url"
                  placeholder="wss://trading-backend.example.com"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-token">인증 토큰</Label>
                <Input
                  id="auth-token"
                  type="password"
                  placeholder="••••••••"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-reconnect"
                  checked={autoReconnect}
                  onCheckedChange={setAutoReconnect}
                />
                <Label htmlFor="auto-reconnect" className="text-sm">자동 재연결</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="heartbeat"
                  checked={heartbeat}
                  onCheckedChange={setHeartbeat}
                />
                <Label htmlFor="heartbeat" className="text-sm">Heartbeat 모니터링</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Brokerage API Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
              <Key className="w-4 h-4" />
              증권사 API 연결 (선택)
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brokerage">증권사 선택</Label>
                <Select value={brokerageType} onValueChange={setBrokerageType}>
                  <SelectTrigger id="brokerage">
                    <SelectValue placeholder="증권사를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kiwoom">키움증권</SelectItem>
                    <SelectItem value="korea_investment">한국투자증권</SelectItem>
                    <SelectItem value="samsung">삼성증권</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {brokerageType && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">App Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="••••••••"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-secret">Secret Key</Label>
                      <Input
                        id="api-secret"
                        type="password"
                        placeholder="••••••••"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-number">계좌번호</Label>
                    <Input
                      id="account-number"
                      placeholder="12345678-01"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "추가 중..." : "전략 추가"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
