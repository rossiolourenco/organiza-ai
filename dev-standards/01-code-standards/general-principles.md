# Princípios Gerais de Código (agnósticos de linguagem)

Aplicam-se independentemente da linguagem escolhida. Os arquivos específicos por linguagem neste mesmo
diretório complementam — nunca contradizem — estes princípios.

## 1. Legibilidade e simplicidade

- Nomes de variáveis, funções e classes devem revelar intenção. Evitar abreviações obscuras.
- Funções pequenas, com responsabilidade única. Se precisa de "e" para descrever o que faz, provavelmente
  deve ser dividida.
- Preferir código explícito a "esperto". Otimização prematura é proibida — otimizar só com dado (profiling)
  que justifique.
- Sem comentários que descrevem o óbvio. Comentar apenas o "porquê" não-óbvio (uma decisão, uma limitação, um
  workaround para um bug externo).
- Nenhuma abstração especulativa: não criar interface/camada genérica para um caso de uso hipotético futuro.

## 2. Estrutura e organização

- Separação clara de camadas: apresentação (controller/handler) → aplicação (casos de uso/serviços) → domínio
  (regras de negócio) → infraestrutura (banco, filas, integrações externas).
- Dependências apontam sempre para dentro (domínio não depende de infraestrutura).
- Um módulo/arquivo não deve misturar responsabilidades de camadas diferentes.

## 3. Tratamento de erros

- Nunca engolir exceções silenciosamente (`catch` vazio).
- Erros de negócio (esperados) são diferenciados de erros técnicos (inesperados) — tipos/classes de erro
  distintos, códigos HTTP/status apropriados.
- Mensagens de erro para o usuário final não vazam detalhes internos (stack trace, query SQL, caminho de
  arquivo). Logs internos podem ter detalhe completo.
- Falhar rápido (fail fast) em entradas inválidas, com validação na borda do sistema.

## 4. Formatação e lint

- Todo projeto deve ter linter + formatter configurados e rodando em pre-commit/CI (ESLint+Prettier,
  Checkstyle/Spotless, dotnet format, Black+Ruff, conforme a linguagem).
- Zero warnings tolerados no CI para regras de severidade alta (bugs prováveis, código morto, segurança).
- Usar o `.editorconfig` de `10-boilerplate/` como base.

## 5. Controle de versão de dependências

- Dependências fixadas por lockfile (`package-lock.json`/`pnpm-lock.yaml`, `poetry.lock`, etc.), nunca por
  ranges soltos em produção.
- Antes de adicionar uma dependência nova: verificar manutenção ativa, licença compatível, tamanho do impacto
  (bundle/imagem), e se não é possível resolver com o que já existe no projeto.
- Rodar auditoria de vulnerabilidades (`npm audit`, `pip-audit`, `dotnet list package --vulnerable`, etc.)
  periodicamente e no CI.

## 6. Revisão e qualidade contínua

- Todo código gerado por IA passa pelo mesmo padrão de revisão que código escrito por humano: legibilidade,
  testes, segurança, performance razoável.
- Complexidade ciclomática alta é sinal de que a função deve ser quebrada.
- Duplicação de lógica de negócio (não de dado, não de boilerplate trivial) é extraída para função/método
  compartilhado — mas sem forçar abstração prematura para 2 ocorrências que podem divergir.

## 7. Internacionalização e acessibilidade (quando aplicável a front-end/mobile)

- Strings de UI nunca hardcoded quando o projeto suporta múltiplos idiomas — usar chave de tradução.
- Componentes de UI seguem práticas mínimas de acessibilidade (labels, contraste, navegação por teclado).
