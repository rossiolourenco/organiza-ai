# Organiza Aí Mobile 2.0

## Arquitetura

Evolução do repositório Mobile `bf9ba5c`, com backend compartilhado do Web `c5302ee`.

```text
app/                         Expo Router, rotas TypeScript e proteção de sessão
  (main)/(tabs)/             Início, Tarefas, Planejar, Foco, Perfil
  (main)/                    Formulário criar/editar e categorias
src/
  components/                Primitivos visuais e feedback de dados
  theme/                     Tokens semânticos, tema claro/escuro/sistema
  types/                     Contratos TypeScript
  services/                  HTTP com timeout, autorização, SecureStore
  state/                     AuthProvider, DataProvider, FocusProvider
  domain/                    Datas civis, filtros, indicadores, máquina de foco
  features/                  Telas e componentes por domínio
tests/                       Regras, HTTP, navegação, tema e persistência local
```

Stack mantida: Expo SDK 54, RN 0.81.5, React 19.1, Expo Router 6. Sem segundo backend, analytics ou integrações externas. `package-lock.json` é a referência de versões; npm é o gerenciador declarado.

As antigas rotas JS foram migradas para TSX e agrupadas, preservando os caminhos `/home`, `/novaTarefa`, `/editarTarefa`, `/categorias`, `/cadastro`. Identidade vem da sessão, nunca de parâmetros de rota. Formulários duplicados foram substituídos por um componente compartilhado.

## Funcionalidades

- Login/cadastro existentes, agora com token opaco emitido pelo Spring Boot; expiração e logout.
- Dashboard calculado a partir das tarefas carregadas: prazos do dia, pendências, concluídas, atrasos, prioridades, próximos vencimentos, gráfico semanal, metas e resumo de foco.
- CRUD, conclusão/reabertura, três status, descrição, prioridade, categoria, prazo civil e horário opcional.
- Checklist/subtarefas, notas, etiquetas, favoritos, fixação, ordem numérica personalizada, duplicação e histórico. Persistência no backend; duplicação começa pendente e sem recorrência.
- Categorias: criação, edição, cor, lista, quantidade e exclusão confirmada preservando tarefas.
- Filtros AND: busca, status, prioridade, categoria/sem categoria, datas inclusivas opcionais, atrasadas e favoritas. Limpeza e contador.
- Planejamento mensal/semanal/diário com indicadores de dias, criação na data e Kanban. Movimento acessível por ações, sem drag-and-drop.
- Foco, pausa curta/longa, durações 1–180 min, tarefa opcional, pausar/retomar, histórico e recuperação por timestamps.
- Temas persistentes, estados vazios/erros/carregamento, confirmação de exclusão, botões bloqueados durante operações, rótulos acessíveis e ícones locais.

## Persistência e rede

| Informação | Local |
|---|---|
| Tarefas, detalhes, categorias, conclusões e recorrência | Spring Boot / PostgreSQL |
| Token no Android/iOS | Expo SecureStore |
| Token na prévia Web | Somente memória; recarregar exige login |
| Tema | AsyncStorage, preferência do aparelho |
| Foco e metas | AsyncStorage, chave por servidor + usuário |

Foco funciona sem rede depois de entrar/restaurar a conta. As demais operações precisam do backend. Não há fila offline, cache persistente de tarefas nem sincronização/conciliação de conflitos. Ao falhar atualização, a interface avisa que os dados podem estar desatualizados.

O temporizador salva seu deadline antes de iniciar. Intervalo em memória apenas redesenha e verifica a conclusão; o tempo restante é `max(0, deadline − Date.now())`. Pausar salva restante; retomar cria novo deadline. Recuperação registra uma sessão por ID. Falha de gravação não anuncia sucesso; estado corrompido é rejeitado sem sobrescrever o histórico. Mudanças manuais no relógio do aparelho podem afetar o cálculo.

Não há notificações locais nem promessa de execução contínua com app suspenso. Foco não sincroniza com Web ou outro aparelho. Sessões encerradas manualmente não são contadas como concluídas. O histórico mostra as 30 mais recentes, mas totais incluem todas.

## Fórmulas

- Atraso: status diferente de CONCLUIDA e prazo anterior à data civil de hoje. Horário opcional não altera esse indicador.
- Conclusão geral: `100 × tarefas atualmente concluídas / total`; lista vazia resulta em 0.
- Progresso do dia: tarefas concluídas **com prazo hoje** / tarefas com prazo hoje.
- Conclusões do dia: tarefas com pelo menos um instante de conclusão naquela data local. Cada tarefa conta uma vez por dia.
- Semana: segunda a domingo; gráfico usa o histórico de conclusões. Reabertura não apaga eventos anteriores.
- Sequência: dias consecutivos com alguma conclusão, começando hoje ou ontem se hoje estiver vazio.
- Prioridade/categoria: contagem no conjunto atual; barra = contagem / total.
- Minutos de foco: soma das durações de sessões concluídas do modo foco / 60000, arredondada para baixo; pausas excluídas.
- Meta: valor alcançado / valor configurado, barra limitada a 100%.
- Exclusão remove a tarefa do conjunto e seu histórico. Conclusões legadas sem histórico não ganham datas inventadas.

Regras de recorrência/migração: `../organiza-ai-web/database/migrations/README.md`.

## Executar

Backend local isolado (H2 em memória, não Supabase):

```bash
cd ../organiza-ai-web/backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Mobile, em outro terminal:

```bash
cd ../organiza-ai
npm ci
npm start
# ou
npm run android
npm run ios
npm run web
```

No dispositivo físico, informar IP LAN do computador (ex. `192.168.1.50`) no login; o formato legado usa porta 8080. Também aceita URL HTTPS/porta explícita. Não há credenciais embutidas. O arquivo `.env.example` oferece configuração pública opcional.

Android Emulator: normalmente `http://10.0.2.2:8080`. Simulador iOS: normalmente `http://localhost:8080`. App nativo distribuído deve usar HTTPS; acesso HTTP em builds próprios depende das políticas de rede do Android/iOS e precisa de validação específica.

## Validar

```bash
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo install --check
npm run export
```

`expo export` gera bundles JS/Hermes Android/iOS/Web, não APK/AAB/IPA assinados. Testes Jest usam fronteira HTTP simulada; testes Java exercitam API HTTP real sobre H2.

## Dependências adicionadas

SecureStore: credencial nativa. AsyncStorage: preferências/foco locais. SystemUI: tema automático no SDK. Feather/vector-icons e expo-font/asset: ícones locais compatíveis. React DOM/RN Web: prévia de validação. TypeScript, ESLint Expo, Jest Expo e Testing Library: qualidade. Sem atualização de SDK/RN.

## Demonstração

Roteiro e seed: `../organiza-ai-web/docs/DEMONSTRACAO-MOBILE-2.0.md`. A conta e todas as tarefas de exemplo usam prefixo DEMO; o seed nunca sobrescreve registros existentes.

## Limites de validação

Consulte `../organiza-ai-web/docs/MOBILE-2.0-ENTREGA.md` para resultados efetivamente executados. Testes em navegador e exportações não equivalem a testes em dispositivos Android/iOS. Migração PostgreSQL deve ser ensaiada antes da implantação coordenada.
