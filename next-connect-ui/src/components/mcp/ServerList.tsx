'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash, 
  Terminal,
  Settings,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { ServerStatus, type MCPServer } from '@/types/mcp';
import { ServerControlButtons } from './ServerControlButtons';
import { ServerDetailsDialog } from './ServerDetailsDialog';
import { ServerLogsDialog } from './ServerLogsDialog';
import { ElicitationDialog } from './ElicitationDialog';
import { mcpApi } from '@/lib/api/mcp';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ServerListProps {
  servers: MCPServer[];
  selectedServer: MCPServer | null;
  onServerSelect: (server: MCPServer | null) => void;
  onServerUpdated: (server: MCPServer) => void;
  onServerDeleted: (serverId: string) => void;
  getStatusIcon: (status: ServerStatus) => React.ReactNode;
  getStatusBadgeVariant: (status: ServerStatus) => any;
}

export function ServerList({
  servers,
  selectedServer,
  onServerSelect,
  onServerUpdated,
  onServerDeleted,
  getStatusIcon,
  getStatusBadgeVariant,
}: ServerListProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<MCPServer | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [elicitationDialogOpen, setElicitationDialogOpen] = useState(false);
  const [selectedServerForDialog, setSelectedServerForDialog] = useState<MCPServer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedServerId, setCopiedServerId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!serverToDelete) return;

    setDeleting(true);
    try {
      await mcpApi.deleteServer(serverToDelete.id);
      onServerDeleted(serverToDelete.id);
      toast({
        title: t('mcp.server.deleteSuccess'),
        description: t('mcp.server.deleteSuccessDescription', { name: serverToDelete.config.name }),
      });
    } catch (error) {
      toast({
        title: t('mcp.server.deleteError'),
        description: error instanceof Error ? error.message : t('mcp.server.deleteErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setServerToDelete(null);
    }
  };

  const openDetailsDialog = (server: MCPServer) => {
    setSelectedServerForDialog(server);
    setDetailsDialogOpen(true);
  };

  const openLogsDialog = (server: MCPServer) => {
    setSelectedServerForDialog(server);
    setLogsDialogOpen(true);
  };

  const openElicitationDialog = (server: MCPServer) => {
    setSelectedServerForDialog(server);
    setElicitationDialogOpen(true);
  };

  const copyServerConfig = async (server: MCPServer) => {
    const config = {
      "claude_desktop_config": {
        "mcpServers": {
          [server.config.name]: {
            "command": "docker",
            "args": [
              "exec",
              "-i",
              server.container_name || `mcp-${server.config.name}`,
              "python",
              "-m",
              "mcp_sse_server"
            ],
            "env": {
              "SUPABASE_JWT_SECRET": "<YOUR_AUTH_TOKEN>",
              "API_BASE_URL": API_BASE_URL || "http://localhost:8080"
            }
          }
        }
      }
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopiedServerId(server.id);
      toast({
        title: t('mcp.server.configCopied'),
        description: t('mcp.server.configCopiedDescription'),
      });
      setTimeout(() => setCopiedServerId(null), 2000);
    } catch (error) {
      toast({
        title: t('mcp.server.configCopyError'),
        description: t('mcp.server.configCopyErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  if (servers.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">{t('mcp.dashboard.noServers')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('mcp.dashboard.serverList')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('mcp.server.name')}</TableHead>
                <TableHead>{t('mcp.server.transport')}</TableHead>
                <TableHead>{t('mcp.server.status')}</TableHead>
                <TableHead>{t('mcp.server.port')}</TableHead>
                <TableHead>{t('mcp.server.controls')}</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map((server) => (
                <TableRow
                  key={server.id}
                  className={`cursor-pointer ${selectedServer?.id === server.id ? 'bg-gray-50' : ''}`}
                  onClick={() => onServerSelect(server)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <div>{server.config.name}</div>
                      {server.config.description && (
                        <div className="text-sm text-gray-500">{server.config.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{server.config.transport.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(server.status.status)}
                      <Badge variant={getStatusBadgeVariant(server.status.status)}>
                        {server.status.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {server.config.port || '-'}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <ServerControlButtons
                      server={server}
                      onServerUpdated={onServerUpdated}
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetailsDialog(server)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('mcp.server.viewDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openLogsDialog(server)}>
                          <Terminal className="h-4 w-4 mr-2" />
                          {t('mcp.server.viewLogs')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyServerConfig(server)}>
                          {copiedServerId === server.id ? (
                            <Check className="h-4 w-4 mr-2" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          {copiedServerId === server.id ? t('mcp.server.configCopied') : t('mcp.server.copyConfig')}
                        </DropdownMenuItem>
                        {server.config.elicitation && (
                          <DropdownMenuItem onClick={() => openElicitationDialog(server)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {t('mcp.server.elicitation')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setServerToDelete(server);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          {t('mcp.server.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('mcp.server.deleteConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('mcp.server.deleteConfirmDescription', { name: serverToDelete?.config.name || '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Server Details Dialog */}
      {selectedServerForDialog && (
        <ServerDetailsDialog
          server={selectedServerForDialog}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}

      {/* Server Logs Dialog */}
      {selectedServerForDialog && (
        <ServerLogsDialog
          server={selectedServerForDialog}
          open={logsDialogOpen}
          onOpenChange={setLogsDialogOpen}
        />
      )}

      {/* Elicitation Dialog */}
      {selectedServerForDialog && (
        <ElicitationDialog
          server={selectedServerForDialog}
          open={elicitationDialogOpen}
          onOpenChange={setElicitationDialogOpen}
        />
      )}
    </>
  );
}