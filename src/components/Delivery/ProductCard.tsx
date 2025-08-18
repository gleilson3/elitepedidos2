import React, { useState, useEffect } from 'react';
import { Plus, Zap, Clock, Package } from 'lucide-react';
import { Product } from '../../types/product';
import { formatPrice } from '../../utils/formatters';
import { isProductAvailable } from '../../utils/availability';
import { useImageUpload } from '../../hooks/useImageUpload';

const IMAGE_PLACEHOLDER = 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
  isSpecialOfTheDay?: boolean;
  disabled?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenModal, isSpecialOfTheDay = false, disabled = false }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);
  const isAvailable = isProductAvailable(product) && product.isActive !== false;
  const { getProductImage } = useImageUpload();

  const getDisplayPrice = () => {
    if (product.pricePerGram) {
      return `R$ ${product.pricePerGram.toFixed(2)}/g`;
    }
    return formatPrice(product.price);
  };

  useEffect(() => {
    const loadProductImage = async () => {
      try {
        // Skip image loading if Supabase is not configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey || 
            supabaseUrl.includes('placeholder') || 
            supabaseKey.includes('placeholder')) {
          setImageUrl(product.image);
          setImageLoading(false);
          return;
        }

        // Set a timeout to prevent long loading states
        const timeoutId = setTimeout(() => {
          if (imageLoading) {
            setImageUrl(product.image);
            setImageLoading(false);
          }
        }, 3000);

        // Try to get image from database
        try {
          const dbImageUrl = await getProductImage(product.id);
          
          if (dbImageUrl) {
            setImageUrl(dbImageUrl);
          } else {
            setImageUrl(product.image);
          }
        } catch (error) {
          // Handle network errors gracefully
          if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.warn('⚠️ Network error loading product image, using fallback');
          } else {
            console.warn('⚠️ Error loading product image, using fallback:', error);
          }
          setImageUrl(product.image);
        }
        
        clearTimeout(timeoutId);
        setImageLoading(false);
      } catch (error) {
        console.warn('⚠️ Error in image loading process, using fallback:', error);
        setImageUrl(product.image);
        setImageLoading(false);
      }
    };

    loadProductImage();
  }, [product.id, product.image]);

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
      !isAvailable ? 'opacity-60' : ''
    } ${isSpecialOfTheDay ? 'ring-2 ring-orange-400 ring-opacity-50' : ''}`}>
      {isSpecialOfTheDay && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center gap-2">
            <Zap size={16} />
            <span className="font-bold text-sm">OFERTA ESPECIAL DO DIA</span>
          </div>
        </div>
      )}
      
      <div className="relative">
        {imageLoading ? (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">
              <Package size={24} />
            </div>
          </div>
        ) : (
          <img
            src={imageUrl || product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-opacity duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = IMAGE_PLACEHOLDER;
            }}
          />
        )}
        
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-full px-3 py-1 flex items-center gap-2">
              <Clock size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Indisponível</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-800">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="flex items-center gap-2">
                <span className={isSpecialOfTheDay ? 'text-orange-600 font-bold text-lg' : 'text-purple-600 font-bold text-lg'}>
                  {formatPrice(product.price)}
                </span>
                <span className="text-gray-500 line-through text-sm">
                  {formatPrice(product.originalPrice)}
                </span>
              </div>
            ) : (
              !product.pricePerGram && (
                <span className={isSpecialOfTheDay ? 'text-orange-600' : 'text-purple-600'}>
                  {getDisplayPrice()}
                </span>
              )
            )}
          </div>
          
          <button
            onClick={() => onOpenModal(product)}
            disabled={!isAvailable}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg ${
              !isAvailable
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isSpecialOfTheDay
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isSpecialOfTheDay ? <Zap size={16} /> : <Plus size={16} />}
            {product.complementGroups && product.complementGroups.length > 0 
              ? 'Personalizar' 
              : isSpecialOfTheDay ? 'Aproveitar' : 'Adicionar'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;