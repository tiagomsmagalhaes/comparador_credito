import {
    AlertCircle,
    ArrowRight,
    BarChart3,
    BookOpen,
    Building2,
    Calculator,
    CheckCircle,
    Download,
    FileText,
    Info,
    Map,
    PieChart,
    Plus,
    Settings,
    Target,
    TrendingUp,
    Upload,
    Users,
    Zap
} from 'lucide-react';
import React from 'react';

export const HomeInstructions: React.FC = () => {
    const features = [
        {
            icon: Building2,
            title: "Gestão de Bancos",
            description: "Adicione, edite e remova bancos facilmente. Cada banco pode ter suas próprias taxas, custos e condições.",
            steps: [
                "Clique em 'Adicionar Banco' para criar um novo",
                "Preencha as informações básicas (valor, prazo)",
                "Configure taxas e custos mensais",
                "Defina custos iniciais e prémios",
                "Visualize o resumo da proposta"
            ]
        },
        {
            icon: TrendingUp,
            title: "Comparação de Propostas",
            description: "Compare automaticamente todas as propostas dos bancos em uma tabela detalhada.",
            steps: [
                "Navegue para a aba 'Propostas'",
                "Visualize comparação por anos (1, 2, 3, 5, 10, 20, 40)",
                "Compare prestações mensais e totais",
                "Analise custos acumulados e juros",
                "Identifique a melhor proposta para cada período"
            ]
        },
        {
            icon: Calculator,
            title: "Amortizações Antecipadas",
            description: "Configure amortizações que se aplicam a todos os bancos simultaneamente.",
            steps: [
                "Acesse a aba 'Amortizações'",
                "Selecione os bancos para aplicar",
                "Configure valor e data da amortização",
                "Visualize o impacto nos cálculos",
                "Compare resultados com e sem amortizações"
            ]
        },
        {
            icon: Map,
            title: "Mapa de Dívida",
            description: "Visualize a evolução da dívida ao longo do tempo para cada banco.",
            steps: [
                "Navegue para a aba 'Mapa'",
                "Visualize tabela detalhada por mês",
                "Analise capital em dívida ao longo do tempo",
                "Compare evolução entre bancos",
                "Identifique pontos de inflexão"
            ]
        },
        {
            icon: BarChart3,
            title: "Gráficos Interativos",
            description: "Visualize dados em gráficos dinâmicos e interativos.",
            steps: [
                "Acesse a aba 'Gráficos'",
                "Selecione os bancos para comparar",
                "Visualize evolução da dívida em gráfico",
                "Compare prestações ao longo do tempo",
                "Analise tendências e padrões"
            ]
        }
    ];

    const quickStart = [
        {
            step: 1,
            title: "Adicionar Primeiro Banco",
            description: "Comece adicionando o banco com a melhor proposta que você recebeu.",
            icon: Plus
        },
        {
            step: 2,
            title: "Configurar Dados",
            description: "Preencha valor do empréstimo, prazo, taxas e custos associados.",
            icon: Settings
        },
        {
            step: 3,
            title: "Adicionar Mais Bancos",
            description: "Adicione outras propostas para comparar e encontrar a melhor opção.",
            icon: Building2
        },
        {
            step: 4,
            title: "Analisar Comparações",
            description: "Use as abas de Propostas, Mapa e Gráficos para tomar a decisão.",
            icon: PieChart
        }
    ];

    const tips = [
        {
            icon: Info,
            title: "Dica Importante",
            content: "Sempre verifique se os dados inseridos correspondem exatamente às propostas reais dos bancos."
        },
        {
            icon: Target,
            title: "Foco nos Custos Totais",
            content: "Não se foque apenas na taxa de juro. Considere todos os custos: seguros, comissões, manutenção de conta."
        },
        {
            icon: Zap,
            title: "Amortizações Antecipadas",
            content: "Configure amortizações antecipadas para ver como elas podem reduzir significativamente o custo total."
        },
        {
            icon: FileText,
            title: "Exportar Dados",
            content: "Use a função de exportar para guardar seus dados e comparar propostas em diferentes momentos."
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <BookOpen className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Guia Completo da Plataforma
                </h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    Aprenda a usar todas as funcionalidades do Comparador de Crédito Habitação para tomar a melhor decisão sobre o seu empréstimo.
                </p>
            </div>

            {/* Quick Start */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Início Rápido</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickStart.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.step} className="relative">
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 h-full flex flex-col">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">{item.step}</span>
                                        </div>
                                        <Icon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-600 flex-1">{item.description}</p>
                                </div>
                                {item.step < 4 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2">
                                        <ArrowRight className="h-6 w-6 text-blue-400" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Funcionalidades Principais</h2>
                    <p className="text-gray-600">Explore cada funcionalidade em detalhe</p>
                </div>

                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Icon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                                        <p className="text-sm text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span>Como usar:</span>
                                </h4>
                                <ol className="space-y-2">
                                    {feature.steps.map((step, stepIndex) => (
                                        <li key={stepIndex} className="flex items-start space-x-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-blue-600">{stepIndex + 1}</span>
                                            </span>
                                            <span className="text-sm text-gray-700">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Dicas Importantes</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tips.map((tip, index) => {
                        const Icon = tip.icon;
                        return (
                            <div key={index} className="bg-white rounded-lg p-4 border border-yellow-200">
                                <div className="flex items-start space-x-3">
                                    <Icon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-1">{tip.title}</h3>
                                        <p className="text-sm text-gray-600">{tip.content}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Gestão de Dados</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                            <Upload className="h-4 w-4 text-green-600" />
                            <span>Importar Dados</span>
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>• Clique em "Carregar" na aba Dados</p>
                            <p>• Selecione um arquivo JSON válido</p>
                            <p>• Os dados serão importados automaticamente</p>
                            <p>• Útil para restaurar comparações anteriores</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                            <Download className="h-4 w-4 text-blue-600" />
                            <span>Exportar Dados</span>
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>• Clique em "Exportar" na aba Dados</p>
                            <p>• Um arquivo JSON será descarregado</p>
                            <p>• Guarde para usar em outros dispositivos</p>
                            <p>• Faça backup das suas comparações</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-green-600" />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <a
                        href="https://coff.ee/jmbcs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        <span>Buy me a coffee</span>
                    </a>
                    <p className="text-sm text-gray-500">
                        Apoie o desenvolvimento da plataforma
                    </p>
                </div>
            </div>
        </div>
    );
};
