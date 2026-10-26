import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://wpblbpehhfafzouxcmis.supabase.co';

export const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_NqPBOHDYx5yfHn-9_WEEkg_knvI9eKD';

export const SUPABASE_PROJECT_REF = 'wpblbpehhfafzouxcmis';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Testa conectividade com o projeto Supabase
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; error?: any }> {
  try {
    // Testa ping no endpoint de saúde ou busca simples
    const { data, error } = await supabase.from('players').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "players" does not exist') || error.message.includes('not found')) {
        return {
          success: true,
          message: 'Supabase conectado! As tabelas precisam ser criadas no SQL Editor (script disponível no painel).',
          error,
        };
      }
      return {
        success: false,
        message: `Erro ao consultar Supabase: ${error.message}`,
        error,
      };
    }
    return {
      success: true,
      message: 'Conexão com Supabase estabelecida com sucesso!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Falha de conexão: ${err?.message || 'Verifique as credenciais'}`,
      error: err,
    };
  }
}
