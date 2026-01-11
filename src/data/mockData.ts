// 서버 리소스 상태
export interface ServerResource {
  cpuUsage: number;
  memoryUsage: number;
  memoryTotal: number;
  uptime: number;
}

export const serverResource: ServerResource = {
  cpuUsage: 23.5,
  memoryUsage: 4.2,
  memoryTotal: 8.0,
  uptime: 172800, // seconds (2 days)
};

// 매매 엔진 프로세스 상태
export interface EngineProcess {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastHeartbeat: string;
  pid: number;
}

export const engineProcesses: EngineProcess[] = [
  { id: 'engine-1', name: 'Main Trading Engine', status: 'running', lastHeartbeat: '2024-01-15 14:35:10', pid: 12345 },
  { id: 'engine-2', name: 'Order Executor', status: 'running', lastHeartbeat: '2024-01-15 14:35:12', pid: 12346 },
  { id: 'engine-3', name: 'Risk Monitor', status: 'running', lastHeartbeat: '2024-01-15 14:35:11', pid: 12347 },
  { id: 'engine-4', name: 'Data Collector', status: 'error', lastHeartbeat: '2024-01-15 14:30:00', pid: 12348 },
];

// 백엔드 연결 상태
export interface BackendStatus {
  isConnected: boolean;
  lastPing: string;
  latency: number;
}

export const backendStatus: BackendStatus = {
  isConnected: true,
  lastPing: '2024-01-15 14:35:12',
  latency: 12,
};

// 전략 데이터
export interface Strategy {
  id: string;
  name: string;
  description: string;
  returnRate: number;
  status: 'active' | 'paused' | 'error';
  account: string;
  lastTrade: string;
  dailyTrades: number;
  takeProfitPercent: number;
  stopLossPercent: number;
}

export const strategies: Strategy[] = [
  {
    id: '1',
    name: '모멘텀 전략 A',
    description: '상승 모멘텀 추종 전략',
    returnRate: 12.5,
    status: 'active',
    account: '키움증권 #1',
    lastTrade: '2024-01-15 14:32:05',
    dailyTrades: 23,
    takeProfitPercent: 5.0,
    stopLossPercent: 2.0,
  },
  {
    id: '2',
    name: '스캘핑 전략 B',
    description: '고빈도 단타 매매',
    returnRate: -3.2,
    status: 'active',
    account: '한국투자 #1',
    lastTrade: '2024-01-15 14:35:12',
    dailyTrades: 156,
    takeProfitPercent: 0.5,
    stopLossPercent: 0.3,
  },
  {
    id: '3',
    name: '평균회귀 전략',
    description: '과매도 구간 진입',
    returnRate: 8.7,
    status: 'paused',
    account: '키움증권 #2',
    lastTrade: '2024-01-15 11:20:33',
    dailyTrades: 8,
    takeProfitPercent: 3.0,
    stopLossPercent: 1.5,
  },
  {
    id: '4',
    name: 'ETF 차익거래',
    description: '지수 ETF 괴리율 매매',
    returnRate: 2.1,
    status: 'active',
    account: '삼성증권 #1',
    lastTrade: '2024-01-15 14:28:44',
    dailyTrades: 45,
    takeProfitPercent: 0.3,
    stopLossPercent: 0.2,
  },
  {
    id: '5',
    name: '변동성 돌파',
    description: '래리 윌리엄스 전략',
    returnRate: 5.3,
    status: 'error',
    account: '키움증권 #1',
    lastTrade: '2024-01-15 09:05:00',
    dailyTrades: 2,
    takeProfitPercent: 4.0,
    stopLossPercent: 2.5,
  },
  {
    id: '6',
    name: '급등주 추적',
    description: '거래량 급증 종목 매매',
    returnRate: 18.9,
    status: 'active',
    account: '한국투자 #2',
    lastTrade: '2024-01-15 14:33:28',
    dailyTrades: 12,
    takeProfitPercent: 8.0,
    stopLossPercent: 3.0,
  },
];

// 매매 로그 데이터
export interface TradeLog {
  id: string;
  timestamp: string;
  strategy: string;
  action: 'buy' | 'sell';
  ticker: string;
  stockName: string;
  quantity: number;
  price: number;
  status: 'success' | 'pending' | 'failed';
  message?: string;
  reason?: string; // 매매 근거
}

export const tradeLogs: TradeLog[] = [
  { id: '1', timestamp: '14:35:12', strategy: '스캘핑 전략 B', action: 'sell', ticker: '005930', stockName: '삼성전자', quantity: 50, price: 72400, status: 'success', reason: 'MACD-Cross' },
  { id: '2', timestamp: '14:33:28', strategy: '급등주 추적', action: 'buy', ticker: '373220', stockName: 'LG에너지솔루션', quantity: 5, price: 425000, status: 'success', reason: 'Volume-Spike' },
  { id: '3', timestamp: '14:32:05', strategy: '모멘텀 전략 A', action: 'buy', ticker: '000660', stockName: 'SK하이닉스', quantity: 30, price: 168500, status: 'success', reason: 'RSI-Oversold' },
  { id: '4', timestamp: '14:28:44', strategy: 'ETF 차익거래', action: 'sell', ticker: '069500', stockName: 'KODEX 200', quantity: 200, price: 35850, status: 'success', reason: 'Arbitrage-Gap' },
  { id: '5', timestamp: '14:25:33', strategy: '스캘핑 전략 B', action: 'buy', ticker: '035720', stockName: '카카오', quantity: 100, price: 48750, status: 'success', reason: 'BB-Breakout' },
  { id: '6', timestamp: '14:22:11', strategy: '변동성 돌파', action: 'buy', ticker: '035420', stockName: 'NAVER', quantity: 20, price: 192500, status: 'failed', message: 'API 연결 오류', reason: 'Range-Break' },
  { id: '7', timestamp: '14:18:45', strategy: '모멘텀 전략 A', action: 'sell', ticker: '051910', stockName: 'LG화학', quantity: 15, price: 485000, status: 'success', reason: 'Take-Profit' },
  { id: '8', timestamp: '14:15:22', strategy: '급등주 추적', action: 'sell', ticker: '006400', stockName: '삼성SDI', quantity: 8, price: 412000, status: 'success', reason: 'Momentum-Exit' },
  { id: '9', timestamp: '14:12:08', strategy: 'ETF 차익거래', action: 'buy', ticker: '102110', stockName: 'TIGER 200', quantity: 150, price: 35920, status: 'success', reason: 'Arbitrage-Gap' },
  { id: '10', timestamp: '14:08:55', strategy: '스캘핑 전략 B', action: 'sell', ticker: '005380', stockName: '현대차', quantity: 40, price: 243500, status: 'success', reason: 'Stop-Loss' },
];

// 보유 종목 데이터
export interface Holding {
  id: string;
  ticker: string;
  stockName: string;
  account: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  profitRate: number;
  profitAmount: number;
  weight: number;
}

export const holdings: Holding[] = [
  { id: '1', ticker: '005930', stockName: '삼성전자', account: '키움증권 #1', quantity: 500, avgPrice: 68500, currentPrice: 72400, profitRate: 5.69, profitAmount: 1950000, weight: 25.2 },
  { id: '2', ticker: '000660', stockName: 'SK하이닉스', account: '키움증권 #1', quantity: 150, avgPrice: 155000, currentPrice: 168500, profitRate: 8.71, profitAmount: 2025000, weight: 17.6 },
  { id: '3', ticker: '373220', stockName: 'LG에너지솔루션', account: '한국투자 #1', quantity: 25, avgPrice: 450000, currentPrice: 425000, profitRate: -5.56, profitAmount: -625000, weight: 7.4 },
  { id: '4', ticker: '035720', stockName: '카카오', account: '한국투자 #1', quantity: 300, avgPrice: 52000, currentPrice: 48750, profitRate: -6.25, profitAmount: -975000, weight: 10.2 },
  { id: '5', ticker: '035420', stockName: 'NAVER', account: '삼성증권 #1', quantity: 80, avgPrice: 185000, currentPrice: 192500, profitRate: 4.05, profitAmount: 600000, weight: 10.7 },
  { id: '6', ticker: '051910', stockName: 'LG화학', account: '키움증권 #2', quantity: 20, avgPrice: 495000, currentPrice: 485000, profitRate: -2.02, profitAmount: -200000, weight: 6.8 },
  { id: '7', ticker: '006400', stockName: '삼성SDI', account: '한국투자 #2', quantity: 30, avgPrice: 395000, currentPrice: 412000, profitRate: 4.30, profitAmount: 510000, weight: 8.6 },
  { id: '8', ticker: '005380', stockName: '현대차', account: '삼성증권 #1', quantity: 60, avgPrice: 235000, currentPrice: 243500, profitRate: 3.62, profitAmount: 510000, weight: 10.2 },
  { id: '9', ticker: '069500', stockName: 'KODEX 200', account: 'ETF 전용', quantity: 1000, avgPrice: 35500, currentPrice: 35850, profitRate: 0.99, profitAmount: 350000, weight: 2.5 },
  { id: '10', ticker: '102110', stockName: 'TIGER 200', account: 'ETF 전용', quantity: 500, avgPrice: 35800, currentPrice: 35920, profitRate: 0.34, profitAmount: 60000, weight: 1.3 },
];

// 계좌 목록
export const accounts = [
  { id: 'all', name: '전체 계좌' },
  { id: 'kiwoom1', name: '키움증권 #1' },
  { id: 'kiwoom2', name: '키움증권 #2' },
  { id: 'korea1', name: '한국투자 #1' },
  { id: 'korea2', name: '한국투자 #2' },
  { id: 'samsung1', name: '삼성증권 #1' },
  { id: 'etf', name: 'ETF 전용' },
];

// 24시간 수익률 차트 데이터
export const profitChartData = [
  { time: '09:00', profit: 0 },
  { time: '09:30', profit: 0.12 },
  { time: '10:00', profit: 0.35 },
  { time: '10:30', profit: 0.28 },
  { time: '11:00', profit: 0.52 },
  { time: '11:30', profit: 0.48 },
  { time: '12:00', profit: 0.61 },
  { time: '12:30', profit: 0.58 },
  { time: '13:00', profit: 0.72 },
  { time: '13:30', profit: 0.85 },
  { time: '14:00', profit: 0.78 },
  { time: '14:30', profit: 0.92 },
  { time: '15:00', profit: 1.05 },
  { time: '15:30', profit: 1.15 },
];

// 총 자산 요약
export const portfolioSummary = {
  totalAssets: 1524350000,
  todayProfit: 15243500,
  todayProfitRate: 1.01,
  totalProfit: 124350000,
  totalProfitRate: 8.89,
  cashBalance: 245680000,
  investedAmount: 1278670000,
};

// API 연결 상태 (증권사 API는 매매 백엔드를 통해 연결)
export const apiStatus = {
  kiwoom: 'connected' as const,
  koreaInvest: 'connected' as const,
  samsung: 'error' as const,
};
