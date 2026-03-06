---
title: "Agent 服务模板抽取实用手册：从 API 到 Agent 可复用服务"
date: 2026-03-06T15:30:00+08:00
tags: ["Agent", "服务模板", "MCP", "Function Calling", "LangGraph"]
categories: ["AI开发手册"]
---

## 概述

本文档提供 Agent 服务化过程中常用的模板抽取方案，包括：
1. API → Function Schema 自动抽取
2. Agent 微服务标准模板
3. LangGraph 可复用 Agent 模板
4. MCP (Model Context Protocol) 服务模板

---

## 模板一：API 到 Function Calling Schema 抽取

### 1.1 从 OpenAPI/Swagger 自动转换

```python
"""
API Schema 抽取器：将 REST API 转换为 LLM Function Calling Schema
"""
from typing import Dict, Any, List, Optional
import json
from pydantic import BaseModel, Field

class ParameterSchema(BaseModel):
    """参数定义"""
    name: str
    type: str
    description: str
    required: bool = True
    enum: Optional[List[str]] = None
    default: Optional[Any] = None

class FunctionSchema(BaseModel):
    """OpenAI Function Calling 标准格式"""
    name: str
    description: str
    parameters: Dict[str, Any]
    
class APISchemaExtractor:
    """从 REST API 提取 Function Schema"""
    
    TYPE_MAPPING = {
        "string": "string",
        "integer": "number",
        "number": "number",
        "boolean": "boolean",
        "array": "array",
        "object": "object"
    }
    
    def extract_from_openapi(self, openapi_spec: Dict, path: str, method: str) -> FunctionSchema:
        """从 OpenAPI 规范提取 Function Schema"""
        endpoint = openapi_spec["paths"][path][method]
        
        # 构建函数名：如 GET /users/{id} → get_user_by_id
        operation_id = endpoint.get("operationId", self._generate_operation_id(path, method))
        description = endpoint.get("summary", endpoint.get("description", ""))
        
        # 提取参数
        properties = {}
        required = []
        
        # 处理路径参数和查询参数
        if "parameters" in endpoint:
            for param in endpoint["parameters"]:
                param_schema = self._convert_parameter(param)
                properties[param["name"]] = param_schema
                if param.get("required", False):
                    required.append(param["name"])
        
        # 处理请求体
        if "requestBody" in endpoint:
            body_schema = endpoint["requestBody"]["content"]["application/json"]["schema"]
            body_properties = self._convert_schema(body_schema)
            properties["body"] = {
                "type": "object",
                "description": "请求体参数",
                "properties": body_properties.get("properties", {}),
                "required": body_properties.get("required", [])
            }
            required.append("body")
        
        return FunctionSchema(
            name=operation_id,
            description=description,
            parameters={
                "type": "object",
                "properties": properties,
                "required": required
            }
        )
    
    def _convert_parameter(self, param: Dict) -> Dict:
        """转换单个参数"""
        schema = param.get("schema", {})
        result = {
            "type": self.TYPE_MAPPING.get(schema.get("type", "string"), "string"),
            "description": param.get("description", "")
        }
        if "enum" in schema:
            result["enum"] = schema["enum"]
        if "default" in schema:
            result["default"] = schema["default"]
        return result
    
    def _generate_operation_id(self, path: str, method: str) -> str:
        """生成操作 ID"""
        parts = path.strip("/").replace("{", "").replace("}", "").split("/")
        return f"{method.lower()}_{'_'.join(parts)}"

# 使用示例
"""
extractor = APISchemaExtractor()
schema = extractor.extract_from_openapi(openapi_spec, "/users/{id}", "get")
print(schema.json(indent=2))
"""
```

### 1.2 转换后标准格式示例

```json
{
  "name": "get_weather",
  "description": "获取指定城市的天气信息",
  "parameters": {
    "type": "object",
    "properties": {
      "city": {
        "type": "string",
        "description": "城市名称，如 Beijing、Shanghai"
      },
      "unit": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"],
        "default": "celsius",
        "description": "温度单位"
      }
    },
    "required": ["city"]
  }
}
```

---

## 模板二：Agent 微服务标准模板

### 2.1 项目结构模板

```
agent-service-template/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── pyproject.toml
├── README.md
├── .env.example
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 配置管理
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── core.py          # Agent 核心逻辑
│   │   ├── tools.py         # 工具定义
│   │   └── memory.py        # 记忆管理
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py        # API 路由
│   │   ├── schemas.py       # Pydantic 模型
│   │   └── dependencies.py  # 依赖注入
│   └── utils/
│       ├── __init__.py
│       └── logger.py
├── tests/
│   ├── __init__.py
│   ├── test_agent.py
│   └── test_api.py
└── k8s/
    ├── deployment.yaml
    ├── service.yaml
    └── configmap.yaml
```

### 2.2 FastAPI 服务封装模板

```python
# src/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Dict, Any, AsyncGenerator

from src.agent.core import AgentService
from src.api.schemas import AgentRequest, AgentResponse, HealthCheck
from src.config import Settings, get_settings

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """应用生命周期管理"""
    # 启动：初始化 Agent
    app.state.agent = AgentService()
    await app.state.agent.initialize()
    yield
    # 关闭：清理资源
    await app.state.agent.cleanup()

app = FastAPI(
    title="Agent Service API",
    description="可复用的 AI Agent 微服务模板",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 依赖注入：获取 Agent 实例
async def get_agent() -> AgentService:
    from fastapi import Request
    return Request.app.state.agent

@app.get("/health", response_model=HealthCheck)
async def health_check():
    """健康检查端点"""
    return HealthCheck(
        status="healthy",
        version="1.0.0",
        agent_status="ready"
    )

@app.post("/agent/run", response_model=AgentResponse)
async def run_agent(
    request: AgentRequest,
    agent: AgentService = Depends(get_agent)
):
    """
    运行 Agent 任务
    
    - **query**: 用户查询
    - **context**: 上下文信息（可选）
    - **session_id**: 会话 ID（用于保持上下文）
    """
    try:
        result = await agent.run(
            query=request.query,
            context=request.context,
            session_id=request.session_id
        )
        return AgentResponse(
            success=True,
            data=result,
            session_id=request.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agent/stream")
async def stream_agent(
    request: AgentRequest,
    agent: AgentService = Depends(get_agent)
):
    """流式响应 Agent 任务"""
    from fastapi.responses import StreamingResponse
    
    async def event_generator():
        async for chunk in agent.run_stream(
            query=request.query,
            session_id=request.session_id
        ):
            yield f"data: {chunk}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )

@app.get("/agent/tools")
async def list_tools(agent: AgentService = Depends(get_agent)):
    """列出 Agent 可用的工具"""
    return {
        "tools": [
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.args_schema.schema() if tool.args_schema else None
            }
            for tool in agent.tools
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 2.3 核心 Agent 服务类模板

```python
# src/agent/core.py
from typing import List, Dict, Any, Optional, AsyncIterator
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import BaseTool
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

from src.agent.tools import get_default_tools
from src.agent.memory import ConversationMemory

class AgentService:
    """可复用的 Agent 服务类"""
    
    def __init__(
        self,
        model_name: str = "gpt-4",
        temperature: float = 0.0,
        max_iterations: int = 10
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.max_iterations = max_iterations
        self.llm: Optional[ChatOpenAI] = None
        self.agent_executor: Optional[AgentExecutor] = None
        self.tools: List[BaseTool] = []
        self.memory_store: Dict[str, ConversationMemory] = {}
    
    async def initialize(self):
        """初始化 Agent"""
        self.llm = ChatOpenAI(
            model=self.model_name,
            temperature=self.temperature
        )
        
        # 加载工具
        self.tools = get_default_tools()
        
        # 构建 Agent
        prompt = ChatPromptTemplate.from_messages([
            ("system", "你是一个有用的 AI 助手，可以使用工具帮助用户解决问题。"),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ])
        
        agent = create_openai_tools_agent(self.llm, self.tools, prompt)
        
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            max_iterations=self.max_iterations,
            verbose=True
        )
    
    async def run(
        self,
        query: str,
        context: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """运行 Agent 任务"""
        # 获取或创建记忆
        memory = self._get_memory(session_id)
        
        # 执行 Agent
        result = await self.agent_executor.ainvoke({
            "input": query,
            "chat_history": memory.get_messages()
        })
        
        # 更新记忆
        memory.add_message(HumanMessage(content=query))
        memory.add_message(AIMessage(content=result["output"]))
        
        return {
            "answer": result["output"],
            "intermediate_steps": result.get("intermediate_steps", []),
            "session_id": session_id
        }
    
    async def run_stream(
        self,
        query: str,
        session_id: Optional[str] = None
    ) -> AsyncIterator[str]:
        """流式运行 Agent"""
        memory = self._get_memory(session_id)
        
        async for chunk in self.agent_executor.astream({
            "input": query,
            "chat_history": memory.get_messages()
        }):
            if "output" in chunk:
                yield chunk["output"]
    
    def _get_memory(self, session_id: Optional[str]) -> ConversationMemory:
        """获取会话记忆"""
        if session_id not in self.memory_store:
            self.memory_store[session_id] = ConversationMemory()
        return self.memory_store[session_id]
    
    async def cleanup(self):
        """清理资源"""
        self.memory_store.clear()
```

---

## 模板三：LangGraph Agent 可复用模板

### 3.1 基础 ReAct Agent 模板

```python
"""
LangGraph ReAct Agent 可复用模板
支持：工具调用、记忆、人机协作、错误重试
"""
from typing import TypedDict, Annotated, Sequence, List, Optional
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import BaseTool
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode
import operator

class AgentState(TypedDict):
    """Agent 状态定义"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    next_step: Optional[str]
    error_count: int
    metadata: dict

class ReActAgentTemplate:
    """
    可复用的 ReAct Agent 模板
    
    使用示例：
        agent = ReActAgentTemplate(tools=[search_tool, calculator_tool])
        graph = agent.build()
        result = graph.invoke({
            "messages": [HumanMessage(content="查询北京天气")]
        })
    """
    
    def __init__(
        self,
        tools: List[BaseTool],
        model_name: str = "gpt-4",
        temperature: float = 0,
        max_error_retries: int = 3
    ):
        self.tools = tools
        self.tool_node = ToolNode(tools)
        self.model = ChatOpenAI(
            model=model_name,
            temperature=temperature
        ).bind_tools(tools)
        self.max_error_retries = max_error_retries
    
    def _should_continue(self, state: AgentState) -> str:
        """决定下一步动作"""
        messages = state["messages"]
        last_message = messages[-1]
        
        # 检查错误重试次数
        if state.get("error_count", 0) >= self.max_error_retries:
            return "end"
        
        # 检查是否需要调用工具
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "continue"
        
        return "end"
    
    def _call_model(self, state: AgentState) -> dict:
        """调用 LLM"""
        messages = state["messages"]
        response = self.model.invoke(messages)
        return {"messages": [response]}
    
    def _handle_error(self, state: AgentState) -> dict:
        """错误处理节点"""
        error_count = state.get("error_count", 0) + 1
        return {
            "error_count": error_count,
            "messages": [AIMessage(content=f"执行出错，正在重试 ({error_count}/{self.max_error_retries})...")]
        }
    
    def build(self) -> StateGraph:
        """构建 Agent 图"""
        workflow = StateGraph(AgentState)
        
        # 定义节点
        workflow.add_node("agent", self._call_model)
        workflow.add_node("tools", self.tool_node)
        workflow.add_node("error_handler", self._handle_error)
        
        # 定义边
        workflow.set_entry_point("agent")
        
        workflow.add_conditional_edges(
            "agent",
            self._should_continue,
            {
                "continue": "tools",
                "end": END
            }
        )
        
        workflow.add_edge("tools", "agent")
        
        # 错误处理边（工具执行失败时）
        workflow.add_conditional_edges(
            "tools",
            lambda state: "error" if state.get("error") else "success",
            {
                "error": "error_handler",
                "success": "agent"
            }
        )
        
        workflow.add_edge("error_handler", "agent")
        
        # 添加记忆持久化
        checkpointer = MemorySaver()
        return workflow.compile(checkpointer=checkpointer)
```

---

## 模板四：MCP (Model Context Protocol) 服务模板

### 4.1 MCP Server 基础模板

```python
"""
MCP Server 标准模板
将 Agent 能力封装为 MCP 服务，供其他 Agent 调用
"""
from typing import Any
from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
    LoggingLevel
)
import mcp.types as types

class MCPServerTemplate:
    """
    MCP Server 模板类
    
    使用示例：
        server = MCPServerTemplate("my-service")
        server.add_tool(
            name="search",
            description="搜索信息",
            input_schema={...},
            handler=search_handler
        )
        server.run()
    """
    
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.server = Server(service_name)
        self.tools: Dict[str, Tool] = {}
        self.handlers: Dict[str, callable] = {}
        self._setup_handlers()
    
    def _setup_handlers(self):
        """设置 MCP 协议处理器"""
        
        @self.server.list_resources()
        async def handle_list_resources() -> List[Resource]:
            """列出可用资源"""
            return [
                Resource(
                    uri="template://docs",
                    name="服务文档",
                    description="API 使用文档",
                    mimeType="text/markdown"
                )
            ]
        
        @self.server.read_resource()
        async def handle_read_resource(uri: str) -> str:
            """读取资源"""
            if uri == "template://docs":
                return f"# {self.service_name} 服务文档\n\n这是一个 MCP 服务。"
            raise ValueError(f"未知资源: {uri}")
        
        @self.server.list_tools()
        async def handle_list_tools() -> List[Tool]:
            """列出可用工具"""
            return list(self.tools.values())
        
        @self.server.call_tool()
        async def handle_call_tool(
            name: str,
            arguments: Dict[str, Any] | None
        ) -> List[types.TextContent | types.ImageContent | types.EmbeddedResource]:
            """调用工具"""
            if name not in self.handlers:
                raise ValueError(f"未知工具: {name}")
            
            try:
                result = await self.handlers[name](arguments or {})
                return [types.TextContent(type="text", text=str(result))]
            except Exception as e:
                return [types.TextContent(type="text", text=f"错误: {str(e)}")]
    
    def add_tool(
        self,
        name: str,
        description: str,
        input_schema: Dict[str, Any],
        handler: callable
    ):
        """
        添加工具
        
        Args:
            name: 工具名称
            description: 工具描述（LLM 用）
            input_schema: JSON Schema 格式的参数定义
            handler: 处理函数
        """
        self.tools[name] = Tool(
            name=name,
            description=description,
            inputSchema=input_schema
        )
        self.handlers[name] = handler
    
    def run(self):
        """启动 MCP Server"""
        async def main():
            async with stdio_server() as (read_stream, write_stream):
                await self.server.run(
                    read_stream,
                    write_stream,
                    InitializationOptions(
                        server_name=self.service_name,
                        server_version="1.0.0",
                        capabilities=self.server.get_capabilities(
                            notification_options=NotificationOptions(),
                            experimental_capabilities={}
                        )
                    )
                )
        
        import asyncio
        asyncio.run(main())

# 使用示例
"""
server = MCPServerTemplate("weather-service")

async def get_weather_handler(args):
    city = args.get("city")
    return f"{city} 今天天气晴朗，25°C"

server.add_tool(
    name="get_weather",
    description="获取指定城市的天气信息",
    input_schema={
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "城市名称"}
        },
        "required": ["city"]
    },
    handler=get_weather_handler
)

if __name__ == "__main__":
    server.run()
"""
```

---

## 模板五：Docker & K8s 部署模板

### 5.1 Dockerfile 模板

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY pyproject.toml .

RUN useradd -m -u 1000 agent && chown -R agent:agent /app
USER agent

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 5.2 Kubernetes 部署模板

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-service
  template:
    metadata:
      labels:
        app: agent-service
    spec:
      containers:
      - name: agent
        image: agent-service:latest
        ports:
        - containerPort: 8000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: agent-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: agent-service
spec:
  selector:
    app: agent-service
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```

---

## 快速使用指南

### 场景 1：将现有 API 封装为 Agent 工具

```python
from api_schema_extractor import APISchemaExtractor
import yaml

# 加载 OpenAPI 规范
with open("api.yaml") as f:
    openapi_spec = yaml.safe_load(f)

# 提取 Function Schema
extractor = APISchemaExtractor()
schema = extractor.extract_from_openapi(openapi_spec, "/orders", "post")

# 使用提取的 schema 创建 Agent 工具
```

### 场景 2：部署 LangGraph Agent 为微服务

```bash
# 1. 使用模板创建项目
cp -r agent-service-template my-agent-service
cd my-agent-agent-service

# 2. 修改 src/agent/core.py 实现业务逻辑

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 添加 OPENAI_API_KEY

# 4. 本地运行
docker-compose up -d

# 5. 部署到 K8s
kubectl apply -f k8s/
```

### 场景 3：创建 MCP Server

```python
from mcp_template import MCPServerTemplate

server = MCPServerTemplate("my-tools")

# 添加工具
server.add_tool(
    name="calculate",
    description="计算表达式",
    input_schema={...},
    handler=calc_handler
)

server.run()
```

---

*手册整理时间：2026-03-06*  
*参考：LangChain、OpenAI、MCP 官方文档及生产实践*
