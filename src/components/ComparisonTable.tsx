import { Award, Building2, Calendar } from 'lucide-react';
import React from 'react';
import { YearlyComparison } from '../types';

interface ComparisonTableProps {
    data: YearlyComparison[];
    year: number;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ data, year }) => {
    const sortedData = [...data].sort((a, b) => a["CashOut Líquido (€)"] - b["CashOut Líquido (€)"]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                    {year}º Ano
                </h3>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
                {sortedData.map((row, index) => (
                    <div
                        key={row.Banco}
                        className={`p-4 rounded-xl border-2 transition-all ${index === 0
                            ? 'border-blue-300 bg-blue-50 shadow-sm'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-gray-900">{row.Banco}</h4>
                            </div>
                            {index === 0 && (
                                <div className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    <Award className="h-3 w-3 mr-1" />
                                    Melhor
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center bg-white rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1 font-medium">Prestação</div>
                                <div className="font-bold text-gray-900">{formatCurrency(row["Prestação Mensal (€)"])}</div>
                            </div>
                            <div className="text-center bg-white rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1 font-medium">Total</div>
                                <div className="font-bold text-gray-900">{formatCurrency(row["Total Mensal (€)"])}</div>
                            </div>
                            <div className="text-center bg-white rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1 font-medium">Capital em Dívida</div>
                                <div className="font-bold text-gray-900">{formatCurrency(row["Capital em Dívida (€)"])}</div>
                            </div>
                            <div className="text-center bg-white rounded-lg p-3">
                                <div className="text-xs text-gray-500 mb-1 font-medium">CashOut Líquido</div>
                                <div className="font-bold text-gray-900">{formatCurrency(row["CashOut Líquido (€)"])}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-6 py-4 font-semibold text-gray-700">Banco</th>
                                <th className="text-right px-6 py-4 font-semibold text-gray-700">Prestação</th>
                                <th className="text-right px-6 py-4 font-semibold text-gray-700">Total</th>
                                <th className="text-right px-6 py-4 font-semibold text-gray-700">Capital em Dívida</th>
                                <th className="text-right px-6 py-4 font-semibold text-gray-700">CashOut Líquido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedData.map((row, index) => (
                                <tr
                                    key={row.Banco}
                                    className={`transition-all duration-200 ${index === 0
                                        ? 'bg-blue-50 hover:bg-blue-100'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                <Building2 className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="font-semibold text-gray-900">{row.Banco}</span>
                                            {index === 0 && (
                                                <div className="ml-3 flex items-center bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                                    <Award className="h-3 w-3 mr-1" />
                                                    Melhor
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-gray-900">{formatCurrency(row["Prestação Mensal (€)"])}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-gray-900">{formatCurrency(row["Total Mensal (€)"])}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-gray-900">{formatCurrency(row["Capital em Dívida (€)"])}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-gray-900">{formatCurrency(row["CashOut Líquido (€)"])}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
