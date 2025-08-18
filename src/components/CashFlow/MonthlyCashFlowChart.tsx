import React from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface MonthlyCashFlowData {
  ano: number;
  mes: number;
  mes_ano: string;
  mes_formatado: string;
  loja: string;
  saldo_inicial: number;
  transferencias_entrada: number;
  transferencias_saida: number;
  receitas: number;
  entradas_sistema: number;
  despesas: number;
  gastos_fixos: number;
  fechamento_sistema: number;
  saldo_do_periodo: number;
  saldo_total_mensal: number;
  total_movimentacoes: number;
}

interface MonthlyCashFlowChartProps {
  data: MonthlyCashFlowData[];
}

const MonthlyCashFlowChart: React.FC<MonthlyCashFlowChartProps> = ({ data }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Calculate max value for chart scaling
  const maxValue = Math.max(
    ...data.map(month => Math.max(
      month.receitas + month.entradas_sistema,
      month.despesas + month.gastos_fixos,
      Math.abs(month.saldo_total_mensal)
    ))
  );

  const getBarHeight = (value: number) => {
    return maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;
  };

  const getBarColor = (value: number, type: 'income' | 'expense' | 'balance') => {
    switch (type) {
      case 'income':
        return 'bg-green-500';
      case 'expense':
        return 'bg-red-500';
      case 'balance':
        return value >= 0 ? 'bg-blue-500' : 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Container */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <BarChart3 size={20} className="text-green-600" />
            Gráfico de Fluxo de Caixa Mensal
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Saídas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Saldo</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative">
          <div className="flex items-end justify-between gap-2 h-64 mb-4">
            {data.slice(0, 12).reverse().map((month, index) => {
              const totalIncome = month.receitas + month.entradas_sistema + month.transferencias_entrada;
              const totalExpense = month.despesas + month.gastos_fixos + month.transferencias_saida + month.fechamento_sistema;
              
              return (
                <div key={month.mes_ano} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bars */}
                  <div className="flex items-end gap-1 h-48">
                    {/* Income Bar */}
                    <div className="relative group">
                      <div
                        className={`w-8 ${getBarColor(totalIncome, 'income')} rounded-t transition-all hover:opacity-80`}
                        style={{ height: `${getBarHeight(totalIncome)}%` }}
                        title={`Entradas: ${formatPrice(totalIncome)}`}
                      ></div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Entradas: {formatPrice(totalIncome)}
                      </div>
                    </div>
                    
                    {/* Expense Bar */}
                    <div className="relative group">
                      <div
                        className={`w-8 ${getBarColor(totalExpense, 'expense')} rounded-t transition-all hover:opacity-80`}
                        style={{ height: `${getBarHeight(totalExpense)}%` }}
                        title={`Saídas: ${formatPrice(totalExpense)}`}
                      ></div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Saídas: {formatPrice(totalExpense)}
                      </div>
                    </div>
                    
                    {/* Balance Bar */}
                    <div className="relative group">
                      <div
                        className={`w-8 ${getBarColor(month.saldo_total_mensal, 'balance')} rounded-t transition-all hover:opacity-80`}
                        style={{ height: `${getBarHeight(month.saldo_total_mensal)}%` }}
                        title={`Saldo: ${formatPrice(month.saldo_total_mensal)}`}
                      ></div>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Saldo: {formatPrice(month.saldo_total_mensal)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Month Label */}
                  <div className="text-xs text-gray-600 text-center">
                    <div className="font-medium">{month.mes_formatado.slice(0, 3)}</div>
                    <div>{month.ano}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.slice(0, 6).map((month) => (
          <div key={month.mes_ano} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                {month.mes_formatado} {month.ano}
              </h4>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                month.saldo_total_mensal >= 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {month.saldo_total_mensal >= 0 ? 'Positivo' : 'Negativo'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Saldo Inicial:</span>
                <span className="font-medium">{formatPrice(month.saldo_inicial)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Receitas:</span>
                <span className="font-medium text-green-600">{formatPrice(month.receitas)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Entradas Sistema:</span>
                <span className="font-medium text-green-600">{formatPrice(month.entradas_sistema)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Despesas:</span>
                <span className="font-medium text-red-600">{formatPrice(month.despesas)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Gastos Fixos:</span>
                <span className="font-medium text-red-600">{formatPrice(month.gastos_fixos)}</span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Saldo Final:</span>
                  <span className={`font-bold text-lg ${
                    month.saldo_total_mensal >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPrice(month.saldo_total_mensal)}
                  </span>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                {month.total_movimentacoes} movimentações
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonthlyCashFlowChart;