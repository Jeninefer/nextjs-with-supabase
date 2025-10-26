"""
ABACO Financial Intelligence - Multi-Agent Analysis System

Core agents for financial data extraction, quantitative analysis, and 
supervision. Implements hierarchical agent orchestration using LangGraph 
patterns.
"""

import json
import logging
import time
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timezone
from dataclasses import dataclass, asdict
import uuid
from enum import Enum

import pandas as pd
import numpy as np

try:
    from langchain_core.messages import (
        BaseMessage, HumanMessage, AIMessage, SystemMessage
    )
    LANGCHAIN_AVAILABLE = True
except ImportError:
    BaseMessage = HumanMessage = AIMessage = SystemMessage = None
    LANGCHAIN_AVAILABLE = False

try:
    from vertexai.preview.generative_models import GenerativeModel
    VERTEX_AI_AVAILABLE = True
except ImportError:
    GenerativeModel = None
    VERTEX_AI_AVAILABLE = False


class AgentRole(Enum):
    """Enumeration of agent roles in the system"""
    SUPERVISOR = "supervisor"
    DATA_EXTRACTION = "data_extraction"
    QUANTITATIVE_ANALYSIS = "quantitative_analysis"


class AgentStatus(Enum):
    """Agent execution status"""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class AgentContext:
    """Context passed between agents during execution"""
    trace_id: str
    session_id: str
    timestamp: str
    agent_role: AgentRole
    input_data: Dict[str, Any]
    previous_results: Dict[str, Any]
    metadata: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        """Convert context to dictionary"""
        return asdict(self)


@dataclass
class AgentResult:
    """Result from agent execution"""
    agent_role: AgentRole
    status: AgentStatus
    output: Dict[str, Any]
    duration_seconds: float
    trace_id: str
    errors: List[str]
    metadata: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to dictionary"""
        return {
            "agent_role": self.agent_role.value,
            "status": self.status.value,
            "output": self.output,
            "duration_seconds": self.duration_seconds,
            "trace_id": self.trace_id,
            "errors": self.errors,
            "metadata": self.metadata
        }


class BaseFinancialAgent:
    """Base class for all financial analysis agents"""

    def __init__(self, role: AgentRole, logger: Optional[logging.Logger] = None):
        self.role = role
        self.logger = logger or logging.getLogger(f"ABACO.{role.value}")
        self.trace_id = str(uuid.uuid4())[:8]
        self.execution_count = 0

    def log_operation(self, status: str, message: str, **kwargs):
        """Log operation with structured format"""
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agent": self.role.value,
            "trace_id": self.trace_id,
            "status": status,
            "message": message,
            **kwargs
        }
        self.logger.info(json.dumps(log_entry))

    async def execute(self, context: AgentContext) -> AgentResult:
        """Execute agent operation - override in subclasses"""
        raise NotImplementedError

    def validate_input(self, context: AgentContext) -> Tuple[bool, List[str]]:
        """Validate input data - override in subclasses"""
        return True, []


class SupervisorAgent(BaseFinancialAgent):
    """
    Orchestrates workflow, routes queries, delegates tasks to specialized 
    agents. Maintains conversation history and aggregates results from 
    other agents.
    """

    def __init__(self, logger: Optional[logging.Logger] = None):
        super().__init__(AgentRole.SUPERVISOR, logger)
        self.agent_registry: Dict[AgentRole, BaseFinancialAgent] = {}
        self.conversation_history: List[Dict[str, str]] = []
        self.delegation_log: List[Dict[str, Any]] = []

    def register_agent(self, agent: BaseFinancialAgent) -> None:
        """Register a specialized agent"""
        self.agent_registry[agent.role] = agent
        self.log_operation("registered", f"Agent {agent.role.value} registered")

    async def execute(self, context: AgentContext) -> AgentResult:
        """Route request and coordinate agent execution"""
        start_time = time.time()
        errors = []
        output = {}

        try:
            self.log_operation(
                "start", "Supervisor execution started",
                input_type=type(context.input_data.get("query", "")).__name__
            )

            query = context.input_data.get("query", "")
            required_agents = self._route_query(query)

            self.conversation_history.append({
                "role": "user",
                "content": query,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })

            delegated_results = {}
            for agent_role in required_agents:
                if agent_role in self.agent_registry:
                    agent = self.agent_registry[agent_role]

                    delegation_context = AgentContext(
                        trace_id=context.trace_id,
                        session_id=context.session_id,
                        timestamp=datetime.now(timezone.utc).isoformat(),
                        agent_role=agent_role,
                        input_data=context.input_data,
                        previous_results=delegated_results,
                        metadata=context.metadata
                    )

                    result = await agent.execute(delegation_context)
                    delegated_results[agent_role.value] = result.to_dict()

                    self.delegation_log.append({
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "delegated_to": agent_role.value,
                        "status": result.status.value,
                        "duration": result.duration_seconds
                    })

            output = {
                "delegated_results": delegated_results,
                "delegation_log": self.delegation_log,
                "conversation_turn": len(self.conversation_history)
            }

            self.log_operation(
                "complete", "Supervisor coordination completed",
                delegated_agents=len(required_agents),
                results=len(delegated_results)
            )

        except Exception as e:
            errors.append(str(e))
            self.log_operation(
                "error", f"Supervisor execution failed: {str(e)}"
            )

        duration = time.time() - start_time
        self.execution_count += 1

        return AgentResult(
            agent_role=AgentRole.SUPERVISOR,
            status=AgentStatus.COMPLETED if not errors else AgentStatus.FAILED,
            output=output,
            duration_seconds=duration,
            trace_id=self.trace_id,
            errors=errors,
            metadata={"execution_count": self.execution_count}
        )

    def _route_query(self, query: str) -> List[AgentRole]:
        """Route query to appropriate agents based on content"""
        route_keywords = {
            AgentRole.DATA_EXTRACTION: [
                "extract", "fetch", "retrieve", "load", "import"
            ],
            AgentRole.QUANTITATIVE_ANALYSIS: [
                "analyze", "calculate", "forecast", "trend", "metric", "kpi"
            ],
        }

        identified_roles = set()
        query_lower = query.lower()

        for role, keywords in route_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                identified_roles.add(role)

        return (list(identified_roles) if identified_roles 
                else [AgentRole.QUANTITATIVE_ANALYSIS])

    def get_conversation_history(self) -> List[Dict[str, str]]:
        """Retrieve conversation history"""
        return self.conversation_history.copy()

    def clear_conversation_history(self) -> None:
        """Clear conversation history"""
        self.conversation_history.clear()
        self.log_operation("cleared", "Conversation history cleared")


class DataExtractionAgent(BaseFinancialAgent):
    """
    Extracts and normalizes financial data from various sources.
    Handles data validation, type conversion, and preprocessing.
    """

    def __init__(self, logger: Optional[logging.Logger] = None):
        super().__init__(AgentRole.DATA_EXTRACTION, logger)
        self.extraction_cache: Dict[str, pd.DataFrame] = {}

    def validate_input(self, context: AgentContext) -> Tuple[bool, List[str]]:
        """Validate extraction input"""
        errors = []

        input_data = context.input_data
        if ("data_source" not in input_data and 
            "dataframe" not in input_data):
            errors.append("Missing data_source or dataframe in input")

        return len(errors) == 0, errors

    async def execute(self, context: AgentContext) -> AgentResult:
        """Extract and normalize financial data"""
        start_time = time.time()
        errors = []
        output = {}

        try:
            valid, validation_errors = self.validate_input(context)
            if not valid:
                errors.extend(validation_errors)
                raise ValueError(
                    f"Validation failed: {', '.join(validation_errors)}"
                )

            self.log_operation("start", "Data extraction started")

            dataframe = context.input_data.get("dataframe")
            if dataframe is None and "data_source" in context.input_data:
                dataframe = self._load_source(
                    context.input_data["data_source"]
                )

            if dataframe is not None:
                normalized_df = self._normalize_dataframe(dataframe)
                extraction_stats = {
                    "original_shape": dataframe.shape,
                    "normalized_shape": normalized_df.shape,
                    "columns_normalized": list(normalized_df.columns),
                    "missing_values": normalized_df.isnull().sum().to_dict(),
                    "data_types": normalized_df.dtypes.astype(str).to_dict()
                }

                output = {
                    "dataframe": normalized_df,
                    "extraction_stats": extraction_stats,
                    "source": context.input_data.get("data_source", "direct")
                }

                self.log_operation(
                    "complete", "Data extraction successful",
                    rows=normalized_df.shape[0],
                    columns=normalized_df.shape[1]
                )
            else:
                errors.append("Failed to load data")

        except Exception as e:
            errors.append(str(e))
            self.log_operation("error", f"Data extraction failed: {str(e)}")

        duration = time.time() - start_time
        self.execution_count += 1

        return AgentResult(
            agent_role=AgentRole.DATA_EXTRACTION,
            status=AgentStatus.COMPLETED if not errors else AgentStatus.FAILED,
            output=output,
            duration_seconds=duration,
            trace_id=self.trace_id,
            errors=errors,
            metadata={"execution_count": self.execution_count}
        )

    def _normalize_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize dataframe columns and types"""
        df = df.copy()

        df.columns = (
            df.columns.str.lower()
            .str.strip()
            .str.replace(r"\s+", "_", regex=True)
            .str.replace(r"[^a-z0-9_]", "", regex=True)
        )

        for col in df.columns:
            if df[col].dtype == 'object':
                try:
                    numeric = pd.to_numeric(
                        df[col].astype(str).str.replace(
                            r"[^\d.-]", "", regex=True
                        ),
                        errors='coerce'
                    )
                    if numeric.notna().sum() / len(df) > 0.5:
                        df[col] = numeric
                except (ValueError, TypeError):
                    pass

        return df

    def _load_source(self, source_path: str) -> Optional[pd.DataFrame]:
        """Load data from various source formats"""
        try:
            if source_path.endswith('.csv'):
                return pd.read_csv(source_path)
            elif source_path.endswith('.xlsx'):
                return pd.read_excel(source_path)
            elif source_path in self.extraction_cache:
                return self.extraction_cache[source_path]
        except (FileNotFoundError, pd.errors.EmptyDataError, 
                pd.errors.ParserError) as e:
            self.log_operation("error", f"Failed to load source: {str(e)}")

        return None


class QuantitativeAnalysisAgent(BaseFinancialAgent):
    """
    Performs quantitative analysis on financial data.
    Computes metrics, trends, forecasts, and anomaly detection.
    """

    def __init__(self, logger: Optional[logging.Logger] = None):
        super().__init__(AgentRole.QUANTITATIVE_ANALYSIS, logger)
        self.analysis_cache: Dict[str, Any] = {}

    def validate_input(self, context: AgentContext) -> Tuple[bool, List[str]]:
        """Validate analysis input"""
        errors = []

        input_data = context.input_data
        previous_results = context.previous_results

        if ("dataframe" not in input_data and 
            "previous_results" not in previous_results):
            errors.append("Missing dataframe or previous extraction results")

        if "analysis_type" not in input_data:
            errors.append("Missing analysis_type specification")

        return len(errors) == 0, errors

    async def execute(self, context: AgentContext) -> AgentResult:
        """Execute quantitative analysis"""
        start_time = time.time()
        errors = []
        output = {}

        try:
            valid, validation_errors = self.validate_input(context)
            if not valid:
                errors.extend(validation_errors)
                raise ValueError(
                    f"Validation failed: {', '.join(validation_errors)}"
                )

            self.log_operation(
                "start", "Quantitative analysis started",
                analysis_type=context.input_data.get("analysis_type")
            )

            dataframe = context.input_data.get("dataframe")
            analysis_type = context.input_data.get("analysis_type", 
                                                   "comprehensive")

            if (dataframe is None and 
                "previous_results" in context.previous_results):
                extraction_result = context.previous_results.get(
                    "data_extraction", {}
                )
                if "output" in extraction_result:
                    dataframe = extraction_result["output"].get("dataframe")

            if dataframe is not None and len(dataframe) > 0:
                analyses = self._perform_analyses(dataframe, analysis_type)

                output = {
                    "analyses": analyses,
                    "analysis_type": analysis_type,
                    "data_shape": dataframe.shape,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }

                self.log_operation(
                    "complete", "Quantitative analysis completed",
                    analyses_performed=list(analyses.keys())
                )
            else:
                errors.append("Invalid or empty dataframe")

        except Exception as e:
            errors.append(str(e))
            self.log_operation("error", f"Analysis failed: {str(e)}")

        duration = time.time() - start_time
        self.execution_count += 1

        return AgentResult(
            agent_role=AgentRole.QUANTITATIVE_ANALYSIS,
            status=AgentStatus.COMPLETED if not errors else AgentStatus.FAILED,
            output=output,
            duration_seconds=duration,
            trace_id=self.trace_id,
            errors=errors,
            metadata={"execution_count": self.execution_count}
        )

    def _perform_analyses(self, df: pd.DataFrame, 
                         analysis_type: str) -> Dict[str, Any]:
        """Perform requested analyses"""
        analyses = {}

        if analysis_type in ["comprehensive", "metrics"]:
            analyses["metrics"] = self._calculate_metrics(df)

        if analysis_type in ["comprehensive", "trends"]:
            analyses["trends"] = self._calculate_trends(df)

        if analysis_type in ["comprehensive", "anomalies"]:
            analyses["anomalies"] = self._detect_anomalies(df)

        return analyses

    def _calculate_metrics(self, df: pd.DataFrame) -> Dict[str, float]:
        """Calculate fundamental financial metrics"""
        metrics = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns

        for col in numeric_cols[:5]:
            metrics[f"{col}_mean"] = float(df[col].mean())
            metrics[f"{col}_median"] = float(df[col].median())
            metrics[f"{col}_std"] = float(df[col].std())
            metrics[f"{col}_min"] = float(df[col].min())
            metrics[f"{col}_max"] = float(df[col].max())

        return metrics

    def _calculate_trends(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate trend analysis"""
        trends = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns

        for col in numeric_cols[:3]:
            if len(df[col].dropna()) > 1:
                values = df[col].dropna().values
                trend_direction = ("increasing" if values[-1] > values[0] 
                                 else "decreasing")
                trend_magnitude = (abs(values[-1] - values[0]) / 
                                 (values[0] + 1e-10))

                trends[col] = {
                    "direction": trend_direction,
                    "magnitude": float(trend_magnitude),
                    "start_value": float(values[0]),
                    "end_value": float(values[-1])
                }

        return trends

    def _detect_anomalies(self, df: pd.DataFrame) -> Dict[str, List[int]]:
        """Detect anomalies using statistical methods"""
        anomalies = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns

        for col in numeric_cols[:3]:
            values = df[col].dropna()
            if len(values) > 2:
                mean = values.mean()
                std = values.std()

                threshold = mean + (3 * std)
                anomaly_indices = df[df[col] > threshold].index.tolist()

                if anomaly_indices:
                    anomalies[col] = anomaly_indices[:10]

        return anomalies


class AgentOrchestrator:
    """
    Orchestrates multi-agent system execution.
    Manages agent lifecycle, routing, and result aggregation.
    """

    def __init__(self, logger: Optional[logging.Logger] = None):
        self.logger = logger or logging.getLogger("ABACO.Orchestrator")
        self.supervisor = SupervisorAgent(logger)
        self.execution_history: List[AgentResult] = []

    def setup_core_agents(self) -> None:
        """Setup core agent chain"""
        data_agent = DataExtractionAgent(self.logger)
        analysis_agent = QuantitativeAnalysisAgent(self.logger)

        self.supervisor.register_agent(data_agent)
        self.supervisor.register_agent(analysis_agent)

    async def execute_query(self, query: str, 
                           input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a query through the agent system"""
        context = AgentContext(
            trace_id=str(uuid.uuid4())[:8],
            session_id=str(uuid.uuid4())[:8],
            timestamp=datetime.now(timezone.utc).isoformat(),
            agent_role=AgentRole.SUPERVISOR,
            input_data={"query": query, **input_data},
            previous_results={},
            metadata={"system": "abaco_financial_intelligence"}
        )

        result = await self.supervisor.execute(context)
        self.execution_history.append(result)

        return result.to_dict()

    def get_execution_summary(self) -> Dict[str, Any]:
        """Get summary of all executions"""
        completed_count = sum(
            1 for r in self.execution_history 
            if r.status == AgentStatus.COMPLETED
        )
        failed_count = sum(
            1 for r in self.execution_history 
            if r.status == AgentStatus.FAILED
        )
        total_duration = sum(r.duration_seconds for r in self.execution_history)

        return {
            "total_executions": len(self.execution_history),
            "successful": completed_count,
            "failed": failed_count,
            "total_duration": total_duration,
            "execution_history": [r.to_dict() for r in 
                                self.execution_history[-10:]]
        }