// MCP Server Types
export enum ServerStatus {
  STOPPED = "stopped",
  STARTING = "starting",
  RUNNING = "running",
  STOPPING = "stopping",
  ERROR = "error",
}

export enum ServerTransport {
  STDIO = "stdio",
  SSE = "sse",  // Deprecated - use STREAMABLE_HTTP instead
  STREAMABLE_HTTP = "streamable_http",
}

export interface MCPServerConfig {
  name: string;
  description?: string;
  transport: ServerTransport;
  image?: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  port?: number;
  resources?: {
    cpu_limit?: string;
    memory_limit?: string;
  };
  middleware?: string[];
  elicitation?: boolean;
  auth_required?: boolean;
  metadata?: Record<string, any>;
}

export interface MCPServerStatus {
  server_id: string;
  status: ServerStatus;
  container_id?: string | null;
  started_at?: string | null;
  stopped_at?: string | null;
  health_check_passed: boolean;
  last_health_check?: string | null;
  error_message?: string | null;
  resource_usage: Record<string, any>;
}

// Backend-compatible server config
export interface BackendServerConfig {
  name: string;
  description: string;
  transport: ServerTransport;
  port: number;
  environment: Record<string, string>;
  docker_image: string;
  memory_limit: string;
  cpu_limit: number;
  restart_policy: string;
  volumes: string[];
  labels: Record<string, string>;
  middleware_config: Record<string, any>;
  // Additional fields that might be needed for UI
  elicitation?: boolean;
  auth_required?: boolean;
}

export interface MCPServer {
  id: string;
  config: BackendServerConfig;
  status: MCPServerStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  container_name?: string;
  access_token?: string;
  api_url?: string;
  // Helper getters for compatibility
  is_running?: boolean;
  can_start?: boolean;
  can_stop?: boolean;
}

// Request/Response types
export interface CreateServerRequest {
  config: MCPServerConfig;
}

export interface UpdateServerRequest {
  config?: Partial<MCPServerConfig>;
}

export interface ServerListResponse {
  servers: MCPServer[];
  total: number;
}

export interface ServerLogEntry {
  timestamp: string;
  level: string;
  message: string;
  container_id?: string;
}

export interface ElicitationRequest {
  prompt: string;
  context?: Record<string, any>;
}

export interface ElicitationResponse {
  response: string;
  tool_calls?: any[];
  metadata?: Record<string, any>;
}