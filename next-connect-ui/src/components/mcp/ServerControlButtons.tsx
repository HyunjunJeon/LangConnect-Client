'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RotateCw, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { ServerStatus, type MCPServer } from '@/types/mcp';
import { mcpApi } from '@/lib/api/mcp';
import { useToast } from '@/hooks/use-toast';

interface ServerControlButtonsProps {
  server: MCPServer;
  onServerUpdated: (server: MCPServer) => void;
  size?: 'sm' | 'default' | 'lg';
}

export function ServerControlButtons({ 
  server, 
  onServerUpdated,
  size = 'sm' 
}: ServerControlButtonsProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading('start');
    try {
      const response = await mcpApi.startServer(server.id);
      if (response.success && response.server) {
        onServerUpdated(response.server);
      }
      toast({
        title: t('mcp.server.startSuccess'),
        description: t('mcp.server.startSuccessDescription', { name: server.config.name }),
      });
    } catch (error) {
      toast({
        title: t('mcp.server.startError'),
        description: error instanceof Error ? error.message : t('mcp.server.startErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleStop = async () => {
    setLoading('stop');
    try {
      const response = await mcpApi.stopServer(server.id);
      if (response.success && response.server) {
        onServerUpdated(response.server);
      }
      toast({
        title: t('mcp.server.stopSuccess'),
        description: t('mcp.server.stopSuccessDescription', { name: server.config.name }),
      });
    } catch (error) {
      toast({
        title: t('mcp.server.stopError'),
        description: error instanceof Error ? error.message : t('mcp.server.stopErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleRestart = async () => {
    setLoading('restart');
    try {
      const response = await mcpApi.restartServer(server.id);
      if (response.success && response.server) {
        onServerUpdated(response.server);
      }
      toast({
        title: t('mcp.server.restartSuccess'),
        description: t('mcp.server.restartSuccessDescription', { name: server.config.name }),
      });
    } catch (error) {
      toast({
        title: t('mcp.server.restartError'),
        description: error instanceof Error ? error.message : t('mcp.server.restartErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const isTransitioning = 
    server.status.status === ServerStatus.STARTING ||
    server.status.status === ServerStatus.STOPPING;

  const canStart = 
    server.status.status === ServerStatus.STOPPED ||
    server.status.status === ServerStatus.ERROR;

  const canStop = 
    server.status.status === ServerStatus.RUNNING;

  const canRestart = 
    server.status.status === ServerStatus.RUNNING;

  return (
    <div className="flex items-center gap-1">
      <Button
        size={size}
        variant="ghost"
        onClick={handleStart}
        disabled={!canStart || loading !== null || isTransitioning}
        title={t('mcp.server.start')}
      >
        {loading === 'start' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <Button
        size={size}
        variant="ghost"
        onClick={handleStop}
        disabled={!canStop || loading !== null || isTransitioning}
        title={t('mcp.server.stop')}
      >
        {loading === 'stop' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Square className="h-4 w-4" />
        )}
      </Button>

      <Button
        size={size}
        variant="ghost"
        onClick={handleRestart}
        disabled={!canRestart || loading !== null || isTransitioning}
        title={t('mcp.server.restart')}
      >
        {loading === 'restart' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCw className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}