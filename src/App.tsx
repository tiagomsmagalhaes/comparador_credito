import { BarChart3, Building2, Calculator, ChevronDown, ChevronRight, ChevronUp, Coffee, Download, Home, Map, Menu, Plus, TrendingUp, Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AmortizacoesForm from './components/AmortizacoesForm';
import { BankDataDisplay } from './components/BankDataDisplay';
import { BankForm } from './components/BankForm';
import { DebtMapChart } from './components/DebtMapChart';
import { HomeInstructions } from './components/HomeInstructions';
import { ProposalComparisonTable } from './components/ProposalComparisonTable';
import { YearlyCalculationsTable } from './components/YearlyCalculationsTable';
import { initialBanksData } from './data/banksData';
import { BankData, BanksData, DebtMapEntry } from './types';
import { compararBancos, gerarMapaDivida } from './utils/calculations';

function App() {
    const [banksData, setBanksData] = useState<BanksData>(initialBanksData);
    const [selectedBank, setSelectedBank] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [editingBank, setEditingBank] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'home' | 'dados' | 'propostas' | 'amortizacoes' | 'graficos' | 'debt-map'>('home');
    const [comparisonResults, setComparisonResults] = useState<{ [key: string]: { [key: number]: any } }>({});
    const [debtMapData, setDebtMapData] = useState<DebtMapEntry[]>([]);
    const [selectedBanksForChart, setSelectedBanksForChart] = useState<string[]>([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [expandedBanks, setExpandedBanks] = useState<Set<string>>(new Set());
    const [selectedBanksForAmortizacoes, setSelectedBanksForAmortizacoes] = useState<string[]>([]);

    const analysisYears = useMemo(() => [1, 2, 3, 5, 10, 20, 40], []);

    useEffect(() => {
        // Generate comparison results when banks data changes
        const results = compararBancos(banksData, analysisYears);
        setComparisonResults(results);

        // Generate debt map data
        const allDebtMapData: DebtMapEntry[] = [];
        Object.entries(banksData).forEach(([bankName, bankData]) => {
            const bankDebtMap = gerarMapaDivida(bankData, bankName);
            allDebtMapData.push(...bankDebtMap);
        });
        setDebtMapData(allDebtMapData);

        // Set selected banks for chart (all banks by default)
        setSelectedBanksForChart(Object.keys(banksData));

        // Set selected banks for amortizations (all banks by default, but only if none are currently selected)
        if (selectedBanksForAmortizacoes.length === 0) {
            setSelectedBanksForAmortizacoes(Object.keys(banksData));
        } else {
            // Filter out banks that no longer exist in the data
            const validSelectedBanks = selectedBanksForAmortizacoes.filter(bankName =>
                Object.keys(banksData).includes(bankName)
            );
            if (validSelectedBanks.length !== selectedBanksForAmortizacoes.length) {
                setSelectedBanksForAmortizacoes(validSelectedBanks);
            }
        }
    }, [banksData, analysisYears]);

    const handleSaveBank = (bankName: string, data: BankData) => {
        const newBanksData = { ...banksData };

        if (editingBank && editingBank !== bankName) {
            // Remove old bank name if it was changed
            delete newBanksData[editingBank];
        }

        // Add/update the bank
        newBanksData[bankName] = data;
        setBanksData(newBanksData);

        // Keep all banks visible - don't change selectedBank
        // Ensure the updated bank remains expanded
        if (expandedBanks.has(editingBank || bankName)) {
            const newExpandedBanks = new Set(expandedBanks);
            if (editingBank && editingBank !== bankName) {
                newExpandedBanks.delete(editingBank);
            }
            newExpandedBanks.add(bankName);
            setExpandedBanks(newExpandedBanks);
        }

        setShowForm(false);
        setEditingBank(null);

        // Auto-expand the updated/added bank for better UX
        setTimeout(() => {
            const newExpandedBanks = new Set(expandedBanks);
            newExpandedBanks.add(bankName);
            setExpandedBanks(newExpandedBanks);
        }, 100);
    };

    const handleDeleteBank = (bankName: string) => {
        if (window.confirm(`Tem certeza que deseja remover o banco "${bankName}"?`)) {
            const newBanksData = { ...banksData };
            delete newBanksData[bankName];
            setBanksData(newBanksData);
            if (selectedBank === bankName) {
                setSelectedBank('');
            }
        }
    };

    const handleAddBank = () => {
        setEditingBank(null);
        setSelectedBank('');
        setShowForm(true);
        setActiveTab('dados');
        setMobileMenuOpen(false);

        // Auto-expand new banks when they are added
        // This will be handled in handleSaveBank when the bank is actually saved
    };

    const toggleAllBanks = (expand: boolean) => {
        if (expand) {
            setExpandedBanks(new Set(Object.keys(banksData)));
        } else {
            setExpandedBanks(new Set());
        }
    };

    const toggleBankExpansion = (bankName: string) => {
        const newExpandedBanks = new Set(expandedBanks);
        if (newExpandedBanks.has(bankName)) {
            newExpandedBanks.delete(bankName);
        } else {
            newExpandedBanks.add(bankName);
        }
        setExpandedBanks(newExpandedBanks);
    };

    const handleLoadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target?.result as string);
                    setBanksData(jsonData);
                    setShowForm(false);
                    alert(`Carregados ${Object.keys(jsonData).length} bancos com sucesso!`);
                } catch (error) {
                    alert('Erro ao carregar o arquivo JSON. Certifique-se de que é um arquivo válido.');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        }
    };

    const exportToJSON = () => {
        const dataStr = JSON.stringify(banksData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'dados_bancos.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const tabs = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'dados', label: 'Dados', icon: Building2 },
        { id: 'propostas', label: 'Propostas', icon: TrendingUp },
        { id: 'amortizacoes', label: 'Amortizações', icon: Calculator },
        { id: 'debt-map', label: 'Mapa', icon: Map },
        { id: 'graficos', label: 'Gráficos', icon: BarChart3 },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo and Title */}
                        <button
                            onClick={() => setActiveTab('home')}
                            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <div className="block">
                                <h1 className="text-lg font-semibold text-gray-900">Comparador</h1>
                                <p className="text-xs text-gray-500">Crédito Habitação</p>
                            </div>
                        </button>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}

                            {/* Buy Me a Coffee Button - Desktop */}
                            <a
                                href="https://coff.ee/jmbcs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 ml-2"
                            >
                                <Coffee className="h-4 w-4" />
                                <span>Buy me a coffee</span>
                            </a>
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors relative"
                        >
                            <div className="relative w-5 h-5">
                                <Menu className={`h-5 w-5 absolute inset-0 transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                                    }`} />
                                <X className={`h-5 w-5 absolute inset-0 transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                                    }`} />
                            </div>
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
                        } border-t border-gray-200`}>
                        <div className="grid grid-cols-2 gap-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id as any);
                                            setMobileMenuOpen(false);
                                        }}
                                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Buy Me a Coffee Button - Mobile (Full Width) */}
                        <div className="mt-3">
                            <a
                                href="https://coff.ee/jmbcs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center space-x-2 p-3 rounded-lg text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 w-full"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Coffee className="h-4 w-4" />
                                <span>Buy me a coffee</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Tab Content */}
                <div className="space-y-6 relative">
                    {/* Home Tab */}
                    <div className={`transition-all duration-300 ease-in-out ${activeTab === 'home' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute'
                        }`}>
                        {activeTab === 'home' && (
                            <HomeInstructions />
                        )}
                    </div>

                    {/* Dados Tab */}
                    <div className={`transition-all duration-300 ease-in-out ${activeTab === 'dados' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute'
                        }`}>
                        {activeTab === 'dados' && (
                            <div className="space-y-6">
                                {/* Header Section */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Dados dos Bancos</h2>
                                        <p className="text-sm text-gray-600 mt-1">Gerencie as informações dos bancos e suas propostas</p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                        <button
                                            onClick={handleAddBank}
                                            className="btn-primary flex items-center justify-center space-x-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Adicionar Banco</span>
                                        </button>

                                        <label className="btn-secondary flex items-center justify-center space-x-2 cursor-pointer">
                                            <Upload className="h-4 w-4" />
                                            <span>Carregar</span>
                                            <input
                                                type="file"
                                                accept=".json"
                                                onChange={handleLoadJSON}
                                                className="hidden"
                                            />
                                        </label>

                                        <button
                                            onClick={exportToJSON}
                                            className="btn-secondary flex items-center justify-center space-x-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            <span>Exportar</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Banks List */}
                                {Object.keys(banksData).length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Building2 className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum banco adicionado</h3>
                                        <p className="text-gray-600 mb-6">Adicione o primeiro banco para começar a comparar propostas.</p>
                                        <button
                                            onClick={handleAddBank}
                                            className="btn-primary"
                                        >
                                            Adicionar Primeiro Banco
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Expand/Collapse Controls */}
                                        <div className="flex items-center justify-end">
                                            <button
                                                onClick={() => toggleAllBanks(expandedBanks.size === 0)}
                                                className="flex items-center space-x-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                            >
                                                {expandedBanks.size === 0 ? (
                                                    <>
                                                        <ChevronDown className="h-3 w-3" />
                                                        <span>Expandir</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronUp className="h-3 w-3" />
                                                        <span>Colapsar</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Banks Grid */}
                                        <div className="space-y-3">
                                            {Object.keys(banksData).map((bankName) => {
                                                const isExpanded = expandedBanks.has(bankName);
                                                return (
                                                    <div
                                                        key={bankName}
                                                        className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                                    >
                                                        {/* Bank Header */}
                                                        <div
                                                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                                            onClick={() => toggleBankExpansion(bankName)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                        <Building2 className="h-5 w-5 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-semibold text-gray-900">{bankName}</h3>
                                                                        <p className="text-sm text-gray-500">Clique para ver detalhes</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center space-x-6">
                                                                    <div className="text-right">
                                                                        <div className="flex items-center space-x-4">
                                                                            <div className="text-center">
                                                                                <div className="text-xs text-gray-500">Taxa Fixa</div>
                                                                                <div className="text-sm font-semibold text-blue-600">
                                                                                    {(banksData[bankName].taxa_fixa).toFixed(2)}%
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-center">
                                                                                <div className="text-xs text-gray-500">Spread</div>
                                                                                <div className="text-sm font-semibold text-purple-600">
                                                                                    {(banksData[bankName].spread).toFixed(2)}%
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight
                                                                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''
                                                                            }`}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expandable Content */}
                                                        <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                                                            }`}>
                                                            <div className="px-4 pb-4">
                                                                <BankDataDisplay
                                                                    bankName={bankName}
                                                                    data={banksData[bankName]}
                                                                    onEdit={() => {
                                                                        setEditingBank(bankName);
                                                                        setShowForm(true);
                                                                    }}
                                                                    onDelete={() => handleDeleteBank(bankName)}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Propostas Tab */}
                    <div className={`transition-all duration-300 ease-in-out ${activeTab === 'propostas' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute'
                        }`}>
                        {activeTab === 'propostas' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Comparação de Propostas</h2>
                                    <p className="text-sm text-gray-600 mt-1">Compare as propostas de todos os bancos</p>
                                </div>
                                <ProposalComparisonTable banksData={banksData} />
                            </div>
                        )}
                    </div>

                    {/* Amortizações Tab */}
                    <div className={`transition-all duration-300 ease-in-out ${activeTab === 'amortizacoes' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute'
                        }`}>
                        {activeTab === 'amortizacoes' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Amortizações Antecipadas Globais</h2>
                                    <p className="text-sm text-gray-600 mt-1">Configure amortizações que se aplicam a todos os bancos simultaneamente</p>
                                </div>

                                {Object.keys(banksData).length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Calculator className="h-8 w-8 text-orange-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum banco adicionado</h3>
                                        <p className="text-gray-600 mb-6">Adicione bancos primeiro para configurar amortizações antecipadas.</p>
                                        <button
                                            onClick={handleAddBank}
                                            className="btn-primary"
                                        >
                                            Adicionar Primeiro Banco
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Formulário Global de Amortizações */}
                                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                            <div className="p-6 border-b border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                                        <Calculator className="h-5 w-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">Configuração Global de Amortizações</h3>
                                                        <p className="text-sm text-gray-500">As amortizações configuradas aqui serão aplicadas a todos os bancos</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <AmortizacoesForm
                                                    amortizacoes={[]}
                                                    onAmortizacoesChange={(amortizacoes) => {
                                                        console.log('=== DEBUG AMORTIZAÇÕES ===');
                                                        console.log('Bancos selecionados:', selectedBanksForAmortizacoes);
                                                        console.log('Nova amortização a adicionar:', amortizacoes);

                                                        const updatedBanksData = { ...banksData };
                                                        // Aplicar amortizações apenas aos bancos selecionados
                                                        selectedBanksForAmortizacoes.forEach(bankName => {
                                                            // Manter as amortizações existentes do banco e adicionar as novas
                                                            const amortizacoesExistentes = updatedBanksData[bankName].amortizacoes || [];
                                                            console.log(`Banco ${bankName} - Amortizações existentes:`, amortizacoesExistentes);

                                                            updatedBanksData[bankName] = {
                                                                ...updatedBanksData[bankName],
                                                                amortizacoes: [...amortizacoesExistentes, ...amortizacoes]
                                                            };

                                                            console.log(`Banco ${bankName} - Amortizações finais:`, updatedBanksData[bankName].amortizacoes);
                                                        });
                                                        setBanksData(updatedBanksData);
                                                    }}
                                                    tempoEmprestimo={banksData[Object.keys(banksData)[0]]?.tempo_emprestimo || 40}
                                                    banksData={banksData}
                                                    selectedBanks={selectedBanksForAmortizacoes}
                                                    onSelectedBanksChange={setSelectedBanksForAmortizacoes}
                                                    onBanksDataChange={setBanksData}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mapa Tab */}
                    <div className={`transition-all duration-300 ease-in-out ${activeTab === 'debt-map' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute'
                        }`}>
                        {activeTab === 'debt-map' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Mapa de Dívida</h2>
                                    <p className="text-sm text-gray-600 mt-1">Visualize a evolução da dívida ao longo do tempo</p>
                                </div>
                                <YearlyCalculationsTable
                                    data={debtMapData}
                                    selectedBanks={Object.keys(banksData)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Gráficos Tab */}
                    <div className={`transition-all duration-300 ease-in-out ${activeTab === 'graficos' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute'
                        }`}>
                        {activeTab === 'graficos' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Gráficos</h2>
                                    <p className="text-sm text-gray-600 mt-1">Visualize dados em gráficos interativos</p>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 shadow-sm">
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-700">
                                                Bancos selecionados ({selectedBanksForChart.length}/{Object.keys(banksData).length}):
                                            </p>
                                            {selectedBanksForChart.length > 0 && (
                                                <button
                                                    onClick={() => setSelectedBanksForChart([])}
                                                    className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                                >
                                                    Limpar todos
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(banksData).map(bankName => (
                                                <label key={bankName} className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 border ${selectedBanksForChart.includes(bankName)
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    }`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedBanksForChart.includes(bankName)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedBanksForChart(prev => [...prev, bankName]);
                                                            } else {
                                                                setSelectedBanksForChart(prev => prev.filter(b => b !== bankName));
                                                            }
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                                                    />
                                                    <Building2 className="h-3 w-3" />
                                                    <span className="text-xs font-medium">{bankName}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <DebtMapChart
                                        data={debtMapData}
                                        selectedBanks={selectedBanksForChart}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Bank Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
                        <BankForm
                            key={`bank-form-${editingBank || 'new'}`}
                            bankName={editingBank || ''}
                            data={editingBank ? banksData[editingBank] : {
                                periodo_fixa: 2,
                                taxa_fixa: 2.5,
                                euribor: 2.081,
                                spread: 0.5,
                                valor_emprestimo: 200000,
                                tempo_emprestimo: 40,
                                premios_entrada: 0,
                                comissoes_iniciais: 0,
                                seguro_vida: 0,
                                seguro_multiriscos: 0,
                                manutencao_conta: 0,
                                outros: 0,
                                devolucao_spread: false,
                                anos_devolucao_spread: 0,
                                amortizacoes: []
                            }}
                            onSave={handleSaveBank}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingBank(null);
                            }}
                            isEditing={!!editingBank}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
