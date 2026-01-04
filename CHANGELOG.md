# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Planejado
- Tutorial interativo para novos usuários
- Animações de transição entre rodadas
- Histórico de jogos salvos
- Modo escuro
- Testes automatizados
- Analytics integrado

---

## [0.1.0] - 2025-01-04

### Added

#### Core do Jogo
- Sistema completo de cartas da Bisca (40 cartas, 4 naipes, 10 valores)
- Algoritmo de embaralhamento Fisher-Yates
- Lógica de comparação de cartas com suporte a trunfo
- Sistema de pontuação (Ás=11, 7=10, Rei=4, Valete=3, Dama=2)
- Cálculo automático de pontos (total 120 por jogo)
- Detecção de vencedor de rodada
- Determinação de ordem de jogada
- Validação de jogadas
- Detecção de fim de jogo
- Cálculo de vencedor final
- Suporte para modo 2 jogadores (individual)
- Suporte para modo 4 jogadores (duplas: 1+3 vs 2+4)

#### Sistema de IA
- Análise automática de estilo de jogo dos oponentes
- Classificação de estilos: Agressivo, Defensivo, Balanceado, Indeterminado
- Cálculo de confiança da análise de estilo (0-100%)
- Motor de recomendações baseado em IA
- Sistema de priorização de cartas (0-100)
- Avaliação de risco em 5 níveis (VERY_LOW a VERY_HIGH)
- Cálculo de probabilidade de trunfo do oponente
- Geração automática de explicações contextuais
- Ajuste de recomendações baseado no estilo do oponente
- Cálculo de probabilidade de vitória

#### Interface do Usuário
- Página inicial com overview do produto
- Página de configuração de jogo
  - Seleção de modo (2 ou 4 jogadores)
  - Campos de nome para todos os jogadores
  - Validação e inicialização automática
- Página principal do jogo com layout em grid:
  - Painel de trunfo
  - Placar em tempo real
  - Visualização da rodada atual
  - Gerenciamento da mão do usuário
  - Painel de recomendações da IA
  - Análise de estilo dos oponentes
  - Mensagens toast para feedback
- Componente de Carta com estados visual (normal, selecionada, recomendada)
- Seletor de Carta em modal com seleção em 2 etapas (valor → naipe)
- Design responsivo para mobile, tablet e desktop
- Tema verde com gradientes
- Símbolos de naipe com cores corretas (vermelho/preto)

#### Gerenciamento de Estado
- Zustand store com 6 actions principais:
  - `startGame()` - Iniciar jogo
  - `registerPlayedCard()` - Registrar jogada
  - `updateUserHand()` - Atualizar mão
  - `requestRecommendation()` - Solicitar recomendação
  - `finalizeRound()` - Finalizar rodada
  - `resetGame()` - Reiniciar jogo
- Persistência automática em localStorage
- Estados do jogo: SETUP, IN_PROGRESS, FINISHED
- Validação de turnos
- Atualização automática de análises de estilo
- Restauração de estado ao recarregar página

#### PWA (Progressive Web App)
- Service Worker com estratégia network-first
- Cache dinâmico de todas as requisições
- Pré-cache de rotas essenciais (`/`, `/setup`, `/game`)
- Web Manifest dinâmico
- Ícones PWA (192×192, 512×512, apple-touch-icon)
- Suporte offline completo
- Instalável na tela inicial (mobile)
- Modo display standalone
- Tema personalizado (#16a34a verde)
- Orientação portrait-primary

#### Documentação
- JSDoc completo em todas as funções
- README.md com overview e instruções
- DEVELOPMENT.md com plano de desenvolvimento detalhado
- CHANGELOG.md (este arquivo)
- Comentários explicativos no código

#### Qualidade de Código
- TypeScript 5.7.2 em modo strict
- Tipos abrangentes para todos os conceitos do jogo
- Linting com ESLint 9.0.0
- Formatação com Prettier 3.4.2
- Build verificado sem erros TypeScript
- Sem warnings críticos

### Changed
- Tradução completa de código de português para inglês:
  - Nomes de funções e métodos
  - Variáveis e parâmetros
  - Tipos e interfaces
  - Propriedades de objetos
  - Enums e seus valores
  - Comentários JSDoc
- UI mantida em português (Brasil) para usuários
- Melhorias na estrutura de pastas
- Otimização de imports

### Fixed
- Regex de parsing em deck.ts (range inválido [A-KQ-J] → [AKQJ])
- Tipo de PWA manifest (purpose 'any maskable' → 'maskable')
- Conflito de nomes entre tipo Card e componente Card
- Traduções parciais que causavam erros de compilação
- Valores de enum não traduzidos
- String literals de PlayerId em português
- Nomes de propriedades manualmente corrigidos
- Imports não utilizados removidos

### Technical Details

#### Estrutura de Arquivos
```
lib/bisca/          - Lógica do jogo
  ├── types.ts      - Definições de tipos
  ├── deck.ts       - Gerenciamento de deck
  ├── rules.ts      - Regras do jogo
  ├── scoring.ts    - Sistema de pontuação
  ├── style-analyzer.ts - Análise de estilo
  └── recommendation-engine.ts - Motor de recomendações

lib/store/
  └── game-store.ts - Zustand store

components/game/
  ├── card.tsx      - Componente de carta
  └── card-selector.tsx - Seletor de carta

app/
  ├── page.tsx      - Página inicial
  ├── setup/        - Configuração
  ├── game/         - Jogo principal
  └── manifest.ts   - PWA manifest

public/
  ├── sw.js         - Service Worker
  └── icons/        - Ícones PWA
```

#### Dependências Principais
- next: ^15.0.3
- react: ^19.0.0
- zustand: ^5.0.2
- tailwindcss: ^3.4.17
- typescript: ^5.7.2

#### Métricas
- ~3.600 linhas de código
- 12 arquivos TypeScript (lógica)
- 6 componentes React
- 3 páginas Next.js
- 100% código em inglês
- 100% UI em português
- 0 erros de compilação
- 0 bugs conhecidos

---

## Convenções de Versionamento

Este projeto usa [Semantic Versioning](https://semver.org/lang/pt-BR/):

- **MAJOR** (X.0.0): Mudanças incompatíveis na API
- **MINOR** (0.X.0): Novas funcionalidades retrocompatíveis
- **PATCH** (0.0.X): Correções de bugs retrocompatíveis

## Categorias de Mudanças

- **Added**: Novas funcionalidades
- **Changed**: Mudanças em funcionalidades existentes
- **Deprecated**: Funcionalidades que serão removidas
- **Removed**: Funcionalidades removidas
- **Fixed**: Correções de bugs
- **Security**: Correções de segurança

---

[Unreleased]: https://github.com/seu-usuario/bisca-assistant/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/seu-usuario/bisca-assistant/releases/tag/v0.1.0
