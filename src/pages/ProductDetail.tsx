import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, ShoppingCart, Truck, Package, Store as StoreIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores (
            id,
            name,
            rating,
            logo_url
          ),
          categories (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleAddToCart = () => {
    toast.success('Produto adicionado ao carrinho!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Produto não encontrado</h2>
            <Button onClick={() => navigate('/discover')}>Voltar para Descobrir</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                    <img src={img} alt={`${product.name} ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.categories && (
              <Badge>{product.categories.name}</Badge>
            )}
            
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-warning text-warning" />
                  <span className="font-medium">{product.rating || 0}</span>
                </div>
                <span className="text-muted-foreground">({product.total_reviews || 0} avaliações)</span>
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-3xl font-bold text-primary">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {(product as any).sizes && (product as any).sizes.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tamanhos Disponíveis:</h3>
                <div className="flex gap-2">
                  {(product as any).sizes.map((size: string) => (
                    <Badge key={size} variant="outline" className="px-4 py-2">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-muted-foreground">{product.description || 'Sem descrição disponível'}</p>
            </div>

            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Frete</p>
                <p className="text-sm text-muted-foreground">
                  {(product as any).shipping_info?.free_shipping ? 'Frete Grátis' : 'Calcular no checkout'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Estoque</p>
                <p className="text-sm text-muted-foreground">
                  {product.stock > 0 ? `${product.stock} unidades disponíveis` : 'Produto esgotado'}
                </p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Produto Esgotado'}
            </Button>
          </div>
        </div>

        {/* Store Info */}
        {product.stores && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {product.stores.logo_url ? (
                  <img 
                    src={product.stores.logo_url} 
                    alt={product.stores.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <StoreIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.stores.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-sm">{product.stores.rating || 0}</span>
                  </div>
                </div>
                <Button variant="outline">Ver Loja</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ProductDetail;
