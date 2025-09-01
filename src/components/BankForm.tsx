import { AlertCircle, Building2, Calculator, CheckCircle, ChevronLeft, ChevronRight, CreditCard, Euro, Save, TrendingUp, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { BankData } from '../types';

interface BankFormProps {
    bankName: string;
    data: BankData;
    onSave: (bankName: string, data: BankData) => void;
    onCancel: () => void;
    isEditing: boolean;
}

export const BankForm: React.FC<BankFormProps> = ({ bankName, data, onSave, onCancel, isEditing }) => {
    const [formData, setFormData] = useState<BankData>(data);
    const [newBankName, setNewBankName] = useState(isEditing ? bankName : '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(1);

    // No useEffect needed - the component will be recreated with the key prop

    // Bloquear scroll do body quando o modal estiver aberto
    useEffect(() => {
        document.body.classList.add('scroll-locked');

        return () => {
            document.body.classList.remove('scroll-locked');
        };
    }, []);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!newBankName.trim()) {
            newErrors.bankName = 'Nome do banco é obrigatório';
        }

        // Função auxiliar para validar campos numéricos
        const validateNumericField = (field: keyof BankData, fieldName: string, minValue: number = 0, allowZero: boolean = false) => {
            const value = formData[field];
            if (typeof value === 'string') {
                if (value === '' || value === '.' || value === '0') {
                    newErrors[field] = `${fieldName} é obrigatório`;
                } else {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        newErrors[field] = `${fieldName} deve ser um número válido`;
                    } else if (!allowZero && numValue <= minValue) {
                        newErrors[field] = `${fieldName} deve ser maior que ${minValue}`;
                    } else if (allowZero && numValue < minValue) {
                        newErrors[field] = `${fieldName} não pode ser menor que ${minValue}`;
                    }
                }
            } else if (typeof value === 'number') {
                if (!allowZero && value <= minValue) {
                    newErrors[field] = `${fieldName} deve ser maior que ${minValue}`;
                } else if (allowZero && value < minValue) {
                    newErrors[field] = `${fieldName} não pode ser menor que ${minValue}`;
                }
            }
        };

        validateNumericField('valor_emprestimo', 'Valor do empréstimo', 0, false);
        validateNumericField('tempo_emprestimo', 'Tempo do empréstimo', 0, false);
        // Removida validação obrigatória para taxa_fixa e periodo_fixa
        validateNumericField('seguro_vida', 'Seguro de vida', 0, true);
        validateNumericField('seguro_multiriscos', 'Seguro multiriscos', 0, true);
        validateNumericField('manutencao_conta', 'Manutenção de conta', 0, true);
        validateNumericField('premios_entrada', 'Prémios de entrada', 0, true);
        validateNumericField('comissoes_iniciais', 'Comissões iniciais', 0, true);
        validateNumericField('outros', 'Outros custos', 0, true);

        // Validação específica para anos de devolução do spread
        if (formData.devolucao_spread) {
            const anosDevolucao = typeof formData.anos_devolucao_spread === 'string' ?
                parseFloat(formData.anos_devolucao_spread) : formData.anos_devolucao_spread;
            const tempoEmprestimo = typeof formData.tempo_emprestimo === 'string' ?
                parseFloat(formData.tempo_emprestimo) : formData.tempo_emprestimo;

            if (isNaN(anosDevolucao) || anosDevolucao <= 0) {
                newErrors.anos_devolucao_spread = 'Anos de devolução do spread deve ser maior que 0';
            } else if (anosDevolucao > tempoEmprestimo) {
                newErrors.anos_devolucao_spread = 'Anos de devolução do spread não pode ser maior que o tempo do empréstimo';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            // Se há erros, ir para o primeiro passo que contém erros
            const errorFields = Object.keys(errors);
            if (errorFields.length > 0) {
                // Encontrar o primeiro passo com erro
                const firstErrorField = errorFields[0];
                const stepWithError = getFieldStep(firstErrorField);
                setActiveStep(stepWithError);
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // Converter todos os valores string para números antes de salvar
            const processedData: BankData = {
                ...formData,
                valor_emprestimo: typeof formData.valor_emprestimo === 'string' ? parseFloat(formData.valor_emprestimo) || 0 : formData.valor_emprestimo,
                tempo_emprestimo: typeof formData.tempo_emprestimo === 'string' ? parseFloat(formData.tempo_emprestimo) || 0 : formData.tempo_emprestimo,
                taxa_fixa: typeof formData.taxa_fixa === 'string' ? parseFloat(formData.taxa_fixa) || 0 : formData.taxa_fixa,
                periodo_fixa: typeof formData.periodo_fixa === 'string' ? parseFloat(formData.periodo_fixa) || 0 : formData.periodo_fixa,
                euribor: typeof formData.euribor === 'string' ? parseFloat(formData.euribor) || 0 : formData.euribor,
                spread: typeof formData.spread === 'string' ? parseFloat(formData.spread) || 0 : formData.spread,
                seguro_vida: typeof formData.seguro_vida === 'string' ? parseFloat(formData.seguro_vida) || 0 : formData.seguro_vida,
                seguro_multiriscos: typeof formData.seguro_multiriscos === 'string' ? parseFloat(formData.seguro_multiriscos) || 0 : formData.seguro_multiriscos,
                manutencao_conta: typeof formData.manutencao_conta === 'string' ? parseFloat(formData.manutencao_conta) || 0 : formData.manutencao_conta,
                premios_entrada: typeof formData.premios_entrada === 'string' ? parseFloat(formData.premios_entrada) || 0 : formData.premios_entrada,
                comissoes_iniciais: typeof formData.comissoes_iniciais === 'string' ? parseFloat(formData.comissoes_iniciais) || 0 : formData.comissoes_iniciais,
                outros: typeof formData.outros === 'string' ? parseFloat(formData.outros) || 0 : formData.outros,
                anos_devolucao_spread: typeof formData.anos_devolucao_spread === 'string' ? parseFloat(formData.anos_devolucao_spread) || 0 : formData.anos_devolucao_spread,
            };

            await onSave(newBankName, processedData);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof BankData, value: number | boolean | any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleNumberInputChange = (field: keyof BankData, value: string) => {
        // Permitir strings vazias e qualquer padrão numérico válido durante a digitação
        if (value === '' ||
            value === '.' ||
            value === '0' ||
            /^0\.$/.test(value) ||
            /^0\.\d*$/.test(value) ||
            /^\d+\.?\d*$/.test(value)) {
            // Manter como string para permitir digitação contínua
            setFormData(prev => ({ ...prev, [field]: value }));
        } else {
            // Verificar se é um número válido
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                handleInputChange(field, numValue);
            } else {
                // Se não for um número válido, manter o valor anterior
                setFormData(prev => ({ ...prev, [field]: prev[field] }));
            }
        }
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(3)}%`;
    };

    // Função para calcular prestação mensal
    const calcularPrestacao = (capital: number, taxaAnual: number, nMeses: number): number => {
        if (taxaAnual === 0 || nMeses === 0) return 0;
        const taxaMensal = taxaAnual / 12 / 100;
        return (capital * taxaMensal * Math.pow(1 + taxaMensal, nMeses)) / (Math.pow(1 + taxaMensal, nMeses) - 1);
    };

    // Função para calcular capital em dívida após período fixo
    const calcularCapitalRestante = (capitalInicial: number, taxaAnual: number, nMeses: number): number => {
        if (taxaAnual === 0 || nMeses === 0) return capitalInicial;

        const taxaMensal = taxaAnual / 12 / 100;
        const prestacao = calcularPrestacao(capitalInicial, taxaAnual, getNumericValue(formData.tempo_emprestimo) * 12);

        // Calcular capital restante após nMeses de pagamentos
        let capitalRestante = capitalInicial;
        for (let mes = 1; mes <= nMeses; mes++) {
            const juros = capitalRestante * taxaMensal;
            const amortizacao = prestacao - juros;
            capitalRestante = capitalRestante - amortizacao;
        }

        return Math.max(0, capitalRestante);
    };

    // Função para obter prestação usando mapa de dívida
    const obterPrestacaoMapaDivida = (data: BankData, mes: number): number => {
        const { gerarMapaDivida } = require('../utils/calculations');

        // Converter dados para valores numéricos para os cálculos
        const numericData: BankData = {
            ...data,
            valor_emprestimo: getNumericValue(data.valor_emprestimo),
            tempo_emprestimo: getNumericValue(data.tempo_emprestimo),
            taxa_fixa: getNumericValue(data.taxa_fixa),
            periodo_fixa: getNumericValue(data.periodo_fixa),
            euribor: getNumericValue(data.euribor),
            spread: getNumericValue(data.spread),
            seguro_vida: getNumericValue(data.seguro_vida),
            seguro_multiriscos: getNumericValue(data.seguro_multiriscos),
            manutencao_conta: getNumericValue(data.manutencao_conta),
            premios_entrada: getNumericValue(data.premios_entrada),
            comissoes_iniciais: getNumericValue(data.comissoes_iniciais),
            outros: getNumericValue(data.outros),
        };

        const debtMap = gerarMapaDivida(numericData, 'temp');
        const entry = debtMap.find((entry: any) => entry.Mês === mes);
        return entry ? entry["Prestação (€)"] : 0;
    };

    // Função auxiliar para obter valores numéricos de forma segura
    const getNumericValue = (value: any): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };

    // Função para obter o nome do campo em português
    const getFieldName = (field: string): string => {
        const fieldNames: Record<string, string> = {
            bankName: 'Nome do Banco',
            valor_emprestimo: 'Valor do Empréstimo',
            tempo_emprestimo: 'Tempo do Empréstimo',
            taxa_fixa: 'Taxa Fixa',
            periodo_fixa: 'Período Fixo',
            euribor: 'Euribor',
            spread: 'Spread',
            seguro_vida: 'Seguro de Vida',
            seguro_multiriscos: 'Seguro Multiriscos',
            manutencao_conta: 'Manutenção de Conta',
            outros: 'Outros Custos',
            premios_entrada: 'Prémios de Entrada',
            comissoes_iniciais: 'Comissões Iniciais',
            anos_devolucao_spread: 'Anos de Devolução do Spread'
        };
        return fieldNames[field] || field;
    };

    // Função para obter o passo onde o campo está localizado
    const getFieldStep = (field: string): number => {
        const fieldToStep: Record<string, number> = {
            bankName: 1,
            valor_emprestimo: 1,
            tempo_emprestimo: 1,
            taxa_fixa: 2,
            periodo_fixa: 2,
            euribor: 2,
            spread: 2,
            seguro_vida: 2,
            seguro_multiriscos: 2,
            manutencao_conta: 2,
            outros: 2,
            anos_devolucao_spread: 2,
            premios_entrada: 3,
            comissoes_iniciais: 3,
        };
        return fieldToStep[field] || 1;
    };

    const totalMonthlyCosts = getNumericValue(formData.seguro_vida) +
        getNumericValue(formData.seguro_multiriscos) +
        getNumericValue(formData.manutencao_conta) +
        getNumericValue(formData.outros);

    const steps = [
        { id: 1, title: 'Informações Básicas', icon: Building2, color: 'blue' },
        { id: 2, title: 'Taxas e Custos', icon: Calculator, color: 'green' },
        { id: 3, title: 'Outflow Inicial', icon: CreditCard, color: 'purple' },
        { id: 4, title: 'Resumo', icon: CheckCircle, color: 'emerald' }
    ];

    const renderStepContent = () => {
        switch (activeStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="form-group">
                                    <label className="form-label">
                                        Nome do Banco *
                                    </label>
                                    <input
                                        type="text"
                                        value={newBankName}
                                        onChange={(e) => {
                                            setNewBankName(e.target.value);
                                            if (errors.bankName) setErrors(prev => ({ ...prev, bankName: '' }));
                                        }}
                                        className={`input ${errors.bankName ? 'input-error' : ''}`}
                                        placeholder="Ex: Banco de Portugal"
                                    />
                                    {errors.bankName && (
                                        <p className="form-error">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>{errors.bankName}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Valor do Empréstimo (€) *
                                    </label>
                                    <input
                                        type="text"
                                        value={typeof formData.valor_emprestimo === 'string' ? formData.valor_emprestimo : (formData.valor_emprestimo || '')}
                                        onChange={(e) => handleNumberInputChange('valor_emprestimo', e.target.value)}
                                        className={`input ${errors.valor_emprestimo ? 'input-error' : ''}`}
                                        placeholder="Ex: 200000"
                                    />
                                    {errors.valor_emprestimo && (
                                        <p className="form-error">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>{errors.valor_emprestimo}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Prazo (anos) *
                                    </label>
                                    <input
                                        type="text"
                                        value={typeof formData.tempo_emprestimo === 'string' ? formData.tempo_emprestimo : (formData.tempo_emprestimo || '')}
                                        onChange={(e) => handleNumberInputChange('tempo_emprestimo', e.target.value)}
                                        className={`input ${errors.tempo_emprestimo ? 'input-error' : ''}`}
                                        placeholder="Ex: 30"
                                    />
                                    {errors.tempo_emprestimo && (
                                        <p className="form-error">
                                            <AlertCircle className="h-4 w-4" />
                                            <span>{errors.tempo_emprestimo}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Calculator className="h-5 w-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Taxas e Custos Mensais</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Taxas */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800 text-base">Taxas</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">
                                                Taxa Fixa (%)
                                            </label>
                                            <input
                                                type="text"
                                                value={String(formData.taxa_fixa) === '0' ? '0' : (formData.taxa_fixa ?? '')}
                                                onChange={(e) => handleNumberInputChange('taxa_fixa', e.target.value)}
                                                className={`input ${errors.taxa_fixa ? 'input-error' : ''}`}
                                                placeholder="Ex: 3.5"
                                            />
                                            {errors.taxa_fixa && (
                                                <p className="form-error">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.taxa_fixa}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Período Fixo (anos)
                                            </label>
                                            <input
                                                type="text"
                                                value={String(formData.periodo_fixa) === '0' ? '0' : (formData.periodo_fixa ?? '')}
                                                onChange={(e) => handleNumberInputChange('periodo_fixa', e.target.value)}
                                                className="input"
                                                placeholder="Ex: 2"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Euribor (%)
                                            </label>
                                            <input
                                                type="text"
                                                value={typeof formData.euribor === 'string' ? formData.euribor : (formData.euribor || '')}
                                                onChange={(e) => handleNumberInputChange('euribor', e.target.value)}
                                                className="input"
                                                placeholder="Ex: 2.081"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Spread (%)
                                            </label>
                                            <input
                                                type="text"
                                                value={typeof formData.spread === 'string' ? formData.spread : (formData.spread || '')}
                                                onChange={(e) => handleNumberInputChange('spread', e.target.value)}
                                                className={`input ${errors.spread ? 'input-error' : ''}`}
                                                placeholder="Ex: 0.5"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Custos Mensais */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800 text-base">Custos Mensais</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label className="form-label">
                                                Seguro de Vida (€/mês)
                                            </label>
                                            <input
                                                type="text"
                                                value={typeof formData.seguro_vida === 'string' ? formData.seguro_vida : (formData.seguro_vida || '')}
                                                onChange={(e) => handleNumberInputChange('seguro_vida', e.target.value)}
                                                className={`input ${errors.seguro_vida ? 'input-error' : ''}`}
                                                placeholder="Ex: 5.00"
                                            />
                                            {errors.seguro_vida && (
                                                <p className="form-error">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.seguro_vida}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Seguro Multirriscos (€/mês)
                                            </label>
                                            <input
                                                type="text"
                                                value={typeof formData.seguro_multiriscos === 'string' ? formData.seguro_multiriscos : (formData.seguro_multiriscos || '')}
                                                onChange={(e) => handleNumberInputChange('seguro_multiriscos', e.target.value)}
                                                className={`input ${errors.seguro_multiriscos ? 'input-error' : ''}`}
                                                placeholder="Ex: 3.50"
                                            />
                                            {errors.seguro_multiriscos && (
                                                <p className="form-error">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.seguro_multiriscos}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Manutenção de Conta (€/mês)
                                            </label>
                                            <input
                                                type="text"
                                                value={typeof formData.manutencao_conta === 'string' ? formData.manutencao_conta : (formData.manutencao_conta || '')}
                                                onChange={(e) => handleNumberInputChange('manutencao_conta', e.target.value)}
                                                className={`input ${errors.manutencao_conta ? 'input-error' : ''}`}
                                                placeholder="Ex: 10.00"
                                            />
                                            {errors.manutencao_conta && (
                                                <p className="form-error">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.manutencao_conta}</span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Outros Custos (€/mês)
                                            </label>
                                            <input
                                                type="text"
                                                value={typeof formData.outros === 'string' ? formData.outros : (formData.outros || '')}
                                                onChange={(e) => handleNumberInputChange('outros', e.target.value)}
                                                className={`input ${errors.outros ? 'input-error' : ''}`}
                                                placeholder="Ex: 5.00"
                                            />
                                            {errors.outros && (
                                                <p className="form-error">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span>{errors.outros}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <input
                                                type="checkbox"
                                                id="devolucao_spread"
                                                checked={formData.devolucao_spread}
                                                onChange={(e) => handleInputChange('devolucao_spread', e.target.checked)}
                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500 h-5 w-5"
                                            />
                                            <label htmlFor="devolucao_spread" className="text-sm font-medium text-gray-700">
                                                Devolução do Spread
                                            </label>
                                        </div>

                                        {formData.devolucao_spread && (
                                            <div className="form-group">
                                                <label className="form-label">
                                                    Anos de Duração da Devolução do Spread
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={getNumericValue(formData.tempo_emprestimo)}
                                                    value={typeof formData.anos_devolucao_spread === 'string' ? formData.anos_devolucao_spread : (formData.anos_devolucao_spread || '')}
                                                    onChange={(e) => handleNumberInputChange('anos_devolucao_spread', e.target.value)}
                                                    className={`input ${errors.anos_devolucao_spread ? 'input-error' : ''}`}
                                                    placeholder="Ex: 2"
                                                />
                                                {errors.anos_devolucao_spread && (
                                                    <p className="form-error">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{errors.anos_devolucao_spread}</span>
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Define por quantos anos a devolução do spread será aplicada
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Resumo dos Custos Mensais */}
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Total Custos Mensais:</span>
                                        <span className="font-semibold text-lg text-green-700">{formatCurrency(totalMonthlyCosts)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Outflow Inicial</h3>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label">
                                            Prémios de Entrada (€)
                                        </label>
                                        <input
                                            type="text"
                                            value={typeof formData.premios_entrada === 'string' ? formData.premios_entrada : (formData.premios_entrada || '')}
                                            onChange={(e) => handleNumberInputChange('premios_entrada', e.target.value)}
                                            className={`input ${errors.premios_entrada ? 'input-error' : ''}`}
                                            placeholder="Ex: 200.00"
                                        />
                                        {errors.premios_entrada && (
                                            <p className="form-error">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.premios_entrada}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Comissões Iniciais (€)
                                        </label>
                                        <input
                                            type="text"
                                            value={typeof formData.comissoes_iniciais === 'string' ? formData.comissoes_iniciais : (formData.comissoes_iniciais || '')}
                                            onChange={(e) => handleNumberInputChange('comissoes_iniciais', e.target.value)}
                                            className={`input ${errors.comissoes_iniciais ? 'input-error' : ''}`}
                                            placeholder="Ex: 300.00"
                                        />
                                        {errors.comissoes_iniciais && (
                                            <p className="form-error">
                                                <AlertCircle className="h-4 w-4" />
                                                <span>{errors.comissoes_iniciais}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Resumo dos Custos Iniciais */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-sm font-medium text-gray-700">Prémios de Entrada:</span>
                                        <span className="font-semibold text-green-700">+{formatCurrency(getNumericValue(formData.premios_entrada))}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                                        <span className="text-sm font-medium text-gray-700">Comissões Iniciais:</span>
                                        <span className="font-semibold text-red-700">-{formatCurrency(getNumericValue(formData.comissoes_iniciais))}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <span className="text-sm font-medium text-gray-700">Saldo Inicial:</span>
                                        <span className={`font-semibold text-lg ${getNumericValue(formData.premios_entrada) >= getNumericValue(formData.comissoes_iniciais) ? 'text-green-700' : 'text-red-700'}`}>
                                            {getNumericValue(formData.premios_entrada) >= getNumericValue(formData.comissoes_iniciais) ? '+' : ''}
                                            {formatCurrency(getNumericValue(formData.premios_entrada) - getNumericValue(formData.comissoes_iniciais))}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        {/* Hidden input to ensure form submission works */}
                        <input type="hidden" value="summary" />
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Resumo da Proposta</h3>
                            </div>

                            {/* Seção de Erros do Formulário - MOVIDA PARA O TOPO */}
                            {Object.keys(errors).length > 0 && (
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                                    <h4 className="font-semibold text-red-900 mb-3 flex items-center space-x-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <span>Erros no Formulário</span>
                                    </h4>
                                    <div className="space-y-2">
                                        <p className="text-sm text-red-700 mb-3">
                                            Por favor, corrija os seguintes erros antes de guardar o banco:
                                        </p>
                                        <div className="space-y-2">
                                            {Object.entries(errors).map(([field, error]) => (
                                                <div key={field} className="flex items-start space-x-2 p-2 bg-red-100 rounded-lg">
                                                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="font-medium text-red-800">
                                                                {getFieldName(field)}:
                                                            </span>
                                                            <span className="text-sm text-red-700">
                                                                {error}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveStep(getFieldStep(field))}
                                                            className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                                                        >
                                                            Ir para o Passo {getFieldStep(field)} para corrigir
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Informações Principais */}
                            <div className="data-grid mb-6">
                                <div className="data-item">
                                    <div className="data-label">Valor do Empréstimo</div>
                                    <div className="data-value">{formatCurrency(getNumericValue(formData.valor_emprestimo))}</div>
                                </div>

                                <div className="data-item">
                                    <div className="data-label">Prazo Total</div>
                                    <div className="data-value">{getNumericValue(formData.tempo_emprestimo)} anos</div>
                                    <div className="text-xs text-gray-500">({getNumericValue(formData.tempo_emprestimo) * 12} meses)</div>
                                </div>

                                <div className="data-item">
                                    <div className="data-label">Taxa Fixa</div>
                                    <div className="data-value">{formatPercentage(getNumericValue(formData.taxa_fixa))}</div>
                                    <div className="text-xs text-gray-500">Período: {getNumericValue(formData.periodo_fixa)} anos</div>
                                </div>

                                <div className="data-item">
                                    <div className="data-label">Custos Mensais</div>
                                    <div className="data-value">{formatCurrency(totalMonthlyCosts)}</div>
                                </div>
                            </div>

                            {/* Taxas e Spread */}
                            <div className="data-grid mb-6">
                                <div className="data-item">
                                    <div className="data-label">Euribor</div>
                                    <div className="data-value">{formatPercentage(getNumericValue(formData.euribor))}</div>
                                </div>

                                <div className="data-item">
                                    <div className="data-label">Spread</div>
                                    <div className="data-value">{formatPercentage(getNumericValue(formData.spread))}</div>
                                </div>

                                <div className="data-item">
                                    <div className="data-label">Devolução Spread</div>
                                    <div className="data-value">
                                        {formData.devolucao_spread ? `Sim (${getNumericValue(formData.anos_devolucao_spread)} anos)` : 'Não'}
                                    </div>
                                </div>
                            </div>

                            {/* Prestações por Período */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Prestação Período Fixo */}
                                <div className="data-card">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                        <Calculator className="h-4 w-4 text-blue-600" />
                                        <span>Prestação Período Fixo</span>
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Taxa Aplicada:</span>
                                            <span className="font-medium text-blue-700">{formatPercentage(getNumericValue(formData.taxa_fixa))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Duração:</span>
                                            <span className="font-medium">{getNumericValue(formData.periodo_fixa)} anos</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Prestação Mensal:</span>
                                            <span className="font-semibold text-lg text-blue-700">
                                                {formatCurrency(obterPrestacaoMapaDivida(formData, 1))}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total com Custos:</span>
                                            <span className="font-semibold text-lg text-blue-700">
                                                {formatCurrency(obterPrestacaoMapaDivida(formData, 1) + totalMonthlyCosts)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Capital em Dívida (após {getNumericValue(formData.periodo_fixa)} anos):</span>
                                            <span className="font-medium text-blue-600">
                                                {formatCurrency(calcularCapitalRestante(getNumericValue(formData.valor_emprestimo), getNumericValue(formData.taxa_fixa), getNumericValue(formData.periodo_fixa) * 12))}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Prestação Período Variável */}
                                <div className="data-card">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-purple-600" />
                                        <span>Prestação Período Variável</span>
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Taxa Aplicada:</span>
                                            <span className="font-medium text-purple-700">{formatPercentage(getNumericValue(formData.euribor) + getNumericValue(formData.spread))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Duração:</span>
                                            <span className="font-medium">
                                                {getNumericValue(formData.periodo_fixa) >= getNumericValue(formData.tempo_emprestimo) ?
                                                    'N/A (apenas período fixo)' :
                                                    `${getNumericValue(formData.tempo_emprestimo) - getNumericValue(formData.periodo_fixa)} anos`
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Prestação Mensal:</span>
                                            <span className="font-semibold text-lg text-purple-700">
                                                {getNumericValue(formData.periodo_fixa) >= getNumericValue(formData.tempo_emprestimo) ?
                                                    'N/A (apenas período fixo)' :
                                                    formatCurrency(obterPrestacaoMapaDivida(formData, getNumericValue(formData.periodo_fixa) * 12 + 1))
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total com Custos:</span>
                                            <span className="font-semibold text-lg text-purple-700">
                                                {getNumericValue(formData.periodo_fixa) >= getNumericValue(formData.tempo_emprestimo) ?
                                                    'N/A (apenas período fixo)' :
                                                    formatCurrency(obterPrestacaoMapaDivida(formData, getNumericValue(formData.periodo_fixa) * 12 + 1) + totalMonthlyCosts)
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Capital em Dívida (início período variável):</span>
                                            <span className="font-medium text-purple-600">
                                                {getNumericValue(formData.periodo_fixa) >= getNumericValue(formData.tempo_emprestimo) ?
                                                    'N/A (apenas período fixo)' :
                                                    formatCurrency(calcularCapitalRestante(getNumericValue(formData.valor_emprestimo), getNumericValue(formData.taxa_fixa), getNumericValue(formData.periodo_fixa) * 12))
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Custos Detalhados */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Custos Mensais Detalhados */}
                                <div className="data-card">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                        <CreditCard className="h-4 w-4 text-emerald-600" />
                                        <span>Custos Mensais Detalhados</span>
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Seguro de Vida:</span>
                                            <span className="font-medium">{formatCurrency(getNumericValue(formData.seguro_vida))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Seguro Multirriscos:</span>
                                            <span className="font-medium">{formatCurrency(getNumericValue(formData.seguro_multiriscos))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Manutenção de Conta:</span>
                                            <span className="font-medium">{formatCurrency(getNumericValue(formData.manutencao_conta))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Outros Custos:</span>
                                            <span className="font-medium">{formatCurrency(getNumericValue(formData.outros))}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-semibold text-emerald-700">
                                            <span>Total Mensal:</span>
                                            <span>{formatCurrency(totalMonthlyCosts)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Custos Iniciais */}
                                <div className="data-card">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                        <Euro className="h-4 w-4 text-emerald-600" />
                                        <span>Outflow Inicial</span>
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Prémios de Entrada:</span>
                                            <span className="font-medium text-green-700">+{formatCurrency(getNumericValue(formData.premios_entrada))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Comissões Iniciais:</span>
                                            <span className="font-medium text-orange-700">-{formatCurrency(getNumericValue(formData.comissoes_iniciais))}</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-semibold">
                                            <span>Saldo Inicial:</span>
                                            <span className={`${getNumericValue(formData.premios_entrada) >= getNumericValue(formData.comissoes_iniciais) ? 'text-green-700' : 'text-red-700'}`}>
                                                {getNumericValue(formData.premios_entrada) >= getNumericValue(formData.comissoes_iniciais) ? '+' : ''}
                                                {formatCurrency(getNumericValue(formData.premios_entrada) - getNumericValue(formData.comissoes_iniciais))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Amortizações Antecipadas */}
                            {(formData.amortizacoes && formData.amortizacoes.length > 0) && (
                                <div className="data-card mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                                        <span>Amortizações Antecipadas</span>
                                    </h4>
                                    <div className="data-grid">
                                        <div className="data-item">
                                            <div className="data-label">Total Amortizações</div>
                                            <div className="data-value">
                                                {formatCurrency(formData.amortizacoes.reduce((total, a) => total + a.valor, 0))}
                                            </div>
                                        </div>
                                        <div className="data-item">
                                            <div className="data-label">Número de Amortizações</div>
                                            <div className="data-value">
                                                {formData.amortizacoes.length}
                                            </div>
                                        </div>
                                        <div className="data-item">
                                            <div className="data-label">Média por Amortização</div>
                                            <div className="data-value">
                                                {formatCurrency(formData.amortizacoes.reduce((total, a) => total + a.valor, 0) / formData.amortizacoes.length)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Resumo Final */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                    <span>Resumo Final da Proposta</span>
                                </h4>
                                <div className="data-grid text-sm">
                                    <div className="data-item">
                                        <div className="data-label">Valor Total</div>
                                        <div className="data-value">{formatCurrency(getNumericValue(formData.valor_emprestimo))}</div>
                                    </div>
                                    <div className="data-item">
                                        <div className="data-label">Custos Anuais</div>
                                        <div className="data-value">{formatCurrency(totalMonthlyCosts * 12)}</div>
                                    </div>
                                    <div className="data-item">
                                        <div className="data-label">Custos Iniciais</div>
                                        <div className="data-value">{formatCurrency(getNumericValue(formData.comissoes_iniciais))}</div>
                                    </div>
                                    <div className="data-item">
                                        <div className="data-label">Prémios de Entrada</div>
                                        <div className="data-value">{formatCurrency(getNumericValue(formData.premios_entrada))}</div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {isEditing ? 'Editar Banco' : 'Adicionar Novo Banco'}
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {newBankName || 'Nome do banco'}
                                </p>
                                {Object.keys(errors).length > 0 && (
                                    <div className="flex items-center space-x-1 mt-1">
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                        <span className="text-xs text-red-600 font-medium">
                                            {Object.keys(errors).length} erro(s) no formulário
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                            aria-label="Fechar"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-6">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center space-x-2">
                                {steps.map((step, index) => {
                                    // Verificar se este passo tem erros
                                    const stepHasErrors = Object.keys(errors).some(field => getFieldStep(field) === step.id);

                                    return (
                                        <div key={step.id} className="flex items-center">
                                            <button
                                                onClick={() => setActiveStep(step.id)}
                                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 relative ${activeStep === step.id
                                                    ? 'bg-blue-600 text-white shadow-lg'
                                                    : activeStep > step.id
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                                    } ${stepHasErrors ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}
                                            >
                                                {activeStep > step.id ? (
                                                    <CheckCircle className="h-5 w-5" />
                                                ) : (
                                                    <step.icon className="h-5 w-5" />
                                                )}
                                                {stepHasErrors && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                        <span className="text-xs text-white font-bold">
                                                            {Object.keys(errors).filter(field => getFieldStep(field) === step.id).length}
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                            {index < steps.length - 1 && (
                                                <div className={`w-12 h-0.5 mx-2 rounded-full ${activeStep > step.id ? 'bg-green-400' : 'bg-gray-300'
                                                    }`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="mt-3 text-center">
                            <span className="text-sm font-medium text-gray-700">
                                {steps[activeStep - 1].title}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 pb-4">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {renderStepContent()}
                    </form>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Passo {activeStep} de {steps.length}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                            {!isEditing && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="btn-secondary w-full sm:w-auto flex items-center justify-center space-x-2"
                                    disabled={isSubmitting}
                                >
                                    <X className="h-4 w-4" />
                                    <span>Cancelar</span>
                                </button>
                            )}

                            {activeStep > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(activeStep - 1)}
                                    className="btn-secondary w-full sm:w-auto flex items-center justify-center space-x-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span>Anterior</span>
                                </button>
                            )}

                            {activeStep < steps.length ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveStep(activeStep + 1)}
                                    className="btn-primary w-full sm:w-auto flex items-center justify-center space-x-2"
                                >
                                    <span>Próximo</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-success w-full sm:w-auto flex items-center justify-center space-x-2"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        // Validar o formulário antes de submeter
                                        if (!validateForm()) {
                                            // Se há erros, o usuário será redirecionado para o passo com erro
                                            // e os erros serão exibidos no passo 4
                                            return;
                                        }
                                        handleSubmit({ preventDefault: () => { } } as any);
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            <span>{isEditing ? 'Atualizar Banco' : 'Adicionar Banco'}</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
