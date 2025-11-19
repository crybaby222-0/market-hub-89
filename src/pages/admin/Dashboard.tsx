import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Store, Users, TrendingUp, Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [commissionsResult, storesResult, profilesResult] = await Promise.all([
        supabase.from('commissions').select('commission_amount, seller_amount'),
        supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);

      const totalCommission = commissionsResult.data?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0;
      const totalSeller = commissionsResult.data?.reduce((sum, c) => sum + Number(c.seller_amount), 0) || 0;
      const totalRevenue = totalCommission + totalSeller;

      return {
        totalCommission,
        totalRevenue,
        totalSeller,
        activeStores: storesResult.count || 0,
        totalUsers: profilesResult.count || 0
      };
    },
    enabled: isAdmin
  });

  const handleWithdraw = () => {
    toast({
      title: "Saque Solicitado",
      description: `Solicitação de saque de R$ ${(stats?.totalCommission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} enviada com sucesso!`,
    });
  };

  if (roleLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <Button 
            onClick={handleWithdraw}
            disabled={!stats?.totalCommission || stats.totalCommission === 0}
            className="gap-2"
          >
            <Wallet className="h-4 w-4" />
            Solicitar Saque
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Receita de Comissões</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                R$ {(stats?.totalCommission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">2% de todas as vendas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Volume total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lojas Ativas</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeStores || 0}</div>
              <p className="text-xs text-muted-foreground">Total de lojas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Total de usuários</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sistema de Comissões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Taxa de Comissão:</span>
                <span className="font-bold">2%</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Pago aos Vendedores:</span>
                <span className="font-bold">
                  R$ {(stats?.totalSeller || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Disponível para Saque:</span>
                <span className="font-bold text-success">
                  R$ {(stats?.totalCommission || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
