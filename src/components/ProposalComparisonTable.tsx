import { Building2, Calendar, ChevronDown, ChevronRight, ChevronUp, DollarSign, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { BankData } from '../types';

interface ProposalComparisonTableProps {
    banksData: { [key: string]: BankData };
}

export const ProposalComparisonTable = ({ banksData }: ProposalComparisonTableProps) => {
    const [selectedBank, setSelectedBank] = useState<string | null>(null);
    const [expandedBanks, setExpandedBanks] = useState<Set<string>>(new Set());

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

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(2)}%`;
    };

    // Calculate monthly payment for fixed rate using debt map
    const calculateFixedPayment = (data: BankData) => {
        const { gerarMapaDivida } = require('../utils/calculations');
        const debtMap = gerarMapaDivida(data, 'temp');

        // Get the first month payment (fixed rate period)
        if (debtMap.length > 0) {
            return debtMap[0]["Prestação (€)"];
        }

        // Fallback calculation if debt map is empty
        const monthlyRate = data.taxa_fixa / 100 / 12;
        const totalPayments = data.tempo_emprestimo * 12;

        if (monthlyRate === 0) return data.valor_emprestimo / totalPayments;

        const payment = data.valor_emprestimo *
            (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
            (Math.pow(1 + monthlyRate, totalPayments) - 1);

        return payment;
    };

    // Calculate monthly payment for variable rate using debt map
    const calculateVariablePayment = (data: BankData) => {
        const { gerarMapaDivida } = require('../utils/calculations');
        const debtMap = gerarMapaDivida(data, 'temp');

        // Get the first month of variable rate period
        const firstVariableMonth = data.periodo_fixa * 12 + 1;
        const variableRateEntry = debtMap.find((entry: any) => entry.Mês === firstVariableMonth);

        if (variableRateEntry) {
            return variableRateEntry["Prestação (€)"];
        }

        // Fallback calculation if debt map doesn't have variable period
        const monthlyRate = (data.euribor + data.spread) / 100 / 12;
        const totalPayments = data.tempo_emprestimo * 12;

        if (monthlyRate === 0) return data.valor_emprestimo / totalPayments;

        const payment = data.valor_emprestimo *
            (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
            (Math.pow(1 + monthlyRate, totalPayments) - 1);

        return payment;
    };

    // Calculate total monthly costs
    const calculateTotalMonthlyCosts = (data: BankData) => {
        return data.seguro_vida + data.seguro_multiriscos + data.manutencao_conta + data.outros;
    };

    // Calculate spread refund total (during spread refund period, considering debt capital)
    const calculateSpreadRefund = (data: BankData) => {
        if (!data.devolucao_spread || !data.anos_devolucao_spread) return 0;

        // Calculate average debt capital during spread refund period
        const { gerarMapaDivida } = require('../utils/calculations');
        const debtMap = gerarMapaDivida(data, 'temp');

        // Get debt capital for each month during spread refund period
        const spreadRefundMonths = data.anos_devolucao_spread * 12;
        const spreadRefundData = debtMap.slice(0, spreadRefundMonths);

        if (spreadRefundData.length === 0) return 0;

        // Calculate average debt capital during spread refund period
        const totalDebtCapital = spreadRefundData.reduce((sum: number, entry: any) => {
            return sum + entry["Capital em Dívida (€)"];
        }, 0);

        const averageDebtCapital = totalDebtCapital / spreadRefundData.length;

        // Calculate total spread refund based on average debt capital
        const monthlySpreadRefund = (averageDebtCapital * (data.spread / 100)) / 12;
        const totalRefund = monthlySpreadRefund * data.anos_devolucao_spread * 12;

        return totalRefund;
    };

    const bankNames = Object.keys(banksData);

    if (bankNames.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="empty-state-title">Nenhum banco configurado</h3>
                <p className="empty-state-description">Adicione bancos para comparar propostas</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mobile Cards */}
            <div className="space-y-6 lg:hidden">
                {/* Expand/Collapse Controls */}
                <div className="flex items-center justify-end mb-4">
                    <button
                        onClick={() => toggleAllBanks(expandedBanks.size === 0)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        {expandedBanks.size === 0 ? (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                <span>Expandir Todos</span>
                            </>
                        ) : (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                <span>Colapsar Todos</span>
                            </>
                        )}
                    </button>
                </div>
                {/* Banks Grid */}
                <div className="space-y-4">
                    {Object.keys(banksData).map((bankName) => {
                        const isExpanded = expandedBanks.has(bankName);
                        const data = banksData[bankName];
                        const totalMonthly = calculateTotalMonthlyCosts(data);
                        const totalInitial = data.premios_entrada - data.comissoes_iniciais + calculateSpreadRefund(data);
                        return (
                            <div
                                key={bankName}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Bank Header */}
                                <div
                                    className="expandable-header"
                                    onClick={() => toggleBankExpansion(bankName)}
                                >
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-gray-900 text-lg">{bankName}</h3>
                                                <p className="text-sm text-gray-500">Clique para ver detalhes</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right space-y-1">
                                                <div className="text-xs text-gray-600 font-medium">Prestação Fixa</div>
                                                <div className="font-bold text-gray-900 text-lg">{formatCurrency(calculateFixedPayment(data))}</div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <div className="text-xs text-gray-600 font-medium">Prestação Variável</div>
                                                <div className="font-bold text-purple-900 text-lg">{formatCurrency(calculateVariablePayment(data))}</div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <div className="text-xs text-gray-600 font-medium">Spread</div>
                                                <div className="font-bold text-blue-600 text-lg">{formatPercentage(data.spread)}</div>
                                            </div>
                                            <ChevronRight className={`h-6 w-6 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Content */}
                                <div className={`expandable-content ${isExpanded ? 'expandable-content-expanded' : 'expandable-content-collapsed'}`}>
                                    <div className="px-6 pb-6 space-y-6">
                                        {/* Rates */}
                                        <div className="bg-blue-50 rounded-xl p-6">
                                            <h4 className="text-base font-semibold text-blue-900 mb-4 flex items-center space-x-3">
                                                <TrendingUp className="h-5 w-5" />
                                                <span>Taxas e Prestações</span>
                                            </h4>
                                            <div className="data-grid gap-4">
                                                <div className="data-item">
                                                    <div className="data-label">Taxa Fixa</div>
                                                    <div className="data-value">{formatPercentage(data.taxa_fixa)}</div>
                                                </div>
                                                <div className="data-item">
                                                    <div className="data-label">Spread</div>
                                                    <div className="data-value">{formatPercentage(data.spread)}</div>
                                                </div>
                                                <div className="data-item">
                                                    <div className="data-label">Prestação Fixa</div>
                                                    <div className="data-value">{formatCurrency(calculateFixedPayment(data))}</div>
                                                </div>
                                                <div className="data-item bg-blue-100 border-l-4 border-blue-500 rounded-r-lg p-4">
                                                    <div className="data-label text-blue-900 font-semibold">Total Fixa + Custos</div>
                                                    <div className="data-value text-blue-800 font-bold text-xl">{formatCurrency(calculateFixedPayment(data) + calculateTotalMonthlyCosts(data))}</div>
                                                </div>
                                                <div className="data-item">
                                                    <div className="data-label">Prestação Variável</div>
                                                    <div className="data-value">{formatCurrency(calculateVariablePayment(data))}</div>
                                                </div>
                                                <div className="data-item bg-purple-100 border-l-4 border-purple-500 rounded-r-lg p-4">
                                                    <div className="data-label text-purple-900 font-semibold">Total Variável + Custos</div>
                                                    <div className="data-value text-purple-800 font-bold text-xl">{formatCurrency(calculateVariablePayment(data) + calculateTotalMonthlyCosts(data))}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Initial Costs */}
                                        <div className="bg-green-50 rounded-xl p-6">
                                            <h4 className="text-base font-semibold text-green-900 mb-4 flex items-center space-x-3">
                                                <DollarSign className="h-5 w-5" />
                                                <span>Outflow Inicial</span>
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
                                                    <span className="text-sm text-gray-600 font-medium">Prémios</span>
                                                    <span className="font-bold text-gray-900 text-lg">+{formatCurrency(data.premios_entrada)}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
                                                    <span className="text-sm text-gray-600 font-medium">Comissões</span>
                                                    <span className="font-bold text-gray-900 text-lg">-{formatCurrency(data.comissoes_iniciais)}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
                                                    <span className="text-sm text-gray-600 font-medium">Devolução Spread</span>
                                                    <span className="font-bold text-gray-900 text-lg">
                                                        {data.devolucao_spread ? '+' : ''}{formatCurrency(calculateSpreadRefund(data))}
                                                    </span>
                                                </div>
                                                <div className="bg-green-100 rounded-lg p-4 border-2 border-green-200 shadow-sm">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-base font-semibold text-gray-900">Total</span>
                                                        <span className={`font-bold text-xl ${totalInitial >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                                            {totalInitial >= 0 ? '+' : ''}{formatCurrency(totalInitial)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Monthly Costs */}
                                        <div className="bg-purple-50 rounded-xl p-6">
                                            <h4 className="text-base font-semibold text-purple-900 mb-4 flex items-center space-x-3">
                                                <Calendar className="h-5 w-5" />
                                                <span>Custos Mensais</span>
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
                                                    <span className="text-sm text-gray-600 font-medium">Seguro Vida</span>
                                                    <span className="font-semibold text-gray-900">{formatCurrency(data.seguro_vida)}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
                                                    <span className="text-sm text-gray-600 font-medium">Seguro Multiriscos</span>
                                                    <span className="font-semibold text-gray-900">{formatCurrency(data.seguro_multiriscos)}</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white rounded-lg p-4 shadow-sm">
                                                    <span className="text-sm text-gray-600 font-medium">Manutenção</span>
                                                    <span className="font-semibold text-gray-900">{formatCurrency(data.manutencao_conta)}</span>
                                                </div>
                                                <div className="bg-red-100 rounded-lg p-4 border-2 border-red-200 shadow-sm">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-base font-semibold text-red-900">Total</span>
                                                        <span className="font-bold text-xl text-red-700">{formatCurrency(calculateTotalMonthlyCosts(data))}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
                <div className="table-container">
                    <div className="responsive-table rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        <table className="table bg-white">
                            <thead>
                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                    <th className="text-left p-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <span className="font-bold text-blue-900 text-lg">Comparação de Propostas</span>
                                        </div>
                                    </th>
                                    {bankNames.map(bankName => (
                                        <th key={bankName} className="text-center p-6">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <span className="font-bold text-gray-800 text-base">{bankName}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Taxas */}
                                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                                    <td className="font-bold text-blue-900 p-4" colSpan={bankNames.length + 1}>
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="text-lg">Taxas e Prestações</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="font-semibold text-gray-700 p-4">Taxa Fixa (%)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center font-semibold text-gray-900 p-4">
                                            {formatPercentage(banksData[bankName].taxa_fixa)}
                                        </td>
                                    ))}
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="font-semibold text-gray-700 p-4">Período Fixo (anos)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center font-semibold text-gray-900 p-4">
                                            {banksData[bankName].periodo_fixa}
                                        </td>
                                    ))}
                                </tr>

                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="font-semibold text-gray-700 p-4">Euribor (%)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center text-gray-900 p-4">
                                            {formatPercentage(banksData[bankName].euribor)}
                                        </td>
                                    ))}
                                </tr>

                                <tr className="border-t-2 border-gray-200">
                                    <td className="font-semibold text-gray-700 py-3">Prestação Fixa (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center font-semibold text-gray-900 py-3">
                                            {formatCurrency(calculateFixedPayment(banksData[bankName]))}
                                        </td>
                                    ))}
                                </tr>

                                <tr className="border-t-2 border-gray-200">
                                    <td className="font-semibold text-gray-700 py-3">Prestação Variável (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center font-semibold text-purple-900 py-3">
                                            {formatCurrency(calculateVariablePayment(banksData[bankName]))}
                                        </td>
                                    ))}
                                </tr>

                                <tr className="bg-blue-50 border-l-4 border-blue-400">
                                    <td className="font-semibold text-blue-900 py-3 pl-4">Total Fixa + Custos (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center font-bold text-blue-700 py-3 text-lg">
                                            {formatCurrency(calculateFixedPayment(banksData[bankName]) + calculateTotalMonthlyCosts(banksData[bankName]))}
                                        </td>
                                    ))}
                                </tr>

                                <tr className="bg-purple-50 border-l-4 border-purple-400">
                                    <td className="font-semibold text-purple-900 py-3 pl-4">Total Variável + Custos (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center font-bold text-purple-700 py-3 text-lg">
                                            {formatCurrency(calculateVariablePayment(banksData[bankName]) + calculateTotalMonthlyCosts(banksData[bankName]))}
                                        </td>
                                    ))}
                                </tr>

                                {/* Outflow Inicial */}
                                <tr className="bg-green-50">
                                    <td className="font-semibold text-green-900" colSpan={bankNames.length + 1}>
                                        <div className="flex items-center space-x-2">
                                            <DollarSign className="h-5 w-5" />
                                            <span>Outflow Inicial</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="font-semibold text-gray-700">Prémios (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center font-semibold text-gray-900">
                                            +{formatCurrency(banksData[bankName].premios_entrada)}
                                        </td>
                                    ))}
                                </tr>

                                <tr>
                                    <td className="font-semibold text-gray-700">Comissões (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center font-semibold text-gray-900">
                                            -{formatCurrency(banksData[bankName].comissoes_iniciais)}
                                        </td>
                                    ))}
                                </tr>

                                <tr>
                                    <td className="font-semibold text-gray-700">Devolução Spread (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center font-semibold text-gray-900">
                                            {banksData[bankName].devolucao_spread ? '+' : ''}{formatCurrency(calculateSpreadRefund(banksData[bankName]))}
                                        </td>
                                    ))}
                                </tr>

                                <tr className="bg-green-50">
                                    <td className="font-semibold text-gray-700">Total Outflow Inicial (€)</td>
                                    {bankNames.map((bankName) => {
                                        const totalInitialCosts =
                                            banksData[bankName].premios_entrada -
                                            banksData[bankName].comissoes_iniciais +
                                            calculateSpreadRefund(banksData[bankName]);

                                        const isPositive = totalInitialCosts >= 0;

                                        return (
                                            <td key={bankName} className={`text-center font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                                {isPositive ? '+' : ''}{formatCurrency(totalInitialCosts)}
                                            </td>
                                        );
                                    })}
                                </tr>

                                {/* Custos Mensais */}
                                <tr className="bg-purple-50">
                                    <td className="font-semibold text-purple-900" colSpan={bankNames.length + 1}>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-5 w-5" />
                                            <span>Custos Mensais</span>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td className="font-semibold text-gray-700">Seguro Vida (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center text-gray-900">
                                            {formatCurrency(banksData[bankName].seguro_vida)}
                                        </td>
                                    ))}
                                </tr>

                                <tr>
                                    <td className="font-semibold text-gray-700">Seguro Multiriscos (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center text-gray-900">
                                            {formatCurrency(banksData[bankName].seguro_multiriscos)}
                                        </td>
                                    ))}
                                </tr>

                                <tr>
                                    <td className="font-semibold text-gray-700">Manutenção Conta (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center text-gray-900">
                                            {formatCurrency(banksData[bankName].manutencao_conta)}
                                        </td>
                                    ))}
                                </tr>

                                <tr>
                                    <td className="font-semibold text-gray-700">Outros (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center text-gray-900">
                                            {formatCurrency(banksData[bankName].outros)}
                                        </td>
                                    ))}
                                </tr>

                                <tr className="bg-red-50">
                                    <td className="font-semibold text-red-700">Total Custos Mensais (€)</td>
                                    {bankNames.map((bankName) => (
                                        <td key={bankName} className="text-center font-semibold text-red-600">
                                            {formatCurrency(calculateTotalMonthlyCosts(banksData[bankName]))}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
