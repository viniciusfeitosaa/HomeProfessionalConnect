import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CreditCard, Eye, CheckCircle, ArrowLeft, Mail } from "lucide-react";
import { useLocation } from "wouter";
import ClientNavbar from "../components/client-navbar";

export default function PrivacySecurity() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ClientNavbar />
      
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setLocation('/settings')}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Privacidade e Segurança</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-8 space-y-6">
        {/* Desktop Header */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Privacidade e Segurança</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Sua segurança é nossa prioridade</p>
            </div>
          </div>
        </div>

        {/* Introdução */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/20 w-16 h-16 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                🔒 Privacidade e Segurança no LifeBee
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                No <strong>LifeBee</strong>, a sua segurança e a proteção dos seus dados são nossa prioridade máxima. 
                Atuamos com total transparência e em conformidade com a Lei Geral de Proteção de Dados (LGPD) e outras regulamentações aplicáveis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seção 1: Segurança dos Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-blue-600" />
              1. Segurança dos Seus Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Quais Dados Coletamos</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Coletamos apenas os dados essenciais para garantir a prestação do serviço e a segurança das transações.
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                <li>Nome, CPF, e-mail, telefone</li>
                <li>Dados de localização (necessários para serviços presenciais)</li>
                <li>Dados de pagamento</li>
                <li>Informações de saúde/bem-estar fornecidas por você (tratados como <strong>Dados Pessoais Sensíveis</strong> com o seu consentimento explícito)</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Finalidade do Uso</h3>
              
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Identificação</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Para validar sua identidade e a do profissional.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Correspondência (Match)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Para conectar clientes e profissionais na mesma área.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Comunicação</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Para enviar notificações sobre o serviço e o pagamento.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Segurança</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Para prevenir fraudes e garantir o cumprimento dos Termos de Uso.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">Proteção</h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Todos os seus dados são armazenados em servidores seguros, com criptografia de ponta e acesso restrito.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Transparência no Fluxo de Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
              2. Transparência no Fluxo de Pagamentos (O Sistema de Retenção)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Para sua tranquilidade, utilizamos um sistema de pagamento com retenção, que garante a segurança da transação para ambas as partes:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-yellow-50 dark:bg-yellow-900/20">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      O Que Acontece
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Transparência & Segurança
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-medium text-gray-900 dark:text-white">
                      Pré-Pagamento
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-600 dark:text-gray-300">
                      Você paga o valor total do serviço. Este dinheiro fica <strong>retido</strong> em uma conta segura, gerenciada por nossa parceira de pagamentos homologada.
                    </td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-medium text-gray-900 dark:text-white">
                      Retenção (Escrow)
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-600 dark:text-gray-300">
                      O profissional tem a garantia de que o dinheiro está reservado. Você tem a certeza de que o valor só será liberado após a conclusão e sua aprovação.
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-medium text-gray-900 dark:text-white">
                      Confirmação do Cliente
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-600 dark:text-gray-300">
                      O dinheiro só é <strong>liberado</strong> da retenção para o profissional após a sua confirmação de que o serviço foi executado conforme o combinado.
                    </td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-medium text-gray-900 dark:text-white">
                      Disputa
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-600 dark:text-gray-300">
                      Em caso de problemas, o valor permanece retido e congelado enquanto o <strong>LifeBee</strong> atua como mediador imparcial, seguindo as regras estabelecidas nos nossos Termos de Uso.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Importante</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    O LifeBee não armazena diretamente seus dados de cartão de crédito; esta função é realizada por nossa parceira de pagamentos, 
                    que possui certificações de segurança (como PCI DSS) exigidas pelo mercado financeiro.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 3: Compartilhamento de Informações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-purple-600" />
              3. Compartilhamento de Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-600 dark:text-gray-300">
              Seus dados são <strong>confidenciais</strong>. Eles só serão compartilhados estritamente quando necessário:
            </p>

            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Com o Profissional/Cliente</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Apenas os dados necessários para a execução do serviço (nome, contato e localização).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Com Parceiros de Pagamento</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Para processar a transação e o sistema de retenção/liberação.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Autoridades Legais</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Caso haja uma obrigação legal ou ordem judicial para fornecer os dados.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 4: Seus Direitos (LGPD) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              4. Seus Direitos (LGPD)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Você é o titular dos seus dados e possui total controle sobre eles. A qualquer momento, você pode:
            </p>

            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">Acessar</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Visualizar todos os seus dados armazenados.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">Corrigir</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Atualizar informações incorretas ou desatualizadas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">Revogar</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Cancelar o consentimento para o tratamento de dados (quando aplicável).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">Solicitar a Exclusão</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Remover seus dados (respeitadas as obrigações legais de retenção).</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Contato</h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Para exercer seus direitos ou tirar dúvidas, entre em contato conosco através do nosso suporte.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aviso Legal */}
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Dica:</strong> Sugerimos fortemente que você procure uma consultoria jurídica para transformar este rascunho em uma 
                <strong>Política de Privacidade</strong> e <strong>Termos de Uso</strong> robustos e com validade legal, 
                incluindo a figura do Encarregado de Dados (DPO), conforme exigido pela LGPD.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botão Voltar */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={() => setLocation('/settings')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Configurações
          </Button>
        </div>
      </div>
    </div>
  );
}

