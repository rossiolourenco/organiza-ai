# dev-standards — Framework de Padrões para Desenvolvimento Assistido por IA

Este é um **template reutilizável**: um conjunto de arquivos de orientação que qualquer IDE com IA (Claude
Code, Cursor, GitHub Copilot, Windsurf etc.) deve carregar como contexto para gerar código de forma
consistente, segura e alinhada a boas práticas — em vez de partir do zero a cada novo projeto ou pedido.

## Como usar em um novo projeto

1. Copie a pasta `dev-standards/` inteira para a raiz do repositório do novo projeto.
2. Rode com o agente o `00-bootstrap/discovery-checklist.md` para alinhar contexto, requisitos e stack.
3. Preencha `00-bootstrap/stack-decision-record.md` com a stack decidida e confirmada — salve como
   `STACK.md` na raiz do projeto.
4. Remova (ou marque como "não aplicável") os arquivos de linguagem/banco em `01-code-standards/` e
   `02-database/` que não se aplicam a este projeto, para manter o contexto enxuto.
5. Crie um `CLAUDE.md` (ou arquivo equivalente lido automaticamente pela sua IDE) na raiz apontando para
   `dev-standards/AI-GUIDELINES.md`, por exemplo:
   ```markdown
   # CLAUDE.md
   Antes de qualquer implementação, siga as diretrizes em `dev-standards/AI-GUIDELINES.md`.
   Stack deste projeto: ver `STACK.md`.
   ```
6. Copie os arquivos de `10-boilerplate/` para os locais reais (`.editorconfig`,
   `.github/pull_request_template.md`).
7. Use os prompts de `09-prompts/` como ponto de partida ao pedir features, bugfixes, revisões e
   refatorações ao agente.

## Como usar em um projeto já existente

1. Copie a pasta `dev-standards/` para a raiz.
2. Rode o discovery checklist — a IA deve **detectar a stack já em uso** (ver `AI-GUIDELINES.md` seção 0) e
   preencher `STACK.md` refletindo o que já existe, não o que seria ideal do zero.
3. Adote os padrões gradualmente nas partes tocadas por novo trabalho — não é necessário (nem recomendado)
   reescrever o projeto inteiro para "se adequar" ao template de uma vez.

## Mapa da estrutura

| Pasta | Conteúdo |
|---|---|
| `AI-GUIDELINES.md` | Arquivo raiz — carregar sempre. Regras não-negociáveis e ordem de leitura dos demais. |
| `00-bootstrap/` | Checklist de descoberta + registro de decisão de stack |
| `01-code-standards/` | Padrões de código gerais + por linguagem (Node/TS, Java/Spring, .NET, Python) |
| `02-database/` | Padrões de banco gerais + por SGBD (PostgreSQL, MySQL, MongoDB, SQL Server) |
| `03-api-design/` | Padrões de API REST e de microsserviços |
| `04-security/` | Checklist de segurança (OWASP) — transversal, revisar sempre |
| `05-architecture/` | Diretrizes de arquitetura geral e mobile |
| `06-testing/` | Estratégia e pirâmide de testes |
| `07-documentation/` | Templates de README, ADR e changelog |
| `08-versioning/` | Fluxo de git, convenção de commit, versionamento semântico |
| `09-prompts/` | Prompts prontos para pedir feature, bugfix, code review, refactor |
| `10-boilerplate/` | Arquivos prontos para copiar (`.editorconfig`, template de PR) |

## Manutenção deste template

Este framework não é estático. Quando uma decisão nova se mostrar recorrente entre projetos (uma
convenção, uma lição aprendida, uma ferramenta padrão), atualize o arquivo correspondente aqui em vez de
repetir a explicação a cada novo projeto.
