# Diretrizes de Arquitetura

## 1. Ponto de partida: monólito modular

- Default para projeto novo: monólito bem modularizado por domínio (módulos internos com fronteiras claras),
  não microsserviços. Migrar para microsserviços é uma decisão posterior, justificada por necessidade real
  (ver `03-api-design/microservices-standards.md` seção 1).

## 2. Camadas (Clean/Hexagonal Architecture)

```
Apresentação (controller/handler/UI)
        │
        ▼
Aplicação (casos de uso, orquestração)
        │
        ▼
Domínio (entidades, regras de negócio, interfaces de porta)
        │
        ▲
Infraestrutura (banco, filas, integrações externas — implementa as portas do domínio)
```

- Regra de dependência: código de domínio nunca importa código de infraestrutura. Infraestrutura implementa
  interfaces definidas pelo domínio (Dependency Inversion).
- Casos de uso (camada de aplicação) orquestram entidades de domínio e portas de infraestrutura; não contêm
  regra de negócio duplicada da camada de domínio.

## 3. Organização de pastas (baseline, adaptar por linguagem)

- Por domínio/feature (preferível para projetos médios/grandes) em vez de por tipo técnico
  (`controllers/`, `services/` genéricos misturando domínios diferentes).
- Cada domínio expõe uma interface pública clara; detalhes internos não são importados diretamente por outros
  domínios.

## 4. Decisões arquiteturais

- Toda decisão relevante (escolha de padrão, troca de biblioteca estrutural, introdução de fila/cache/nova
  dependência de infraestrutura) gera um ADR (`07-documentation/adr-template.md`).
- Reversibilidade importa: preferir decisões reversíveis (portas/adaptadores trocáveis) a decisões que travam
  o sistema em uma tecnologia específica, especialmente em pontos de incerteza alta.

## 5. Padrões recomendados por cenário

| Cenário | Padrão sugerido |
|---|---|
| CRUD simples, baixa complexidade de regra de negócio | Transaction Script / camada de serviço simples |
| Regra de negócio complexa, muitas invariantes | Domain Model rico (DDD tático: entidades, agregados, value objects) |
| Múltiplas fontes de dados/necessidade de trocar infraestrutura | Repository pattern + Dependency Inversion |
| Processos com múltiplos passos e necessidade de auditoria/replay | Event Sourcing (avaliar custo/benefício — não é default) |
| Leitura e escrita com padrões de acesso muito diferentes | CQRS (avaliar custo/benefício — não é default) |

- Nenhum desses padrões é aplicado por padrão automaticamente — a complexidade adicional é sempre justificada
  pelo problema real, não adotada "porque é boa prática" isoladamente.

## 6. Escalabilidade e resiliência

- Stateless por padrão nos serviços de aplicação (estado fica no banco/cache compartilhado, não em memória
  do processo), permitindo escalar horizontalmente.
- Configuração de timeout, retry e circuit breaker em toda chamada externa (rede, banco, fila) — ver
  `03-api-design/microservices-standards.md` seção 3 quando aplicável.
- Graceful shutdown implementado (finalizar requisições em andamento antes de encerrar o processo em
  deploy/scale-down).

## 7. Diagramas

- Diagrama de contexto (C4 nível 1-2) mantido atualizado para qualquer sistema com mais de um serviço/
  integração externa relevante — salvo como parte da documentação do projeto (`07-documentation/`).
