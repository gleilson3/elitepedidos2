import React, { useState } from 'react';
import '../../index.css';
import { Plus, Search, Edit3, Trash2, Package, Scale, Eye, EyeOff, Image as ImageIcon, Save, X, Upload, Check } from 'lucide-react';
import { useStore2Products, Store2Product } from '../../hooks/useStore2Products';
import { useImageUpload } from '../../hooks/useImageUpload';
import ImageUploadModal from '../Admin/ImageUploadModal';

const Store2ProductsManager: React.FC = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct, searchProducts } = useStore2Products();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Store2Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  
  const { getProductImage, saveImageToProduct } = useImageUpload();

  const filteredProducts = React.useMemo(() => {
    let result = searchTerm 
      ? searchProducts(searchTerm)
      : products;
    
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }
    
    return result;
  }, [products, searchProducts, searchTerm, selectedCategory]);

  const categories = [
    { id: 'all', label: 'Todas as Categorias' },
    { id: 'acai', label: 'Açaí' },
    { id: 'sorvetes', label: 'Sorvetes' },
    { id: 'bebidas', label: 'Bebidas' },
    { id: 'complementos', label: 'Complementos' },
    { id: 'sobremesas', label: 'Sobremesas' },
    { id: 'outros', label: 'Outros' }
  ];

  // Carregar imagens dos produtos
  React.useEffect(() => {
    const loadProductImages = async () => {
      const images: Record<string, string> = {};
      
      for (const product of filteredProducts) {
        try {
          const savedImage = await getProductImage(product.id);
          if (savedImage) {
            images[product.id] = savedImage;
          }
        } catch (error) {
          console.warn(`Erro ao carregar imagem do produto ${product.name}:`, error);
        }
      }
      
      setProductImages(images);
    };

    loadProductImages();
  }, [filteredProducts, getProductImage]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const handleCreate = () => {
    setEditingProduct({
      id: '',
      code: '',
      name: '',
      category: 'acai',
      is_weighable: false,
      unit_price: 0,
      price_per_gram: undefined,
      image_url: '',
      stock_quantity: 0,
      min_stock: 0,
      is_active: true,
      barcode: '',
      description: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    
    if (!editingProduct.code.trim() || !editingProduct.name.trim()) {
      alert('Código e nome são obrigatórios');
      return;
    }
    
    if (editingProduct.is_weighable) {
      if (!editingProduct.price_per_gram || editingProduct.price_per_gram <= 0) {
        alert('Preço por grama deve ser maior que zero para produtos pesáveis.');
        return;
      }
    } else {
      if (!editingProduct.unit_price || editingProduct.unit_price <= 0) {
        alert('Preço unitário deve ser maior que zero para produtos unitários.');
        return;
      }
    }

    setSaving(true);
    try {
      if (isCreating) {
        const { id, created_at, updated_at, ...productData } = editingProduct;
        const newProduct = await createProduct(productData);
        
        // Salvar imagem se houver
        if (editingProduct.image_url && !editingProduct.image_url.includes('pexels.com')) {
          await saveImageToProduct(editingProduct.image_url, newProduct.id);
        }
      } else {
        await updateProduct(editingProduct.id, editingProduct);
        
        // Salvar imagem se houver
        if (editingProduct.image_url && !editingProduct.image_url.includes('pexels.com')) {
          await saveImageToProduct(editingProduct.image_url, editingProduct.id);
        }
      }
      
      setEditingProduct(null);
      setIsCreating(false);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        Produto ${isCreating ? 'criado' : 'atualizado'} com sucesso!
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 3000);
    } catch (error) {
      console.error('Erro ao salvar produto da Loja 2:', error);
      alert(`Erro ao salvar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto');
      }
    }
  };

  const handleToggleActive = async (product: Store2Product) => {
    try {
      await updateProduct(product.id, { is_active: !product.is_active });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando produtos da Loja 2...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Package size={24} className="text-blue-600" />
            Gerenciar Produtos - Loja 2
          </h2>
          <p className="text-gray-600">Configure produtos exclusivos da Loja 2</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Produto</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Preço</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Estoque</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {productImages[product.id] ? (
                          <img 
                            src={productImages[product.id]} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {categories.find(c => c.id === product.category)?.label || product.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {product.is_weighable ? (
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <Scale size={14} />
                        {formatPrice((product.price_per_gram || 0) * 1000)}/kg
                      </div>
                    ) : (
                      <div className="font-semibold text-green-600">
                        {formatPrice(product.unit_price || 0)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className={`font-medium ${
                      product.stock_quantity <= product.min_stock ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {product.stock_quantity}
                      {product.stock_quantity <= product.min_stock && (
                        <span className="text-xs ml-1 text-red-500">(Baixo)</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                        product.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {product.is_active ? (
                        <>
                          <Eye size={12} />
                          Ativo
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          Inativo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar produto"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir produto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Nenhum produto encontrado' 
                : 'Nenhum produto cadastrado'
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  {isCreating ? 'Novo Produto - Loja 2' : 'Editar Produto'}
                </h2>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsCreating(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Produto
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  <p>💡 <strong>Dica:</strong> Clique em "Fazer Upload" para adicionar uma nova imagem</p>
                  <p>🔄 A imagem será salva automaticamente no banco de dados</p>
                  <p>📱 Imagens ficam sincronizadas em todos os dispositivos</p>
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={productImages[editingProduct.id] || editingProduct.image_url || 'https://via.placeholder.com/100?text=Sem+Imagem'}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Upload size={16} />
                    Fazer Upload
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    name: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Açaí Premium 500g - Loja 2"
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código do Produto *
                </label>
                <input
                  type="text"
                  value={editingProduct.code}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    code: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: AC001L2"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    category: e.target.value as PDVProduct['category']
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.filter(cat => cat.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Weighable */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_weighable}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      is_weighable: e.target.checked,
                      unit_price: e.target.checked ? undefined : editingProduct.unit_price,
                      price_per_gram: e.target.checked ? (editingProduct.price_per_gram || 0.045) : undefined
                    })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Scale size={16} className="text-blue-600" />
                    Produto pesável (vendido por peso)
                  </span>
                </label>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingProduct.is_weighable ? 'Preço por grama (R$) *' : 'Preço unitário (R$) *'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingProduct.is_weighable 
                    ? editingProduct.price_per_gram || '' 
                    : editingProduct.unit_price || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setEditingProduct({
                      ...editingProduct,
                      ...(editingProduct.is_weighable 
                        ? { price_per_gram: value } 
                        : { unit_price: value })
                    });
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {editingProduct.is_weighable && (
                  <p className="text-xs text-gray-500 mt-1">
                    Preço por kg: {formatPrice((editingProduct.price_per_gram || 0) * 1000)}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    step={editingProduct.is_weighable ? "0.001" : "1"}
                    min="0"
                    value={editingProduct.stock_quantity}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      stock_quantity: parseFloat(e.target.value) || 0
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    step={editingProduct.is_weighable ? "0.001" : "1"}
                    min="0"
                    value={editingProduct.min_stock}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      min_stock: parseFloat(e.target.value) || 0
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({
                    ...editingProduct,
                    description: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição do produto..."
                />
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active !== false}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct,
                      is_active: e.target.checked
                    })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Produto ativo (visível no PDV)
                  </span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsCreating(false);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingProduct.name.trim() || !editingProduct.code.trim()}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {saving ? (
                  'Salvando...'
                ) : (
                  <>
                    <Save size={16} />
                    {isCreating ? 'Criar Produto' : 'Salvar Alterações'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUpload && (
        <ImageUploadModal
          isOpen={showImageUpload}
          onClose={() => setShowImageUpload(false)}
          onSelectImage={(imageUrl) => {
            if (editingProduct) {
              setEditingProduct({
                ...editingProduct,
                image_url: imageUrl
              });
              
              // Atualizar preview local
              setProductImages(prev => ({
                ...prev,
                [editingProduct.id]: imageUrl
              }));
            }
            setShowImageUpload(false);
          }}
          currentImage={productImages[editingProduct?.id || ''] || editingProduct?.image_url}
        />
      )}
    </div>
  );
};

export default Store2ProductsManager;