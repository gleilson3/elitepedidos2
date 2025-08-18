import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, ShoppingCart, Check, Info, AlertCircle, AlertTriangle } from 'lucide-react';
import { Product, ProductSize, ComplementGroup, SelectedComplement, Complement } from '../../types/product';
import { isProductAvailable, getAvailabilityMessage } from '../../utils/availability';
import { useImageUpload } from '../../hooks/useImageUpload';

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, selectedSize?: ProductSize, quantity: number, observations?: string, selectedComplements?: SelectedComplement[]) => void;
  initialSize?: ProductSize;
  initialQuantity?: number;
  initialObservations?: string;
  initialComplements?: SelectedComplement[];
  isEditing?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  initialSize,
  initialQuantity = 1,
  initialObservations = '',
  initialComplements = [],
  isEditing = false
}) => {
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    initialSize || (product.sizes ? product.sizes[0] : undefined)
  );
  const [quantity, setQuantity] = useState(initialQuantity);
  const [observations, setObservations] = useState(initialObservations);
  const [selectedComplements, setSelectedComplements] = useState<SelectedComplement[]>(initialComplements);
  const [productImage, setProductImage] = useState<string | null>(null);
  const hasSetCustomImage = useRef<boolean>(false);
  const [incompleteGroups, setIncompleteGroups] = useState<string[]>([]);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { getProductImage } = useImageUpload();
  
  // Fetch product image when component mounts or product changes
  useEffect(() => {
    const loadProductImage = async () => {
      try {
        const image = await getProductImage(product.id);
        // Only set the image if we haven't set a custom image yet
        if (image && !hasSetCustomImage.current) {
          setProductImage(image);
          hasSetCustomImage.current = true;
        }
      } catch (error) {
        console.error('Error loading product image:', error);
      }
    };
    
    loadProductImage();
  }, [product.id, getProductImage]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCurrentPrice = () => {
    return selectedSize ? selectedSize.price : product.price;
  };

  const getComplementsPrice = () => {
    return selectedComplements.reduce((total, selected) => total + selected.complement.price, 0);
  };

  const getTotalPrice = () => {
    return (getCurrentPrice() + getComplementsPrice()) * quantity;
  };

  const handleComplementChange = (group: ComplementGroup, complementId: string, checked: boolean) => {
    setSelectedComplements(prev => {
      const groupSelections = prev.filter(s => s.groupId === group.id);
      
      if (checked) {
        // Verificar se pode adicionar mais itens
        if (groupSelections.length >= group.maxItems) {
          return prev;
        }
        
        const complement = group.complements.find(c => c.id === complementId);
        if (complement) {
          return [...prev, {
            groupId: group.id,
            complementId,
            complement
          }];
        }
      } else {
        // Remover item
        return prev.filter(s => !(s.groupId === group.id && s.complementId === complementId));
      }
      
      return prev;
    });
  };

  const handleRadioComplementChange = (group: ComplementGroup, complementId: string) => {
    setSelectedComplements(prev => {
      // Check if this complement is already selected
      const isAlreadySelected = prev.some(s => s.groupId === group.id && s.complementId === complementId);
      
      // Remove all selections from this group
      const withoutGroup = prev.filter(s => s.groupId !== group.id);
      
      // If already selected, just return without this group's selections (deselect)
      if (isAlreadySelected) {
        return withoutGroup;
      }
      
      const complement = group.complements.find(c => c.id === complementId);
      if (complement) {
        return [...withoutGroup, {
          groupId: group.id,
          complementId,
          complement
        }];
      }
      
      return withoutGroup;
    });
  };

  const isComplementSelected = (groupId: string, complementId: string) => {
    return selectedComplements.some(s => s.groupId === groupId && s.complementId === complementId);
  };

  const getGroupSelectionCount = (groupId: string) => {
    return selectedComplements.filter(s => s.groupId === groupId).length;
  };

  const canAddToCart = () => {
    if (!product.complementGroups || !Array.isArray(product.complementGroups)) return true;
    
    const allGroupsValid = product.complementGroups.every(group => {
      const selectionCount = getGroupSelectionCount(group.id);
      return selectionCount >= group.minItems && selectionCount <= group.maxItems;
    });
    
    return allGroupsValid;
  };
  
  const validateGroups = () => {
    if (!product.complementGroups || !Array.isArray(product.complementGroups)) return true;
    
    const invalidGroups: string[] = [];
    
    product.complementGroups.forEach(group => {
      const selectionCount = getGroupSelectionCount(group.id);
      if (group.required && (selectionCount < group.minItems || selectionCount > group.maxItems)) {
        invalidGroups.push(group.id);
      }
    });
    
    setIncompleteGroups(invalidGroups);
    return invalidGroups.length === 0;
  };

  const handleAddToCart = () => {
    // Validate all required groups
    const isValid = validateGroups();
    
    if (!isValid) {
      setShowValidationAlert(true);
      
      // Scroll to the first incomplete group
      if (incompleteGroups.length > 0 && contentRef.current) {
        const firstIncompleteGroup = document.getElementById(`group-${incompleteGroups[0]}`);
        if (firstIncompleteGroup) {
          firstIncompleteGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      return;
    }
    
    onAddToCart(product, selectedSize, quantity, observations, selectedComplements);
    onClose();
    if (!isEditing) {
      setQuantity(1);
      setObservations('');
      setSelectedComplements([]);
    }
    setIncompleteGroups([]);
    setShowValidationAlert(false);
  };

  const isAvailable = isProductAvailable(product);
  const availabilityMessage = getAvailabilityMessage(product);

  // Use the fetched image or fall back to the default product image
  // Once we've set a custom image, we'll always use that
  const imageToShow = hasSetCustomImage.current && productImage ? productImage : product.image;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-xl overflow-hidden flex flex-col">
        {/* Header with image */}
        <div className="relative h-48">
          <img
            src={imageToShow}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          
          {/* Product name on image */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h2 className="text-2xl font-bold">{product.name}</h2>
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 transition-colors shadow-md"
          >
            <X size={20} />
          </button>
          
          {/* Promotion badge */}
          {product.originalPrice && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
              PROMOÇÃO
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto" ref={contentRef}>
          <div className="p-6">
            <p className="text-gray-600 mb-2">{product.description}</p>
            
            {/* Status de Disponibilidade */}
            <div className={`inline-flex items-center gap-2 text-sm mb-3 px-3 py-1.5 rounded-full ${
              isAvailable ? 'text-green-600' : 'text-red-600'
            } ${isAvailable ? 'bg-green-50' : 'bg-red-50'}`}>
              <Check size={16} />
              <span className="font-medium">{availabilityMessage}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-3">
              <span className="text-2xl font-bold text-green-600">
                {formatPrice(getCurrentPrice())}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through ml-2">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Seleção de Tamanho */}
            {product.sizes && (
              <div className="mt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                  Escolha o tamanho:
                </h3>
                <div className="space-y-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`w-full p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                        selectedSize?.id === size.id
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="font-medium">{size.name}</div>
                          {size.description && (
                            <div className="text-sm text-gray-500">{size.description}</div>
                          )}
                        </div>
                        <div className="font-bold text-purple-600">
                          {formatPrice(size.price)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grupos de Complementos */}
            {product.complementGroups && Array.isArray(product.complementGroups) && product.complementGroups.map((group, groupIndex) => (
              <div 
                key={group.id} 
                id={`group-${group.id}`} 
                className={`mb-8 p-4 rounded-xl transition-all ${
                  incompleteGroups.includes(group.id) 
                    ? 'border-2 border-red-300 bg-red-50' 
                    : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">{groupIndex + 2}</span>
                    {group.name}
                  </h3>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded-full text-gray-700 font-medium">
                    {getGroupSelectionCount(group.id)}/{group.maxItems}
                  </span>
                </div>
                
                {group.required && (
                  <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${
                    incompleteGroups.includes(group.id) 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    <AlertCircle size={16} />
                    <p className="text-sm font-medium">Seleção obrigatória</p>
                  </div>
                )}
                
                {incompleteGroups.includes(group.id) && (
                  <div className="flex items-center gap-2 mb-3 bg-red-100 text-red-700 p-2 rounded-lg border border-red-200">
                    <AlertTriangle size={16} />
                    <p className="text-sm font-medium">
                      {group.maxItems === 1 
                        ? 'Selecione uma opção para continuar' 
                        : `Selecione entre ${group.minItems} e ${group.maxItems} opções`}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  {group.complements.map((complement) => {
                    // Não mostrar complementos inativos
                    if (complement.isActive === false || complement.is_active === false) {
                      console.log(`🚫 Complemento ${complement.name} oculto (inativo)`)
                      return null;
                    }
                    
                    const isSelected = isComplementSelected(group.id, complement.id);
                    const groupCount = getGroupSelectionCount(group.id);
                    const canSelect = groupCount < group.maxItems || isSelected;
                    const isRadio = group.maxItems === 1;
                    
                    return (
                      <label
                        key={complement.id}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm ${
                          isSelected
                            ? 'border-green-500 bg-green-50 shadow-sm'
                            : canSelect
                            ? 'border-gray-200 hover:border-green-200'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected 
                              ? 'border-green-500 bg-green-500'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{complement.name}</div>
                            {complement.description && (
                              <div className="text-sm text-gray-500">{complement.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="font-bold text-green-600">
                          {complement.price > 0 ? formatPrice(complement.price) : 'Grátis'}
                        </div>
                        <div className="hidden">
                          <input
                            type={isRadio ? 'radio' : 'checkbox'}
                            name={isRadio ? `group-${group.id}` : undefined}
                            checked={isSelected}
                           disabled={false}
                            onChange={(e) => {
                              if (isRadio) {
                                handleRadioComplementChange(group, complement.id);
                              } else {
                                handleComplementChange(group, complement.id, e.target.checked);
                              }
                            }}
                            className="sr-only" // Hidden but accessible
                          />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {/* Validation Alert */}
            {showValidationAlert && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Opções obrigatórias faltando</h4>
                    <p className="text-sm text-red-700">
                      Por favor, complete todas as seleções obrigatórias destacadas em vermelho.
                    </p>
                    {incompleteGroups.length > 0 && (
                      <ul className="mt-2 text-sm text-red-700 list-disc pl-5 space-y-1">
                        {product.complementGroups
                          ? product.complementGroups.filter(g => incompleteGroups.includes(g.id))
                          .map(g => (
                            <li key={g.id}>{g.name}</li>
                          )) : []}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Observações */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Info size={18} className="text-purple-600" />
                Observações:
              </h3>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: Sem açúcar, mais granola..."
                className="w-full p-4 border border-gray-300 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>

            {/* Quantidade */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantidade:</h3>
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-white hover:bg-gray-100 border border-gray-300 rounded-full p-2 transition-colors shadow-sm"
                >
                  <Minus size={20} />
                </button>
                <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-white hover:bg-gray-100 border border-gray-300 rounded-full p-2 transition-colors shadow-sm"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Resumo do Preço */}
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-sm">
              <h3 className="text-lg font-semibold text-green-800 mb-3">Resumo do Pedido</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Produto base:</span>
                  <span className="font-medium">{formatPrice(getCurrentPrice())}</span>
                </div>
                {getComplementsPrice() > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Complementos:</span>
                    <span className="font-medium">{formatPrice(getComplementsPrice())}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Quantidade:</span>
                  <span className="font-medium">{quantity}x</span>
                </div>
                <div className="border-t border-green-200 my-2 pt-2"></div>
                <div className="flex justify-between font-bold text-green-800">
                  <span>Total:</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Add to Cart button - fixed at bottom */}
        <div className="p-4 border-t border-gray-200 bg-white">
          {/* Botão Adicionar */}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
              !isAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover:shadow-lg transform hover:scale-[1.02]'
            }`}
          >
            <ShoppingCart size={20} />
            {isEditing ? `Salvar Alterações - ${formatPrice(getTotalPrice())}` : `Adicionar - ${formatPrice(getTotalPrice())}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;