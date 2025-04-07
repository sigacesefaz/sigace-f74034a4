import { supabase } from "@/lib/supabase";

const STORAGE_CACHE_KEY = 'supabase_storage_urls';
const DEFAULT_EXPIRY = 3600; // 1 hora

interface CachedUrl {
  url: string;
  expiresAt: number;
}

export class StorageService {
  private static getCache(): Record<string, CachedUrl> {
    const cache = localStorage.getItem(STORAGE_CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
  }

  private static setCache(cache: Record<string, CachedUrl>) {
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(cache));
  }

  static async checkBucketExists(bucketName: string) {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    if (error) {
      console.error(`Bucket ${bucketName} não existe ou erro de acesso:`, error);
      throw new Error(`Bucket ${bucketName} não disponível`);
    }
    return data;
  }

  static async uploadFile(
    bucketName: string,
    filePath: string,
    file: File,
    upsert = false
  ) {
    await this.checkBucketExists(bucketName);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert });

    if (error) {
      throw new Error(`Falha no upload: ${error.message}`);
    }
    return data;
  }

  static async getFileUrl(
    bucketName: string,
    filePath: string,
    expiresIn = DEFAULT_EXPIRY,
    download = false
  ): Promise<string> {
    if (!bucketName || !filePath) {
      throw new Error('Bucket name e file path são obrigatórios');
    }
    
    if (typeof bucketName !== 'string' || typeof filePath !== 'string') {
      throw new Error('Parâmetros devem ser strings');
    }
    try {
      // Verifica cache primeiro
      const cacheKey = `${bucketName}/${filePath}`;
      const cache = this.getCache();
      const cached = cache[cacheKey];

      if (cached && cached.expiresAt > Date.now()) {
        return cached.url;
      }

      // Se não tem cache ou expirado, gera nova URL
      await this.checkBucketExists(bucketName);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn, { download });

      if (error) {
        throw new Error(`Falha ao gerar URL: ${error.message}`);
      }

      if (!data?.signedUrl || typeof data.signedUrl !== 'string') {
        throw new Error('URL assinada inválida ou não retornada');
      }

      // Atualiza cache
      cache[cacheKey] = {
        url: data.signedUrl,
        expiresAt: Date.now() + (expiresIn * 1000) - 60000 // 1 minuto antes de expirar
      };
      this.setCache(cache);

      return data.signedUrl;
    } catch (error) {
      console.error('Erro no StorageService.getFileUrl:', error);
      throw error;
    }
  }

  static async getPublicUrl(bucketName: string, filePath: string) {
    await this.checkBucketExists(bucketName);
    
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  static async removeFile(bucketName: string, filePath: string) {
    await this.checkBucketExists(bucketName);
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Falha ao remover arquivo: ${error.message}`);
    }

    // Remove do cache se existir
    const cacheKey = `${bucketName}/${filePath}`;
    const cache = this.getCache();
    if (cache[cacheKey]) {
      delete cache[cacheKey];
      this.setCache(cache);
    }
  }
}
