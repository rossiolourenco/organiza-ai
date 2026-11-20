# Diretrizes de Arquitetura — Mobile

## 1. Escolha de abordagem

- Nativo (Swift/SwiftUI no iOS, Kotlin/Jetpack Compose no Android): melhor performance e acesso a
  plataforma, custo de manter 2 bases de código.
- Cross-platform (React Native, Flutter): uma base de código para ambas as plataformas, bom para times
  pequenos ou apps com UI não excessivamente customizada por plataforma.
- Decisão sempre confirmada com o usuário (ver `AI-GUIDELINES.md` seção 0), considerando equipe existente,
  prazo e necessidade de recursos nativos específicos.
- Projeto já existente: manter a abordagem já adotada, salvo decisão explícita de reescrita.

## 2. Estrutura e padrão de camadas

- MVVM (ou MVI) como padrão recomendado: View (UI declarativa/imperativa) → ViewModel (estado e lógica de
  apresentação) → Repository (fonte de dados: API, banco local, cache) → Domínio (regras de negócio, quando
  o app tiver complexidade que justifique).
- ViewModel não referencia componente de UI diretamente (testável sem instanciar tela).
- Repository abstrai a fonte de dado real (API vs. cache local) da camada de apresentação.

## 3. Estado e dados locais

- Fonte única de verdade por dado (evitar duplicar o mesmo estado em múltiplos lugares sincronizados
  manualmente).
- Persistência local (SQLite/Room/CoreData/Realm ou storage do framework cross-platform) para suporte
  offline quando o requisito de produto exigir; estratégia de sincronização e resolução de conflito definida
  explicitamente (last-write-wins, merge, ou intervenção do usuário).
- Cache de rede com invalidação explícita (TTL ou invalidação por evento), nunca cache "para sempre" sem
  critério.

## 4. Rede

- Cliente HTTP único e centralizado (não instanciar cliente ad-hoc em cada tela) com interceptors para auth,
  retry, logging.
- Timeout e tratamento de estado offline/erro de rede em toda chamada — UI sempre trata estado de
  loading/erro/vazio, nunca assume sucesso.
- Nunca hardcode de URL/chave de API sensível no bundle do app sem necessidade — segredo de backend nunca
  embarcado no cliente mobile (client é ambiente não confiável).

## 5. Navegação

- Navegação centralizada/tipada (Navigation Compose, SwiftUI NavigationStack, React Navigation, GoRouter) —
  evitar navegação ad-hoc espalhada sem previsibilidade de pilha.
- Deep links tratados de forma explícita e validados (nunca navegar/executar ação com base em deep link sem
  validar parâmetros).

## 6. Performance e UX

- Listas grandes usam virtualização/recycling (RecyclerView/LazyColumn/FlatList) — nunca renderizar lista
  não virtualizada com centenas de itens.
- Operação de I/O (rede, disco, banco) sempre fora da thread principal/main thread.
- Imagens carregadas com cache e redimensionamento adequado (Glide/Coil/Kingfisher/`expo-image` etc.),
  evitando carregar imagem em resolução maior que a necessária para a tela.

## 7. Segurança específica mobile

- Dado sensível local (token, credencial) armazenado em Keychain (iOS) / Keystore (Android) / secure storage
  do framework — nunca em `UserDefaults`/`SharedPreferences`/`localStorage` puro sem criptografia.
- Certificate pinning avaliado para apps com dado altamente sensível (financeiro, saúde).
- Ofuscação/minificação de build de produção habilitada (ProGuard/R8 no Android).

## 8. Testes

- Testes de ViewModel/lógica de apresentação isolados da UI (sem precisar de emulador para rodar).
- Testes de UI (Espresso/XCUITest/Detox/Maestro) cobrindo os fluxos críticos (golden path), não a totalidade
  de telas.
