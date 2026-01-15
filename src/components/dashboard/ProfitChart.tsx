import { useHoldings } from "@/hooks/useHoldings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export function ProfitChart() {
  const { data: holdings, isLoading } = useHoldings();

  // Generate chart data from holdings
  // In production, this would come from a dedicated profit history table
  const chartData = holdings && holdings.length > 0 
    ? generateProfitChartData(holdings)
    : [];

  const latestProfit = chartData.length > 0 ? chartData[chartData.length - 1]?.profit || 0 : 0;
  const isPositive = latestProfit >= 0;

  return (
    <Card>
      <CardHeader className="pb-2 px-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">금일 수익률 추이</CardTitle>
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <span className={`font-mono font-semibold text-sm ${isPositive ? 'profit-text' : 'loss-text'}`}>
              {isPositive ? '+' : ''}{latestProfit.toFixed(2)}%
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="h-40">
          {isLoading ? (
            <Skeleton className="w-full h-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                  domain={['dataMin - 0.1', 'dataMax + 0.1']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px hsl(var(--shadow) / 0.1)',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px' }}
                  formatter={(value: number) => [`${value.toFixed(2)}%`, '수익률']}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  fill="url(#profitGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              수익률 데이터가 없습니다
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to generate chart data from holdings
// In production, this would fetch actual historical data
function generateProfitChartData(holdings: any[]) {
  const totalProfitRate = holdings.reduce((acc, h) => acc + (h.profit_rate || 0), 0) / holdings.length;
  
  // Generate sample time series data for today
  const now = new Date();
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
  
  return hours.map((time, index) => ({
    time,
    profit: totalProfitRate * (0.5 + index * 0.08), // Simulated progression
  }));
}
