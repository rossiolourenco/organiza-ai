# AI-GUIDELINES.md — Constituição de Desenvolvimento

> **Este é o arquivo raiz.** Toda IDE/agente de IA (Claude Code, Cursor, Copilot, Windsurf etc.) deve carregar este
> arquivo como contexto antes de gerar qualquer código. Ele referencia os demais módulos em `dev-standards/`.
> Copie a pasta `dev-standards/` para a raiz de cada novo projeto (ou aponte a IDE para um repositório
> compartilhado) e ajuste apenas os arquivos `STACK.md` e `00-bootstrap/stack-decision-record.md` gerados por
> projeto.

## 0. Regra de ouro: nunca presumir a stack

Antes de escrever a primeira linha de código em qualquer tarefa, o agente **deve**:

1. **Projeto já iniciado** → detectar a stack existente (linguagem, framework, banco, gerenciador de pacotes,
   estilo de código já usado) lendo `package.json`/`pom.xml`/`.csproj`/`requirements.txt`/`pyproject.toml`,
   configs de lint, migrations, etc. — e **continuar no mesmo padrão**. Não introduzir uma segunda linguagem,
   ORM ou convenção sem justificativa e aprovação explícita.
2. **Projeto novo baseado em sistema existente/open-source** → identificar a stack do sistema-base e
   **permanecer nela**, mesmo que não seja a preferência padrão do agente.
3. **Projeto totalmente novo, sem base definida** → analisar os requisitos (tipo de aplicação, carga esperada,
   equipe, requisitos não-funcionais) e **recomendar** a melhor stack, com prós/contras objetivos.
4. **Em todos os casos** → **sempre perguntar e obter confirmação explícita do usuário antes de iniciar a
   implementação**, apresentando: stack escolhida (linguagem, framework, banco de dados, ORM/driver) e o
   motivo. Preencher `00-bootstrap/stack-decision-record.md` com a decisão. Nunca seguir em frente com
   suposições silenciosas sobre stack.

Só depois desse alinhamento o agente aplica os padrões dos módulos abaixo.

## 1. Ordem de leitura recomendada para o agente

| Ordem | Arquivo | Quando se aplica |
|---|---|---|
| 1 | `00-bootstrap/discovery-checklist.md` | Sempre, no início de qualquer tarefa/feature nova |
| 2 | `01-code-standards/general-principles.md` + arquivo da linguagem específica | Antes de escrever código |
| 3 | `02-database/general-principles.md` + arquivo do banco específico | Ao tocar em modelagem/queries/migrations |
| 4 | `03-api-design/*.md` | Ao criar ou alterar endpoints/contratos |
| 5 | `04-security/security-checklist.md` | Sempre — é transversal, revisar em todo PR |
| 6 | `05-architecture/*.md` | Ao decidir estrutura de pastas/camadas/serviços |
| 7 | `06-testing/testing-strategy.md` | Ao implementar qualquer funcionalidade (testes não são opcionais) |
| 8 | `07-documentation/*.md` | Ao finalizar uma feature (README, ADR, changelog) |
| 9 | `08-versioning/*.md` | Ao commitar, versionar, abrir PR |
| 10 | `09-prompts/*.md` | Templates de prompt que o usuário/agente reutiliza para pedir trabalho |

## 2. Princípios não-negociáveis

1. **Segurança antes de conveniência.** Nunca sacrificar um item do `security-checklist.md` para entregar
   mais rápido sem avisar o usuário do risco assumido.
2. **Sem código morto, sem placeholder silencioso.** Se algo não pôde ser implementado, isso é dito
   explicitamente — nunca um `TODO` silencioso é apresentado como concluído.
3. **Consistência > preferência pessoal do agente.** Seguir o padrão já estabelecido no projeto mesmo que o
   agente "prefira" outra abordagem. Sugerir mudanças como proposta, não como fato consumado.
4. **Menor mudança possível para o objetivo.** Não refatorar, renomear ou reorganizar código fora do escopo
   pedido. Mudanças amplas são propostas separadamente e aprovadas antes de executadas.
5. **Toda decisão arquitetural relevante gera um ADR** (`07-documentation/adr-template.md`), não só um
   comentário no código.
6. **Todo endpoint, tabela ou fluxo sensível passa pelo checklist de segurança** antes de ser considerado
   pronto.
7. **Versionamento semântico e commits convencionais são obrigatórios** — ver `08-versioning/`.
8. **Nunca commitar segredos** (chaves, tokens, strings de conexão, senhas). Usar variáveis de ambiente e
   `.env.example` sem valores reais.

## 3. Como adaptar este template a um novo projeto

1. Copiar a pasta `dev-standards/` para a raiz do novo repositório.
2. Rodar o processo de `00-bootstrap/discovery-checklist.md` com o usuário.
3. Preencher `00-bootstrap/stack-decision-record.md`.
4. Apagar (ou marcar como "não aplicável") os arquivos de linguagem/banco que não forem usados nesse projeto,
   para reduzir ruído de contexto — manter apenas os relevantes.
5. Criar `CLAUDE.md` (ou equivalente da IDE usada) na raiz do projeto com um resumo enxuto que aponte para
   `dev-standards/AI-GUIDELINES.md`, já que muitas IDEs carregam automaticamente esse tipo de arquivo.

## 4. Escopo coberto por este framework

- Padrões de código por linguagem (`01-code-standards/`)
- Padrões de banco de dados por SGBD (`02-database/`)
- Design de API REST e microsserviços (`03-api-design/`)
- Segurança (`04-security/`)
- Arquitetura e organização de pastas, incluindo mobile (`05-architecture/`)
- Estratégia de testes (`06-testing/`)
- Documentação (README, ADR, changelog) (`07-documentation/`)
- Versionamento (git flow, commits, semver) (`08-versioning/`)
- Prompts padronizados para pedir trabalho ao agente (`09-prompts/`)
- Boilerplate reutilizável (`.editorconfig`, template de PR, etc.) (`10-boilerplate/`)
