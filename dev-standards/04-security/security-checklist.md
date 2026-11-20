# Checklist de Segurança

> Baseado no OWASP Top 10 e OWASP ASVS. Transversal — revisar em todo PR que toca autenticação, dados
> sensíveis, entrada de usuário ou integração externa. Não é opcional: ver `AI-GUIDELINES.md` princípio 1.

## 1. Controle de acesso

- [ ] Toda rota/endpoint sensível exige autenticação; autorização (permissão específica) verificada no
      backend, nunca só na UI.
- [ ] IDOR (Insecure Direct Object Reference) evitado: usuário A não consegue acessar recurso do usuário B
      trocando um ID na URL — checagem de posse/permissão em toda consulta por ID.
- [ ] Princípio do menor privilégio: usuário de banco, service account e chaves de API com escopo mínimo
      necessário.

## 2. Injeção

- [ ] Toda query SQL/NoSQL parametrizada — nenhuma concatenação de string de entrada do usuário em query.
- [ ] Comandos de shell nunca montados por concatenação de entrada do usuário (usar API estruturada, não
      `exec`/`system` com string interpolada).
- [ ] Entrada usada em `eval`/deserialização dinâmica tratada como não confiável por padrão (evitar
      `eval`/`pickle`/deserialização insegura sobre dado externo).

## 3. Validação de entrada

- [ ] Toda entrada externa (body, query string, header, upload) validada na borda (schema/DTO), com tipo,
      formato e tamanho esperados.
- [ ] Upload de arquivo valida tipo real (magic bytes, não só extensão) e tamanho máximo; armazenado fora do
      diretório executável da aplicação.
- [ ] Whitelist preferida a blacklist para validação de formato.

## 4. Autenticação e sessão

- [ ] Senha nunca armazenada em texto plano ou hash fraco (MD5/SHA1) — usar bcrypt/Argon2/scrypt.
- [ ] Política de senha mínima (comprimento, não reutilizar senha vazada — checagem contra
      HaveIBeenPwned/similar quando viável).
- [ ] MFA disponível para contas sensíveis/administrativas.
- [ ] Token de sessão/JWT com expiração curta + refresh token; JWT nunca carrega dado sensível não
      criptografado no payload (payload de JWT é apenas assinado, não é secreto).
- [ ] Logout invalida sessão/token no servidor (não só remove do client).

## 5. Exposição de dados sensíveis

- [ ] TLS obrigatório em todo tráfego (HTTP → HTTPS redirect, HSTS habilitado).
- [ ] Dado sensível (PII, financeiro) criptografado em repouso quando aplicável; nunca em log.
- [ ] Mensagem de erro para o client não revela detalhe interno (stack trace, versão de biblioteca, query).
- [ ] Headers de segurança configurados: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`,
      `X-Frame-Options`/`frame-ancestors`, `Strict-Transport-Security`.

## 6. CSRF/XSS (aplicações web)

- [ ] Proteção CSRF em toda operação que muda estado via cookie de sessão (token CSRF ou `SameSite=Strict/Lax`
      no cookie).
- [ ] Saída para HTML sempre escapada (o framework de template faz isso por padrão — não desabilitar
      escaping sem necessidade justificada e sanitização manual equivalente).
- [ ] `Content-Security-Policy` restringindo origem de script executável.

## 7. Configuração e segredos

- [ ] Nenhum segredo (chave, token, senha, connection string) commitado no repositório — usar variáveis de
      ambiente/vault, `.env` no `.gitignore`, `.env.example` sem valores reais.
- [ ] Dependências auditadas (`npm audit`/`pip-audit`/`dotnet list package --vulnerable`/OWASP Dependency
      Check) no CI, com política de atualização para vulnerabilidade crítica/alta.
- [ ] Ambiente de produção não expõe ferramentas de debug/console administrativo publicamente.

## 8. Logging e monitoramento

- [ ] Eventos de segurança relevantes logados (login falho, mudança de permissão, ação administrativa) sem
      logar dado sensível (senha, token, número de cartão completo).
- [ ] Alertas configurados para padrão anômalo (múltiplas falhas de login, spike de erro 401/403).

## 9. Rate limiting e disponibilidade

- [ ] Rate limiting em endpoints sensíveis (login, reset de senha, endpoints públicos custosos).
- [ ] Timeout configurado em toda chamada de rede de saída (nunca chamada sem timeout, risco de exaustão de
      recursos).

## 10. SSRF e integrações externas

- [ ] URL fornecida por usuário nunca usada diretamente para requisição server-side sem validação de
      allowlist (proteção contra SSRF).
- [ ] Webhooks recebidos validam assinatura/origem antes de processar.
