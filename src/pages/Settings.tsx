import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Key, Bell, Shield, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "설정 저장 완료",
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

      {/* API Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <CardTitle>API 연결 설정</CardTitle>
          </div>
          <CardDescription>증권사 API 연결 정보를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <p className="font-medium">시스템 오류 알림</p>
              <p className="text-sm text-muted-foreground">API 연결 오류 등 시스템 문제 발생 시 알림</p>
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
