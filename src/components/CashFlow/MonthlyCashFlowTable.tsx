import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';

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
  primeira_movimentacao: string;
  ultima_movimentacao: string;
}

interface MonthlyCashFlowTableProps {
  data: MonthlyCashFlowData[];
}

const MonthlyCashFlowTable: React.FC<MonthlyCashFlowTableProps> = ({ data }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Último Mês</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(data[0].saldo_total_mensal)}
                  </p>
                  <p className="text-xs text-gray-500">{data[0].mes_formatado}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receitas do Mês</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatPrice(data[0].receitas + data[0].entradas_sistema)}
                  </p>
                  <p className="text-xs text-gray-500">Total de entradas</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Despesas do Mês</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatPrice(data[0].despesas + data[0].gastos_fixos)}
                  </p>
                  <p className="text-xs text-gray-500">Total de saídas</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Movimentações</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {data[0].total_movimentacoes}
                  </p>
                  <p className="text-xs text-gray-500">Registros</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Fluxo de Caixa por Mês</h3>
          <p className="text-gray-600 text-sm">Consolidação mensal das movimentações financeiras</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Mês</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Saldo Inicial</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Transferências</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Receitas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Entradas Sistema</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Despesas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Gastos Fixos</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Fechamento Sistema</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Saldo do Período</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Saldo Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Movimentações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((month) => (
                <tr key={month.mes_ano} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-medium text-gray-800">{month.mes_formatado}</div>
                      <div className="text-sm text-gray-500">{month.ano}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-blue-600">
                      {formatPrice(month.saldo_inicial)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="text-sm text-green-600">
                        +{formatPrice(month.transferencias_entrada)}
                      </div>
                      <div className="text-sm text-red-600">
                        -{formatPrice(month.transferencias_saida)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-green-600">
                      {formatPrice(month.receitas)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-green-600">
                      {formatPrice(month.entradas_sistema)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-red-600">
                      {formatPrice(month.despesas)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-red-600">
                      {formatPrice(month.gastos_fixos)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-gray-600">
                      {formatPrice(month.fechamento_sistema)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {month.saldo_do_periodo >= 0 ? (
                        <TrendingUp size={16} className="text-green-500" />
                      ) : (
                        <TrendingDown size={16} className="text-red-500" />
                      )}
                      <span className={`font-bold ${
                        month.saldo_do_periodo >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPrice(month.saldo_do_periodo)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {month.saldo_total_mensal < 0 && (
                        <AlertTriangle size={16} className="text-red-500" />
                      )}
                      <span className={`font-bold text-lg ${
                        month.saldo_total_mensal >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPrice(month.saldo_total_mensal)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-center">
                      <div className="font-medium text-gray-800">{month.total_movimentacoes}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(month.primeira_movimentacao)} a {formatDate(month.ultima_movimentacao)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum dado de fluxo de caixa encontrado</p>
          </div>
        )}
      </div>

      {/* Alerts for Negative Balances */}
      {data.some(month => month.saldo_total_mensal < 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 mb-2">⚠️ Atenção: Saldos Negativos Detectados</h4>
              <p className="text-red-700 text-sm mb-2">
                Os seguintes meses apresentam saldo negativo:
              </p>
              <ul className="text-red-700 text-sm space-y-1">
                {data
                  .filter(month => month.saldo_total_mensal < 0)
                  .map(month => (
                    <li key={month.mes_ano} className="flex items-center gap-2">
                      <span>•</span>
                      <span className="font-medium">{month.mes_formatado} {month.ano}:</span>
                      <span className="font-bold">{formatPrice(month.saldo_total_mensal)}</span>
                    </li>
                  ))
                }
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyCashFlowTable;