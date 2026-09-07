# Technology Preferences

Status: living document

Last consolidated: 2026-09-07

Audience: maintainers, reviewers, and coding agents

## 1. 문서의 성격

이 문서는 Saturday Dinner Club 프로젝트들에서 반복적으로 확인되었거나 소유자가 명시적으로 정한 기술 선택과 그 근거를 정리한다. 새 구현을 시작할 때 탐색 공간을 줄이기 위한 기본값이지, 모든 문제에 동일한 스택을 강제하는 목록은 아니다.

기술은 다음 순서로 선택한다.

1. 먼저 도메인 불변식, 내구성 경계, 지연 목표, 복구 방법과 운영 단위를 정한다.
2. 그 요구를 이미 만족하는 선호 기술이 있으면 재사용한다.
3. 선호 기술이 맞지 않으면 다른 기술을 선택하되, 달라진 요구와 운영 비용을 기록한다.
4. 제품별 버전, 토폴로지, 스키마와 튜닝 값은 해당 퀀텀의 문서와 manifest가 소유한다.

여기서 `기본`은 여러 퀀텀에서 반복 사용되었거나 명시적으로 정해져 새 작업에도 우선 검토할 선택, `조건부`는 특정 workload에서 선호하는 선택, `실험`은 구현 또는 가능성은 확보했지만 운영 기본값으로 확정하지 않은 선택을 뜻한다.

## 2. 언어와 런타임

### Go: 상태를 소유하는 백엔드와 장수명 프로세스의 기본

도메인 상태와 전이의 권위를 소유하는 API, 네트워크 edge, worker, publisher와 control plane은 Go를 우선한다. 특히 transaction, lease, queue, 장수명 connection이나 여러 dependency의 lifecycle을 함께 소유하는 프로세스에 적용한다.

선택 근거:

- 단일 바이너리와 명시적인 프로세스 lifecycle이 VM 및 container 배포에 잘 맞는다.
- 동시 연결, bounded queue, worker orchestration과 graceful shutdown을 비교적 단순하게 표현할 수 있다.
- 표준 라이브러리의 HTTP, context, crypto와 testing을 중심에 두고 필요한 protocol client만 추가할 수 있다.
- Accounts, Channel, Chat, Stream, Log가 같은 언어와 관측 facade를 사용하므로 운영·리뷰·장애 분석 방식이 일관된다.

구현 기본값:

- framework보다 표준 라이브러리와 작은 명시적 adapter를 먼저 검토한다.
- Go의 관계형 DB 접근은 명시적인 SQL을 유지하면서 typed code를 생성하는 `sqlc`를 선호하고, PostgreSQL driver/pool은 `pgx/v5`를 우선한다. Redis는 `rueidis`, Cassandra는 `gocql`, Kafka는 `franz-go`, NATS는 공식 Go client/server를 우선한다.
- module 버전은 각 레포가 고정한다. 현재 모든 Go 퀀텀이 같은 Go toolchain을 쓰는 사실을 영구적인 버전 정책으로 일반화하지 않는다.
- 재현 가능한 release/container build가 중요하면 dependencies를 vendor한다. sibling `replace`는 로컬 개발 편의이며 배포 계약이 아니다.

Go가 부적합한 특화 codec, 브라우저 UI, 데이터 과학 작업까지 억지로 Go로 다시 만들지 않는다.

### Sidecar와 ambassador: Go 또는 Rust 우선

sidecar, ambassador, local proxy, protocol adapter처럼 다른 application과 함께 배포되어 data/control path를 중개하는 프로세스는 Go 또는 Rust를 우선한다. 이 선택은 현재 레포의 반복 사용뿐 아니라 명시적인 소유자 선호를 반영한다.

- orchestration, 동시 연결, 빠른 구현과 기존 Saturday Dinner Club client 생태계 재사용이 중요하면 Go를 먼저 본다.
- 낮은 runtime overhead, 엄격한 memory ownership, low-level protocol 처리나 resource predictability가 더 중요하면 Rust를 먼저 본다.
- 어느 쪽이든 bounded buffering, backpressure, readiness, drain, peer application과의 version compatibility를 sidecar 계약으로 다룬다.

### 무상태·특수목적 API: NestJS 또는 FastAPI 허용

모든 API를 Go로 만들 필요는 없다. 권위 있는 상태 전이를 직접 소유하지 않고 요청을 가볍게 변환·조합하거나, 특정 내부 workload를 좁게 노출하는 무상태 API는 NestJS 또는 FastAPI를 선택할 수 있다.

- TypeScript ecosystem, module 구조, validation과 application composition이 이점이면 NestJS를 사용한다. 관계형 DB 접근이 필요할 때 선호 ORM은 Prisma다.
- Python library와 모델 실행이 중심인 LLM, 데이터 과학, 분석 worker/processor에는 Python을 사용한다. HTTP API가 필요하면 FastAPI를 우선 검토한다.
- 상태 저장소를 사용한다는 이유만으로 API가 곧 상태 소유자가 되는 것은 아니다. canonical transition, transaction과 schema migration을 이 프로세스가 책임지면 다시 Go 기본값과 운영 근거를 비교한다.
- framework 선택이 outbox, idempotency, timeout, backpressure, observability와 graceful shutdown 책임을 없애지는 않는다.

### TypeScript와 Node.js: 브라우저 SDK와 프런트엔드 도구의 기본

브라우저 SDK, framework-independent player/client, 데모 UI와 frontend build tooling은 TypeScript와 Node.js 생태계를 우선한다.

선택 근거:

- wire contract와 공개 API를 타입으로 노출하면서 실제 브라우저 동작에 가까운 코드를 작성할 수 있다.
- 하나의 vanilla core를 Svelte, React 또는 다른 UI에서 얇게 감쌀 수 있다.
- Vite, TypeScript compiler, Vitest와 jsdom 조합으로 빠른 build/test loop를 유지할 수 있다.

구현 기본값:

- browser 기능과 SDK core는 vanilla DOM 또는 표준 Web API에 가까운 ESM으로 먼저 구현하고 특정 UI framework를 필수 dependency로 두지 않는다.
- UI framework가 실제로 필요하면 Svelte를 기본으로 선택한다. React는 기존 소비자, component ecosystem 또는 integration 제약이 분명할 때 선택한다.
- Svelte와 React integration은 가능한 한 얇은 lifecycle adapter/example로 제공한다. 우선순위는 **vanilla → Svelte → React**이며, framework 편의 때문에 core contract를 framework state model에 종속시키지 않는다.
- 관련 package와 demo가 한 릴리스 경계를 이룰 때 npm workspaces와 하나의 lockfile을 사용한다.
- Node.js는 현재 서버 runtime의 기본이라기보다 browser code의 build/test/tooling runtime이다.

### Python과 `uv`: Python이 필요한 작업의 명시적 향후 선호

Python이 더 자연스러운 자동화, 데이터 처리, ML, 분석 또는 운영 도구에는 `uv`로 interpreter와 dependency 환경을 관리하는 방식을 선호한다.

이 선택은 소유자가 밝힌 방향이지만 현재 Saturday Dinner Club의 주요 구현 레포에서는 아직 반복 검증되지 않았다. 따라서 Python 서비스 framework, async runtime, packaging layout 또는 production serving 방식까지 추론하지 않는다. Python을 도입할 때 첫 실제 레포의 lock, build, test, container와 배포 경험을 근거로 이 절을 구체화한다.

## 3. 관계형 상태와 트랜잭션

### PostgreSQL + `pgx`/`sqlc`: canonical transactional state의 기본

계정, 세션, 소유권, 정책 command, transactional outbox처럼 관계와 불변식이 중요한 상태는 PostgreSQL을 우선한다.

선택 근거:

- transaction, unique constraint, row lock과 compare/update를 이용해 한 퀀텀의 권위 있는 전이를 강하게 지킬 수 있다.
- outbox를 도메인 변경과 함께 commit하여 외부 broker 장애와 process crash 사이의 유실 구간을 제거할 수 있다.
- 여러 worker가 `FOR UPDATE SKIP LOCKED`로 같은 backlog를 안전하게 나누어 처리할 수 있다.
- projection이나 cache를 잃어도 canonical row와 outbox에서 복구할 수 있다.

운영 원칙:

- 성공 응답이 PostgreSQL commit, Kafka ACK 또는 최종 projection 중 무엇을 뜻하는지 endpoint마다 명시한다.
- broker에 내구 기록이 확인된 outbox row는 삭제하거나 bounded archive로 옮긴다. 무기한 쌓아 두지 않는다.
- backup, PITR, migration과 connection exhaustion은 PostgreSQL을 택한 순간 함께 소유한다.
- multi-region active-active는 단순 multi-primary 선언으로 해결하지 않는다. home shard, fencing, conflict rule과 replication 범위를 도메인별로 설계한다.

MySQL도 workload, 운영 환경, 기존 전문성과 생태계가 더 잘 맞으면 OLTP authority로 선택할 수 있다. PostgreSQL 선호는 MySQL을 배제한다는 뜻이 아니며, 아래 CDC projection 패턴은 둘 모두에 적용한다.

Go에서 `sqlc`를 선호 ORM이라고 부르지만, 정확히는 runtime object mapper가 아니라 작성한 SQL과 schema에서 type-safe Go code를 생성하는 도구다. query plan과 transaction 경계를 SQL로 명시하면서 반복적인 scan/binding 코드를 줄일 수 있다는 점을 선호한다. 아주 작거나 동적인 query에는 driver를 직접 사용할 수 있고, `sqlc`를 쓰기 위해 부자연스러운 query contract를 만들지는 않는다.

### OLTP CDC → durable log → hot projection

OLTP의 committed change를 CDC로 읽고 Kafka 같은 durable log를 통해 전달한 뒤, Redis나 Cassandra에 query-optimized projection을 만드는 구조를 선호한다.

```text
PostgreSQL / MySQL authoritative transaction
  → transaction log 기반 CDC
  → Kafka 또는 동등한 durable change log
  → idempotent materializer
  → Redis hot cache / Cassandra read model
  → latency-sensitive query
```

이 구조의 목표는 쓰기 권위를 OLTP에 유지하면서 read path가 매번 OLTP나 원격 authority를 기다리지 않게 하여, 최신 projection이 준비된 정상 경로에서 유사 zero-latency 조회를 제공하는 것이다. 변경 전파 자체가 실제로 0초이거나 즉시 일관적이라고 주장하지 않는다.

- application이 OLTP와 cache/broker에 직접 이중 쓰기하지 않고 committed transaction log를 change source로 삼는다.
- CDC record에는 source coordinate 또는 안정적인 change identity, entity identity, operation, schema version과 필요한 ordering/version 정보를 보존한다.
- materializer는 duplicate와 replay에 멱등하고, delete/tombstone과 out-of-order change를 명시적으로 처리한다.
- 초기 snapshot과 이어지는 CDC log 사이에 gap이나 중복이 없도록 bootstrap 및 resume 지점을 관리한다.
- projection lag, consumer failure와 rebuild 진행률을 계측한다. 최신성이 필수인 query는 authority fallback, version check 또는 fail-closed 중 도메인에 맞는 동작을 정한다.
- Redis는 매우 빠른 bounded hot state에, Cassandra는 큰 시간·키 범위의 지속 가능한 read model에 우선한다. 둘을 단지 같은 의미의 cache로 취급하지 않는다.

Kafka는 이 패턴의 선호 전달 계층이지만 CDC connector 호환성, replay 요구와 운영 규모에 따라 동등한 durable log를 사용할 수 있다. projection은 교체·재구축 가능한 파생 상태이며 canonical mutation은 계속 OLTP owner를 거친다.

### Embedded database: SQLite 또는 Pebble

별도 database service 없이 한 process나 한 node가 로컬 상태를 소유해야 하면 SQLite와 Pebble을 우선 검토한다.

- 관계형 schema, transaction, secondary index, ad-hoc query와 관리 도구가 필요하면 SQLite를 선택한다.
- ordered key-value access, prefix/range scan, LSM 기반 write pattern과 application이 직접 정의하는 encoding이 더 적합하면 Pebble을 선택한다.
- 둘 모두 한 process/node의 embedded persistence이지 분산 합의나 multi-node replication을 제공하지 않는다. file ownership, 동시 접근, backup/restore, corruption recovery와 schema/encoding migration을 application lifecycle에 포함한다.
- 임시 cache인지 재구축 가능한 projection인지 유일한 durable copy인지 먼저 정하고, 유일한 copy라면 crash consistency와 복구 검증을 강화한다.

## 4. Redis

### Redis + `rueidis`: 빠른 projection과 짧은 상태의 기본

Redis는 canonical database의 값싼 대체재가 아니라 다음 역할에 우선한다.

- rebuild 가능한 session/policy/JWKS projection;
- one-time token과 짧은 인증 ceremony;
- lease, discovery advertisement와 liveness;
- rate-limit counter와 bounded retry receipt;
- 매우 짧은 media hot path 또는 backlog;
- Redis가 이미 workflow state를 소유하는 범위의 Streams command/outbox.

Go client는 cluster discovery와 server-assisted client-side caching을 지원하는 `rueidis`를 우선한다. client-side cache를 쓸 때 staleness, invalidation failure, bypass path와 authoritative fallback을 계약에 포함한다.

내구성과 장애 성격이 다른 Redis는 처음부터 분리한다. 예를 들어 Accounts의 session projection과 security ceremony, Chat의 auth/policy와 publisher discovery, Stream의 control state와 media bytes는 서로 같은 장애·backup 정책을 강요하지 않는다.

- 잃으면 안 되는 control/auth 상태에는 적절한 AOF와 복구 절차를 둔다.
- 재생성 가능하고 지연만 가속하는 media/discovery 상태는 persistence를 끌 수 있다.
- 메모리 한도와 eviction 정책은 데이터 의미에 맞게 명시한다. `noeviction`은 overload를 오류로 드러내려는 선택이지 무한 용량이 아니다.
- Redis Cluster에서는 multi-key atomicity와 key slot을 먼저 설계한다.

Redis Streams는 Kafka나 broadcast bus의 보편적 대체물이 아니다. 한 consumer group은 fan-out이 아니라 작업 분배다. durable replay, 여러 독립 consumer, 긴 retention과 대규모 재처리가 핵심이면 Kafka를 우선 검토한다.

## 5. 이벤트 로그와 실시간 메시징

### Kafka + `franz-go`: durable regional event log의 조건부 기본

메시지를 process 장애 뒤에도 replay해야 하고, 여러 consumer가 각자 offset을 갖고, Cassandra 같은 read model을 다시 만들 수 있어야 하면 Kafka를 선택한다.

선택 근거:

- producer ACK를 명확한 내구성 경계로 사용할 수 있다.
- partition key로 필요한 범위의 순서를 정하고 consumer lag와 replay window를 운영할 수 있다.
- 빠른 알림 경로가 누락되어도 durable log에서 최종 상태와 history를 회복할 수 있다.

Go client는 `franz-go`를 우선한다. topic partition 수, replication factor, `acks`, min ISR, retention과 batching은 workload와 장애 목표로 정하며 로컬 Compose의 single-node 값은 운영 권장값이 아니다.

Kafka를 단순 request routing, presence pulse 또는 짧은 control signal에 넣지 않는다. outbox가 Kafka ACK를 확인한 뒤 NATS 전달에 실패하는 것은, NATS가 의도적으로 disposable한 경로라면 정상적인 degradation이다.

### Core NATS: 유실 가능한 저지연 fan-out과 discovery

Core NATS는 빠른 room fan-out, system notification, request/reply와 내부 discovery signal처럼 지연이 중요하고 누락을 다른 authority/history에서 복구하거나 제품상 허용할 수 있는 경로에 선호한다.

선택 근거:

- 작은 protocol과 subject 기반 routing으로 실시간 전달 경로를 단순하게 유지한다.
- durable database/Kafka/Cassandra와 분리하면 NATS 장애가 truth를 손상시키지 않는다.
- lifecycle을 의도적으로 Publisher에 묶는 경우 embedded NATS server가 fan-out capability를 프로세스에 내재화한다.

룸 broadcast에는 queue group을 쓰지 않는다. 관심 있는 모든 Edge가 받아야 하기 때문이다. queue group은 여러 handler 중 하나만 실행해야 하는 경쟁 작업에 사용한다.

JetStream은 기본값이 아니다. delivery 자체가 durable contract가 되면 Kafka와 Redis Streams를 포함해 ownership, replay, operations를 다시 비교한 뒤 선택한다. Core NATS 누락을 재시도 backlog로 바꾸면 원래의 낮은 지연과 장애 격리 의도를 훼손할 수 있다.

## 6. 대규모 history, 객체 데이터와 검색

### Cassandra + `gocql`: 시간 순 고쓰기 history와 multi-DC projection

룸 메시지, 시스템 이벤트, 장시간 stream catalog처럼 시간 범위로 기록하고 높은 write throughput, 긴 retention 또는 multi-DC merge가 중요한 데이터에 Cassandra를 조건부로 선호한다.

선택 근거:

- domain ID와 time bucket으로 partition을 설계하면 큰 append-oriented history를 수평 확장할 수 있다.
- multi-DC replication과 idempotent event ID를 결합해 리전별로 수락된 데이터를 최종적으로 합칠 수 있다.
- Kafka 같은 durable source와 함께 쓰면 writer 장애 시 offset을 보존하고 재처리할 수 있다.

주의 사항:

- Cassandra를 관계형 transaction이나 작은 canonical control state 때문에 선택하지 않는다.
- query에서 출발해 partition key, clustering key, bucket 크기와 retention을 설계한다.
- `(occurred_at, event_id)` 같은 결정론적 merge order와 idempotent upsert를 정의한다.
- 기본 무기한 보존 또는 TTL/reaper 중 어느 쪽인지 명시한다. 대규모 삭제는 tombstone과 compaction 영향을 운영 검증한다.

### S3-compatible object storage + filesystem adapter

큰 immutable media/object는 object storage를 장기 authority로 두고 application에서는 semantic storage interface 뒤에 숨긴다.

현재 production adapter의 기본은 AWS SDK for Go v2를 사용하는 S3/S3-compatible API이고, 로컬 개발은 filesystem implementation을 사용한다.

선택 근거:

- application process와 media 수명을 분리하고 CDN이 storage에서 직접 읽을 수 있다.
- create-only `Put`, 명시적 `Replace`, range read, ETag와 conditional request 같은 의미를 interface에 보존할 수 있다.
- deterministic local adapter로 빠른 테스트를 하면서 production object store의 실패 의미를 별도 integration suite로 확인할 수 있다.

S3 versioning, replication, lifecycle와 deletion은 비용·법적 보존·복구 목표에 따라 bucket owner가 명시한다. 현재 Stream의 미디어 bucket은 versioning 없이 series 단위 삭제와 post-live part 정리를 전제로 하지만 이를 모든 object data의 기본으로 일반화하지 않는다.

### BM25와 vector search

검색 index는 canonical source가 아니라 재구축 가능한 query projection으로 취급한다. OLTP CDC나 durable event log에서 문서 version과 삭제를 받아 idempotent하게 materialize하고, analyzer·embedding model·index schema version과 rebuild/alias 전환 절차를 함께 관리한다.

| 검색 요구 | 우선 검토 기술 | 선택 기준 |
| --- | --- | --- |
| application에 내장된 BM25/full-text | Bleve | 작은 단일-node 또는 process-local index, 별도 search cluster를 운영할 이유가 적을 때 |
| 공유·분산 BM25/full-text | OpenSearch | 여러 producer/consumer, shard/replica, aggregation과 중앙 운영이 필요할 때 |
| BM25 + vector hybrid search | OpenSearch | lexical score와 vector score를 한 query/index 운영 경계에서 조합해야 할 때 |
| vector-only search | Qdrant | 핵심 workload가 nearest-neighbor/vector filtering이고 full-text 기능이 필요하지 않을 때 |
| 분산 vector search와 기존 OpenSearch 운영 결합 | OpenSearch | 별도 vector database보다 하나의 search platform으로 운영하는 편이 유리할 때 |

따라서 BM25에는 Bleve와 OpenSearch를, vector search에는 높은 우선순위로 OpenSearch와 Qdrant를 고려한다. 일반 기본값은 **hybrid search면 OpenSearch, vector-only면 Qdrant**다.

- Bleve는 embedded 선택이므로 index file의 단일 writer, process lifecycle, rebuild와 backup 책임이 application에 붙는다.
- OpenSearch와 Qdrant는 외부 cluster dependency이므로 readiness, timeout, bulk backpressure, shard/collection sizing과 degraded query behavior를 명시한다.
- BM25 analyzer/tokenizer와 vector embedding은 의미 계약이다. model 또는 analyzer 변경은 같은 index에 조용히 섞지 않고 versioned rebuild와 평가를 거친다.
- 검색 품질은 engine 선택만으로 증명되지 않는다. 대표 query set으로 relevance, recall, latency와 resource cost를 함께 검증한다.

## 7. API, wire format와 transport

### HTTP/JSON

브라우저가 직접 쓰거나 사람이 진단하기 쉬운 public/control API에는 HTTP와 bounded JSON을 우선한다. request body 크기, unknown field, 단일 JSON value, structured error, timeout, cache와 idempotency 의미를 함께 정한다.

Internal HTTP가 곧 신뢰 경계를 없애지는 않는다. private network 접근 제어만 쓰는 endpoint는 그 배포 전제를 문서화하고 public ingress에서 차단한다. mTLS는 모든 내부 hop의 강제 기본값이 아니며 실제 위협 모델과 운영 능력으로 결정한다.

외부 TLS는 가능한 한 Nginx, Caddy 또는 동등한 edge reverse proxy/load balancer에서 종료하고, 통제된 private network 안의 application hop은 HTTP로 단순하게 유지하는 방식을 선호한다. Nginx와 Caddy 사이에는 전역 우선순위를 두지 않고 인증서 자동화, 동적 discovery, 설정 복잡도와 운영 환경으로 고른다.

- edge는 외부에서 들어온 `Forwarded`/`X-Forwarded-*` 값을 제거하거나 신뢰 가능한 값으로 덮어쓰고 application은 지정된 proxy에서 온 metadata만 신뢰한다.
- 원래 scheme, host, client address와 request identity가 권한, redirect, cookie 또는 audit에 영향을 주면 전달 계약을 명시한다.
- backend network가 shared/untrusted이거나 cross-region·규제·위협 모델상 기밀성과 peer authentication이 필요하면 내부 TLS 또는 mTLS를 사용한다. edge termination 선호가 이 요구를 무효화하지 않는다.
- health check와 내부 service port가 실수로 public ingress에 노출되지 않도록 network policy와 listener binding을 함께 관리한다.

### Protocol Buffers, gRPC와 Buf

타입이 있는 내부 control RPC, streaming command/watch API와 다언어 generated client에는 Protocol Buffers와 gRPC를 우선 검토한다. schema lint, breaking-change 검사와 reproducible generation에는 Buf를 선호한다.

대용량 data plane 전체를 gRPC에 넣을 필요는 없다. Stream처럼 control은 generated gRPC로, media payload는 bounded framed TCP로 보내고 header만 deterministic Protobuf로 정의할 수 있다.

serialization workload별 Protobuf, FlatBuffers, AntiSerial 선택 규칙은 [interfaces-and-contracts.md](interfaces-and-contracts.md)를 따른다.

### WebSocket과 WebTransport

브라우저 양방향 세션은 WebSocket을 현재의 호환성·운영 기본으로 둔다. 동일한 application protocol을 WebTransport에도 구현할 수 있지만, 실제 브라우저/프록시 호환성과 성능 이득이 검증되기 전에는 실험 경로로 유지한다.

transport가 달라도 event identity, authentication, ACK, resume, duplicate와 backpressure 계약은 달라지지 않아야 한다.

## 8. 미디어 기술

이 절은 일반 서비스가 아니라 Stream 계열 작업에만 적용한다.

### FFmpeg를 실행 엔진으로, Go를 orchestration 계층으로

codec과 hardware acceleration을 직접 구현하기보다 FFmpeg child process를 실행 엔진으로 사용하고 Go가 admission, assignment, process lifecycle, framing, queue, retry, metrics와 recovery를 관리한다.

선택 근거:

- NVENC, Intel QSV와 Apple VideoToolbox 같은 platform backend를 하나의 검증 가능한 실행 계층에서 다룰 수 있다.
- codec implementation과 distributed orchestration의 변경 속도와 장애 경계를 분리한다.
- rendition별 process 격리로 한 출력의 stall이 다른 출력 전체를 막는 위험을 줄일 수 있다.

현재 domain 기본은 AV1 video 우선, AAC-LC audio, CMAF/fMP4 LL-HLS, 200 ms part와 1초 segment다. H.264는 ingress/compatibility 확장 대상이다. hardware capability는 시작 시 실제 decode/scale/encode probe로 검증하고, backend 이름만 보고 성공으로 간주하지 않는다. CPU fallback은 품질과 처리량을 보장하지 않으므로 emergency rendition처럼 명시적으로 제한한다.

### Shaka Player

브라우저 LL-HLS/VoD/DVR player는 현재 Shaka Player를 선호한다. 실제 Stream Lab에서 hls.js보다 DVR 연속 재생, live edge 유지와 LL-HLS 소비가 안정적이었던 경험이 선택 근거다.

Shaka는 framework-independent TypeScript core 안에 감추고 React/Svelte는 얇은 lifecycle adapter로 연결한다. player object의 source 전환, destroy, async teardown, autoplay 정책, browser codec 지원과 native device QA는 wrapper 계약과 테스트에 포함한다.

이 선택은 현재 AV1/AAC HLS 제품 요구에 대한 것이며 모든 영상 제품의 보편적 player 결론은 아니다.

## 9. 인증과 암호 기술

Accounts 계열의 현재 선호는 다음과 같다.

- password verifier는 Argon2id와 per-account random salt, root-derived pepper를 사용한다.
- 검색 가능한 이메일 identity는 HMAC-derived lookup key와 XChaCha20-Poly1305 encrypted original을 분리한다.
- MFA는 TOTP 또는 Passkey/WebAuthn을 사용하고 user verification을 요구한다.
- browser session은 가능한 환경에서 DBSC device proof를 session extension authority로 사용한다. fallback refresh token과 혼동하지 않는다.
- 내부 AcT/RfT signing은 현재 Ed25519와 JWKS distribution을 사용한다.
- wire에는 구현 알고리즘 이름을 domain 의미로 굳히지 않고 opaque signature profile을 두어 향후 ML-DSA, Falcon 등 다른 algorithm을 병행할 여지를 둔다.
- process가 보유하는 root/private secret에는 file-mounted secret, label-derived subkey, explicit zeroing, `memguard`와 지원 환경의 Go protected-secret facility를 검토한다.

구체 parameter, key lifetime, migration과 threat model은 [security.md](security.md)와 Accounts 소유 문서를 따른다. cryptographic agility는 downgrade 허용이나 임의 algorithm 선택 endpoint를 뜻하지 않는다.

### Hash는 BLAKE 계열 우선

새로운 내부 hash를 선택할 수 있고 외부 표준이나 wire protocol이 알고리즘을 강제하지 않는다면 BLAKE 계열을 우선한다. BLAKE2와 BLAKE3 중에서는 target language의 유지보수되는 구현, interoperability, keyed mode 필요 여부, streaming/parallel workload와 digest 수명으로 선택한다.

- content identity, deduplication, cache key derivation과 고처리량 integrity fingerprint가 대표적인 적용 대상이다.
- 알고리즘과 digest 길이는 persisted data 또는 wire contract에 version/profile로 기록하여 교체와 재계산을 가능하게 한다.
- 표준이 SHA 계열을 요구하는 JWT/JWK thumbprint, WebAuthn, HMAC 기반 외부 계약 등을 임의로 BLAKE로 바꾸지 않는다.
- password hashing에는 계속 Argon2id처럼 해당 목적의 password KDF를 사용한다.
- 우발적 손상 검출만 필요한 CRC32C 같은 비암호 checksum을 보안 hash로 오해하지도, 무조건 더 비싼 hash로 교체하지도 않는다.

이 선호는 향후 구현의 기본값이며 기존 저장 형식이나 protocol을 즉시 migration하라는 지시가 아니다.

## 10. 관측 가능성

### zerolog facade + OpenTelemetry

Go 서비스는 공통 `github.com/saturday-dinner-club/log` facade를 통해 구조화 JSON 로그를 남기고 trace와 metric은 OpenTelemetry로 계측한다.

선택 근거:

- domain code가 zerolog나 exporter 세부 구현에 직접 결합되지 않는다.
- stdout JSON, 선택적 bounded rotating file, trace/span correlation을 같은 필드 정책으로 유지한다.
- W3C trace context와 OTLP/HTTP로 quantum 경계의 요청을 연결하되 collector/backend는 배포별로 선택할 수 있다.

Prometheus, Grafana, Tempo, Loki와 OTel Collector로 구성한 stack은 유용한 현재 관측 환경이지만 모든 배포가 반드시 같은 backend를 써야 한다는 뜻은 아니다. domain metric, cardinality, payload redaction, dashboard와 alert는 각 퀀텀이 소유한다.

## 11. 빌드, 배포와 로컬 개발

현재 기본 운영 가정은 VM에 독립 프로세스로 배포할 수 있고, 같은 artifact를 container로도 실행할 수 있는 구조다.

- 각 command/process는 자체 Dockerfile과 health/readiness contract를 가진다.
- 로컬 통합 환경은 Docker Compose로 해당 퀀텀과 필요한 dependency만 올린다.
- 기본 Compose가 다른 퀀텀 전체를 요구하지 않게 contract-compatible stub/fake와 pairwise tests를 둔다.
- Kubernetes는 현재 필수 배포 플랫폼이 아니다. 도입하면 기존 process lifecycle, storage ownership과 failure boundary를 가리지 않아야 한다.
- Nginx나 Caddy는 edge TLS termination, routing 또는 DNS re-resolution에 사용할 수 있지만 business authority가 아니다.
- content-first site에는 Hugo, app/interactive demo에는 Vite가 현재 사용된다. 이는 도메인 backend 선택과 별개다.

Graceful shutdown, bounded drain, dependency-aware readiness와 telemetry flush는 runtime 선택의 일부다. 컨테이너가 시작된 사실만으로 service가 assignment를 받을 준비가 된 것은 아니다.

## 12. 테스트 도구와 증거

선호 도구는 빠른 local proof와 실제 dependency 경계 검증을 함께 지원해야 한다.

- Go: `go test ./...`, race-sensitive unit/integration tests, `go vet`, deterministic fakes.
- TypeScript: TypeScript build/lint, Vitest, jsdom과 framework lifecycle tests.
- Protocol: generated-code freshness, Buf lint/breaking checks, golden vectors와 old/new compatibility tests.
- Infrastructure: Docker Compose smoke, process-kill/HA smoke, dependency outage와 recovery checks.
- Media/browser/hardware: synthetic tests 뒤에 실제 FFmpeg build, GPU, OBS, Shaka와 target browser/device compatibility 검증.

로컬 single-node Kafka, Redis, Cassandra 또는 PostgreSQL 테스트는 application wiring 증거이지 production HA 증거가 아니다. 구현 완료와 운영 검증을 분리해서 보고한다.

## 13. 선택하지 않은 것으로 간주하면 안 되는 것

다음은 현재 사용 흔적만으로 전역 표준으로 승격하지 않는다.

- React: Stream Lab의 UI 선택이며 SDK core의 필수 framework가 아니다.
- Svelte: compatibility example과 개발 검증 대상이며 유일한 UI framework가 아니다.
- Nginx와 Caddy: edge TLS/proxy 역할의 대체 가능한 구현이며 한 제품으로 전역 고정하지 않는다.
- Docker Compose의 image version과 single-node topology: 재현 가능한 개발 fixture다.
- Kubernetes 부재: 금지 결정이 아니라 VM-first 현재 우선순위다.
- WebTransport 구현: WebSocket을 대체했다는 뜻이 아니다.
- 한 퀀텀의 persistence/retention 설정: 같은 제품의 다른 Redis, bucket, table에도 자동 적용되지 않는다.
