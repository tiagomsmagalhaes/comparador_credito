import { Building2, Calendar, Euro, Info, Plus, Trash2, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { Amortizacao } from '../types';

interface AmortizacoesFormProps {
    amortizacoes: Amortizacao[];
    onAmortizacoesChange: (amortizacoes: Amortizacao[]) => void;
    tempoEmprestimo: number;
    banksData: { [key: string]: any };
    selectedBanks: string[];
    onSelectedBanksChange: (selectedBanks: string[]) => void;
    onBanksDataChange?: (banksData: { [key: string]: any }) => void;
}

const AmortizacoesForm: React.FC<AmortizacoesFormProps> = ({
    amortizacoes,
    onAmortizacoesChange,
    tempoEmprestimo,
    banksData,
    selectedBanks,
    onSelectedBanksChange,
    onBanksDataChange
}) => {
    const [novaPrestacao, setNovaPrestacao] = useState<number>(1);
    const [novoValor, setNovoValor] = useState<number>(0);

    const adicionarAmortizacao = () => {
        if (novaPrestacao > 0 && novaPrestacao <= tempoEmprestimo * 12 && novoValor > 0) {
            const novaAmortizacao: Amortizacao = {
                prestacao: novaPrestacao,
                valor: novoValor
            };

            const amortizacoesAtualizadas = [...amortizacoes, novaAmortizacao]
                .sort((a, b) => a.prestacao - b.prestacao);

            onAmortizacoesChange(amortizacoesAtualizadas);
            setNovaPrestacao(1);
            setNovoValor(0);
        }
    };

    const removerAmortizacao = (index: number) => {
        const amortizacoesAtualizadas = amortizacoes.filter((_, i) => i !== index);
        onAmortizacoesChange(amortizacoesAtualizadas);
    };

    const totalAmortizacoes = amortizacoes.reduce((total, a) => total + a.valor, 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Seção Combinada: Seleção de Bancos + Adição de Amortização */}
            <div className="bg-white/80 rounded-xl p-6 border border-blue-200 shadow-sm">
                {/* Formulário de Adição */}
                <div className="mb-4">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-1.5 bg-orange-500 rounded-lg">
                            <Plus className="h-4 w-4 text-white" />
                        </div>
                        <h5 className="text-sm font-semibold text-orange-900">Adicionar Amortização</h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700">
                                Prestação
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={novaPrestacao || ''}
                                    onChange={(e) => setNovaPrestacao(Number(e.target.value) || 0)}
                                    className="input pl-10 h-10 text-sm"
                                    placeholder="Ex: 38"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                {Math.ceil(novaPrestacao / 12)}º ano, {novaPrestacao % 12 || 12}º mês
                            </p>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700">
                                Valor (€)
                            </label>
                            <div className="relative">
                                <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={novoValor || ''}
                                    onChange={(e) => setNovoValor(Number(e.target.value) || 0)}
                                    className="input pl-10 h-10 text-sm"
                                    placeholder="Ex: 10000"
                                />
                            </div>
                            <div className="h-4"></div> {/* Spacer to align with helper text */}
                        </div>

                        <div className="space-y-1">
                            <label className="block text-xs font-semibold text-gray-700">
                                &nbsp; {/* Invisible label for alignment */}
                            </label>
                            <button
                                onClick={adicionarAmortizacao}
                                disabled={novaPrestacao <= 0 || novaPrestacao > tempoEmprestimo * 12 || novoValor <= 0}
                                className="btn-primary w-full h-10 flex items-center justify-center space-x-2 text-sm"
                            >
                                <Plus className="h-3 w-3" />
                                <span>Adicionar</span>
                            </button>
                            <div className="h-4"></div> {/* Spacer to align with helper text */}
                        </div>
                    </div>
                </div>

                {/* Seleção de Bancos */}
                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">
                            Bancos selecionados ({selectedBanks.length}/{Object.keys(banksData).length}):
                        </p>
                        {selectedBanks.length > 0 && (
                            <button
                                onClick={() => onSelectedBanksChange([])}
                                className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            >
                                Limpar todos
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {Object.keys(banksData).map(bankName => (
                            <label key={bankName} className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 border ${selectedBanks.includes(bankName)
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                }`}>
                                <input
                                    type="checkbox"
                                    checked={selectedBanks.includes(bankName)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            onSelectedBanksChange([...selectedBanks, bankName]);
                                        } else {
                                            onSelectedBanksChange(selectedBanks.filter(bank => bank !== bankName));
                                        }
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3"
                                />
                                <Building2 className="h-3 w-3" />
                                <span className="text-xs font-medium">{bankName}</span>
                            </label>
                        ))}
                    </div>

                    {selectedBanks.length === 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800">
                                ⚠️ Selecione pelo menos um banco para aplicar as amortizações.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lista de Amortizações por Banco */}
            <div className="bg-white/80 rounded-xl p-6 border border-green-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-green-500 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-green-900">Amortizações por Banco</h4>
                </div>

                <div className="space-y-4">
                    {Object.keys(banksData).map(bankName => {
                        const bankAmortizacoes = banksData[bankName]?.amortizacoes || [];
                        const totalBanco = bankAmortizacoes.reduce((total: number, a: any) => total + a.valor, 0);
                        const isSelected = selectedBanks.includes(bankName);

                        return (
                            <div key={bankName} className={`border rounded-lg p-4 ${isSelected ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                                }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-green-100' : 'bg-gray-100'
                                            }`}>
                                            <Building2 className={`h-4 w-4 ${isSelected ? 'text-green-600' : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <h5 className={`font-semibold ${isSelected ? 'text-green-900' : 'text-gray-700'
                                                }`}>
                                                {bankName}
                                                {isSelected && (
                                                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                        Selecionado
                                                    </span>
                                                )}
                                            </h5>
                                            <p className="text-xs text-gray-500">
                                                Total: {formatCurrency(totalBanco)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {bankAmortizacoes.length > 0 ? (
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {bankAmortizacoes.map((amortizacao: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                                <div className="flex items-center space-x-3">
                                                    <Calendar className="h-3 w-3 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">
                                                            Prestação {amortizacao.prestacao}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {Math.ceil(amortizacao.prestacao / 12)}º ano, {amortizacao.prestacao % 12 || 12}º mês
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-semibold text-green-700">
                                                        {formatCurrency(amortizacao.valor)}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            console.log('Removendo amortização:', { bankName, index, amortizacao });

                                                            // Remover a amortização específica do banco
                                                            const updatedAmortizacoes = bankAmortizacoes.filter((_: any, i: number) => i !== index);

                                                            // Criar uma cópia atualizada dos dados dos bancos
                                                            const updatedBanksData = { ...banksData };
                                                            updatedBanksData[bankName] = {
                                                                ...updatedBanksData[bankName],
                                                                amortizacoes: updatedAmortizacoes
                                                            };

                                                            // Atualizar o estado global dos bancos
                                                            if (onBanksDataChange) {
                                                                onBanksDataChange(updatedBanksData);
                                                            }
                                                        }}
                                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500">Nenhuma amortização configurada</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Informações */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                        <Info className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-2">Como funcionam as amortizações antecipadas:</p>
                        <ul className="space-y-1">
                            <li>• <strong>Timing:</strong> Aplicadas na prestação especificada</li>
                            <li>• <strong>Efeito:</strong> Reduzem o capital em dívida imediatamente</li>
                            <li>• <strong>Recálculo:</strong> As prestações seguintes são recalculadas automaticamente</li>
                            <li>• <strong>Economia:</strong> Reduzem significativamente o total de juros pagos</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AmortizacoesForm;
