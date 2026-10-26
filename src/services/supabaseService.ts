import { supabase } from '../lib/supabase';
import { RegisteredPlayer, PrizeItem } from '../types/bingo';

export const supabaseService = {
  /**
   * Salva ou atualiza um jogador na tabela 'players' do Supabase
   */
  async savePlayer(player: RegisteredPlayer): Promise<{ success: boolean; error?: any }> {
    try {
      const payload = {
        id: player.id,
        name: player.name,
        nickname: player.nickname,
        avatar: player.avatar || '👑',
        email: player.email || null,
        phone: player.phone || null,
        city: player.city || null,
        lucky_number: player.luckyNumber || null,
        games_played: player.gamesPlayed || 0,
        bingo_wins: player.bingoWins || 0,
        is_google_auth: !!player.isGoogleAuth,
        registered_at: player.registeredAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('players').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase upsert player warning:', error.message);
        return { success: false, error };
      }
      return { success: true };
    } catch (err: any) {
      console.warn('Erro ao salvar jogador no Supabase:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Busca todos os jogadores cadastrados no Supabase
   */
  async fetchPlayers(): Promise<RegisteredPlayer[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('bingo_wins', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        nickname: d.nickname,
        avatar: d.avatar || '👑',
        email: d.email || undefined,
        phone: d.phone || undefined,
        city: d.city || undefined,
        luckyNumber: d.lucky_number || undefined,
        gamesPlayed: d.games_played || 0,
        bingoWins: d.bingo_wins || 0,
        registeredAt: d.registered_at,
        isGoogleAuth: d.is_google_auth,
      }));
    } catch (err) {
      console.warn('Erro ao ler jogadores do Supabase:', err);
      return [];
    }
  },

  /**
   * Busca o catálogo de prêmios do Supabase
   */
  async fetchPrizes(): Promise<PrizeItem[]> {
    try {
      const { data, error } = await supabase.from('prizes').select('*');
      if (error || !data || data.length === 0) {
        return [];
      }
      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        imageUrl: d.image_url,
        description: d.description,
        estimatedValue: d.estimated_value,
        badge: d.badge,
      }));
    } catch (err) {
      console.warn('Erro ao ler prêmios do Supabase:', err);
      return [];
    }
  },

  /**
   * Salva um prêmio no Supabase
   */
  async savePrize(prize: PrizeItem): Promise<{ success: boolean; error?: any }> {
    try {
      const payload = {
        id: prize.id,
        title: prize.title,
        category: prize.category,
        image_url: prize.imageUrl,
        description: prize.description,
        estimated_value: prize.estimatedValue,
        badge: prize.badge,
      };

      const { error } = await supabase.from('prizes').upsert(payload, { onConflict: 'id' });
      if (error) {
        return { success: false, error };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },
};
