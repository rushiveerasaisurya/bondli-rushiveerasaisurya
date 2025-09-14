import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  IdCard, 
  AlertTriangle, 
  Server,
  CheckCircle,
  XCircle
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  kycPending: number;
  tradeAlerts: number;
  platformUptime: string;
}

interface KYCApplication {
  id: string;
  userId: string;
  userName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  documents: any[];
}

interface TradeAlert {
  id: string;
  type: 'large_volume' | 'price_movement' | 'suspicious_activity';
  severity: 'high' | 'medium' | 'low';
  bondId: string;
  bondName: string;
  description: string;
  timestamp: string;
  status: 'new' | 'investigating' | 'resolved';
}

export default function Admin() {
  const [selectedAlert, setSelectedAlert] = useState<TradeAlert | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 30000,
  });

  const { data: kycApplications, isLoading: kycLoading } = useQuery<KYCApplication[]>({
    queryKey: ['/api/admin/kyc-applications'],
    refetchInterval: 60000,
  });

  const { data: tradeAlerts, isLoading: alertsLoading } = useQuery<TradeAlert[]>({
    queryKey: ['/api/admin/trade-alerts'],
    refetchInterval: 30000,
  });

  const kycActionMutation = useMutation({
    mutationFn: async ({ applicationId, action }: { applicationId: string; action: 'approve' | 'reject' }) => {
      await apiRequest('POST', `/api/admin/kyc-applications/${applicationId}/${action}`, {});
    },
    onSuccess: (_, { action }) => {
      toast({
        title: `KYC ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `Application has been ${action}d successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc-applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const alertActionMutation = useMutation({
    mutationFn: async ({ alertId, action }: { alertId: string; action: 'investigate' | 'resolve' }) => {
      await apiRequest('POST', `/api/admin/trade-alerts/${alertId}/${action}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Alert updated",
        description: "Alert status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/trade-alerts'] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-destructive bg-destructive/5 text-destructive';
      case 'medium': return 'border-warning bg-warning/5 text-warning';
      case 'low': return 'border-success bg-success/5 text-success';
      default: return 'border-border bg-background';
    }
  };

  if (statsLoading || kycLoading || alertsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground">Platform monitoring and compliance oversight</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-users">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-success text-sm">+12 today</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">KYC Pending</p>
                <p className="text-2xl font-bold text-warning" data-testid="text-kyc-pending">
                  {stats?.kycPending || 0}
                </p>
                <p className="text-muted-foreground text-sm">Awaiting review</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <IdCard className="text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Trade Alerts</p>
                <p className="text-2xl font-bold text-destructive" data-testid="text-trade-alerts">
                  {stats?.tradeAlerts || 0}
                </p>
                <p className="text-muted-foreground text-sm">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Platform Uptime</p>
                <p className="text-2xl font-bold text-success" data-testid="text-platform-uptime">
                  {stats?.platformUptime || "99.9%"}
                </p>
                <p className="text-muted-foreground text-sm">30 days</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Server className="text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trade Monitoring */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Trade Surveillance</h3>
            <div className="space-y-4">
              {tradeAlerts && tradeAlerts.length > 0 ? (
                tradeAlerts.slice(0, 5).map((alert) => (
                  <Alert key={alert.id} className={getAlertSeverityColor(alert.severity)}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {alert.type === 'large_volume' && 'Large Volume Alert'}
                            {alert.type === 'price_movement' && 'Price Movement Alert'}
                            {alert.type === 'suspicious_activity' && 'Suspicious Activity'}
                          </h4>
                          <p className="text-sm mt-1">{alert.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {alert.status === 'new' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => alertActionMutation.mutate({ alertId: alert.id, action: 'investigate' })}
                              disabled={alertActionMutation.isPending}
                              data-testid={`button-investigate-${alert.id}`}
                            >
                              Investigate
                            </Button>
                          )}
                          {alert.status === 'investigating' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => alertActionMutation.mutate({ alertId: alert.id, action: 'resolve' })}
                              disabled={alertActionMutation.isPending}
                              data-testid={`button-resolve-${alert.id}`}
                            >
                              Resolve
                            </Button>
                          )}
                          {alert.status === 'resolved' && (
                            <Badge variant="secondary">Resolved</Badge>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No active alerts</p>
                  <p className="text-sm mt-1">System is operating normally</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KYC Management */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">KYC Queue</h3>
            <div className="space-y-3">
              {kycApplications && kycApplications.length > 0 ? (
                kycApplications.filter(app => app.status === 'pending').slice(0, 5).map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 border border-border rounded">
                    <div>
                      <p className="font-medium text-sm">{application.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(application.submittedAt).toRelativeTimeString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="bg-success text-white hover:bg-success/90"
                        onClick={() => kycActionMutation.mutate({ applicationId: application.id, action: 'approve' })}
                        disabled={kycActionMutation.isPending}
                        data-testid={`button-approve-${application.id}`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => kycActionMutation.mutate({ applicationId: application.id, action: 'reject' })}
                        disabled={kycActionMutation.isPending}
                        data-testid={`button-reject-${application.id}`}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <IdCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No pending KYC applications</p>
                  <p className="text-sm mt-1">All applications are up to date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Monitoring */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">System Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Server className="w-8 h-8 text-success" />
              </div>
              <p className="font-medium">API Server</p>
              <p className="text-sm text-success">Operational</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Server className="w-8 h-8 text-success" />
              </div>
              <p className="font-medium">Database</p>
              <p className="text-sm text-success">Operational</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Server className="w-8 h-8 text-success" />
              </div>
              <p className="font-medium">WebSocket</p>
              <p className="text-sm text-success">Operational</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
