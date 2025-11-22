import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Painel do Vendedor</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">R$ 0,00</div>
              <p className="text-xs text-muted-foreground">98% das vendas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Total de produtos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Comissão (2%)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">R$ 0,00</div>
              <p className="text-xs text-muted-foreground">Total retido</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Comece a Vender</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Configure sua loja e adicione produtos para começar a vender no Market+.
              A plataforma retém apenas 2% de comissão em cada venda.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Como Sacar Meu Dinheiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">💰 Saldo Disponível:</strong> 98% de cada venda fica disponível para você.
              </p>
              <p>
                <strong className="text-foreground">🏦 Saque:</strong> Acesse a aba "Pagamentos" para configurar sua conta bancária e solicitar saques.
              </p>
              <p>
                <strong className="text-foreground">⏱️ Prazo:</strong> Saques são processados em até 2 dias úteis.
              </p>
              <p>
                <strong className="text-foreground">💵 Valor Mínimo:</strong> R$ 50,00 para solicitar saque.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
