import { BankData, DebtMapEntry, MonthlyResult } from '../types';

// High precision for financial calculations
const PRECISION = 12;

function toDecimal(value: number): number {
  return Number(value.toFixed(PRECISION));
}

export function calcularPrestacao(capital: number, taxaAnual: number, nMeses: number): number {
  const taxaMensal = taxaAnual / 12 / 100;
  const capitalDecimal = toDecimal(capital);

  if (taxaMensal === 0 || nMeses === 0) {
    return 0;
  }

  if (capitalDecimal === 0) {
    return 0;
  }

  const result = (capitalDecimal * taxaMensal) / (1 - Math.pow(1 + taxaMensal, -nMeses));
  return toDecimal(result);
}

export function calcularPlanoEmprestimo(dadosBanco: BankData): MonthlyResult[] {
  const valorEmprestimo = toDecimal(dadosBanco.valor_emprestimo);
  const taxaFixa = toDecimal(dadosBanco.taxa_fixa);
  const periodoFixa = dadosBanco.periodo_fixa;
  const spread = toDecimal(dadosBanco.spread);
  const euribor = toDecimal(dadosBanco.euribor);
  const amortizacoes = dadosBanco.amortizacoes || [];

  // Calculate total monthly commissions from separate categories
  const seguroVida = toDecimal(dadosBanco.seguro_vida || 0);
  const seguroMultiriscos = toDecimal(dadosBanco.seguro_multiriscos || 0);
  const manutencaoConta = toDecimal(dadosBanco.manutencao_conta || 0);
  const outros = toDecimal(dadosBanco.outros || 0);
  const comissoesMensais = toDecimal(seguroVida + seguroMultiriscos + manutencaoConta + outros);

  const comissoesIniciais = toDecimal(dadosBanco.comissoes_iniciais || 0);
  const premiosEntrada = toDecimal(dadosBanco.premios_entrada || 0);
  const devolucaoSpread = dadosBanco.devolucao_spread || false;
  const anosDevolucaoSpread = dadosBanco.anos_devolucao_spread || 0;
  const tempoEmprestimo = dadosBanco.tempo_emprestimo;

  let capitalEmDivida = valorEmprestimo;
  let totalAmortizado = 0;
  let totalJuros = 0;
  let cashOutBruto = comissoesIniciais;
  let cashOutLiquido = toDecimal(comissoesIniciais - premiosEntrada);
  const resultados: MonthlyResult[] = [];
  let spreadPagoAcumulado = 0;
  let prestacaoMensal = 0;
  let mesesRestantes = tempoEmprestimo * 12;

  for (let mes = 1; mes <= tempoEmprestimo * 12; mes++) {
    const anoAtual = Math.floor((mes - 1) / 12) + 1;

    // Check if there's an amortization in this month
    const amortizacaoMes = amortizacoes.find(a => a.prestacao === mes);
    if (amortizacaoMes) {
      const valorAmortizacao = toDecimal(amortizacaoMes.valor);
      capitalEmDivida = toDecimal(capitalEmDivida - valorAmortizacao);
      capitalEmDivida = Math.max(capitalEmDivida, 0);
      totalAmortizado = toDecimal(totalAmortizado + valorAmortizacao);
      cashOutBruto = toDecimal(cashOutBruto + valorAmortizacao);
      cashOutLiquido = toDecimal(cashOutLiquido + valorAmortizacao);
    }

    // Calculate remaining months correctly
    mesesRestantes = tempoEmprestimo * 12 - mes + 1;

    // Switch from fixed to variable rate
    let taxaAplicada: number;
    if (mes > periodoFixa * 12) {
      taxaAplicada = toDecimal(euribor + spread);
    } else {
      taxaAplicada = taxaFixa;
    }

    // Recalculate payment if capital changed or rate changed
    if (mes === 1 || mes === periodoFixa * 12 + 1 || amortizacaoMes || capitalEmDivida <= 0) {
      if (capitalEmDivida > 0 && mesesRestantes > 0) {
        prestacaoMensal = calcularPrestacao(capitalEmDivida, taxaAplicada, mesesRestantes);
      } else {
        prestacaoMensal = 0;
      }
    }

    const taxaMensal = toDecimal(taxaAplicada / 12 / 100);
    const jurosMes = toDecimal(capitalEmDivida * taxaMensal);
    const amortizacaoNormalMes = toDecimal(prestacaoMensal - jurosMes);

    // Accumulate theoretical spread during spread refund period
    let spreadDevolvidoMes = 0;
    if (devolucaoSpread && anosDevolucaoSpread > 0 && mes <= anosDevolucaoSpread * 12) {
      const spreadMensal = toDecimal(spread / 12 / 100);
      const spreadPagoMes = toDecimal(capitalEmDivida * spreadMensal);
      spreadPagoAcumulado = toDecimal(spreadPagoAcumulado + spreadPagoMes);
      spreadDevolvidoMes = spreadPagoMes;
      // Monthly spread refund
      cashOutBruto = toDecimal(cashOutBruto - spreadPagoMes);
      cashOutLiquido = toDecimal(cashOutLiquido - spreadPagoMes);
    }

    totalAmortizado = toDecimal(totalAmortizado + amortizacaoNormalMes);
    totalJuros = toDecimal(totalJuros + jurosMes);
    cashOutBruto = toDecimal(cashOutBruto + prestacaoMensal + comissoesMensais);
    cashOutLiquido = toDecimal(cashOutLiquido + prestacaoMensal + comissoesMensais);

    capitalEmDivida = toDecimal(capitalEmDivida - amortizacaoNormalMes);
    capitalEmDivida = Math.max(capitalEmDivida, 0);

    // Ensure debt reaches zero at the end
    if (mes === tempoEmprestimo * 12) {
      capitalEmDivida = 0;
    }

    if (mes % 12 === 0 || mes === tempoEmprestimo * 12) {
      // Calculate effective payment considering spread refund
      const prestacaoEfetiva = toDecimal(prestacaoMensal - spreadDevolvidoMes);
      const totalMensal = toDecimal(prestacaoEfetiva + comissoesMensais);

      resultados.push({
        Ano: anoAtual,
        "Prestação Mensal (€)": Number(prestacaoEfetiva.toFixed(2)),
        "Total Mensal (€)": Number(totalMensal.toFixed(2)),
        "Amortização Total (€)": Number(totalAmortizado.toFixed(2)),
        "Capital em Dívida (€)": Number(capitalEmDivida.toFixed(2)),
        "CashOut Bruto (€)": Number(cashOutBruto.toFixed(2)),
        "CashOut Líquido (€)": Number(cashOutLiquido.toFixed(2)),
        "Taxa Aplicada (%)": Number(taxaAplicada.toFixed(3)),
        "Juros Acumulados (€)": Number(totalJuros.toFixed(2)),
        "Comissões Acumuladas (€)": Number((comissoesIniciais + comissoesMensais * mes).toFixed(2)),
      });
    }
  }

  return resultados;
}

export function gerarMapaDivida(dadosBanco: BankData, nomeBanco: string): DebtMapEntry[] {
  const valorEmprestimo = toDecimal(dadosBanco.valor_emprestimo);
  const taxaFixa = toDecimal(dadosBanco.taxa_fixa);
  const periodoFixa = dadosBanco.periodo_fixa;
  const spread = toDecimal(dadosBanco.spread);
  const euribor = toDecimal(dadosBanco.euribor);
  const amortizacoes = dadosBanco.amortizacoes || [];

  const seguroVida = toDecimal(dadosBanco.seguro_vida || 0);
  const seguroMultiriscos = toDecimal(dadosBanco.seguro_multiriscos || 0);
  const manutencaoConta = toDecimal(dadosBanco.manutencao_conta || 0);
  const outros = toDecimal(dadosBanco.outros || 0);
  const comissoesMensais = toDecimal(seguroVida + seguroMultiriscos + manutencaoConta + outros);

  const comissoesIniciais = toDecimal(dadosBanco.comissoes_iniciais || 0);
  const premiosEntrada = toDecimal(dadosBanco.premios_entrada || 0);
  const devolucaoSpread = dadosBanco.devolucao_spread || false;
  const anosDevolucaoSpread = dadosBanco.anos_devolucao_spread || 0;
  const tempoEmprestimo = dadosBanco.tempo_emprestimo;

  let capitalEmDivida = valorEmprestimo;
  let spreadPagoAcumulado = 0;
  let totalAmortizado = 0;
  let totalJuros = 0;
  let cashOutBruto = comissoesIniciais;
  let cashOutLiquido = toDecimal(comissoesIniciais - premiosEntrada);
  let prestacaoMensal = 0;
  let mesesRestantes = tempoEmprestimo * 12;

  const registos: DebtMapEntry[] = [];

  for (let mes = 1; mes <= tempoEmprestimo * 12; mes++) {
    const ano = Math.floor((mes - 1) / 12) + 1;

    // Check if there's an amortization in this month
    const amortizacaoMes = amortizacoes.find(a => a.prestacao === mes);
    if (amortizacaoMes) {
      const valorAmortizacao = toDecimal(amortizacaoMes.valor);
      capitalEmDivida = toDecimal(capitalEmDivida - valorAmortizacao);
      capitalEmDivida = Math.max(capitalEmDivida, 0);
      totalAmortizado = toDecimal(totalAmortizado + valorAmortizacao);
      cashOutBruto = toDecimal(cashOutBruto + valorAmortizacao);
      cashOutLiquido = toDecimal(cashOutLiquido + valorAmortizacao);
    }

    // Calculate remaining months correctly
    mesesRestantes = tempoEmprestimo * 12 - mes + 1;

    let taxaAplicada: number;
    if (mes > periodoFixa * 12) {
      taxaAplicada = toDecimal(euribor + spread);
    } else {
      taxaAplicada = taxaFixa;
    }

    // Recalculate payment if capital changed or rate changed
    if (mes === 1 || mes === periodoFixa * 12 + 1 || amortizacaoMes || capitalEmDivida <= 0) {
      if (capitalEmDivida > 0 && mesesRestantes > 0) {
        prestacaoMensal = calcularPrestacao(capitalEmDivida, taxaAplicada, mesesRestantes);
      } else {
        prestacaoMensal = 0;
      }
    }

    const taxaMensal = toDecimal(taxaAplicada / 12 / 100);
    const jurosMes = toDecimal(capitalEmDivida * taxaMensal);
    const amortizacaoNormalMes = toDecimal(prestacaoMensal - jurosMes);

    // Calculate spread refund
    let spreadDevolvidoMes = 0;
    if (devolucaoSpread && anosDevolucaoSpread > 0 && mes <= anosDevolucaoSpread * 12) {
      const spreadMensal = toDecimal(spread / 12 / 100);
      const spreadPagoMes = toDecimal(capitalEmDivida * spreadMensal);
      spreadPagoAcumulado = toDecimal(spreadPagoAcumulado + spreadPagoMes);
      spreadDevolvidoMes = spreadPagoMes;
      cashOutBruto = toDecimal(cashOutBruto - spreadPagoMes);
      cashOutLiquido = toDecimal(cashOutLiquido - spreadPagoMes);
    }

    totalAmortizado = toDecimal(totalAmortizado + amortizacaoNormalMes);
    totalJuros = toDecimal(totalJuros + jurosMes);
    cashOutBruto = toDecimal(cashOutBruto + prestacaoMensal + comissoesMensais);
    cashOutLiquido = toDecimal(cashOutLiquido + prestacaoMensal + comissoesMensais);

    capitalEmDivida = toDecimal(capitalEmDivida - amortizacaoNormalMes);
    capitalEmDivida = Math.max(capitalEmDivida, 0);

    // Ensure debt reaches zero at the end
    if (mes === tempoEmprestimo * 12) {
      capitalEmDivida = 0;
    }

    // Calculate effective payment considering spread refund
    const prestacaoEfetiva = toDecimal(prestacaoMensal - spreadDevolvidoMes);
    const totalMensal = toDecimal(prestacaoEfetiva + comissoesMensais);

    registos.push({
      Banco: nomeBanco,
      Mês: mes,
      Ano: ano,
      "Prestação (€)": Number(prestacaoEfetiva.toFixed(2)),
      "Total Mensal (€)": Number(totalMensal.toFixed(2)),
      "Amortização Total (€)": Number(totalAmortizado.toFixed(2)),
      "Juros (€)": Number(jurosMes.toFixed(2)),
      "Capital em Dívida (€)": Number(capitalEmDivida.toFixed(2)),
      "CashOut Bruto (€)": Number(cashOutBruto.toFixed(2)),
      "CashOut Líquido (€)": Number(cashOutLiquido.toFixed(2)),
      "Taxa Aplicada (%)": Number(taxaAplicada.toFixed(3)),
      "Comissões Acumuladas (€)": Number((comissoesIniciais + comissoesMensais * mes).toFixed(2)),
    });
  }

  return registos;
}

export function compararBancos(
  dadosBancos: { [key: string]: BankData },
  anosAnalise: number[] = [1, 2, 3, 5, 10, 20, 40]
): { [key: string]: { [key: number]: MonthlyResult } } {
  const resultadosCompletos: { [key: string]: { [key: number]: MonthlyResult } } = {};

  for (const [banco, dados] of Object.entries(dadosBancos)) {
    try {
      const plano = calcularPlanoEmprestimo(dados);
      resultadosCompletos[banco] = {};

      for (const resultado of plano) {
        if (anosAnalise.includes(resultado.Ano)) {
          resultadosCompletos[banco][resultado.Ano] = resultado;
        }
      }
    } catch (error) {
      console.error(`Erro ao calcular para ${banco}:`, error);
    }
  }

  return resultadosCompletos;
}
