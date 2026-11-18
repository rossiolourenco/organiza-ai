# Organiza Aí 3.0 — documentação técnica

Atualizado em 18/11/2026. Este documento descreve a implementação efetiva do Mobile 3.0 e sua
integração com o backend compartilhado. Nada aqui depende de serviço externo, IA ou Firebase.

## 1. Arquitetura

```
Expo Router / React Native
  ├─ AuthProvider      sessão (SecureStore nativo, memória na Web)
  ├─ DataProvider      tarefas, categorias, hábitos, erro, conexão, mutações e desfazer
  ├─ SettingsProvider  disponibilidade, notificações e plano aceito (por conta)
  ├─ FocusProvider     Pomodoro, histórico e metas (AsyncStorage por conta/servidor)
  └─ ThemeProvider     tokens claro/escuro/sistema (por aparelho)
        ↓ HTTP tipado (Bearer)
Spring Boot 4 / JPA / PostgreSQL (H2 isolado na demonstração)
```

- Regras puras ficam em `src/domain` e são testadas sem UI: datas, tarefas, foco, planejamento,
  Eisenhower, hábitos e revisão.
- Serviços ficam em `src/services`: HTTP, armazenamento de sessão, exportação e lembretes.
- UI fica em `src/features` (uma pasta por domínio) e `src/components/ui.tsx` (design system).
- Nenhuma tela acessa `fetch` diretamente; tudo passa por `Api`, que injeta `usuarioId` e `Bearer`.

## 2. Design System 3.0

Tokens em `src/theme/ThemeProvider.tsx`. Cores literais são proibidas nas telas.

### Cores

| Semântico | Claro | Escuro |
|---|---|---|
| background | `#F7F8FC` | `#0B1020` |
| surface | `#FFFFFF` | `#151C2E` |
| surfaceSecondary | `#F0F2F8` | `#101728` |
| elevated | `#EEF0FF` | `#1C2538` |
| primary | `#635BFF` | `#8B83FF` |
| primaryHover | `#5148E5` | `#A29BFF` |
| secondary | `#8B83FF` | `#B7B2FF` |
| text | `#172033` | `#F8FAFC` |
| muted | `#667085` | `#94A3B8` |
| border | `#E5E7EF` | `#2A3448` |
| success | `#16A34A` | `#4ADE80` |
| warning | `#B45309` | `#FBBF24` |
| danger | `#DC2626` | `#FDA4AF` |

Cada cor de estado tem variante `*Soft` para fundos de badges. Contraste conferido nos dois temas
para texto principal/secundário e botões primários.

### Tipografia e espaçamento

- Escala: micro 11, caption 12, body 15, subtitle 17, title 21, heading 28, display 40.
- Peso mínimo de metadados 400; títulos 700/800. Fonte do sistema (sem download, sem blocking).
- Espaçamento: 4, 8, 12, 16, 24, 36, 48. Raios: 8, 12, 16, 22, 28, pill.
- Área de toque mínima: 48 px. Botões compactos mantêm 40 px com espaçamento ao redor.

### Componentes

`AppHeader`, `PremiumCard`, `MetricCard`, `ProgressRing` (SVG), `Progress`, `StatusBadge`,
`PriorityBadge`, `FilterChip`, `Segmented`, `QuickAction`, `FloatingActionButton`, `SearchBar`,
`EmptyState`, `ErrorState`, `LoadingSkeleton`, `AppBottomSheet`, `ConfirmDialog`, `DateSelector`,
`CalendarGrid`, `ThemeToggle`, `ToggleRow`, `SectionHeader`, `SmartSuggestionCard`, `Toast`.
Todos vivem em `src/components/ui.tsx`; não há estilos duplicados por tela.

## 3. Navegação

Cinco abas: Início, Tarefas, Planejar, Foco, Perfil. Telas de pilha: nova/editar tarefa,
categorias, hábitos, revisão semanal, lixeira e modo concentração. O stack usa `headerShown: false`
e o cabeçalho do design system, evitando cabeçalho duplicado.

## 4. Funcionalidades

| Módulo | Implementação |
|---|---|
| Dashboard | saudação, data, anel de progresso diário, 4 métricas, próxima melhor ação, agenda, hábitos, semana, metas, próximos 7 dias, atalhos |
| Tarefas | busca, filtros combinados (E), agrupamento por data/área/lista, 3 ordenações, checklist com progresso, ações rápidas, paginação |
| Cadastro/edição | seções progressivas: essencial, planejamento, checklist/notas, repetição, Eisenhower |
| Calendário | mês/semana/dia, contagens, destaque de atrasos, criação na data, navegação |
| Kanban | 3 colunas, status persistido via menu acessível (sem drag-and-drop instável) |
| Foco | Pomodoro configurável, pausa/retomada por timestamps, encerramento com registro do tempo real, histórico e estatísticas |
| Concentração | tarefa, objetivo, checklist interativo, cronômetro, pausa e conclusão |
| Hábitos | CRUD, frequência diária/semanal, meta, registros idempotentes, sequência, consistência e arquivamento |
| Planejamento | algoritmo determinístico + timeline com aceite explícito |
| Eisenhower | 4 quadrantes com atributos explícitos e sugestão aplicada só sob confirmação |
| Revisão semanal | conclusões, prazos, foco, categorias, hábitos, metas e recomendações por regras |
| Perfil | tema, notificações, metas, distribuições, exportação, acessibilidade, modo exposição e logout |
| Confiabilidade | lixeira reversível, desfazer, bloqueio de mutações concorrentes, indicador de conexão, estados de erro |

## 5. Planejamento inteligente

Arquivo: `src/domain/planning.ts`.

- Duração: `duracaoEstimada` ou 30 min quando ausente.
- Pontuação (constantes públicas `PLANNING_WEIGHTS`):
  atraso +50; vence hoje +30; amanhã +15; nesta semana +8; prioridade ALTA +24, MÉDIA +12, BAIXA +4;
  importante +10; urgente +12; favorita +5; fixada +4; bônus por tarefa curta até +6.
- Ordenação: pontuação desc, duração asc, id asc. Empates são reproduzíveis.
- Alocação gulosa: entra no plano enquanto couber na disponibilidade; o restante vai para
  “fora do tempo”. Não há promessa de agenda ótima e dependências não existem no contrato atual.
- O app sugere; o usuário aceita ou ignora. Nenhuma tarefa é alterada automaticamente.
- Timeline começa no horário configurado (padrão 08:00) e avança pela duração estimada.

## 6. Matriz de Eisenhower

Arquivo: `src/domain/eisenhower.ts`. Campos persistidos: `detalhes.importante` e
`detalhes.urgente` (booleanos anuláveis). Sem classificação, a tarefa não entra em quadrante.

Sugestão explícita (nunca aplicada sozinha):

- urgente = atrasada ou prazo até amanhã;
- importante = prioridade alta, tarefa fixada, ou prioridade média com prazo em até 3 dias.

Quadrantes: Fazer agora (importante+urgente), Planejar (importante), Reduzir (urgente),
Eliminar (nenhum). A tela oferece filtros por quadrante, além da grade visual completa.

## 7. Hábitos

Tabelas `habitos` e `habito_registros` (V003). Um registro por hábito e data civil, garantido por
`UNIQUE (habito_id, data)`; repetir a mesma data é idempotente.

- Datas são civis (`AAAA-MM-DD`), sem conversão UTC. O “dia” é o do usuário.
- Sequência diária: dias consecutivos com registro. Se hoje ainda não foi marcado, a sequência
  continua a partir de ontem.
- Sequência semanal: semanas consecutivas em que a meta de dias foi atingida; a semana atual entra
  se a meta já foi cumprida, senão começa na anterior.
- Melhor sequência é o maior bloco histórico.
- Consistência mostra os últimos 28 dias; `rate30` usa 30 dias.
- Excluir hábito remove registros por cascata; a UI pede confirmação.

## 8. Revisão semanal

Arquivo: `src/domain/review.ts`. Semana civil de segunda a domingo.

- concluídas: tarefas com evento de conclusão dentro da semana;
- prazos da semana: tarefas com prazo entre início e fim; taxa = concluídas com prazo ÷ total com prazo;
- pendentes agora e atrasadas: estado atual, independente da semana;
- foco: soma de sessões `focus` cujo dia de conclusão cai na semana (local);
- comparação: tarefas concluídas na semana anterior completa;
- metas: dias da semana (até hoje) com conclusões ≥ meta diária; foco ≥ meta diária × 7;
- categorias: contagem das tarefas concluídas na semana;
- hábitos: registros da semana versus meta.

Recomendações (regras fixas): atrasadas > 0; taxa < 50% com ≥ 3 prazos; foco < 60% da meta semanal;
uma única categoria concentrando ≥ 3 conclusões; nenhum hábito; taxa ≥ 80% como reforço positivo.

## 9. Foco e modo concentração

- Estado local por servidor/usuário (`organiza.focus.v2:<servidor>:<id>`).
- Cronômetro baseado em `endAt`, não em contagem incremental; sobrevive a suspensão e recálculo.
- Encerrar antes do fim registra o tempo realmente decorrido; sessões abaixo de 1 minuto não entram.
- Sessões recuperadas são deduplicadas por id.
- Notificações locais agendadas no início e canceladas em pausa/encerramento.
- Metas e histórico não sincronizam entre aparelhos.

## 10. Confiabilidade

- Exclusão lógica com restauração e “Desfazer” no toast.
- Mutações usam lock: não há dois envios simultâneos; mensagens orientam atualizar antes de repetir.
- Cache local atualizado após mutação por refresh autorizado; respostas fora de ordem são descartadas
  por geração.
- `online` indica alcançabilidade do **servidor** (não do Wi-Fi): falha de rede marca offline, sucesso
  marca online.
- Respostas 401 expiram a sessão; 403 e 404 têm mensagens específicas.
- Preferências inválidas são ignoradas sem sobrescrever dados.

## 11. Notificações locais

`src/services/reminders.native.ts` (Android/iOS) e `reminders.ts` (Web, indisponível).
Usa `expo-notifications`, sem push externo.

- Até 20 lembretes para tarefas abertas nos próximos 7 dias, no horário da tarefa (ou 09:00) menos
  a antecedência configurada.
- Um aviso no término de cada sessão de foco.
- Permissão solicitada ao ativar; se negada, a UI explica.
- Limites: Web não suporta; Android pode exigir canal/permissão; iOS pode limitar avisos; o sistema
  pode atrasar entregas. Não há garantia de execução em segundo plano.

## 12. Exportação e modo exposição

- `src/services/export.ts` gera JSON com tarefas, categorias, hábitos, foco, metas e preferências.
  Web baixa via Blob; nativo abre a folha de compartilhamento. Token nunca é incluído.
- Modo exposição é identificado pelo domínio reservado `@exposicao.invalid`.
- “Restaurar cenário local” limpa apenas foco e plano do aparelho para aquela conta. É idempotente.
- O cenário de tarefas/categorias/hábitos é criado/restaurado por `scripts/seed-demo.mjs`
  (somente `localhost`/`127.0.0.1`).

## 13. Backend e migração

Contrato aditivo: os endpoints e campos da 2.0 continuam válidos. Novidades:

- `GET /api/tarefas/lixeira`, `POST /api/tarefas/{id}/restaurar`, `DELETE /api/tarefas/{id}/definitivo`;
- `GET/POST/PUT/DELETE /api/habitos` e `POST/DELETE /api/habitos/{id}/registros`;
- `detalhes.importante`, `detalhes.urgente` e `detalhes.duracaoEstimada`.

`DELETE /api/tarefas/{id}` agora move para a lixeira. Migração `V003__premium_produtividade.sql`.
A autorização continua por token Bearer e valida `usuarioId`; hábitos também verificam propriedade.

## 14. Acessibilidade e desempenho

- Rótulos e papéis em botões, checkboxes, switches, abas e progressos; estados selecionado/checado.
- Alvos ≥ 48 px; contraste; texto ampliável do sistema; feedback textual além de cor.
- Sem animações contínuas, sem bibliotecas pesadas de UI. Listas paginadas em 40 itens.
- Ícones Feather importados diretamente; SVG apenas no anel de progresso.
- `FlatList` não foi introduzida nesta etapa; as listas são paginadas e limitadas. Para volumes
  muito grandes, migrar as listagens para `FlatList`/virtualização é a evolução indicada.

## 15. Execução

```bash
# backend isolado
cd organiza-ai-web/backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local

# seed idempotente do cenário
cd organiza-ai-web
DEMO_PASSWORD='...' DEMO_EMAIL='demo@exposicao.invalid' node scripts/seed-demo.mjs --reset

# mobile
cd organiza-ai
npm ci
npm start          # ou npm run web
```

## 16. Limitações conhecidas

- Sem offline completo, fila de sincronização ou resolução de conflitos.
- Kanban por menu, sem drag-and-drop; ordem personalizada é numérica.
- Dependências entre tarefas não existem no contrato atual.
- Foco, metas e preferências são locais; não sincronizam.
- Notificações não validadas em aparelhos físicos.
- Migração V003 não aplicada em PostgreSQL real.
- Sem build assinado, sem teste em emulador/aparelho nesta execução.
