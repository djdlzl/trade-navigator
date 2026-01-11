import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Key, Bell, Shield, Database, Server, Info } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const handleSave = () => {
    toast.success("설정 저장 완료", {
      description: "시스템 설정이 업데이트되었습니다.",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">시스템 설정</h1>
        <p className="text-muted-foreground mt-1">시스템 전반의 설정을 관리하세요</p>
      </div>

      {/* Architecture Info Banner */}
      <Alert className="border-primary/30 bg-primary/5">
        <Server className="h-4 w-4" />
        <AlertDescription className="ml-2">
          <span className="font-medium">자체 매매 백엔드 아키텍처</span>
          <p className="text-sm text-muted-foreground mt-1">
            모든 매매 데이터는 직접 개발한 '매매 백엔드(Trading Backend)'에서 수신됩니다.
            아래에서 입력하는 증권사 API 키는 플랫폼 DB에 암호화되어 저장된 후, 매매 시스템으로 안전하게 전달됩니다.
          </p>
        </AlertDescription>
      </Alert>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <CardTitle>증권사 API 설정</CardTitle>
          </div>
          <CardDescription>
            증권사 API 연결 정보를 설정합니다. 입력된 키는 암호화되어 저장되며, 매매 백엔드로 전달됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info box */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">API 키 처리 흐름</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>입력된 API 키는 플랫폼 백엔드 DB에 암호화 저장</li>
                <li>매매 엔진 시작 시 안전한 채널로 키 전달</li>
                <li>매매 엔진에서 증권사 API로 직접 연결</li>
              </ol>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kiwoom-id">키움증권 App Key</Label>
              <Input id="kiwoom-id" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kiwoom-secret">키움증권 Secret Key</Label>
              <Input id="kiwoom-secret" type="password" placeholder="••••••••" />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="korea-id">한국투자 App Key</Label>
              <Input id="korea-id" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="korea-secret">한국투자 Secret Key</Label>
              <Input id="korea-secret" type="password" placeholder="••••••••" />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="samsung-id">삼성증권 App Key</Label>
              <Input id="samsung-id" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="samsung-secret">삼성증권 Secret Key</Label>
              <Input id="samsung-secret" type="password" placeholder="••••••••" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backend Connection Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            <CardTitle>매매 백엔드 연결</CardTitle>
          </div>
          <CardDescription>매매 엔진 서버 연결 설정을 관리합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backend-url">백엔드 서버 URL</Label>
              <Input
                id="backend-url"
                type="text"
                placeholder="wss://trading-backend.example.com"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">WebSocket 연결 주소</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backend-token">인증 토큰</Label>
              <Input id="backend-token" type="password" placeholder="••••••••" />
              <p className="text-xs text-muted-foreground">매매 백엔드 인증용 토큰</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">자동 재연결</p>
              <p className="text-sm text-muted-foreground">연결 끊김 시 자동으로 재연결을 시도합니다</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Heartbeat 모니터링</p>
              <p className="text-sm text-muted-foreground">매매 엔진 생존 상태를 주기적으로 확인합니다</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle>알림 설정</CardTitle>
          </div>
          <CardDescription>매매 알림 및 시스템 알림을 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">매매 체결 알림</p>
              <p className="text-sm text-muted-foreground">주문 체결 시 알림을 받습니다</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">손절 알림</p>
              <p className="text-sm text-muted-foreground">손절 발생 시 즉시 알림을 받습니다</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">매매 엔진 오류 알림</p>
              <p className="text-sm text-muted-foreground">매매 백엔드 연결 오류 등 시스템 문제 발생 시 알림</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">일일 리포트</p>
              <p className="text-sm text-muted-foreground">매일 장 마감 후 수익률 리포트를 받습니다</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>리스크 관리</CardTitle>
          </div>
          <CardDescription>전체 계좌 리스크 관리 설정</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-loss">일일 최대 손실률 (%)</Label>
              <Input id="max-loss" type="number" defaultValue="3" className="font-mono" />
              <p className="text-xs text-muted-foreground">초과 시 전 전략 자동 정지</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-position">최대 포지션 비율 (%)</Label>
              <Input id="max-position" type="number" defaultValue="30" className="font-mono" />
              <p className="text-xs text-muted-foreground">단일 종목 최대 투자 비율</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">자동 긴급 정지</p>
              <p className="text-sm text-muted-foreground">일일 최대 손실률 초과 시 자동 정지</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <CardTitle>데이터 관리</CardTitle>
          </div>
          <CardDescription>로그 및 데이터 보관 설정</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="log-retention">매매 로그 보관 기간 (일)</Label>
            <Input id="log-retention" type="number" defaultValue="90" className="font-mono w-32" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">자동 백업</p>
              <p className="text-sm text-muted-foreground">매일 자정 데이터 자동 백업</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Settings className="w-4 h-4 mr-2" />
          설정 저장
        </Button>
      </div>
    </div>
  );
}
