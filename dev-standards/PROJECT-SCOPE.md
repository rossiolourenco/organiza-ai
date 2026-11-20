# Escopo de aplicação do dev-standards — Mobile

O framework completo é mantido para reprodutibilidade. A seleção abaixo define o que é carregado
pelo `opencode.json` e consultado nas tarefas deste projeto.

| Arquivo | Aplicação |
|---|---|
| `AI-GUIDELINES.md` | Obrigatório |
| `00-bootstrap/*` | Obrigatório em feature nova |
| `01-code-standards/general-principles.md` | Obrigatório |
| `01-code-standards/nodejs-typescript.md` | Obrigatório (React Native/TS) |
| `01-code-standards/java-spring.md` | Não aplicável (backend em outro repositório) |
| `01-code-standards/dotnet-csharp.md`, `python.md` | Não aplicável |
| `02-database/*` | Não aplicável diretamente; dados via API |
| `03-api-design/rest-api-standards.md` | Obrigatório para consumir/contratar API |
| `03-api-design/microservices-standards.md` | Não aplicável |
| `04-security/security-checklist.md` | Obrigatório |
| `05-architecture/mobile-architecture.md` | Obrigatório |
| `05-architecture/architecture-guidelines.md` | Referência para integração com o backend |
| `06-testing/testing-strategy.md` | Obrigatório |
| `07-documentation/*` | Obrigatório ao documentar |
| `08-versioning/*` | Obrigatório ao versionar |
| `09-prompts/*` | Referência de trabalho |
| `10-boilerplate/*` | Referência; `.editorconfig` e PR template já copiados |

## Dívidas conhecidas (não corrigidas nesta intervenção)

- `App.backup.js`, `index.js` legado e diretórios vazios (`componentes/`, `servicos/`) são resíduos
  acadêmicos (P3) e devem ser removidos em uma limpeza autorizada.
- README ainda contém seções históricas; a seção 3.2 está nos documentos novos.
- Sem Prettier configurado (P3), embora ESLint e typecheck existam.
- Sem build assinado publicado em loja (dependência de release).
