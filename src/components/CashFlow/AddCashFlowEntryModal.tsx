import React, { useState } from 'react';
import { X, Save, DollarSign, Calendar, FileText, Tag } from 'lucide-react';

interface CashFlowEntry {
  data: string;
  tipo: string;
  descricao: string;
  valor: number;
  loja: string;
  criado_por: string;
}

interface AddCashFlowEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: CashFlowEntry) => Promise<void>;
  selectedStore: string;
}

const AddCashFlowEntryModal: React.FC<AddCashFlowEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedStore
}) => {
  const [formData, setFormData] = useState<CashFlowEntry>({
    data: new Date().toISOString().split('T')[0],
    tipo: 'receita',
    descricao: '',
    valor: 0,
    loja: selectedStore,
    criado_por: 'Sistema PDV'
  });
  const [saving, setSaving] = useState(false);

  const tiposMovimentacao = [
    { value: 'saldo_inicial', label: 'Saldo Inicial', color: 'bg-blue-100 text-blue-800' },
    { value: 'transferencia_entrada', label: 'Transferência Entrada', color: 'bg-green-100 text-green-800' },
    { value: 'transferencia_saida', label: 'Transferência Saída', color: 'bg-red-100 text-red-800' },
    { value: 'receita', label: 'Receita', color: 'bg-green-100 text-green-800' },
    { value: 'sistema_entrada', label: 'Sistema - Entrada', color: 'bg-blue-100 text-blue-800' },
    { value: 'despesa', label: 'Despesa', color: 'bg-red-100 text-red-800' },
    { value: 'gasto_fixo', label: 'Gasto Fixo', color: 'bg-orange-100 text-orange-800' },
    { value: 'sistema_fechamento', label: 'Sistema - Fechamento de Caixa', color: 'bg-purple-100 text-purple-800' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descricao.trim() || formData.valor <= 0) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
      
      // Reset form
      setFormData({
        data: new Date().toISOString().split('T')[0],
        tipo: 'receita',
        descricao: '',
        valor: 0,
        loja: selectedStore,
        criado_por: 'Sistema PDV'
      });
    } catch (error) {
      console.error('Erro ao salvar entrada:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const selectedTipo = tiposMovimentacao.find(t => t.value === formData.tipo);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign size={24} className="text-green-600" />
              Nova Entrada de Fluxo de Caixa
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Movimentação *
            </label>
            <div className="relative">
              <Tag size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                required
              >
                {tiposMovimentacao.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>
            {selectedTipo && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${selectedTipo.color}`}>
                  {selectedTipo.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição *
            </label>
            <div className="relative">
              <FileText size={20} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                rows={3}
                placeholder="Descreva a movimentação..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$) *
            </label>
            <div className="relative">
              <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loja
            </label>
            <select
              value={formData.loja}
              onChange={(e) => setFormData(prev => ({ ...prev, loja: e.target.value }))}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="loja1">Loja 1</option>
              <option value="loja2">Loja 2</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !formData.descricao.trim() || formData.valor <= 0}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Salvar Entrada
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCashFlowEntryModal;