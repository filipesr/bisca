# Bisca Assistant 🎴

Assistente inteligente para o jogo de cartas Bisca. Rastreia cartas jogadas, recomenda jogadas e analisa estilos de jogo dos oponentes.

## 🎯 Funcionalidades

### ✅ Sistema Básico
- ✓ Rastreamento de todas as cartas jogadas na partida
- ✓ Registro da sua mão
- ✓ Cálculo automático de pontuação
- ✓ Suporte para 2 ou 4 jogadores

### 🧠 Recomendações Inteligentes
- ✓ Análise de probabilidades baseada em cartas restantes
- ✓ Sugestão da melhor carta para jogar
- ✓ Avaliação de risco de cada jogada
- ✓ Explicação detalhada das recomendações

### 📊 Análise de Estilo
- ✓ Detecta padrões de jogo (agressivo/defensivo/equilibrado)
- ✓ Adapta recomendações baseado no estilo dos oponentes
- ✓ Mostra confiança da análise
- ✓ Histórico de jogadas por rodada

### 📱 PWA (Progressive Web App)
- ✓ Funciona offline
- ✓ Instalável no celular
- ✓ Persistência de dados (localStorage)

## 🚀 Como Usar

### 1. Instalação e Execução

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Build para produção
pnpm build
pnpm start
```

Acesse http://localhost:3000

### 2. Configurar Partida

1. Na tela inicial, clique em "Iniciar Nova Partida"
2. Escolha o número de jogadores (2 ou 4)
3. Insira os nomes dos jogadores
4. Clique em "Iniciar Partida"

### 3. Durante o Jogo

#### Informar sua mão
1. Clique em "+ Adicionar Carta" na seção "Minha Mão"
2. Selecione o valor (A, 7, K, J, Q, 6, 5, 4, 3, 2)
3. Selecione o naipe (♥ ♦ ♠ ♣)
4. Repita para todas as cartas da sua mão

#### Registrar jogadas dos oponentes
1. Na seção "Cartas Jogadas nesta Rodada", clique em "Registrar jogada de [Nome]"
2. Selecione a carta que o jogador jogou
3. Repita para todos os jogadores

#### Solicitar recomendação
1. Certifique-se que informou todas as cartas da sua mão
2. Clique em "⭐ Solicitar Recomendação"
3. Veja a carta recomendada (marcada com ★) e a explicação

#### Finalizar rodada
1. Quando todos jogarem, clique em "Finalizar Rodada"
2. Os pontos serão calculados automaticamente
3. Uma nova rodada começará

## 🎮 Regras do Jogo de Bisca

### Objetivo
Ganhar o maior número de pontos possível capturando cartas valiosas.

### Pontuação das Cartas
- **Ás (A)**: 11 pontos
- **7**: 10 pontos
- **Rei (K)**: 4 pontos
- **Valete (J)**: 3 pontos
- **Dama (Q)**: 2 pontos
- **6, 5, 4, 3, 2**: 0 pontos

**Total de pontos no jogo**: 120 (30 por naipe)

### Como Jogar

**2 Jogadores:**
- Cada jogador começa com 3 cartas
- A última carta do baralho é virada e define o **trunfo**
- O primeiro jogador joga uma carta
- O segundo jogador responde
- Quem jogar a carta mais forte ganha a rodada
- O vencedor compra uma carta do baralho
- O perdedor compra a próxima
- O vencedor inicia a próxima rodada

**4 Jogadores:**
- Jogadores 1 e 3 formam uma dupla
- Jogadores 2 e 4 formam outra dupla
- Cada jogador começa com 10 cartas
- Não há compra de cartas durante o jogo

### Força das Cartas
1. **Trunfo** sempre vence cartas de outros naipes
2. Entre trunfos, vale a ordem: A > 7 > K > J > Q > 6 > 5 > 4 > 3 > 2
3. Se nenhuma for trunfo, apenas cartas do **mesmo naipe da primeira** podem vencer
4. Entre cartas do mesmo naipe, vale a ordem de força

## 📖 Exemplo de Uso

### Cenário: Jogo de 2 Jogadores

**Situação:**
- Trunfo: 7♥
- Sua mão: A♠, 7♦, K♥
- Oponente jogou: K♠ (4 pontos)
- Cartas já jogadas: 10 cartas

**Solicitando Recomendação:**

O assistente analisa:
1. **Cartas restantes**: 30 cartas
2. **Probabilidade de trunfo**: 30% (9 copas restantes / 30 cartas)
3. **Pontos em jogo**: 4 (do Rei jogado)
4. **Estilo do oponente**: Agressivo (60% confiança)

**Recomendação:**
- Carta: **K♥ (trunfo)**
- Prioridade: 85/100
- Risco: Médio
- Motivo: "4 pontos em jogo, vale tentar ganhar. Trunfo forte para garantir pontos."

## 📚 Documentação

### Documentação Completa

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Plano de desenvolvimento, funcionalidades implementadas e roadmap
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitetura técnica detalhada, fluxos de dados e algoritmos
- **[AI-ENGINE.md](./AI-ENGINE.md)** - Documentação completa dos algoritmos de IA e recomendações
- **[CHANGELOG.md](./CHANGELOG.md)** - Histórico de versões e mudanças

### Guias Rápidos

- **Para Desenvolvedores**: Leia [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a estrutura do código
- **Para Entender a IA**: Veja [AI-ENGINE.md](./AI-ENGINE.md) para detalhes dos algoritmos
- **Para Roadmap**: Consulte [DEVELOPMENT.md](./DEVELOPMENT.md) para funcionalidades planejadas

## 🏗️ Arquitetura

### Tecnologias
- **Next.js 15** (App Router, Server Components)
- **TypeScript** (strict mode)
- **Tailwind CSS** (estilização)
- **Zustand** (state management)
- **localStorage** (persistência)

### Estrutura de Arquivos
```
bisca/
├── app/
│   ├── page.tsx              # Tela inicial
│   ├── setup/page.tsx        # Configuração da partida
│   ├── game/page.tsx         # Jogo em andamento
│   └── manifest.ts           # PWA manifest
├── components/
│   └── game/
│       ├── card.tsx          # Componente de carta
│       └── card-selector.tsx # Seletor de cartas
├── lib/
│   ├── bisca/
│   │   ├── types.ts                 # Tipos TypeScript
│   │   ├── deck.ts                  # Lógica do baralho
│   │   ├── rules.ts                 # Regras do jogo
│   │   ├── scoring.ts               # Sistema de pontuação
│   │   ├── style-analyzer.ts        # Análise de estilo
│   │   └── recommendation-engine.ts # Motor de recomendação
│   └── store/
│       └── game-store.ts     # Zustand store
└── public/
    ├── sw.js                 # Service Worker
    └── icon-*.svg            # Ícones PWA
```

## 🔮 Próximas Funcionalidades

- [ ] Modo multiplayer online
- [ ] IA para jogar contra o computador
- [ ] Histórico de partidas
- [ ] Estatísticas detalhadas
- [ ] Autenticação de usuários
- [ ] Diferentes estilos visuais de cartas
- [ ] Tutorial interativo

## 📝 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

**Desenvolvido com ❤️ para jogadores de Bisca**
