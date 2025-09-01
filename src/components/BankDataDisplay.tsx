import { Clock, CreditCard, DollarSign, Edit, Gift, Globe, Heart, Lock, RefreshCw, Trash2, TrendingUp } from 'lucide-react';
import React from 'react';
import { BankData } from '../types';

interface BankDataDisplayProps {
    bankName: string;
    data: BankData;
    onEdit: () => void;
    onDelete: () => void;
}

export const BankDataDisplay: React.FC<BankDataDisplayProps> = ({ bankName, data, onEdit, onDelete }) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(3)}%`;
    };

    // Calculate spread refund (same logic as in ProposalComparisonTable)
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

    // Calculate total premiums including spread refund
    const totalPremiums = data.premios_entrada + calculateSpreadRefund(data);

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                    onClick={onEdit}
                    className="btn-secondary flex items-center justify-center space-x-2"
                >
                    <Edit className="h-4 w-4" />
                    <span>Editar</span>
                </button>
                <button
                    onClick={onDelete}
                    className="btn-error flex items-center justify-center space-x-2"
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                </button>
            </div>

            {/* Data Grid */}
            <div className="data-grid">
                <div className="data-item">
                    <div className="flex items-center space-x-2 mb-2">
                        <Heart className="h-4 w-4 text-blue-600" />
                        <div className="data-label">Taxa Fixa</div>
                    </div>
                    <div className="data-value">{formatPercentage(data.taxa_fixa)}</div>
                </div>

                <div className="data-item">
                    <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-red-600" />
                        <div className="data-label">Spread</div>
                    </div>
                    <div className="data-value">{formatPercentage(data.spread)}</div>
                </div>

                <div className="data-item">
                    <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                        <div className="data-label">Empréstimo</div>
                    </div>
                    <div className="data-value">{formatCurrency(data.valor_emprestimo)}</div>
                </div>

                <div className="data-item">
                    <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <div className="data-label">Prazo</div>
                    </div>
                    <div className="data-value">{data.tempo_emprestimo} anos</div>
                </div>

                <div className="data-item">
                    <div className="flex items-center space-x-2 mb-2">
                        <Lock className="h-4 w-4 text-amber-600" />
                        <div className="data-label">Período Fixo</div>
                    </div>
                    <div className="data-value">{data.periodo_fixa} anos</div>
                </div>

                <div className="data-item">
                    <div className="flex items-center space-x-2 mb-2">
                        <Globe className="h-4 w-4 text-cyan-600" />
                        <div className="data-label">Euribor</div>
                    </div>
                    <div className="data-value">{formatPercentage(data.euribor)}</div>
                </div>

                <div className="data-item">
                    <div className="flex items-center space-x-2 mb-2">
                        <Gift className="h-4 w-4 text-green-600" />
                        <div className="data-label">
                            {data.devolucao_spread ? 'Prémios + Spread' : 'Prémios'}
                        </div>
                    </div>
                    <div className="data-value text-green-600">+{formatCurrency(totalPremiums)}</div>
                    {data.devolucao_spread && (
                        <div className="text-xs text-green-600 mt-1">
                            (inclui {formatCurrency(calculateSpreadRefund(data))} spread)
                        </div>
                    )}
                </div>

                <div className="data-item">
                    <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="h-4 w-4 text-red-600" />
                        <div className="data-label">Comissões</div>
                    </div>
                    <div className="data-value text-red-600">-{formatCurrency(data.comissoes_iniciais)}</div>
                </div>

                <div className="data-item">
                    <div className="flex items-center space-x-2 mb-2">
                        <RefreshCw className="h-4 w-4 text-gray-600" />
                        <div className="data-label">Devolução Spread</div>
                    </div>
                    <div className="data-value">
                        {data.devolucao_spread ? (
                            <span className="text-green-600">Sim ({data.anos_devolucao_spread} anos)</span>
                        ) : (
                            <span className="text-red-600">Não</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Amortizações Section */}
            {(data.amortizacoes && data.amortizacoes.length > 0) && (
                <div className="data-card">
                    <div className="flex items-center space-x-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        <h4 className="text-lg font-semibold text-emerald-900">Amortizações Antecipadas</h4>
                    </div>

                    <div className="data-grid mb-4">
                        <div className="data-item">
                            <div className="data-label">Total Amortizações</div>
                            <div className="data-value">
                                {formatCurrency(data.amortizacoes.reduce((total, a) => total + a.valor, 0))}
                            </div>
                        </div>
                        <div className="data-item">
                            <div className="data-label">Número de Amortizações</div>
                            <div className="data-value">
                                {data.amortizacoes.length}
                            </div>
                        </div>
                        <div className="data-item">
                            <div className="data-label">Média por Amortização</div>
                            <div className="data-value">
                                {formatCurrency(data.amortizacoes.reduce((total, a) => total + a.valor, 0) / data.amortizacoes.length)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {data.amortizacoes.map((amortizacao, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-semibold">{index + 1}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            Amortização {index + 1}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Prestação: {formatCurrency(amortizacao.prestacao)}
                                        </div>
                                    </div>
                                </div>
                                <div className="font-semibold text-emerald-700">
                                    {formatCurrency(amortizacao.valor)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
