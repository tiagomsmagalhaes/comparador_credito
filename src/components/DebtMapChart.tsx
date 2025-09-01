import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DebtMapEntry } from '../types';

interface DebtMapChartProps {
    data: DebtMapEntry[];
    selectedBanks: string[];
}

export const DebtMapChart: React.FC<DebtMapChartProps> = ({ data, selectedBanks }) => {
    // Filter data for selected banks and only show yearly data
    const yearlyData = data
        .filter(entry => selectedBanks.includes(entry.Banco) && entry.Mês % 12 === 0)
        .map(entry => ({
            ...entry,
            Ano: entry.Ano
        }));

    // Group by year and bank
    const chartData: any[] = [];
    const years = Array.from(new Set(yearlyData.map(d => d.Ano))).sort((a: number, b: number) => a - b);

    years.forEach(year => {
        const yearData: any = { Ano: year };
        selectedBanks.forEach(bank => {
            const bankData = yearlyData.find(d => d.Banco === bank && d.Ano === year);
            if (bankData) {
                yearData[`${bank}_Capital`] = bankData["Capital em Dívida (€)"];
                yearData[`${bank}_Comissoes`] = bankData["Comissões Acumuladas (€)"];
            }
        });
        chartData.push(yearData);
    });

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

    const formatCurrency = (value: any) => {
        if (typeof value === 'number') {
            return new Intl.NumberFormat('pt-PT', {
                style: 'currency',
                currency: 'EUR'
            }).format(value);
        }
        return value;
    };

    return (
        <div className="space-y-8">
            {/* Capital em Dívida Chart */}
            <div className="bg-white/80 rounded-xl p-6 border border-blue-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-500 rounded-lg">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">Evolução do Capital em Dívida</h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                        <XAxis
                            dataKey="Ano"
                            label={{ value: 'Ano', position: 'insideBottom', offset: -10, style: { fontSize: 14, fontWeight: 600 } }}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                        />
                        <YAxis
                            label={{ value: 'Capital em Dívida (€)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                        />
                        <Tooltip
                            formatter={(value: any) => [formatCurrency(value), 'Capital em Dívida']}
                            labelFormatter={(label) => `Ano ${label}`}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                        {selectedBanks.map((bank, index) => (
                            <Line
                                key={`${bank}_Capital`}
                                type="monotone"
                                dataKey={`${bank}_Capital`}
                                name={bank}
                                stroke={colors[index % colors.length]}
                                strokeWidth={3}
                                dot={{ r: 6, strokeWidth: 2, fill: 'white' }}
                                activeDot={{ r: 8, strokeWidth: 3 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Comissões Acumuladas Chart */}
            <div className="bg-white/80 rounded-xl p-6 border border-green-200 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-500 rounded-lg">
                        <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-green-900">Evolução das Comissões Acumuladas</h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                        <XAxis
                            dataKey="Ano"
                            label={{ value: 'Ano', position: 'insideBottom', offset: -10, style: { fontSize: 14, fontWeight: 600 } }}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                        />
                        <YAxis
                            label={{ value: 'Comissões Acumuladas (€)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            axisLine={{ stroke: '#d1d5db' }}
                        />
                        <Tooltip
                            formatter={(value: any) => [formatCurrency(value), 'Comissões Acumuladas']}
                            labelFormatter={(label) => `Ano ${label}`}
                            contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            iconSize={8}
                        />
                        {selectedBanks.map((bank, index) => (
                            <Line
                                key={`${bank}_Comissoes`}
                                type="monotone"
                                dataKey={`${bank}_Comissoes`}
                                name={bank}
                                stroke={colors[index % colors.length]}
                                strokeWidth={3}
                                dot={{ r: 6, strokeWidth: 2, fill: 'white' }}
                                activeDot={{ r: 8, strokeWidth: 3 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
