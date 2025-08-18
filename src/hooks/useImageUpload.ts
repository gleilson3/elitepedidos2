import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UploadedImage {
  url: string;
  name: string;
  size: number;
  id: string;
}

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<UploadedImage> => {
    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      console.log('🚀 Iniciando upload da imagem:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Validar arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB
        throw new Error('Arquivo muito grande. Máximo 5MB');
      }

      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `product-images/${fileName}`;

      console.log('📁 Caminho do arquivo:', filePath);

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Erro no upload para storage:', uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      if (!uploadData || !uploadData.path) {
        console.error('❌ Upload retornou dados inválidos:', uploadData);
        throw new Error('Upload falhou - dados inválidos retornados');
      }

      console.log('✅ Upload para storage concluído:', uploadData);
      setUploadProgress(50);

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Erro ao obter URL da imagem');
      }

      console.log('🔗 URL pública gerada:', urlData.publicUrl);
      setUploadProgress(75);

      // Salvar informações da imagem na tabela product_images
      const { data: imageRecord, error: dbError } = await supabase
        .from('product_images')
        .insert([{
          file_name: fileName,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          public_url: urlData.publicUrl,
          original_name: file.name
        }])
        .select()
        .single();

      if (dbError) {
        console.error('❌ Erro ao salvar metadados no banco:', dbError);
        // Tentar deletar o arquivo do storage se falhou salvar no banco
        try {
          await supabase.storage.from('images').remove([filePath]);
          console.log('🗑️ Arquivo removido do storage após erro no banco');
        } catch (cleanupError) {
          console.error('⚠️ Erro ao limpar arquivo do storage:', cleanupError);
        }
        throw new Error(`Erro ao salvar no banco: ${dbError.message}`);
      }

      console.log('✅ Metadados salvos no banco:', imageRecord);
      setUploadProgress(100);

      return {
        id: imageRecord.id,
        url: urlData.publicUrl,
        name: file.name,
        size: file.size
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer upload';
      setError(errorMessage);
      console.error('💥 Erro geral no upload:', err);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    try {
      console.log('🗑️ Iniciando exclusão da imagem:', imageUrl);

      // Remove cache-busting parameters from URL for database lookup
      const cleanImageUrl = imageUrl.split('?')[0];

      // Buscar informações da imagem no banco
      const { data: imageRecord, error: findError } = await supabase
        .from('product_images')
        .select('id, file_path')
        .eq('public_url', cleanImageUrl)
        .maybeSingle();

      if (findError || !imageRecord) {
        console.error('❌ Imagem não encontrada no banco para exclusão:', findError);
        throw new Error('Imagem não encontrada no banco de dados');
      }

      console.log('📋 Dados da imagem encontrados:', imageRecord);

      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([imageRecord.file_path]);

      if (storageError) {
        console.warn('⚠️ Erro ao deletar do storage (continuando):', storageError);
      }

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageRecord.id);

      if (dbError) {
        console.error('❌ Erro ao deletar metadados do banco:', dbError);
        throw new Error(`Erro ao deletar do banco: ${dbError.message}`);
      }

      console.log('🗑️ Removendo associações de produtos...');
      // Remover associações de produtos
      const { error: associationError } = await supabase
        .from('product_image_associations')
        .delete()
        .eq('image_id', imageRecord.id);

      if (associationError) {
        console.warn('⚠️ Erro ao remover associações:', associationError);
      }

      console.log('✅ Imagem excluída completamente');
    } catch (err) {
      console.error('Erro ao deletar imagem:', err);
      throw err;
    }
  };

  const getUploadedImages = async (): Promise<UploadedImage[]> => {
    try {
      console.log('📋 Carregando lista de imagens...');

      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar imagens do banco:', error);
        return [];
      }

      const imageCount = data?.length || 0;
      console.log(`✅ ${imageCount} imagens carregadas do banco`);

      return (data || []).map(img => ({
        id: img.id,
        url: img.public_url,
        name: img.original_name,
        size: img.file_size
      }));
    } catch (err) {
      console.error('💥 Erro geral ao buscar imagens:', err);
      return [];
    }
  };

  const saveImageToProduct = async (imageUrl: string, productId: string): Promise<string | null> => {
    try {
      console.log('🔗 Iniciando associação imagem-produto:', { 
        imageUrl: imageUrl.split('?')[0].substring(0, 50) + '...', 
        productId 
      });
      
      // Remove cache-busting parameters from URL for database lookup
      const cleanImageUrl = imageUrl.split('?')[0];
      
      // Buscar ID da imagem
      const { data: imageRecord, error: findError } = await supabase
        .from('product_images')
        .select('*')
        .eq('public_url', cleanImageUrl)
        .maybeSingle();

      if (findError || !imageRecord) {
        console.error('❌ Imagem não encontrada no banco para associação:', findError);
        throw new Error('Imagem não encontrada no banco de dados');
      }

      console.log('✅ Imagem encontrada para associação:', imageRecord.id);
      
      // Remover associação anterior se existir
      const { error: deleteError } = await supabase
        .from('product_image_associations')
        .delete()
        .eq('product_id', productId);

      if (deleteError) {
        console.warn('⚠️ Erro ao remover associação anterior (continuando):', deleteError);
      }

      // Criar nova associação
      const { error: associationError } = await supabase
        .from('product_image_associations')
        .insert([{
          product_id: productId,
          image_id: imageRecord.id
        }]);

      if (associationError) {
        console.error('❌ Erro ao criar associação imagem-produto:', associationError);
        throw new Error(`Erro ao associar imagem: ${associationError.message}`);
      }
      
      // Force a cache refresh by adding a timestamp to the URL
      const timestamp = new Date().getTime();
      const refreshedUrl = imageUrl.includes('?') ? 
        `${cleanImageUrl}?t=${timestamp}` : 
        `${imageUrl}?t=${timestamp}`;
      
      console.log('✅ Associação imagem-produto criada com sucesso');

      // Return the clean URL without cache parameters
      return cleanImageUrl;
    } catch (err) {
      console.error('Erro ao salvar imagem do produto:', err);
      throw err;
    }
  };

  const getProductImage = async (productId: string): Promise<string | null> => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl.includes('placeholder') || 
          supabaseKey.includes('placeholder')) {
        console.warn('⚠️ Supabase not configured, skipping image fetch');
        return null;
      }

      // Check if Supabase is properly configured
      const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const envSupabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!envSupabaseUrl || !envSupabaseKey || 
          envSupabaseUrl === 'your_supabase_url_here' || 
          envSupabaseKey === 'your_supabase_anon_key_here' ||
          envSupabaseUrl.includes('placeholder')) {
        console.warn('Supabase not configured, using fallback image');
        return null
      }

      const cleanProductId = productId;
            
      try {
        const { data, error } = await supabase
          .from('product_image_associations')
          .select(`
            image:product_images(public_url)
          `)
          .eq('product_id', cleanProductId)
          .maybeSingle();
        
        if (error) {
          console.warn(`⚠️ Database error loading image for product ${cleanProductId}:`, error.message);
          return null;
        }

        if (!data) {
          return null;
        }
        
        return data.image?.public_url || null;
      } catch (fetchError) {
        // Handle network errors gracefully
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          console.warn(`🌐 Network error loading image for product ${cleanProductId} - using fallback`);
        } else {
          console.warn(`⚠️ Unexpected error loading image for product ${cleanProductId}:`, fetchError);
        }
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      // Handle different types of network errors gracefully
      if (err instanceof TypeError && (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('fetch') || errorMessage.includes('NetworkError'))) {
        console.warn(`🌐 Network connectivity issue - using fallback image for product ${productId}`);
      } else if (errorMessage.includes('timeout') || errorMessage.includes('aborted')) {
        console.warn(`⏱️ Request timeout - using fallback image for product ${productId}`);
      } else {
        console.warn(`⚠️ Unexpected error loading image for product ${productId}:`, errorMessage);
      }
      // Handle network errors gracefully
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.warn('⚠️ Network error when fetching product image, using fallback');
        return null;
      }
      
      console.warn('⚠️ Error fetching product image, using fallback:', error);
      return null;
    }
  };

  return {
    uploadImage,
    deleteImage,
    getUploadedImages,
    saveImageToProduct,
    getProductImage,
    uploading,
    uploadProgress,
    error
  };
};