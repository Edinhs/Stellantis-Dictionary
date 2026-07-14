/**
 * PLACEHOLDER — Convenção do endpoint de health-check (readiness).
 * =============================================================================
 * Entrega T06 / devops-baseline. Isto NÃO é lógica de produção: fixa apenas a
 * CONVENÇÃO e ONDE o endpoint mora, conforme doc 13 §5 (contrato de API) e
 * SPEC 02 §5 (observabilidade). A implementação real chega com o bootstrap do
 * backend (T07/T08) e será um `.ts` normal (sem o sufixo `.placeholder`).
 *
 * Contrato:
 *   Método/rota : GET /api/health        (prefixo /api — doc 13 §5)
 *   Auth        : nenhuma (endpoint público)
 *   200 OK      : { "status": "ok" }     -> app no ar E banco acessível (readiness)
 *   503         : { "status": "degraded" } -> banco inacessível
 *   Resposta    : mínima — NÃO vazar versões, stack ou detalhes internos.
 *
 * Encaixe na arquitetura (doc 13):
 *   - Vive em `backend/src/core/http/` (infra transversal, não é feature).
 *   - Registrado por `app.ts` na composição do servidor, antes dos módulos.
 *   - O healthcheck do container (docker/docker-compose.yml, serviço `app`) e o
 *     futuro orquestrador (D6) batem exatamente nesta rota.
 *
 * O compose usa `GET /api/health`. Se, no bootstrap, adotar-se também `/healthz`
 * (liveness separado de readiness), manter os dois e ajustar o healthcheck.
 *
 * Esboço não-funcional (ilustrativo — não usar como está):
 *
 *   // async function healthHandler(deps) {
 *   //   const dbOk = await deps.db.ping();            // core/db
 *   //   return dbOk
 *   //     ? { status: 200, body: { status: 'ok' } }
 *   //     : { status: 503, body: { status: 'degraded' } };
 *   // }
 */

export {};
