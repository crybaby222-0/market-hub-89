import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, color: 'bg-warning text-warning-foreground' },
  processing: { label: 'Processando', icon: Package, color: 'bg-primary text-primary-foreground' },
  shipped: { label: 'Enviado', icon: Truck, color: 'bg-blue-500 text-white' },
  delivered: { label: 'Entregue', icon: CheckCircle, color: 'bg-success text-success-foreground' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'bg-destructive text-destructive-foreground' },
};

export default function MyOrders() {
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              images
            ),
            stores (
              name
            )
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Meus Pedidos</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status || 'pending'].icon;
              
              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Pedido #{order.id.slice(0, 8)}
                      </CardTitle>
                      <Badge className={statusConfig[order.status || 'pending'].color}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusConfig[order.status || 'pending'].label}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex gap-4">
                          <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {item.products?.images?.[0] ? (
                              <img 
                                src={item.products.images[0]} 
                                alt={item.products.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{item.products?.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Vendido por: {item.stores?.name}
                            </p>
                            <p className="text-sm">
                              Quantidade: {item.quantity} x R$ {Number(item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              R$ {Number(item.total_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-primary">
                            R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h2>
              <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
