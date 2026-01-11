# Design Document

## Overview

This design enhances the trading dashboard UI with improved system monitoring, enhanced strategy management safety features, categorized trade logging, and optimized layout density. The solution builds upon the existing React/TypeScript architecture using shadcn/ui components and maintains consistency with the current design system.

## Architecture

The enhancement follows the existing component-based architecture:

```
src/
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx (enhanced with SystemHealthPanel)
│   │   └── MainLayout.tsx
│   ├── dashboard/
│   │   ├── TradeTerminal.tsx (enhanced with log categorization)
│   │   ├── PortfolioStats.tsx
│   │   └── ProfitChart.tsx
│   └── ui/ (existing shadcn/ui components)
├── pages/
│   ├── Dashboard.tsx (layout optimization)
│   └── Strategies.tsx (enhanced safety features)
└── data/
    └── mockData.ts (extended with log categories)
```

The design leverages existing infrastructure:
- React Router for navigation
- shadcn/ui component library for consistent styling
- Sonner for toast notifications
- AlertDialog for confirmation modals
- Existing state management patterns

## Components and Interfaces

### 1. SystemHealthPanel (AppHeader Enhancement)

Replaces the current API status section with comprehensive system monitoring:

```typescript
interface SystemHealthMetrics {
  engineStatus: {
    status: 'running' | 'stopped' | 'error';
    processes: EngineProcess[];
  };
  serverLoad: {
    cpuUsage: number;
    memoryUsage: number;
    memoryTotal: number;
  };
}

interface EngineProcess {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
}
```

**Visual Design:**
- LED indicators for engine status (green=running, red=error, gray=stopped)
- Compact progress bars for CPU/RAM usage
- Tooltip overlays for detailed metrics
- Color-coded status indicators (green/yellow/red thresholds)

### 2. Enhanced Strategy Management (Strategies.tsx)

Adds safety confirmations and live parameter updates:

```typescript
interface StrategyManagementState {
  selectedStrategy: Strategy | null;
  isApplyingLive: boolean;
  emergencyStopDialogOpen: boolean;
}

interface LiveParameterUpdate {
  strategyId: string;
  parameters: {
    takeProfitPercent: number;
    stopLossPercent: number;
  };
}
```

**Emergency Stop Flow:**
1. User clicks "긴급 정지" button
2. AlertDialog displays confirmation with detailed consequences
3. User confirms → All strategies stop, positions liquidate
4. Toast notification confirms completion

**Live Parameter Flow:**
1. User modifies parameters in form
2. User clicks "Apply to Live" button
3. Loading state with spinner
4. API call to backend (simulated)
5. Success toast: "백엔드 엔진에 파라미터가 실시간 반영되었습니다"

### 3. Categorized Trade Terminal (TradeTerminal.tsx)

Enhances log visualization with type-based categorization:

```typescript
interface CategorizedTradeLog extends TradeLog {
  category: 'System' | 'Strategy' | 'Trade';
  reason?: string; // Trading decision rationale
}

interface LogCategoryConfig {
  System: {
    color: 'text-blue-400';
    icon: 'Settings';
  };
  Strategy: {
    color: 'text-yellow-400';
    icon: 'TrendingUp';
  };
  Trade: {
    color: 'text-green-400';
    icon: 'ArrowUpDown';
  };
}
```

**Log Format Examples:**
- System: `[14:23:15] [시스템] 매매 엔진 재시작 완료`
- Strategy: `[14:23:20] [전략] RSI 과매도 신호 감지 - 삼성전자`
- Trade: `[14:23:25] [RSI과매도] 삼성전자 10주 매수 주문 체결`

**Visual Enhancements:**
- Category-specific color coding
- Emphasized reason tags in cyan for trade logs
- Consistent icon usage per category
- Improved readability with better spacing

### 4. Optimized Dashboard Layout (Dashboard.tsx)

Restructures layout for higher information density:

```typescript
interface DashboardLayoutConfig {
  topSection: {
    component: 'PortfolioStats';
    span: 'full-width';
  };
  bottomSection: {
    left: {
      component: 'ProfitChart';
      ratio: 2;
    };
    right: {
      component: 'TradeTerminal';
      ratio: 1;
    };
  };
  densitySettings: {
    fontSize: 'reduced';
    padding: 'compact';
    lineHeight: 'tight';
  };
}
```

**Layout Structure:**
```
┌─────────────────────────────────────┐
│           PortfolioStats            │
├─────────────────────┬───────────────┤
│                     │               │
│     ProfitChart     │ TradeTerminal │
│       (2/3)         │     (1/3)     │
│                     │               │
└─────────────────────┴───────────────┘
```

## Data Models

### Enhanced Log Data Structure

```typescript
interface EnhancedTradeLog {
  id: string;
  timestamp: string;
  category: 'System' | 'Strategy' | 'Trade';
  strategy?: string;
  action?: 'buy' | 'sell';
  ticker?: string;
  stockName?: string;
  quantity?: number;
  price?: number;
  status: 'success' | 'failed' | 'pending';
  message: string;
  reason?: string; // For trade category
}
```

### System Health Data Structure

```typescript
interface SystemHealthData {
  engineStatus: {
    overall: 'healthy' | 'warning' | 'error';
    processes: EngineProcess[];
  };
  serverMetrics: {
    cpu: {
      usage: number;
      threshold: { warning: 60, critical: 80 };
    };
    memory: {
      used: number;
      total: number;
      threshold: { warning: 60, critical: 80 };
    };
  };
  lastUpdated: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing the acceptance criteria, several properties can be consolidated:
- Properties 1.2 and 1.5 both test component rendering with different data inputs
- Properties 4.1, 4.2, 4.3, and 4.4 all relate to log categorization and formatting
- Multiple example-based tests can be grouped by component

The following properties provide comprehensive coverage while avoiding redundancy:

### Property 1: System Health Panel Resource Display
*For any* system resource data (CPU usage, memory usage), the SystemHealthPanel should render progress bars with appropriate visual indicators and color coding based on usage thresholds
**Validates: Requirements 1.2**

### Property 2: Engine Status LED Indicator Mapping
*For any* engine status value (running, stopped, error), the LED indicator should display the corresponding color (green for running, gray for stopped, red for error)
**Validates: Requirements 1.5**

### Property 3: Log Categorization and Formatting
*For any* log entry, the TradeTerminal should assign it to exactly one category (System, Strategy, Trade), apply the correct color coding for that category, and format trade logs with emphasized reason tags when present
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

## Error Handling

### System Health Monitoring Errors
- **Network Disconnection**: Display offline indicators when system metrics unavailable
- **Invalid Metrics**: Handle malformed or out-of-range resource data gracefully
- **Engine Status Errors**: Show error states clearly with appropriate visual indicators

### Strategy Management Errors
- **Parameter Validation**: Validate numeric inputs for take profit and stop loss percentages
- **Backend Communication**: Handle API failures during live parameter updates with error toasts
- **Emergency Stop Failures**: Provide fallback mechanisms if emergency stop encounters errors

### Trade Terminal Errors
- **Log Parsing Errors**: Handle malformed log entries without breaking the display
- **Category Assignment**: Default to 'System' category for logs that don't match expected patterns
- **Real-time Updates**: Gracefully handle connection interruptions to log streams

### Layout and Rendering Errors
- **Responsive Breakpoints**: Ensure layout adapts properly across different screen sizes
- **Component Loading**: Handle loading states for dashboard components
- **Data Unavailability**: Show appropriate placeholders when data is not available

## Testing Strategy

### Dual Testing Approach
The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific UI interactions (button clicks, form submissions)
- Component integration points
- Error conditions and edge cases
- Exact text content and component presence

**Property-Based Tests** focus on:
- Universal behaviors across all input variations
- Data transformation and formatting rules
- Component rendering with randomized data
- State management consistency

### Property-Based Testing Configuration
- **Framework**: fast-check for TypeScript/React components
- **Iterations**: Minimum 100 iterations per property test
- **Test Tagging**: Each property test references its design document property
- **Tag Format**: **Feature: trading-dashboard-ui-enhancement, Property {number}: {property_text}**

### Unit Testing Focus Areas
- Emergency stop dialog flow verification
- Toast notification content validation
- Component replacement verification (API status → System Health Panel)
- Layout structure validation (PortfolioStats positioning)
- Specific user interaction scenarios

### Integration Testing
- End-to-end dashboard loading and rendering
- Cross-component communication (strategy updates affecting multiple views)
- Real-time data flow from mock services to UI components
- Responsive layout behavior across viewport sizes

### Testing Tools and Libraries
- **Jest**: Primary testing framework
- **React Testing Library**: Component testing utilities
- **fast-check**: Property-based testing library
- **MSW (Mock Service Worker)**: API mocking for integration tests
- **@testing-library/user-event**: User interaction simulation