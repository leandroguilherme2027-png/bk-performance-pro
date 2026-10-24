# Project Guidance

## User Preferences

- Gamer interface with electric blue, black and white accents
- Smooth animations and modern graphics
- Large clear buttons and simple navigation
- Layout adapted to different screen sizes, performant on entry-level phones
- Clear error messages, loading indicators and confirmation before important changes
- Never present simulated data as real device data

## Accepted Requirements

- Painel inicial com nome BK PERFORMANCE PRO e botões OTIMIZAR MEU CELULAR, GERAR SENSIBILIDADE, MONITOR DE DESEMPENHO, MEUS JOGOS e CONFIGURAÇÕES
- Indicadores de temperatura, RAM e FPS quando disponíveis, com indicador visual do estado do aparelho
- Central de otimização com seleção de jogo, análise de desempenho, armazenamento, RAM, orientação para fechar apps, economia de recursos, recomendações gráficas, perfil por jogo, APLICAR OTIMIZAÇÕES e RESTAURAR CONFIGURAÇÕES
- Adicionar jogos manualmente quando a identificação automática não for possível
- Gerador de Sensi Full Capa com marca, modelo pesquisável e manual, tipo de sensibilidade, DPI, estilo de jogo e modo de jogo
- Resultado da sensi com Geral, Ponto vermelho, Mira 2x, Mira 4x, Mira AWM e Olhadinha, e botões COPIAR MINHA SENSI, GERAR OUTRA SENSI, SALVAR CONFIGURAÇÃO e VER COMO CONFIGURAR NO FREE FIRE
- Monitor de desempenho com FPS, temperatura da bateria, temperatura de CPU/GPU, RAM, armazenamento, bateria, CPU, gráficos, alertas de aquecimento e recomendações
- Exibir 'Dado não disponível neste dispositivo' com explicação quando o Android não permitir, sem inventar números
- Botão ABRIR JOGO com mensagem explicativa quando o jogo não puder ser aberto
- Perfis e histórico com salvar, perfis por aparelho, perfis separados Free Fire/Free Fire MAX, consultar, comparar, restaurar, editar e excluir, com persistência local
- Não prometer FPS ilimitado, capa garantida, ausência de tiros no peito ou descoberta automática sem testes; não alterar arquivos protegidos do jogo, não burlar antitrapaça e não pedir senha da conta
- Monitor de desempenho com opção de ativar o monitoramento e indicadores de FPS, bateria, RAM e armazenamento
- Gerador de Sensi com escolha de aparelho, com DPI ou sem DPI, sensi alta ou sensi baixa e botão GERAR SENSI
- Resultado da sensi mostrando o número do botão e o número da DPI
- Exibir 'Dado não disponível neste dispositivo' quando o aparelho não permitir, sem inventar números

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend commands from src/backend: mops check --fix, mops build. Frontend commands from src/frontend: pnpm typecheck, pnpm fix, pnpm build. Bindings are generated from the root with pnpm bindgen.
- Motoko: Map.remove returns (), not Bool; check .get(id) != null before removing to report deletion. Array.sort returns the sorted array and must be the switch arm's result, not a sequenced statement.
- Motoko: 'label' is a reserved keyword; the OptimizationOption field is named 'title'. Migration files must be self-contained and inline exact record types for stable Map fields.
- Frontend foundation exports: Layout and PageShell from src/frontend/src/components/Layout.tsx; ActionButton, TelemetryCard, TelemetryLabel, TelemetryValue, StatusBadge, SectionHeading and UnavailableState from src/frontend/src/components/telemetry.tsx; React Query hooks from src/frontend/src/hooks/useQueries.ts; useDeviceMetrics and formatBytes from src/frontend/src/hooks/use-device-metrics.ts.
- Frontend: a custom prop named variant collides with shadcn Button's variant; name it tone. Backend string enums used as computed keys need value imports; Record<Enum,string> label maps avoid TS2366 non-exhaustive switch errors.
- Routes registered in src/frontend/src/App.tsx: /, /optimization, /sensi, /sensi/resultado, /monitor, /games, /profiles, /settings.
- SensiResultPage guards location.state with an optional chain (state?.result) so a direct visit to /sensi/resultado renders the empty state instead of crashing; SensiGeneratorPage restores previous choices from router state via a restoreChoices helper.
- MonitorPage mounts a LiveMonitor child only while monitoring is on, so useDeviceMetrics effects start and stop with the ATIVAR/DESATIVAR toggle without changing the hook contract.
- Backend generateSensitivity is a stateless public query in src/backend/mixins/sensitivity-api.mo; GenerateSensitivityRequest {brand, model, dpiMode, dpi, sensitivityType} returns GeneratedSensitivity {values, dpi} with dpi optional.
- OQL manual adapters for nested Map<Principal, Map<Id, Record>> flatten to (owner, record) rows, derive the owner column from the outer key, and need .sample(...) plus an explicit .scopedPerUser(); OQL 0.7.1 has no ?T _toRow instance, so render optional fields as Text payloads.
- A generated OQL adapter returning Iter.Iter needs its own import Iter "mo:core/Iter"; Motoko string literals do not support backslash-newline continuation, so use one literal with \n escapes.
- getApiDoc lives in src/backend/mixins/api-doc.mo and is included from main.mo; it is one very long single-line string, so the read tool truncates it at 2000 characters.
