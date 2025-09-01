export interface Amortizacao {
  prestacao: number;
  valor: number;
}

export interface BankData {
  periodo_fixa: number;
  taxa_fixa: number;
  euribor: number;
  spread: number;
  valor_emprestimo: number;
  tempo_emprestimo: number;
  premios_entrada: number;
  comissoes_iniciais: number;
  seguro_vida: number;
  seguro_multiriscos: number;
  manutencao_conta: number;
  outros: number;
  devolucao_spread: boolean;
  anos_devolucao_spread: number;
  amortizacoes: Amortizacao[];
}

export interface BanksData {
  [bankName: string]: BankData;
}

export interface MonthlyResult {
  Ano: number;
  "Prestação Mensal (€)": number;
  "Total Mensal (€)": number;
  "Amortização Total (€)": number;
  "Capital em Dívida (€)": number;
  "CashOut Bruto (€)": number;
  "CashOut Líquido (€)": number;
  "Taxa Aplicada (%)": number;
  "Juros Acumulados (€)": number;
  "Comissões Acumuladas (€)": number;
}

export interface ComparisonResult {
  [bankName: string]: {
    [year: number]: MonthlyResult;
  };
}

export interface DebtMapEntry {
  Banco: string;
  Mês: number;
  Ano: number;
  "Prestação (€)": number;
  "Total Mensal (€)": number;
  "Amortização Total (€)": number;
  "Juros (€)": number;
  "Capital em Dívida (€)": number;
  "CashOut Bruto (€)": number;
  "CashOut Líquido (€)": number;
  "Taxa Aplicada (%)": number;
  "Comissões Acumuladas (€)": number;
}

export interface YearlyComparison {
  Banco: string;
  "Prestação Mensal (€)": number;
  "Total Mensal (€)": number;
  "Taxa Aplicada (%)": number;
  "Juros Acumulados (€)": number;
  "Capital em Dívida (€)": number;
  "CashOut Bruto (€)": number;
  "CashOut Líquido (€)": number;
}
