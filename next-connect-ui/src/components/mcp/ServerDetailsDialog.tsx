'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/hooks/use-translation';
import { type MCPServer } from '@/types/mcp';
import { 
  Server, 
  Clock, 
  Activity, 
  Settings, 
  Key,
  Network,
  Cpu,
  MemoryStick,
  HardDrive
} from 'lucide-react';

interface ServerDetailsDialogProps {
  server: MCPServer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServerDetailsDialog({
  server,
  open,
  onOpenChange,
}: ServerDetailsDialogProps) {
  const { t } = useTranslation();

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{server.config.name}</DialogTitle>
          <DialogDescription>
            {server.config.description || t('mcp.server.noDescription')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('mcp.server.overview')}</TabsTrigger>
            <TabsTrigger value="configuration">{t('mcp.server.configuration')}</TabsTrigger>
            <TabsTrigger value="status">{t('mcp.server.status')}</TabsTrigger>
            <TabsTrigger value="metrics">{t('mcp.server.metrics')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    {t('mcp.server.basicInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.id')}:</span>
                    <span className="font-mono">{server.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.transport')}:</span>
                    <Badge variant="outline">{server.config.transport.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.port')}:</span>
                    <span>{server.config.port || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.dockerImage')}:</span>
                    <span className="font-mono">{server.config.docker_image || '-'}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('mcp.server.timestamps')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.createdAt')}:</span>
                    <span>{formatDate(server.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.updatedAt')}:</span>
                    <span>{formatDate(server.updated_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.startedAt')}:</span>
                    <span>{server.status.started_at ? formatDate(server.status.started_at) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.createdBy')}:</span>
                    <span className="font-mono text-xs">{server.created_by}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {server.container_name && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    {t('mcp.server.containerInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.containerName')}:</span>
                    <span className="font-mono">{server.container_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.containerId')}:</span>
                    <span className="font-mono text-xs">{server.status.container_id || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.apiUrl')}:</span>
                    <span className="font-mono text-xs">{server.api_url || '-'}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="configuration" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t('mcp.server.command')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {/* Note: command and args not available in backend config */}
                  {t('mcp.server.notAvailable')}
                </pre>
              </CardContent>
            </Card>

            {server.config.environment && Object.keys(server.config.environment).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    {t('mcp.server.environmentVariables')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    {Object.entries(server.config.environment).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-mono text-gray-600">{key}:</span>
                        <span className="font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  {t('mcp.server.resourceLimits')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('mcp.server.cpuLimit')}:</span>
                  <span>{server.config.cpu_limit || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('mcp.server.memoryLimit')}:</span>
                  <span>{server.config.memory_limit || '-'}</span>
                </div>
              </CardContent>
            </Card>

            {server.config.middleware_config && server.config.middleware_config.enabled_middleware && server.config.middleware_config.enabled_middleware.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {t('mcp.server.middleware')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {server.config.middleware_config.enabled_middleware.map((mw: string, index: number) => (
                      <Badge key={index} variant="secondary">{mw}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="status" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  {t('mcp.server.currentStatus')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('mcp.server.state')}:</span>
                  <Badge>{server.status.status}</Badge>
                </div>
                {server.status.error_message && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.message')}:</span>
                    <span>{server.status.error_message}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health monitoring not implemented yet
            {server.status.health && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {t('mcp.server.health')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.healthStatus')}:</span>
                    <Badge 
                      variant={server.status.health.status === 'healthy' ? 'default' : 'destructive'}
                    >
                      {server.status.health.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('mcp.server.lastCheck')}:</span>
                    <span>{formatDate(server.status.health.last_check)}</span>
                  </div>
                  {server.status.health.details && (
                    <pre className="bg-gray-100 p-2 rounded text-xs mt-2">
                      {JSON.stringify(server.status.health.details, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )}
            */}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4 mt-4">
            {/* Metrics not implemented yet
            {server.status.metrics ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      {t('mcp.server.cpuUsage')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {server.status.metrics.cpu_usage?.toFixed(2) || 0}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MemoryStick className="h-4 w-4" />
                      {t('mcp.server.memoryUsage')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatBytes(server.status.metrics.memory_usage)}
                    </div>
                  </CardContent>
                </Card>

                {server.status.metrics.network_io && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        {t('mcp.server.networkIO')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('mcp.server.bytesReceived')}:</span>
                        <span>{formatBytes(server.status.metrics.network_io.rx_bytes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('mcp.server.bytesSent')}:</span>
                        <span>{formatBytes(server.status.metrics.network_io.tx_bytes)}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : ( */}
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">{t('mcp.server.noMetricsAvailable')}</p>
                </CardContent>
              </Card>
            {/* )} */}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}