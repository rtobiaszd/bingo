-- =========================================================================
-- BINGO REAL-TIME CLUB - SUPABASE INITIAL SCHEMA
-- Projeto: wpblbpehhfafzouxcmis
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/wpblbpehhfafzouxcmis/sql
-- =========================================================================

-- 1. Tabela de Jogadores Cadastrados (10, 20, 100+ Jogadores)
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
  registered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Catálogo de Prêmios com Fotos em Alta Definição
CREATE TABLE IF NOT EXISTS public.prizes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  estimated_value TEXT,
  badge TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela de Salas de Bingo
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  host_id TEXT NOT NULL,
  host_name TEXT NOT NULL,
  host_avatar TEXT DEFAULT '👑',
  mode TEXT DEFAULT 'BINGO_75',
  status TEXT DEFAULT 'WAITING',
  draw_speed_seconds INTEGER DEFAULT 4,
  winning_rule TEXT DEFAULT 'ANY',
  prize_title TEXT,
  prize_image_url TEXT,
  drawn_balls JSONB DEFAULT '[]'::jsonb,
  current_ball INTEGER,
  is_private BOOLEAN DEFAULT false,
  player_count INTEGER DEFAULT 1,
  winner_id TEXT,
  winner_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS (Row Level Security) com políticas públicas para MVP
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura e escrita dos jogadores
CREATE POLICY "Permitir leitura publica de jogadores" ON public.players FOR SELECT USING (true);
CREATE POLICY "Permitir cadastro de jogadores" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao de jogadores" ON public.players FOR UPDATE USING (true);

-- Políticas de prêmios
CREATE POLICY "Permitir leitura publica de premios" ON public.prizes FOR SELECT USING (true);
CREATE POLICY "Permitir insercao de premios" ON public.prizes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao de premios" ON public.prizes FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusao de premios" ON public.prizes FOR DELETE USING (true);

-- Políticas de salas
CREATE POLICY "Permitir leitura publica de salas" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Permitir criacao de salas" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualizacao de salas" ON public.rooms FOR UPDATE USING (true);

-- Inserir catálogo inicial de prêmios se a tabela estiver vazia
INSERT INTO public.prizes (id, title, category, image_url, description, estimated_value, badge)
VALUES
  ('prize_tv_55', 'Smart TV 55" 4K Crystal UHD', 'Grande Prêmio', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80', 'Tela cinematográfica Ultra HD 4K com comando de voz e cores vibrantes.', 'R$ 2.499,00', '🏆 BINGO CHEIO'),
  ('prize_smartphone', 'Smartphone 128GB 5G', 'Tecnologia', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', 'Câmera tripla de alta resolução e desempenho veloz para o dia a dia.', 'R$ 1.699,00', '⚡ PRÊMIO ESPECIAL'),
  ('prize_airfryer', 'Fritadeira Airfryer Digital 4.5L', 'Eletrodoméstico', 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80', 'Praticidade total na cozinha sem óleo em poucos minutos.', 'R$ 399,00', '⭐ LINHA 1'),
  ('prize_coffee', 'Cafeteira Expresso Automática', 'Gourmet', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', 'Café cremoso barista no conforto do lar com 15 bar de pressão.', 'R$ 549,00', '☕ LINHA 2'),
  ('prize_speaker', 'Caixa de Som Bluetooth Pro à Prova d''Água', 'Áudio & Festa', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80', 'Graves potentes, iluminação LED e até 18 horas de bateria.', 'R$ 380,00', '🎵 QUATRO CANTOS'),
  ('prize_chocolate_basket', 'Cesta Gourmet de Chocolates Nobres & Doces', 'Delícias', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80', 'Seleção artesanal de trufas, bombons e guloseimas finas.', 'R$ 199,00', '🍫 PREMIAÇÃO DA RODADA'),
  ('prize_trophy_club', 'Troféu Oficial Dourado Campeão Bingo Club', 'Colecionável', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80', 'Gravação do nome do vencedor, pedestal comemorativo e medalha.', 'R$ 150,00', '👑 RECONHECIMENTO')
ON CONFLICT (id) DO NOTHING;
