-- ========================================================
-- SCHEMA SQL PARA SUPABASE - BINGO CLUB
-- Projeto: wpblbpehhfafzouxcmis
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/wpblbpehhfafzouxcmis/sql/new
-- ========================================================

-- 1. TABELA DE JOGADORES (PLAYERS)
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar TEXT DEFAULT '👑',
  email TEXT,
  phone TEXT,
  city TEXT,
  lucky_number INTEGER,
  games_played INTEGER DEFAULT 0,
  bingo_wins INTEGER DEFAULT 0,
  is_google_auth BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_players_nickname ON public.players(nickname);
CREATE INDEX IF NOT EXISTS idx_players_email ON public.players(email);
CREATE INDEX IF NOT EXISTS idx_players_bingo_wins ON public.players(bingo_wins DESC);

-- 2. TABELA DE PRÊMIOS (PRIZES)
CREATE TABLE IF NOT EXISTS public.prizes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Geral',
  image_url TEXT NOT NULL,
  description TEXT,
  estimated_value TEXT,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACESSO (POLICIES)
-- Permite leitura e cadastro/atualização para a aplicação cliente usando a chave anônima (anon key)
DROP POLICY IF EXISTS "Permitir leitura pública de jogadores" ON public.players;
CREATE POLICY "Permitir leitura pública de jogadores"
  ON public.players FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir inserção e atualização de jogadores" ON public.players;
CREATE POLICY "Permitir inserção e atualização de jogadores"
  ON public.players FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura pública de prêmios" ON public.prizes;
CREATE POLICY "Permitir leitura pública de prêmios"
  ON public.prizes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir inserção e atualização de prêmios" ON public.prizes;
CREATE POLICY "Permitir inserção e atualização de prêmios"
  ON public.prizes FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. POPULAR PRÊMIOS INICIAIS (OPCIONAL/PADRÃO)
INSERT INTO public.prizes (id, title, category, image_url, description, estimated_value, badge)
VALUES
  ('prize_tv_55', 'Smart TV 55" 4K Crystal UHD', 'Grande Prêmio', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=1200&q=80', 'Tela Crystal 4K com HDR, comando de voz e design ultra fino.', 'R$ 2.499,00', 'SUPER PRÊMIO'),
  ('prize_phone', 'Smartphone 128GB 5G Octa-Core', 'Tecnologia', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80', 'Câmera tripla de alta resolução, tela 120Hz e bateria de 5000mAh.', 'R$ 1.899,00', 'DESTAQUE'),
  ('prize_airfryer', 'Fritadeira Airfryer Digital 4.5L', 'Eletroportáteis', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=1200&q=80', 'Painel touch digital com timer e controle preciso de temperatura.', 'R$ 449,00', 'MAIS COBIÇADO'),
  ('prize_coffee', 'Cafeteira Expresso Automática', 'Casa & Gourmet', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80', 'Cafés expressos cremosos, vaporizador de leite e acabamento inox.', 'R$ 699,00', 'GOURMET'),
  ('prize_speaker', 'Caixa de Som Bluetooth 30W IPX7', 'Áudio', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=80', 'À prova d''água IPX7, bateria para 15 horas de festa e graves profundos.', 'R$ 389,00', 'PORTÁTIL')
ON CONFLICT (id) DO NOTHING;
