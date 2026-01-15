# 설계 문서

## 개요

본 설계는 기존 트레이딩 대시보드 UI를 실제 트레이딩 엔진과 연결하기 위한 포괄적인 백엔드 통합 아키텍처를 수립합니다. 솔루션은 구성 관리를 위한 Platform API와 실행을 위한 Trading Engine으로 구성된 이중 서비스 아키텍처를 구현하며, 실시간 통신을 위해 WebSocket으로 연결됩니다. 설계는 데이터 스키마 준수, 안전한 구성 관리, 긴급 리스크 제어 및 강력한 오류 처리를 보장합니다.

## 아키텍처

통합은 명확한 관심사 분리를 갖춘 마이크로서비스 아키텍처를 따릅니다:

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    HTTP/WS    ┌─────────────────┐
│   Trading UI    │◄──────────────►│  Platform API   │◄─────────────►│ Trading Engine  │
│   (React)       │                 │  (Python FastAPI)│               │   (Python)      │
└─────────────────┘                 └─────────────────┘               └─────────────────┘
         │                                   │                                 │
         │                                   │                                 │
         ▼                                   ▼                                 ▼
┌─────────────────┐                 ┌─────────────────┐               ┌─────────────────┐
│   Settings UI   │                 │   PostgreSQL    │               │  Brokerage API  │
│   (React)       │                 │   Database      │               │   (External)    │
└─────────────────┘                 └─────────────────┘               └─────────────────┘
```

### 컴포넌트 책임

**Trading UI (프론트엔드)**:
- 실시간 데이터로 대시보드 렌더링
- 사용자 상호작용 처리 (긴급 정지, 파라미터 업데이트)
- 실시간 업데이트를 위한 WebSocket 연결 유지
- 백엔드로 전송하기 전 사용자 입력 검증

**Platform API (백엔드 서비스)**:
- 구성 및 설정 저장소 관리
- UI와 엔진 간 통신 조정
- 인증 및 보안 처리
- REST 엔드포인트 및 WebSocket 게이트웨이 제공
- 엔진 라이프사이클 및 상태 모니터링 관리

**Trading Engine (실행 서비스)**:
- 트레이딩 전략 실행 및 포지션 관리
- 주문 실행을 위한 증권사 API 연결
- Platform API에 상태 및 거래 데이터 보고
- 긴급 정지 및 파라미터 업데이트 핸들러 구현
- 데이터 스키마 표준 준수 유지

## 컴포넌트 및 인터페이스

### 1. Platform API 서비스

**기술 스택**:
- Python 3.11+ with FastAPI framework
- Pydantic for data validation and serialization
- SQLAlchemy with asyncpg for PostgreSQL async operations
- Redis for session management and caching
- WebSocket support via FastAPI's built-in WebSocket capabilities
- Cryptography library for encryption/decryption

**핵심 모듈**:

```python
# Configuration Management
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio

class ConfigurationService:
    async def store_user_settings(self, user_id: str, settings: UserSettings) -> None:
        """Store user settings with encryption for sensitive data"""
        pass
    
    async def get_user_settings(self, user_id: str) -> UserSettings:
        """Retrieve user settings with decryption"""
        pass
    
    async def validate_api_credentials(self, credentials: BrokerageCredentials) -> bool:
        """Test actual API connectivity"""
        pass
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive configuration data"""
        pass
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive configuration data"""
        pass

# Engine Communication
class EngineCoordinator:
    def __init__(self):
        self.connected_engines: Dict[str, EngineConnection] = {}
    
    async def register_engine(self, engine_id: str, metadata: EngineMetadata) -> None:
        """Register a new trading engine"""
        pass
    
    async def broadcast_emergency_stop(self) -> List[EmergencyStopResult]:
        """Send emergency stop to all engines"""
        pass
    
    async def update_engine_parameters(self, engine_id: str, params: StrategyParameters) -> None:
        """Update parameters for specific engine"""
        pass
    
    async def get_engine_health(self) -> SystemHealthMetrics:
        """Aggregate health from all engines"""
        pass

# WebSocket Gateway
class WebSocketGateway:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def broadcast_to_clients(self, event: str, data: Any) -> None:
        """Broadcast message to all connected clients"""
        pass
    
    async def handle_client_connection(self, websocket: WebSocket) -> None:
        """Handle new client WebSocket connection"""
        pass
    
    async def forward_engine_updates(self, engine_id: str, update: EngineUpdate) -> None:
        """Forward engine updates to UI clients"""
        pass
```

**FastAPI REST Endpoints**:

```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer
import asyncio

app = FastAPI(title="Trading Platform API", version="1.0.0")

# Configuration endpoints
@app.post("/api/settings/user")
async def save_user_settings(settings: UserSettings, user_id: str = Depends(get_current_user)):
    """Save user settings with validation and encryption"""
    pass

@app.get("/api/settings/user")
async def get_user_settings(user_id: str = Depends(get_current_user)) -> UserSettings:
    """Get user settings with decryption"""
    pass

@app.post("/api/settings/validate")
async def validate_credentials(credentials: BrokerageCredentials) -> ValidationResult:
    """Validate API credentials by testing connectivity"""
    pass

# Engine management endpoints
@app.get("/api/engines/status")
async def get_engine_status() -> List[EngineStatus]:
    """Get status of all registered engines"""
    pass

@app.post("/api/engines/emergency-stop")
async def trigger_emergency_stop() -> EmergencyStopResponse:
    """Trigger emergency stop for all engines"""
    pass

@app.patch("/api/engines/{engine_id}/parameters")
async def update_engine_parameters(engine_id: str, params: StrategyParameters) -> UpdateResult:
    """Update parameters for specific engine"""
    pass

# Health monitoring endpoints
@app.get("/api/health/system")
async def get_system_health() -> SystemHealthMetrics:
    """Get aggregated system health metrics"""
    pass

@app.get("/api/health/engines")
async def get_engine_health() -> List[EngineHealthDetail]:
    """Get detailed health information for all engines"""
    pass

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    pass
```

### 2. Trading Engine 서비스

**기술 스택**:
- Python 3.11+ with asyncio for concurrent operations
- WebSocket client (websockets library) for Platform API communication
- Brokerage-specific API clients (KIS, Kiwoom, etc.)
- Pandas for data processing and analysis
- Asyncio-based strategy execution engine

**핵심 아키텍처**:

```python
from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import asyncio
from dataclasses import dataclass
from enum import Enum

class EngineStatus(Enum):
    STARTING = "starting"
    RUNNING = "running"
    STOPPING = "stopping"
    STOPPED = "stopped"
    ERROR = "error"

@dataclass
class TradingEngine:
    id: str
    name: str
    status: EngineStatus
    strategies: Dict[str, 'Strategy']
    
    async def start(self) -> None:
        """Start the trading engine"""
        pass
    
    async def stop(self) -> None:
        """Stop the trading engine gracefully"""
        pass
    
    async def emergency_stop(self) -> None:
        """Emergency stop with immediate position liquidation"""
        pass
    
    async def update_parameters(self, strategy_id: str, params: StrategyParameters) -> None:
        """Update strategy parameters without restart"""
        pass
    
    def get_health_metrics(self) -> SystemHealthMetrics:
        """Get current engine health metrics"""
        pass

# Strategy Execution
class StrategyExecutor:
    async def execute_strategy(self, strategy: 'Strategy', market_data: MarketData) -> TradeDecision:
        """Execute trading strategy logic"""
        pass
    
    def apply_parameter_update(self, params: StrategyParameters) -> None:
        """Apply parameter updates to running strategy"""
        pass
    
    async def get_current_positions(self) -> List[Position]:
        """Get current trading positions"""
        pass
    
    async def liquidate_all_positions(self) -> LiquidationResult:
        """Liquidate all positions immediately"""
        pass

# Brokerage Integration
class BrokerageConnector(ABC):
    @abstractmethod
    async def connect(self, credentials: BrokerageCredentials) -> None:
        """Connect to brokerage API"""
        pass
    
    @abstractmethod
    async def place_order(self, order: OrderRequest) -> OrderResult:
        """Place trading order"""
        pass
    
    @abstractmethod
    async def cancel_all_orders(self) -> None:
        """Cancel all pending orders"""
        pass
    
    @abstractmethod
    async def get_positions(self) -> List[Position]:
        """Get current positions"""
        pass
    
    @abstractmethod
    async def subscribe_to_market_data(self, symbols: List[str]) -> None:
        """Subscribe to real-time market data"""
        pass

# Specific implementations
class KiwoomConnector(BrokerageConnector):
    """Kiwoom API connector implementation"""
    pass

class KISConnector(BrokerageConnector):
    """Korea Investment & Securities API connector implementation"""
    pass
```

### 3. 데이터 스키마 준수 레이어

**스키마 검증**:

```python
from pydantic import BaseModel, validator
from typing import Any, Dict, List, Union
from datetime import datetime

# Ensure all engine outputs conform to UI expectations
class SchemaValidator:
    @staticmethod
    def validate_trade_log(log_data: Dict[str, Any]) -> CategorizedTradeLog:
        """Validate and transform trade log data"""
        pass
    
    @staticmethod
    def validate_system_health(health_data: Dict[str, Any]) -> SystemHealthMetrics:
        """Validate system health data"""
        pass
    
    @staticmethod
    def validate_strategy_status(status_data: Dict[str, Any]) -> Strategy:
        """Validate strategy status data"""
        pass
    
    @staticmethod
    def transform_error_code(code: Union[int, str]) -> str:
        """Convert numeric codes to descriptive strings"""
        error_mapping = {
            1001: "error_api_connection",
            1002: "error_insufficient_balance",
            1003: "error_invalid_symbol",
            # Add more mappings as needed
        }
        if isinstance(code, int):
            return error_mapping.get(code, f"error_unknown_{code}")
        return code if isinstance(code, str) else "error_unknown"

# Data transformation utilities
class DataTransformer:
    @staticmethod
    def categorize_trade_log(log: TradeLog) -> CategorizedTradeLog:
        """Add category to trade log based on content"""
        pass
    
    @staticmethod
    def format_trading_reason(reason: str, action: str, symbol: str) -> str:
        """Format trading decision reason"""
        return f"{action} {symbol}: {reason}"
    
    @staticmethod
    async def aggregate_engine_health(engines: List[EngineProcess]) -> SystemHealthMetrics:
        """Aggregate health metrics from multiple engines"""
        pass

# Pydantic models for data validation
class CategorizedTradeLog(BaseModel):
    id: str
    timestamp: datetime
    category: str  # 'System', 'Strategy', 'Trade'
    message: str
    reason: Optional[str] = None
    
    @validator('category')
    def validate_category(cls, v):
        allowed_categories = ['System', 'Strategy', 'Trade']
        if v not in allowed_categories:
            raise ValueError(f'Category must be one of {allowed_categories}')
        return v

class SystemHealthMetrics(BaseModel):
    cpu_usage: float
    memory_usage: float
    process_status: str
    engine_count: int
    active_strategies: int
    last_update: datetime

class Strategy(BaseModel):
    id: str
    name: str
    status: str  # 'active', 'paused', 'error'
    parameters: Dict[str, Any]
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['active', 'paused', 'error']
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of {allowed_statuses}')
        return v
```

### 4. 보안 및 구성 관리

**암호화 서비스**:

```python
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
from typing import Optional
import bcrypt

class EncryptionService:
    def __init__(self, master_key: Optional[str] = None):
        if master_key:
            self.key = master_key.encode()
        else:
            self.key = os.environ.get('ENCRYPTION_KEY', Fernet.generate_key())
        self.cipher_suite = Fernet(self.key)
    
    def encrypt_api_key(self, api_key: str) -> str:
        """Encrypt API key for secure storage"""
        encrypted_key = self.cipher_suite.encrypt(api_key.encode())
        return base64.urlsafe_b64encode(encrypted_key).decode()
    
    def decrypt_api_key(self, encrypted_key: str) -> str:
        """Decrypt API key for use"""
        encrypted_data = base64.urlsafe_b64decode(encrypted_key.encode())
        decrypted_key = self.cipher_suite.decrypt(encrypted_data)
        return decrypted_key.decode()
    
    async def rotate_encryption_keys(self) -> None:
        """Rotate encryption keys and re-encrypt stored data"""
        # Implementation for key rotation
        pass
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

# Configuration with validation
from pydantic import BaseModel, validator
from typing import Dict, Any

class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []

class ConfigurationValidator:
    @staticmethod
    async def validate_brokerage_credentials(creds: BrokerageCredentials) -> ValidationResult:
        """Validate brokerage credentials by testing connectivity"""
        result = ValidationResult(is_valid=True)
        
        # Test actual API connectivity
        try:
            # Implementation depends on brokerage type
            if creds.brokerage_type == "kiwoom":
                # Test Kiwoom API connection
                pass
            elif creds.brokerage_type == "kis":
                # Test KIS API connection
                pass
            # Add more brokerage types as needed
        except Exception as e:
            result.is_valid = False
            result.errors.append(f"API connection failed: {str(e)}")
        
        return result
    
    @staticmethod
    def validate_strategy_parameters(params: StrategyParameters) -> ValidationResult:
        """Validate strategy parameters"""
        result = ValidationResult(is_valid=True)
        
        # Validate parameter ranges and types
        if params.take_profit_percent <= 0:
            result.errors.append("Take profit percentage must be positive")
        if params.stop_loss_percent <= 0:
            result.errors.append("Stop loss percentage must be positive")
        if params.max_position_size <= 0:
            result.errors.append("Max position size must be positive")
        
        result.is_valid = len(result.errors) == 0
        return result
    
    @staticmethod
    def validate_system_limits(limits: SystemLimits) -> ValidationResult:
        """Validate system resource limits"""
        result = ValidationResult(is_valid=True)
        
        if limits.max_memory_usage > 0.9:
            result.warnings.append("Memory usage limit is very high (>90%)")
        if limits.max_cpu_usage > 0.8:
            result.warnings.append("CPU usage limit is very high (>80%)")
        
        return result

class BrokerageCredentials(BaseModel):
    brokerage_type: str
    api_key: str
    api_secret: str
    account_number: str
    
    @validator('brokerage_type')
    def validate_brokerage_type(cls, v):
        allowed_types = ['kiwoom', 'kis', 'samsung']
        if v not in allowed_types:
            raise ValueError(f'Brokerage type must be one of {allowed_types}')
        return v

class StrategyParameters(BaseModel):
    take_profit_percent: float
    stop_loss_percent: float
    max_position_size: float
    risk_per_trade: float

class SystemLimits(BaseModel):
    max_memory_usage: float
    max_cpu_usage: float
    max_concurrent_strategies: int
```

## 데이터 모델

### 향상된 구성 모델

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class BrokerageType(str, Enum):
    KIWOOM = "kiwoom"
    KIS = "kis"
    SAMSUNG = "samsung"

# User settings with encryption markers
class UserSettings(BaseModel):
    id: str
    user_id: str
    brokerage_accounts: List['BrokerageAccount']
    system_preferences: 'SystemPreferences'
    risk_limits: 'RiskLimits'
    created_at: datetime
    updated_at: datetime

class BrokerageAccount(BaseModel):
    id: str
    name: str
    type: BrokerageType
    api_key: str = Field(..., description="Encrypted in storage")
    api_secret: str = Field(..., description="Encrypted in storage")
    account_number: str
    is_active: bool = True
    last_validated: Optional[datetime] = None

class SystemPreferences(BaseModel):
    theme: str = "dark"
    notifications_enabled: bool = True
    auto_save_interval: int = 30  # seconds
    default_chart_timeframe: str = "1h"

class RiskLimits(BaseModel):
    max_daily_loss: float
    max_position_size: float
    max_concurrent_positions: int
    emergency_stop_loss: float

# Engine communication models
class UpdateType(str, Enum):
    HEALTH = "health"
    TRADE = "trade"
    STATUS = "status"
    ERROR = "error"

class EngineUpdate(BaseModel):
    engine_id: str
    type: UpdateType
    timestamp: datetime
    data: Dict[str, Any]  # Can be SystemHealthMetrics, CategorizedTradeLog, EngineStatus, or ErrorReport

class EmergencyStopRequest(BaseModel):
    request_id: str
    timestamp: datetime
    user_id: str
    reason: Optional[str] = None

class EmergencyStopResult(BaseModel):
    engine_id: str
    success: bool
    positions_liquidated: int
    orders_cancelled: int
    error: Optional[str] = None
    completed_at: datetime
```

### 실시간 통신 모델

```python
from pydantic import BaseModel
from typing import Any, Optional, Dict
from datetime import datetime
from enum import Enum

# WebSocket message types
class MessageType(str, Enum):
    HEALTH_UPDATE = "health_update"
    TRADE_LOG = "trade_log"
    ENGINE_STATUS = "engine_status"
    EMERGENCY_STOP = "emergency_stop"
    PARAMETER_UPDATE = "parameter_update"

class WebSocketMessage(BaseModel):
    type: MessageType
    payload: Dict[str, Any]
    timestamp: datetime
    engine_id: Optional[str] = None

# Live parameter update
class UpdateStatus(str, Enum):
    PENDING = "pending"
    APPLIED = "applied"
    FAILED = "failed"

class LiveParameterUpdate(BaseModel):
    request_id: str
    engine_id: str
    strategy_id: str
    parameters: Dict[str, Any] = Field(
        description="Parameters like takeProfitPercent, stopLossPercent, maxPositionSize, riskPerTrade"
    )
    applied_at: Optional[datetime] = None
    status: UpdateStatus = UpdateStatus.PENDING
    error: Optional[str] = None

# Additional models for completeness
class EngineMetadata(BaseModel):
    name: str
    version: str
    supported_brokerages: List[str]
    capabilities: List[str]

class EngineConnection(BaseModel):
    engine_id: str
    websocket_url: str
    last_heartbeat: datetime
    status: str

class TradeDecision(BaseModel):
    action: str  # 'buy', 'sell', 'hold'
    symbol: str
    quantity: float
    price: Optional[float] = None
    reason: str

class OrderRequest(BaseModel):
    symbol: str
    side: str  # 'buy' or 'sell'
    quantity: float
    order_type: str  # 'market', 'limit'
    price: Optional[float] = None

class OrderResult(BaseModel):
    order_id: str
    status: str
    filled_quantity: float
    average_price: Optional[float] = None
    error: Optional[str] = None

class Position(BaseModel):
    symbol: str
    quantity: float
    average_price: float
    current_price: float
    unrealized_pnl: float

class LiquidationResult(BaseModel):
    positions_closed: int
    total_pnl: float
    errors: List[str] = []

class MarketData(BaseModel):
    symbol: str
    price: float
    volume: float
    timestamp: datetime
    bid: Optional[float] = None
    ask: Optional[float] = None
```

## 정확성 속성

*속성(property)은 시스템의 모든 유효한 실행에서 참이어야 하는 특성 또는 동작입니다. 본질적으로 시스템이 수행해야 하는 작업에 대한 형식적 진술입니다. 속성은 사람이 읽을 수 있는 명세와 기계가 검증할 수 있는 정확성 보장 사이의 다리 역할을 합니다.*

### 속성 반영

모든 인수 기준을 분석한 후, 중복을 피하기 위해 여러 속성을 통합할 수 있습니다:
- 속성 1.1, 1.3, 5.5, 6.2는 모두 데이터 스키마 준수와 관련되어 결합 가능
- 속성 3.1, 3.2, 3.3, 3.4는 모두 긴급 정지 동작과 관련되어 결합 가능
- 속성 4.1, 4.2, 4.3은 모두 파라미터 업데이트 흐름과 관련되어 결합 가능
- 속성 7.1과 7.5는 모두 암호화와 관련되어 결합 가능
- 속성 8.1, 8.2, 8.3은 모두 오류 복구와 관련되어 결합 가능

### 속성 1: 데이터 스키마 준수
*모든* 트레이딩 엔진의 데이터 출력(거래 로그, 상태 메트릭, 전략 상태)에 대해, 데이터는 src/data/mockData.ts에 정의된 해당 TypeScript 인터페이스를 준수해야 하며, 적절한 카테고리 값과 필수 필드를 포함해야 합니다
**검증: 요구사항 1.1, 1.3, 5.5, 6.2**

### 속성 2: 상태 값 제약
*모든* 전략 상태 업데이트에 대해, 상태 필드는 허용된 값 중 정확히 하나를 포함해야 합니다: 'active', 'paused', 또는 'error'
**검증: 요구사항 1.2**

### 속성 3: 거래 로그 이유 필드 요구사항
*모든* 카테고리가 'Trade'인 거래 로그에 대해, 로그는 거래 결정을 설명하는 비어있지 않은 이유 필드를 포함해야 합니다
**검증: 요구사항 1.4**

### 속성 4: 오류 코드 문자열 형식
*모든* 트레이딩 엔진의 오류 응답에 대해, 오류 코드는 'error_[설명]' 패턴을 따르는 설명적 문자열이어야 합니다(숫자 코드가 아님)
**검증: 요구사항 1.5**

### 속성 5: 구성 지속성
*모든* Settings UI를 통해 저장된 사용자 설정에 대해, 데이터는 데이터베이스에 지속되어야 하며 후속 API 호출을 통해 검색 가능해야 합니다
**검증: 요구사항 2.1**

### 속성 6: 엔진 구성 전달
*모든* 트레이딩 엔진 시작에 대해, 엔진은 환경 변수 또는 API 호출을 통해 모든 필수 구성 데이터(API 키, 설정)를 받아야 합니다
**검증: 요구사항 2.2**

### 속성 7: 구성 변경 알림
*모든* 구성 변경에 대해, 실행 중인 모든 엔진은 합리적인 시간 내에 업데이트 알림을 받아야 합니다
**검증: 요구사항 2.3**

### 속성 8: API 키 검증
*모든* 설정 양식의 API 키 입력에 대해, 검증은 잘못된 형식의 키를 거부하고 증권사 사양에 따라 올바르게 형식화된 키를 수락해야 합니다
**검증: 요구사항 2.4**

### 속성 9: 저장소의 데이터 암호화
*모든* 민감한 구성 데이터(API 키, 비밀번호)에 대해, 데이터베이스에 저장된 버전은 암호화되어야 하며 평문으로 읽을 수 없어야 합니다
**검증: 요구사항 2.5, 7.1, 7.5**

### 속성 10: 긴급 정지 완전 흐름
*모든* 긴급 정지 활성화에 대해, 연결된 모든 엔진은 정지 신호를 받고, 대기 중인 주문을 취소하고, 포지션을 청산하고, 타임아웃 기간 내에 완료 상태를 보고해야 합니다
**검증: 요구사항 3.1, 3.2, 3.3, 3.4**

### 속성 11: 긴급 정지 타임아웃
*모든* 긴급 정지 명령에 대해, 작업은 30초 이내에 완료되거나 타임아웃 오류를 보고해야 합니다
**검증: 요구사항 3.5**

### 속성 12: 실시간 파라미터 업데이트 흐름
*모든* 파라미터 업데이트 요청에 대해, 대상 엔진은 업데이트를 받고, 재시작 없이 변경 사항을 적용하고, 기존 포지션을 보존하고, 현재 값으로 업데이트를 확인해야 합니다
**검증: 요구사항 4.1, 4.2, 4.3, 4.5**

### 속성 13: 파라미터 업데이트 오류 보고
*모든* 실패한 파라미터 업데이트에 대해, 엔진은 업데이트를 적용할 수 없는 이유를 설명하는 구체적인 오류 이유를 보고해야 합니다
**검증: 요구사항 4.4**

### 속성 14: 하트비트 타이밍
*모든* 실행 중인 트레이딩 엔진에 대해, 하트비트 메시지는 WebSocket을 통해 정기적으로 5초 간격으로 전송되어야 합니다
**검증: 요구사항 5.1**

### 속성 15: 상태 보고 완전성
*모든* 시스템 상태 보고에 대해, 데이터는 CPU 사용량, 메모리 사용량 및 프로세스 상태 정보를 포함해야 합니다
**검증: 요구사항 5.2**

### 속성 16: 상태 변경 브로드캐스팅
*모든* 엔진 상태 변경에 대해, 업데이트는 연결된 클라이언트에 즉시 브로드캐스트되어야 합니다
**검증: 요구사항 5.3**

### 속성 17: 연결 손실 감지
*모든* UI와 백엔드 간 연결 손실에 대해, SystemHealthPanel은 15초 이내에 오프라인 표시기를 표시해야 합니다
**검증: 요구사항 5.4**

### 속성 18: WebSocket 연결 수립
*모든* 트레이딩 엔진 시작에 대해, 실시간 통신을 위해 Platform API에 대한 WebSocket 연결이 성공적으로 수립되어야 합니다
**검증: 요구사항 6.1**

### 속성 19: 오류 보고 구조
*모든* 트레이딩 엔진의 오류 보고에 대해, 보고서는 카테고리 및 이유 필드를 포함한 구조화된 정보를 포함해야 합니다
**검증: 요구사항 6.3**

### 속성 20: 메시지 확인
*모든* 통신 프로토콜을 통해 전송된 메시지에 대해, 전달을 확인하기 위한 확인 응답을 받아야 합니다
**검증: 요구사항 6.4**

### 속성 21: 연결 상태 관리
*모든* 엔진 연결 실패에 대해, Platform API는 실패를 감지하고 재연결 시도를 적절하게 처리해야 합니다
**검증: 요구사항 6.5**

### 속성 22: 연결성을 통한 구성 검증
*모든* 구성 검증 요청에 대해, 시스템은 구성이 유효함을 확인하기 전에 실제 API 연결성을 테스트해야 합니다
**검증: 요구사항 7.2**

### 속성 23: 인증된 구성 액세스
*모든* 구성 데이터에 대한 엔진 요청에 대해, 데이터를 제공하기 전에 보안 토큰을 사용하여 요청을 인증해야 합니다
**검증: 요구사항 7.3**

### 속성 24: 보안 감사 로깅
*모든* 구성 데이터에 대한 액세스 시도에 대해, 보안 감사를 위한 충분한 세부 정보와 함께 시도가 기록되어야 합니다
**검증: 요구사항 7.4**

### 속성 25: 우아한 성능 저하를 통한 오류 복구
*모든* 시스템 오류 또는 리소스 고갈에 대해, 트레이딩 엔진은 적절한 백오프로 복구를 시도하고, 상세한 로그를 유지하고, 완전한 종료보다는 가능한 경우 성능이 저하된 기능으로 계속 작동해야 합니다
**검증: 요구사항 8.1, 8.2, 8.3, 8.4, 8.5**

<function_calls>
<invoke name="prework">
<parameter name="featureName">trading-platform-backend-integration

## 오류 처리

### Platform API 오류 처리

**구성 오류**:
- **잘못된 API 자격 증명**: 특정 검증 실패와 함께 구조화된 오류 반환
- **데이터베이스 연결 실패**: 재시도 로직이 있는 연결 풀링 구현
- **암호화/복호화 오류**: 보안 이벤트 기록 및 클라이언트에 일반 오류 메시지 반환
- **WebSocket 연결 오류**: 연결 상태 유지 및 자동 재연결 구현

**엔진 통신 오류**:
- **엔진 타임아웃**: 응답하지 않는 엔진에 대한 회로 차단기 패턴 구현
- **메시지 전달 실패**: 재시도 및 데드 레터 큐가 있는 메시지 큐잉 사용
- **스키마 검증 오류**: 잘못된 데이터 변환 및 기록, 표준화된 오류 형식 반환
- **긴급 정지 실패**: 수동 개입으로 에스컬레이션 및 운영자 경고

### Trading Engine 오류 처리

**증권사 API 오류**:
- **연결 실패**: 최대 재시도 제한이 있는 지수 백오프
- **주문 거부**: 거부 이유 분류 및 적절한 응답 구현
- **속도 제한**: 요청 스로틀링 및 큐 관리 구현
- **인증 오류**: 토큰 자동 갱신 및 지속적인 실패 시 경고

**전략 실행 오류**:
- **파라미터 검증**: 적용 전 파라미터 검증 및 잘못된 값 거부
- **포지션 관리**: 포지션 제한 및 리스크 체크 구현
- **시장 데이터 오류**: 오래된 데이터 처리 및 데이터 품질 체크 구현
- **리소스 고갈**: 트레이딩 활동 감소를 통한 우아한 성능 저하

### 오류 복구 전략

**자동 복구**:
```python
from dataclasses import dataclass
from enum import Enum
from typing import Optional

class BackoffStrategy(str, Enum):
    EXPONENTIAL = "exponential"
    LINEAR = "linear"
    FIXED = "fixed"

@dataclass
class ErrorRecoveryStrategy:
    max_retries: int
    backoff_strategy: BackoffStrategy
    base_delay: float  # seconds
    max_delay: float   # seconds
    circuit_breaker_threshold: int

# Example configuration
api_connection_recovery = ErrorRecoveryStrategy(
    max_retries=5,
    backoff_strategy=BackoffStrategy.EXPONENTIAL,
    base_delay=1.0,
    max_delay=30.0,
    circuit_breaker_threshold=10
)

class CircuitBreaker:
    def __init__(self, strategy: ErrorRecoveryStrategy):
        self.strategy = strategy
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.state = "closed"  # closed, open, half-open
    
    async def call(self, func, *args, **kwargs):
        """Execute function with circuit breaker protection"""
        if self.state == "open":
            if self._should_attempt_reset():
                self.state = "half-open"
            else:
                raise Exception("Circuit breaker is open")
        
        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e
    
    def _should_attempt_reset(self) -> bool:
        """Check if enough time has passed to attempt reset"""
        import time
        if self.last_failure_time is None:
            return True
        return time.time() - self.last_failure_time > self.strategy.max_delay
    
    def _on_success(self):
        """Reset circuit breaker on successful call"""
        self.failure_count = 0
        self.state = "closed"
    
    def _on_failure(self):
        """Handle failure and potentially open circuit"""
        import time
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.strategy.circuit_breaker_threshold:
            self.state = "open"
```

**수동 개입 트리거**:
- 타임아웃 후 긴급 정지 실패
- 지속적인 인증 실패
- 중요한 시스템 리소스 고갈
- 데이터 손상 또는 스키마 위반

## 테스트 전략

### 이중 테스트 접근법

테스트 전략은 포괄적인 커버리지를 보장하기 위해 단위 테스트와 속성 기반 테스트를 모두 사용합니다:

**단위 테스트**는 다음에 중점을 둡니다:
- 특정 API 엔드포인트 동작 및 오류 응답
- WebSocket 연결 수립 및 메시지 처리
- 데이터베이스 작업 및 암호화/복호화 함수
- 긴급 정지 대화 상자 흐름 및 사용자 상호작용
- 알려진 올바른/잘못된 입력으로 구성 검증

**속성 기반 테스트**는 다음에 중점을 둡니다:
- 모든 엔진 출력에 대한 보편적 데이터 스키마 준수
- 메시지 전달 및 확인 패턴
- 다양한 실패 조건에서의 오류 복구 동작
- 암호화 및 인증과 같은 보안 속성
- 하트비트 및 긴급 정지에 대한 타이밍 제약

### 속성 기반 테스트 구성

- **프레임워크**: Python 백엔드 서비스용 Hypothesis
- **반복 횟수**: 속성 테스트당 최소 100회 반복
- **테스트 태깅**: 각 속성 테스트는 설계 문서 속성을 참조
- **태그 형식**: **Feature: trading-platform-backend-integration, Property {번호}: {속성_텍스트}**
- 각 정확성 속성은 단일 속성 기반 테스트로 구현되어야 함
- 테스트는 현실적인 트레이딩 데이터 및 구성 시나리오를 생성해야 함

### 통합 테스트

**엔드투엔드 시나리오**:
- 설정 구성에서 실시간 트레이딩까지의 완전한 사용자 워크플로우
- UI 클릭에서 엔진 포지션 청산까지의 긴급 정지 전파
- UI에서 엔진으로 확인과 함께 흐르는 파라미터 업데이트
- 엔진에서 UI 대시보드 업데이트로의 실시간 데이터 흐름

**성능 테스트**:
- 고빈도 트레이딩 부하에서의 WebSocket 메시지 처리량
- 동시 구성 업데이트가 있는 데이터베이스 성능
- 확장된 트레이딩 세션 동안의 메모리 사용 패턴
- 연결 불안정 상태에서의 네트워크 복원력

### 보안 테스트

**침투 테스트**:
- 잘못된 인증으로 API 엔드포인트 보안
- 구성 엔드포인트에 대한 SQL 인젝션 시도
- WebSocket 메시지 변조 및 재생 공격
- 암호화 키 추출 시도

**규정 준수 테스트**:
- 데이터 암호화 표준 검증
- 감사 로그 완전성 및 무결성
- 액세스 제어 시행
- 안전한 키 순환 절차

### 테스트 도구 및 라이브러리

- **pytest**: 단위 및 통합 테스트를 위한 주요 테스트 프레임워크
- **Hypothesis**: 보편적 속성을 위한 속성 기반 테스트 라이브러리
- **httpx**: FastAPI 엔드포인트를 위한 비동기 HTTP 클라이언트 테스트
- **websockets**: WebSocket 연결 테스트
- **Docker Compose**: PostgreSQL 및 Redis가 있는 격리된 테스트 환경
- **locust**: 성능 검증을 위한 부하 테스트

### 모의 서비스 및 테스트 데이터

**증권사 API 모의**:
- 다양한 주문 실행 시나리오 시뮬레이션
- 현실적인 시장 데이터 스트림 생성
- 속도 제한 및 오류 조건 구현
- 여러 증권사 API 형식 지원

**테스트 데이터 생성**:
- 다양한 시장 조건을 가진 현실적인 트레이딩 시나리오
- 유효하고 잘못된 형식의 구성 데이터
- 오류 조건 및 엣지 케이스
- 성능 스트레스 테스트 시나리오

테스트 전략은 개별 컴포넌트가 올바르게 작동하고 전체 시스템이 모든 작동 조건에서 정확성 속성을 유지하도록 보장하여, 트레이딩 플랫폼 통합의 프로덕션 배포에 대한 신뢰를 제공합니다.