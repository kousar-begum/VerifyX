import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase Configuration from Environment / User Settings
export const SUPABASE_URL =
  localStorage.getItem('verifyx_supabase_url') ||
  import.meta.env.VITE_SUPABASE_URL ||
  'https://brbcjzxdkwysjdanxndh.supabase.co';

export const SUPABASE_ANON_KEY =
  localStorage.getItem('verifyx_supabase_anon_key') ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_hgVeqsvnBybZh0XMHdeswg_2lXK4j7J';

export const BUCKETS = {
  DOCUMENTS: import.meta.env.VITE_DOCUMENTS_BUCKET || 'documents',
  REPORTS: import.meta.env.VITE_REPORTS_BUCKET || 'analysis-reports',
  ARTIFACTS: import.meta.env.VITE_ARTIFACTS_BUCKET || 'analysis-artifacts',
  PROCESSED_DOCUMENTS: import.meta.env.VITE_PROCESSED_DOCUMENTS_BUCKET || 'processed-documents',
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (clientInstance) return clientInstance;
  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return clientInstance;
    }
  } catch (err) {
    console.warn('Supabase client initialization skipped:', err);
  }
  return null;
};

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<{
  connected: boolean;
  message: string;
  buckets?: string[];
  latencyMs?: number;
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return { connected: false, message: 'Supabase client credentials not set' };
  }

  const start = performance.now();
  try {
    // Check storage bucket access
    const { data: buckets, error } = await client.storage.listBuckets();
    const latency = Math.round(performance.now() - start);

    if (error) {
      // Even if listBuckets has permission restrictions, try simple ping
      const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok || res.status === 404) {
        return {
          connected: true,
          message: 'Supabase REST API is reachable',
          latencyMs: latency,
        };
      }
      return { connected: false, message: error.message };
    }

    return {
      connected: true,
      message: `Connected (${buckets?.length || 0} buckets detected)`,
      buckets: buckets?.map((b) => b.name) || [],
      latencyMs: latency,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err.message || 'Network error reaching Supabase instance',
    };
  }
};

// Upload document to Supabase storage bucket
export const uploadToSupabaseBucket = async (
  file: File,
  bucketName: string = BUCKETS.DOCUMENTS
): Promise<{ success: boolean; path?: string; publicUrl?: string; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client unavailable' };
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  try {
    const { data, error } = await client.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = client.storage.from(bucketName).getPublicUrl(data.path);

    return {
      success: true,
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Upload exception' };
  }
};
