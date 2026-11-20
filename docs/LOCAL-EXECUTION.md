# Execução local — Mobile

## 1. Caminho oficial

```text
/Users/rossiolourenco/ProjetosFaama/organiza-ai
```

**Não execute** `organiza-ai - cópia` nem os ZIPs de `~/Downloads`; eles contêm o app acadêmico 1.0.0
com `IP do servidor`.

## 2. Início

```bash
cd /Users/rossiolourenco/ProjetosFaama/organiza-ai
npm start
```

- Expo Web: `http://localhost:8081`
- Expo nativo: porta indicada pelo Expo (atual `8082`)
- API padrão: `https://organizaai.evox.net.br/api`

Para usar o backend local:

```bash
cd /Users/rossiolourenco/ProjetosFaama/organiza-ai
EXPO_PUBLIC_API_URL=http://localhost:8080 npm start
```

O backend local precisa permitir a origem do Expo Web (`8081` já está no profile local). Em
dispositivo físico, use o IP LAN do Mac; não reintroduza o campo de IP na UI.

## 3. Cache do Metro

Se a versão/configuração antiga aparecer:

```bash
npx expo start -c
```

Isso limpa o cache do Metro. Na validação 3.2, o Perfil mostrava `v1.0.0` antes do `-c` e passou a
`v3.2.0` depois.

## 4. Testes

```bash
npm run typecheck
npm run lint
npm test -- --silent
npm run doctor
npm run export
npm run verify
```

## 5. Simulador iOS

O Xcode está configurado em `/Volumes/HDAppExternos/Apps/Xcode.app`. Se o volume não estiver
montado, o `xcrun` falha; nesse caso, use a prévia Web ou reconecte o HD externo. Não foi possível
validar aparelho físico nesta execução.

## 6. Contas locais

- Crie uma conta comum em `/cadastro`.
- O admin local é criado pelo backend com `ADMIN_BOOTSTRAP_*` (ver `docs/LOCAL-EXECUTION.md` do
  Web). Não commite senhas.
- O H2 local é em memória: reiniciar o backend apaga as contas/dados.

## 7. Problemas comuns

| Sintoma | Causa | Ação |
|---|---|---|
| Campo “IP do servidor” | app/cache antigo | usar repositório oficial e `-c` |
| Layout acadêmico | cópia `organiza-ai - cópia` | executar o caminho oficial |
| Versão `v1.0.0` | cache do Metro | `npx expo start -c` |
| Login falha local | API/CORS/conta | verificar `EXPO_PUBLIC_API_URL` e CORS |
| Porta 8081/8082 ocupada | outra sessão Expo | encerrar a duplicada |
| Xcode indisponível | HD externo desmontado | reconectar ou usar Expo Web |

## 8. Distribuição

Não publique em loja nesta fase. O código/bundles 3.2 estão prontos, mas é necessário build assinado
EAS/APK/AAB/IPA e autorização.
