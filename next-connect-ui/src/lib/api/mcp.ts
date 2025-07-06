import { getSession } from 'next-auth/react';
import type {
  MCPServer,
  CreateServerRequest,
  UpdateServerRequest,
  ServerListResponse,
  ElicitationRequest,
  ElicitationResponse,
} from '@/types/mcp';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class MCPApiClient {
  private async getHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    
    return headers;
  }

  async listServers(): Promise<ServerListResponse> {
    const response = await fetch(`${API_BASE_URL}/api/mcp/servers`, {
      headers: await this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch servers: ${response.statusText}`);
    }
    
    return response.json();
  }

  async getServer(serverId: string): Promise<MCPServer> {
    const response = await fetch(`${API_BASE_URL}/api/mcp/servers/${serverId}`, {
      headers: await this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch server: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createServer(data: CreateServerRequest): Promise<MCPServer> {
    // Map frontend config to backend format
    const backendConfig = {
      name: data.config.name,
      description: data.config.description || '',
      transport: data.config.transport,
      port: data.config.port,
      environment: data.config.env || {},
      docker_image: data.config.image || 'langconnect-mcp:latest',
      memory_limit: data.config.resources?.memory_limit || '512m',
      cpu_limit: data.config.resources?.cpu_limit ? parseFloat(data.config.resources.cpu_limit) : 1.0,
      middleware_config: data.config.middleware ? 
        { enabled_middleware: data.config.middleware } : {},
    };

    const response = await fetch(`${API_BASE_URL}/api/mcp/servers`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(backendConfig),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create server');
    }
    
    return response.json();
  }

  async updateServer(serverId: string, data: UpdateServerRequest): Promise<MCPServer> {
    const response = await fetch(`${API_BASE_URL}/api/mcp/servers/${serverId}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update server');
    }
    
    return response.json();
  }

  async deleteServer(serverId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/mcp/servers/${serverId}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete server');
    }
  }

  async startServer(serverId: string): Promise<{ success: boolean; message: string; server?: MCPServer }> {
    const response = await fetch(`${API_BASE_URL}/api/mcp/servers/${serverId}/start`, {
      method: 'POST',
      headers: await this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to start server');
    }
    
    return response.json();
  }

  async stopServer(serverId: string): Promise<{ success: boolean; message: string; server?: MCPServer }> {
    const response = await fetch(`${API_BASE_URL}/api/mcp/servers/${serverId}/stop`, {
      method: 'POST',
      headers: await this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to stop server');
    }
    
    return response.json();
  }

  async restartServer(serverId: string): Promise<{ success: boolean; message: string; server?: MCPServer }> {
    const response = await fetch(`${API_BASE_URL}/api/mcp/servers/${serverId}/restart`, {
      method: 'POST',
      headers: await this.getHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to restart server');
    }
    
    return response.json();
  }

  async elicit(serverId: string, data: ElicitationRequest): Promise<ElicitationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/mcp/servers/${serverId}/elicit`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send elicitation request');
    }
    
    return response.json();
  }

  async streamLogs(serverId: string, onMessage: (log: string) => void, onError?: (error: Error) => void): Promise<() => void> {
    try {
      const headers = await this.getHeaders();
      // Remove Content-Type for SSE
      delete (headers as any)['Content-Type'];
      
      const response = await fetch(`${API_BASE_URL}/api/mcp/servers/${serverId}/logs?follow=true`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to stream logs: ${response.statusText}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      const read = async () => {
        if (!reader) return;
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                onMessage(data);
              }
            }
          }
        } catch (error) {
          if (onError) {
            onError(error as Error);
          }
        }
      };
      
      read();
      
      // Return cleanup function
      return () => {
        reader?.cancel();
      };
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
      return () => {};
    }
  }
}

export const mcpApi = new MCPApiClient();