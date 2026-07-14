# SPEC — Diretório de Responsáveis e Especialistas ("Quem procurar")

Status: **rascunho para validação**. Deriva do PDR `07-responsaveis-especialistas.md`.
Nenhuma decisão aqui é final até aprovação. Documento escrito para ser
**extensível**: novas ideias devem se encaixar sem reescrever o que já existe.

## 0. Princípio de projeto: manter o projeto "aberto"

O stakeholder vai acrescentar ideias com o tempo. Para não travar isso, esta
SPEC adota três regras de extensibilidade:

1. **Fonte única da verdade por `slug`** — pessoas, setores e componentes se
   ligam por identificadores estáveis (`term_slug`, `sector_slug`), nunca por
   texto duplicado. Novos módulos reaproveitam esses elos.
2. **Campo `metadata` (JSON) em toda entidade nova** — permite guardar
   atributos ainda não previstos sem alterar o schema (migração só quando um
   atributo "virar oficial").
3. **Camadas isoladas** — dados (JSON de sementes/tabelas) → API de leitura →
   UI. Cada camada pode evoluir sozinha; a UI nunca lê o banco direto.

## 1. Escopo desta SPEC

Cobre o módulo que responde "**com quem devo falar?**":
- **Responsáveis por setor** (ponto de contato de uma área).
- **Especialistas de componente** (referência técnica de uma peça/termo).

Fora de escopo aqui: dicionário, chat RAG, Explorador 3D e auth — já
especificados em `02-spec.md`. Este módulo **consome** essas partes.

## 2. Como se encaixa na arquitetura existente

Reusa a arquitetura de `02-spec.md` (Frontend SPA → Backend REST → Postgres).
Nenhum serviço novo é necessário no MVP.

```
  Frontend "Quem procurar" ─┐
  Bloco no verbete ─────────┼─▶  GET /api/diretorio/...  ─▶  Postgres
  Card no hotspot 3D ───────┘        (backend REST)          (novas tabelas)
```

## 3. Modelo de dados

Acrescenta ao modelo de `02-spec.md` (seção 4). Todas as tabelas novas incluem
`metadata jsonb` (regra de extensibilidade) e `created_at`/`updated_at`.

- `sectors (id, slug, name, description, metadata, created_at, updated_at)`
- `people (id, name, job_title, email, phone, location, sector_id?, active, metadata, created_at, updated_at)`
- `sector_owners (id, sector_id, person_id, role, metadata, created_at)`
  — `role` ex.: `titular` | `suplente`. Permite mais de um responsável por setor.
- `component_specialists (id, person_id, term_slug, expertise_level, metadata, created_at)`
  — N:N pessoa ↔ componente/termo; `term_slug` liga a `terms.slug` e a
  `cockpit_hotspots.term_slug`.

Regras de integridade:
- `component_specialists.term_slug` deve existir em `terms.slug` (FK lógica;
  no MVP com JSON de sementes, validar na carga).
- Excluir uma pessoa não apaga o setor/termo — só remove os vínculos.
- `people.active = false` oculta a pessoa das consultas sem apagar histórico.

### Origem dos dados
- **MVP/protótipo**: um JSON de sementes versionado (`seeds/diretorio.json`),
  editado manualmente pelo stakeholder e carregado na inicialização.
- **Fase posterior**: CRUD no painel admin grava direto nas tabelas.
- O formato do JSON espelha as tabelas (ver exemplo no PDR, seção 4).

## 4. API (contrato REST, rascunho)

Todas as rotas exigem usuário **autenticado** (dado pessoal — ver seção 6).
Somente leitura no MVP; escrita (`POST/PUT/DELETE`) chega com o painel admin.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/diretorio/setores` | Lista setores + responsável(is) |
| GET | `/api/diretorio/setores/{slug}` | Detalhe do setor + pessoas |
| GET | `/api/diretorio/pessoas/{id}` | Card da pessoa (setores + componentes) |
| GET | `/api/diretorio/componentes/{term_slug}/especialistas` | Especialistas de um componente/termo |
| GET | `/api/diretorio/busca?q=` | Busca por pessoa, setor ou componente |

Exemplo de resposta (`GET /api/diretorio/componentes/hud/especialistas`):

```json
{
  "term_slug": "hud",
  "term_label": "Head-Up Display",
  "especialistas": [
    { "person_id": "p1", "name": "Fulano de Tal", "job_title": "Eng. Embarcado",
      "sector": "Conectividade", "email": "fulano@empresa", "expertise_level": "referencia" }
  ]
}
```

Pontos de integração (reuso, sem duplicar texto):
- Verbete `GET /api/termos/{slug}` passa a incluir (ou o frontend agrega) a
  lista de especialistas daquele `slug`.
- Hotspot do 3D usa o mesmo `term_slug` para buscar o especialista.

## 5. UX / telas

- **Página "Quem procurar"**: setores → responsável; busca unificada.
- **Bloco no verbete do dicionário**: "Especialista(s)" com nome, cargo, setor,
  contato.
- **Card no hotspot 3D**: link "Falar com o especialista" → card da pessoa.
- **Card da pessoa**: dados de contato + setores que responde + componentes em
  que é referência.

Fallback: se não houver especialista cadastrado para um termo, o bloco some
(nunca mostrar "vazio" quebrado).

## 6. Segurança e privacidade

- Dados de contato = **dados pessoais** → só a usuários autenticados; nunca
  públicos, nunca em cache anônimo.
- RBAC: `user` consulta; apenas `admin` cria/edita (quando houver escrita).
- LGPD: exibir o mínimo necessário; `active=false` para desligar sem apagar;
  preferir contato corporativo a pessoal.
- Sem dados reais até a estratégia de hospedagem/segurança estar definida
  (mesma regra do dicionário em `02-spec.md`).
- Entrada de busca sanitizada (evitar SQLi/XSS); rate limit na rota de busca.

## 7. Requisitos não funcionais

- **Extensibilidade** (ver seção 0) é requisito de primeira classe deste módulo.
- **Desempenho**: consultas do diretório são leves (índices em `slug`,
  `term_slug`, `sector_id`).
- **Portabilidade**: roda no mesmo Docker Compose do resto do projeto.

## 8. Ganchos de extensão (para ideias futuras)

Desenhado para acomodar, sem reescrever:
- **Novos tipos de vínculo** (ex.: "fornecedor responsável", "aprovador") →
  nova tabela de ligação no mesmo padrão `(person_id, alvo_slug, metadata)`.
- **Novos alvos além de componentes** (ex.: especialista de "processo" ou
  "sistema") → o alvo já é um `term_slug`, e `terms.category` distingue o tipo.
- **Campos não previstos** → `metadata jsonb` até virarem coluna oficial.
- **Integração futura com RH/AD** → substituir a carga do JSON por um
  sincronizador, mantendo o mesmo contrato de API.

## 9. Perguntas em aberto (herdadas do PDR `07`)

1. Uma pessoa pode responder por mais de um setor? (schema já permite).
2. Quais dados de contato exibir? (e-mail corporativo, Teams, ramal?)
3. Vínculo só por componente (`term_slug`) ou também por setor inteiro?
