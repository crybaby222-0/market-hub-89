import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Termos de Uso e Política de Privacidade</h1>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">1. Termos de Uso</h2>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">1.1 Aceitação dos Termos</h3>
                <p className="text-muted-foreground">
                  Ao acessar e usar a plataforma Market+, você concorda com estes termos de uso. 
                  Se você não concordar com estes termos, não utilize nossa plataforma.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">1.2 Elegibilidade</h3>
                <p className="text-muted-foreground">
                  Para usar nossa plataforma, você deve ter pelo menos 18 anos de idade. 
                  Ao criar uma conta, você confirma que tem idade legal para formar um contrato vinculativo.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">1.3 Conta de Usuário</h3>
                <p className="text-muted-foreground">
                  Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as 
                  atividades que ocorrem em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">1.4 Comissão da Plataforma</h3>
                <p className="text-muted-foreground">
                  O Market+ cobra uma comissão de 2% sobre cada venda realizada através da plataforma. 
                  Esta taxa é automaticamente deduzida do valor total da venda antes do repasse ao vendedor.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">1.5 Conduta do Usuário</h3>
                <p className="text-muted-foreground">
                  Você concorda em não usar a plataforma para:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Violar qualquer lei ou regulamento aplicável</li>
                  <li>Vender produtos proibidos ou ilegais</li>
                  <li>Publicar conteúdo ofensivo, difamatório ou fraudulento</li>
                  <li>Interferir no funcionamento da plataforma</li>
                  <li>Coletar dados de outros usuários sem autorização</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">2. Política de Privacidade</h2>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">2.1 Coleta de Informações</h3>
                <p className="text-muted-foreground">
                  Coletamos informações que você nos fornece diretamente, incluindo:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Nome completo e informações de contato</li>
                  <li>Informações de pagamento e endereço de entrega</li>
                  <li>Histórico de compras e preferências</li>
                  <li>Comunicações com nosso suporte</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">2.2 Uso das Informações</h3>
                <p className="text-muted-foreground">
                  Usamos suas informações para:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Processar suas transações e pedidos</li>
                  <li>Fornecer suporte ao cliente</li>
                  <li>Melhorar nossa plataforma e serviços</li>
                  <li>Enviar atualizações e ofertas (com seu consentimento)</li>
                  <li>Prevenir fraudes e garantir a segurança</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">2.3 Compartilhamento de Informações</h3>
                <p className="text-muted-foreground">
                  Não vendemos suas informações pessoais. Podemos compartilhar seus dados com:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Vendedores para processamento de pedidos</li>
                  <li>Provedores de pagamento e logística</li>
                  <li>Autoridades legais quando requerido por lei</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">2.4 Segurança</h3>
                <p className="text-muted-foreground">
                  Implementamos medidas de segurança para proteger suas informações pessoais. 
                  No entanto, nenhum método de transmissão pela internet é 100% seguro.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">2.5 Seus Direitos</h3>
                <p className="text-muted-foreground">
                  Você tem o direito de:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Acessar suas informações pessoais</li>
                  <li>Corrigir dados imprecisos</li>
                  <li>Solicitar a exclusão de suas informações</li>
                  <li>Optar por não receber comunicações de marketing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">3. Políticas de Vendedor</h2>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">3.1 Requisitos para Vender</h3>
                <p className="text-muted-foreground">
                  Para se tornar um vendedor no Market+, você deve:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Ter pelo menos 18 anos de idade</li>
                  <li>Criar uma loja válida na plataforma</li>
                  <li>Fornecer informações precisas sobre produtos</li>
                  <li>Cumprir prazos de envio e políticas de devolução</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold">3.2 Produtos Proibidos</h3>
                <p className="text-muted-foreground">
                  É estritamente proibido vender:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Produtos ilegais ou roubados</li>
                  <li>Armas e munições</li>
                  <li>Drogas e substâncias controladas</li>
                  <li>Produtos falsificados ou pirateados</li>
                  <li>Material adulto ou impróprio</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">4. Modificações</h2>
              <p className="text-muted-foreground">
                Reservamos o direito de modificar estes termos a qualquer momento. 
                Notificaremos você sobre mudanças significativas. O uso continuado da plataforma 
                após as modificações constitui aceitação dos novos termos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold">5. Contato</h2>
              <p className="text-muted-foreground">
                Para questões sobre estes termos ou nossa política de privacidade, entre em contato conosco através do 
                suporte ao cliente na plataforma.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Terms;
