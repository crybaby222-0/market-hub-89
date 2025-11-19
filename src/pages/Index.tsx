import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Package, Users, Store as StoreIcon, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores (
            name,
            rating
          ),
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['marketplace-stats'],
    queryFn: async () => {
      const [storesResult, productsResult] = await Promise.all([
        supabase.from('stores').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      return {
        stores: storesResult.count || 0,
        products: productsResult.count || 0,
        customers: 0 // Placeholder
      };
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-8 md:p-12">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Market+ - O Marketplace do Futuro
            </h1>
            <p className="mb-4 text-lg text-muted-foreground">
              Nascido da visão de democratizar o comércio online, o <strong>Market+</strong> é uma plataforma 
              inovadora que conecta vendedores e compradores de todo o Brasil.
            </p>
            <p className="mb-6 text-base text-muted-foreground">
              Nossa ideia principal é simples: criar um ecossistema justo onde qualquer pessoa pode 
              abrir sua loja virtual com apenas <strong className="text-primary">2% de comissão</strong> - 
              a menor taxa do mercado. Acreditamos que o sucesso dos nossos vendedores é o nosso sucesso.
            </p>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg bg-background/80 p-3">
                <ShieldCheck className="h-5 w-5 text-success" />
                <span className="text-sm font-medium">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-background/80 p-3">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Entrega Rápida</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-background/80 p-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Suporte 24/7</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link to="/auth">Começar a Vender</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/products">Explorar Produtos</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12 grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <StoreIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.stores || 0}+</p>
                <p className="text-sm text-muted-foreground">Lojas Ativas</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.products || 0}+</p>
                <p className="text-sm text-muted-foreground">Produtos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">Growing</p>
                <p className="text-sm text-muted-foreground">Clientes Satisfeitos</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Featured Products */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Produtos em Destaque</h2>
            <Button variant="ghost" asChild>
              <Link to="/products">Ver todos</Link>
            </Button>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : products && products.length > 0 ? (
              products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    {product.categories && (
                      <Badge className="mb-2">{product.categories.name}</Badge>
                    )}
                    <h3 className="mb-2 font-semibold line-clamp-2 min-h-[3rem]">{product.name}</h3>
                    <div className="mb-3 flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-medium">{product.rating || 0}</span>
                      <span className="text-sm text-muted-foreground">({product.total_reviews || 0})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-primary">
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Button size="sm">Comprar</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-4 text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  Nenhum produto cadastrado ainda. Seja o primeiro vendedor!
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/auth">Começar a Vender</Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
