# Bingo Web Real-Time — Salas Privadas & Cartelas Personalizadas

Plataforma completa de Bingo multiplayer em tempo real com suporte a salas privadas com código de acesso, alternância entre as modalidades tradicionais de 75 e 90 bolas, personalizador estético de cartelas e marcadores, chat integrado para participantes, sorteador automático com locução por voz (Web Speech API) e motor de validação auditada de vitórias.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo foram consolidadas com base nas respostas do usuário na Fase 1:

- **Modalidades de Bingo**: Suporte completo tanto ao **Bingo 75 Bolas** (grade 5x5 tradicional com casa central grátis e padrões de vitória) quanto ao **Bingo 90 Bolas** (cartela 3x9 tradicional com 15 números por cartela e prêmios por Linha e Bingo).
- **Personalização de Cartelas**: Customização em tempo real focada em números tradicionais com temas visuais (paletas de cores, texturas de fundo da cartela), estilos de marcadores (fichas cassino, trevo da sorte, carimbos neon, estrelas) e avatar/apelido do jogador.
- **Sorteio e Locução**: Sorteio automatizado com intervalo configurável pelo anfitrião (ex: 3s a 10s por pedra), controle de pausa/avanço e narração sintetizada (Web Speech API) em português anunciando as pedras e bordões clássicos do bingo.

---

## 1. Overview & Core Concept

- **O que faz**: Permite que grupos de amigos, famílias ou comunidades criem salas de bingo fechadas ou públicas, convidem participantes via código/link, personalizem a estética das suas cartelas e joguem simultaneamente com sorteio automatizado, locução, chat com reações rápidas e verificação instantânea de "BINGO!".
- **Público-alvo**: Grupos sociais, eventos corporativos remotos, famílias e comunidades que buscam uma experiência interativa, lúdica e sem fricção de instalação.
- **Valor central**: Fidelidade à experiência social do bingo tradicional, combinada com a conveniência do digital: ninguém perde pedra sorteada, a conferência de vitória é instantânea e confiável, e a atmosfera é enriquecida com som, voz e chat ao vivo.

---

## 2. User Experience & Visual Design

### Fluxos Principais do Usuário
1. **Lobby & Criação de Sala**:
   - Criação rápida de sala privada com código gerado (ex: `BINGO-7429`) ou entrada direta com código.
   - Configurações da sala: escolha do modo (75 Bolas ou 90 Bolas), velocidade do sorteio (3s, 5s, 8s), modo de vitória (Linha, Cartela Cheia, Quatro Cantos, etc.).
2. **Sala de Espera (Pre-Game) & Personalização**:
   - Visualização dos participantes conectados em tempo real com indicador do anfitrião.
   - Painel interativo de personalização da cartela: escolha do tema de cor (Esmeralda Clássico, Casino Royale, Neon Cyber, Terracota Vintage), seleção do marcador (Ficha Dourada, Selo Carimbado, Trevo, Marcador Caneta) e opção de gerar nova numeração de cartela com 1 clique antes do início.
3. **Mesa de Jogo (Live Play)**:
   - **Globo & Painel Geral**: Exibição central da última bola sorteada com animação e histórico das pedras recentes em barra superior retrátil, além do quadro geral (todas as 75 ou 90 pedras marcadas).
   - **Cartela Interativa**: Grid responsivo com células grandes e legíveis ($\ge 44\text{px}$), clique intuitivo para marcar/desmarcar, indicação visual sutil se o número já foi sorteado (auxílio opcional do anfitrião).
   - **Chat Lateral / Drawer**: Mensagens de texto com timestamp, alertas automáticos do jogo ("João marcou 4 cantos!", "Maria está a 1 bola do Bingo!"), botões de reação rápida (palmas, buzina de bingo, risadas).
   - **Botão BINGO & Verificação**: Botão de chamada de BINGO destacado com feedback tátil e sonoro. Ao ser acionado, o servidor pausa o globo e audita a cartela contra as bolas sorteadas publicando o resultado no chat e disparando chuva de confetes se válido.

### Identidade Visual & Tema
- **Aesthetic Direction**: *Lúdico e sofisticado* (Neo-Casino Arcade) — equilibrando a elegância dos salões de jogos clássicos com a vivacidade moderna de interfaces contemporâneas.
- **Paleta de Cores (60-30-10)**:
  - 60% Canvas Neutro: Fundo escuro aveludado (`slate-950` / `zinc-900`) simulando feltro moderno com contraste impecável.
  - 30% Superfícies Estruturais: Cartelas em tons creme-claro ou superfícies de alto contraste (`zinc-800` no modo dark), linhas de grade finas e tipografia ultra-legível.
  - 10% Acentos Focais: Dourado âmbar quente (`amber-400` / `amber-500`) para a bola atual sorteada e o botão principal de ação; esmeralda (`emerald-500`) para acertos confirmados.
- **Tipografia**:
  - Títulos e Números das Bolas: Fonte de alta legibilidade condensada e limpa (`Plus Jakarta Sans` / `Outfit`) com `tabular-nums` obrigatório em todos os números.
  - Textos de Interface e Chat: Sans-serif legível e amigável.
- **Sonoplastia & Voz**:
  - Web Audio API com sintetizador suave para clique de marcação, rolagem do globo e fanfarra de vitória.
  - Web Speech API (síntese de voz nativa no navegador) com locução em português: *"B-12!"*, *"Bola 45!"*.

---

## 3. Key Product Decisions & Trade-Offs

- **Arquitetura de Tempo Real (WebSocket com Fallback de Sincronização Local)**:
  - *Decisão*: Servidor WebSocket integrado com identificação de salas e broadcast de eventos (`room:join`, `ball:drawn`, `game:start`, `card:mark`, `bingo:claim`, `chat:message`). Em complemento, canal de sincronização multi-aba (`BroadcastChannel`) e modo offline/solo de teste.
  - *Motivo*: Garante suporte multiplayer real entre diferentes janelas e dispositivos sem latência perceptível e com recuperação resiliente em caso de oscilação de rede.
- **Validação Autoritativa no Servidor (Anti-Cheat)**:
  - *Decisão*: O estado oficial das bolas sorteadas e o registro das cartelas são validados no momento da reivindicação do BINGO.
  - *Motivo*: Impede que jogadores marquem números ainda não sorteados para tentar forjar uma vitória.
- **Locução por Síntese Nativa do Navegador (SpeechSynthesis)**:
  - *Decisão*: Utilizar `window.speechSynthesis` configurado para português brasileiro (`pt-BR`).
  - *Motivo*: Zero latência, sem consumo de cotas de APIs externas caras de áudio, funciona offline e permite ajuste de velocidade (pitch e rate) em tempo real.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (React 19)                         │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────────────────────────┐  │
│  │   Lobby / Room Setup  │  │   Customizer (Card Themes & Pegs)    │  │
│  └───────────┬───────────┘  └──────────────────┬───────────────────┘  │
│              │                                 │                      │
│  ┌───────────▼─────────────────────────────────▼───────────────────┐  │
│  │                     Bingo Room Engine View                      │  │
│  │  ┌──────────────┐  ┌───────────────────┐  ┌──────────────────┐  │  │
│  │  │ Ball Spinner │  │ Interactive Card  │  │ Chat & Reactions │  │  │
│  │  │ & Voice Ann. │  │ (75/90 Dynamic)   │  │ & Game Events    │  │  │
│  │  └──────────────┘  └───────────────────┘  └──────────────────┘  │  │
│  └───────────────────────────────┬─────────────────────────────────┘  │
└──────────────────────────────────┼────────────────────────────────────┘
                                   │ WebSocket / REST API
┌──────────────────────────────────▼────────────────────────────────────┐
│                    SERVER LAYER (Node.js + Express)                   │
│                                                                        │
│  ┌─────────────────────────┐  ┌────────────────────────────────────┐  │
│  │ Room Manager (Memory)   │  │ Game Loop & Draw Timer             │  │
│  │ - Room IDs & Passwords  │  │ - 75 / 90 Ball Pools               │  │
│  │ - Host Permissions     │  │ - Interval Dispatcher              │  │
│  └───────────┬─────────────┘  └─────────────────┬──────────────────┘  │
│              │                                  │                     │
│  ┌───────────▼──────────────────────────────────▼──────────────────┐  │
│  │ Audit & Validation Engine                                       │  │
│  │ - Validates Winning Patterns against Drawn History              │  │
│  │ - Broadcasts Winner Celebrations & Chat Events                  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Estrutura de Estado e Dados
- **Room State**:
  - `id`: string (ex: `LOBBY-9281`)
  - `hostId`: string
  - `mode`: `'BINGO_75'` | `'BINGO_90'`
  - `status`: `'WAITING'` | `'PLAYING'` | `'PAUSED'` | `'FINISHED'`
  - `drawSpeed`: number (segundos entre bolas)
  - `winningRule`: `'LINE'` | `'FULL_CARD'` | `'FOUR_CORNERS'` | `'ANY'`
  - `drawnBalls`: number[]
  - `currentBall`: number | null
  - `players`: Record<string, PlayerProfile>
- **Player Card Data**:
  - `cardGrid`: number[][] (5x5 para 75 bolas com centro livre, ou 3x9 para 90 bolas)
  - `markedCells`: boolean[][]
  - `theme`: `{ id: string, name: string, cardBg: string, accentColor: string, markerIcon: string }`
- **Chat Messages**:
  - `id`: string, `senderId`: string, `senderName`: string, `text`: string, `isSystem`: boolean, `timestamp`: number

---

## 5. Próximos Passos & Fases de Execução

1. **Setup do Servidor Real-Time**: Configurar o backend Express com endpoints de criação/listagem de salas e suporte a conexões de eventos em tempo real.
2. **Motor de Geração de Cartelas e Regras**:
   - Algoritmo de geração matemática de cartelas para Bingo 75 (colunas B:1-15, I:16-30, N:31-45, G:46-60, O:61-75) e Bingo 90 (15 números distribuídos em grade 3x9).
   - Validador de padrões de vitória (Linha horizontal, Coluna, Diagonal, 4 Cantos e Bingo Cheio).
3. **Módulo de Customização em Tempo Real**: Seletor visual de temas, cores de contraste, estilo de marcadores e prévia instantânea da cartela.
4. **Interface do Jogo (HUD & Globo de Sorteio)**: Globo animado de sorteio de pedras, mostrador da bola atual com locução por áudio/voz sintetizada, painel com todas as pedras já chamadas e cartela interativa com marcação tátil.
5. **Chat em Tempo Real & Validação de Vitória**: Painel de mensagens integrado com alertas automáticos da partida, verificação segura anti-trapaça e tela de celebração de campeão.
