# Padrões de Microsserviços

## 1. Quando usar (e quando não)

- Microsserviços resolvem problema de escala organizacional (times independentes) e de escala técnica
  (partes do sistema com perfis de carga muito diferentes). Não é o padrão default para todo projeto novo —
  um monólito bem modularizado é preferível até existir uma razão concreta para separar.
- Essa decisão é sempre discutida e confirmada com o usuário, nunca assumida silenciosamente.

## 2. Fronteiras de serviço

- Cada serviço tem um bounded context claro (DDD), dono de seus próprios dados — nenhum outro serviço acessa
  o banco de outro serviço diretamente.
- Comunicação entre serviços só via API (síncrona) ou evento (assíncrona) — nunca via banco compartilhado.

## 3. Comunicação síncrona

- REST ou gRPC (gRPC quando latência/throughput interno for crítico e os times controlam ambas as pontas).
- Timeout explícito em toda chamada entre serviços — nunca chamada sem timeout.
- Circuit breaker (Resilience4j, Polly, opossum, etc.) para evitar cascata de falha quando um serviço
  downstream degrada.
- Retry com backoff exponencial e jitter, limitado a operações idempotentes.

## 4. Comunicação assíncrona

- Mensageria (Kafka, RabbitMQ, SQS/SNS, Service Bus) para eventos de domínio e desacoplamento entre serviços.
- Outbox pattern para garantir consistência entre escrita no banco local e publicação de evento (evita
  perder evento em caso de falha entre commit e publish).
- Eventos versionados e com schema explícito (Avro/JSON Schema/Protobuf) — mudança breaking de evento segue
  o mesmo cuidado de versionamento de API.
- Consumidores idempotentes (tratam reentrega/duplicata de mensagem sem efeito colateral duplicado).

## 5. Dados e consistência

- Cada serviço com seu próprio schema/banco (mesmo que compartilhem a instância física do SGBD por custo,
  logicamente isolados).
- Consistência eventual assumida entre serviços; transação distribuída (saga) usada para fluxos multi-serviço
  que precisam de compensação em caso de falha parcial.

## 6. Observabilidade distribuída

- Tracing distribuído (OpenTelemetry) com propagação de contexto entre serviços — obrigatório, não opcional,
  em arquitetura de microsserviços (sem isso, debugar produção é inviável).
- Logs estruturados (JSON) com `traceId` correlacionando requisição através dos serviços.
- Métricas de saúde por serviço (latência, taxa de erro, saturação) expostas para o sistema de monitoramento.

## 7. Deploy e infraestrutura

- Cada serviço com seu próprio pipeline de CI/CD e deploy independente — acoplamento de deploy entre
  serviços é um sinal de que a fronteira está errada.
- Health check (`/health`, `/ready`) exposto por todo serviço para orquestrador (Kubernetes, ECS, etc.).
- Configuração externa ao artefato (variáveis de ambiente, config server) — imagem/artefato é o mesmo em
  todos os ambientes.

## 8. API Gateway / BFF

- Gateway centraliza autenticação, rate limiting e roteamento quando há múltiplos serviços expostos
  externamente — clients não conhecem a topologia interna dos serviços.
- Backend-for-Frontend (BFF) considerado quando diferentes clients (web, mobile) precisam de agregações
  diferentes dos mesmos serviços.
