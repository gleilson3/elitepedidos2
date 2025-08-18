import React, { useState } from 'react';
import { X, Search, Plus, Scale } from 'lucide-react';
import { TableCartItem } from '../../types/table-sales';
import { usePDVProducts } from '../../hooks/usePDV';
import { useStore2Products } from '../../hooks/useStore2Products';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: TableCartItem) => Promise<void>;
  storeId: 1 | 2;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  storeId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  
  // Carregar produtos do banco de dados baseado na loja
  const { products: store1Products, loading: store1Loading } = usePDVProducts();
  const { products: store2Products, loading: store2Loading } = useStore2Products();
  
  const products = storeId === 1 ? store1Products : store2Products;
  const loading = storeId === 1 ? store1Loading : store2Loading;


  const filteredProducts = searchTerm
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const calculateSubtotal = () => {
    if (!selectedProduct) return 0;
    
    if (selectedProduct.is_weighable && weight && selectedProduct.price_per_gram) {
      return weight * selectedProduct.price_per_gram * 1000;
    } else if (!selectedProduct.is_weighable && selectedProduct.unit_price) {
      return quantity * selectedProduct.unit_price;
    }
    
    return 0;
  };

  const handleAddItem = async () => {
    if (!selectedProduct) return;

    console.log('🛒 Adicionando item:', {
      product: selectedProduct.name,
      quantity,
      weight,
      subtotal: calculateSubtotal()
    });
    
    // Validar se o subtotal é válido
    const subtotal = calculateSubtotal();
    if (subtotal <= 0) {
      alert('Erro: Valor do item deve ser maior que zero.');
      return;
    }
    
    // Validar dados obrigatórios
    if (!selectedProduct.code || !selectedProduct.name) {
      alert('Erro: Produto inválido selecionado.');
      return;
    }
    
    if (selectedProduct.is_weighable && (!weight || weight <= 0)) {
      alert('Erro: Peso deve ser maior que zero para produtos pesáveis.');
      return;
    }
    
    if (!selectedProduct.is_weighable && quantity <= 0) {
      alert('Erro: Quantidade deve ser maior que zero.');
      return;
    }
    
    const item: TableCartItem = {
      product_code: selectedProduct.code,
      product_name: selectedProduct.name,
      quantity: selectedProduct.is_weighable ? 1 : quantity,
      weight: selectedProduct.is_weighable ? weight : undefined,
      unit_price: selectedProduct.unit_price,
      price_per_gram: selectedProduct.price_per_gram,
      subtotal: subtotal,
      notes: notes || undefined
    };

    console.log('📦 Item preparado para envio:', item);

    try {
      await onAddItem(item);
      
      console.log('✅ Item enviado com sucesso');
      // O modal será fechado pelo componente pai após sucesso
    } catch (error) {
      console.error('❌ Erro ao adicionar item:', error);
      alert(`Erro ao adicionar item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Adicionar Item - Loja {storeId}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Busca de Produtos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Produto
            </label>
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o nome ou código do produto..."
              />
            </div>
          </div>

          {/* Lista de Produtos */}
          {searchTerm && (
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Carregando produtos...</p>
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                      selectedProduct?.id === product.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-800">{product.name}</h4>
                          <p className="text-sm text-gray-600">Código: {product.code}</p>
                          {product.description && (
                            <p className="text-xs text-gray-500">{product.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {product.is_weighable ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Scale size={16} />
                            <span className="font-medium">
                              R$ {((product.price_per_gram || 0) * 1000).toFixed(2)}/kg
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium text-green-600">
                            R$ {(product.unit_price || 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Nenhum produto encontrado</p>
                  <p className="text-sm">Tente buscar por outro termo</p>
                </div>
              )}
            </div>
          )}

          {/* Produto Selecionado */}
          {selectedProduct && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-3">Produto Selecionado</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600">Código: {selectedProduct.code}</p>
                    {selectedProduct.description && (
                      <p className="text-xs text-gray-500">{selectedProduct.description}</p>
                    )}
                  </div>
                  {selectedProduct.is_weighable && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Scale size={16} />
                      <span>Produto pesável</span>
                    </div>
                  )}
                </div>

                {/* Quantidade ou Peso */}
                {selectedProduct.is_weighable ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={weight || ''}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || undefined)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.500"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="Ex: Sem açúcar, mais granola..."
                  />
                </div>

                {/* Subtotal */}
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Subtotal:</span>
                    <span className="text-xl font-bold text-green-600">
                      R$ {calculateSubtotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddItem}
            disabled={
              loading ||
              !selectedProduct || 
              (selectedProduct.is_weighable && (!weight || weight <= 0)) || 
              (!selectedProduct.is_weighable && quantity <= 0) ||
              calculateSubtotal() <= 0
            }
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Adicionando...
              </>
            ) : (
              <>
                <Plus size={16} />
                Adicionar Item
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;