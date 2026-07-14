# PDR — Diretório de Responsáveis e Especialistas ("Quem procurar")

> Status: **rascunho da ideia para validação**. Nada será implementado ainda.
> Este documento apenas registra o conceito. O preenchimento dos dados
> (pessoas, setores, componentes) será feito manualmente pelo stakeholder.

## 1. Objetivo

Adicionar ao projeto uma área onde o usuário consegue descobrir **a quem
recorrer** dentro da empresa:

- **Responsáveis por setores** — quem é o ponto de contato / dono de cada
  setor ou área (ex.: quem procurar sobre "Powertrain", "Conectividade",
  "Qualidade", "Manufatura").
- **Especialistas de componentes** — quem domina uma peça/componente
  específico (ex.: quem entende do "cluster", "HUD", "central multimídia",
  "comandos do volante").

Assim, além de consultar o **significado** de um termo (dicionário) e **ver a
peça no 3D** (Explorador do cockpit), o usuário também descobre **quem falar**
sobre aquele assunto — fechando o ciclo "o que é → onde fica → com quem falar".

## 2. Como se conecta ao que já existe

Este módulo reaproveita as entidades atuais como fonte da verdade, sem
duplicar conteúdo:

- **Dicionário (`terms`)**: cada verbete pode exibir "Especialista(s)
  responsável(is)" por aquele termo/componente.
- **Explorador 3D (`cockpit_hotspots`)**: ao clicar num hotspot, além do
  nome + prévia do verbete, mostra-se **quem é o especialista** daquele
  componente (via o mesmo `term_slug`).
- **Setores**: agrupam pessoas e podem ser associados a categorias de termos
  (`terms.category`), permitindo navegar "por setor".

```
   Termo (dicionário) ─┐
                       ├──▶  Especialista(s)  ──▶  Pessoa  ──▶  Setor  ──▶  Responsável do setor
   Hotspot 3D  ────────┘        (por componente)                              (ponto de contato)
```

## 3. Decisões propostas (a confirmar)

| # | Decisão | Status |
|---|---|---|
| D10 | Criar módulo "Responsáveis e Especialistas" como diretório de contatos interno | Proposto |
| D11 | Dados preenchidos **manualmente** pelo admin/stakeholder (sem integração automática com RH/AD no MVP) | Proposto |
| D12 | Duas relações distintas: **responsável por setor** (1 pessoa ↔ 1 setor) e **especialista de componente** (N pessoas ↔ N termos/componentes) | Proposto |
| D13 | Fonte da verdade das ligações = `term_slug` (mesmo identificador usado por dicionário e hotspots 3D) | Proposto |
| D14 | Dados de contato são **dados pessoais** → tratar com cuidado (LGPD): expor só o necessário, apenas a usuários autenticados | Proposto |
| D15 | No protótipo/MVP, os dados podem vir de um **JSON de sementes versionado**; CRUD pelo admin vem depois | Proposto |

## 4. Esboço de modelo de dados (rascunho)

Acrescenta-se ao modelo atual (`02-spec.md`, seção 4):

- `sectors (id, name, slug, description, created_at)`
  — setor/área (ex.: "Conectividade", "Powertrain").
- `people (id, name, job_title, email, phone, location, sector_id, notes, active, created_at)`
  — pessoa cadastrada; `sector_id` opcional (setor principal).
- `sector_owners (id, sector_id, person_id, role)`
  — quem é o **responsável** por um setor (permite titular + suplente).
- `component_specialists (id, person_id, term_slug, expertise_level, notes)`
  — liga uma **pessoa** a um **componente/termo** (`term_slug`), indicando que
  ela é referência naquele assunto. Relação N:N (uma pessoa pode ser
  especialista de vários componentes; um componente pode ter vários
  especialistas).

> Observação: `term_slug` já é o elo usado por `terms.slug` e
> `cockpit_hotspots.term_slug`, então o especialista aparece automaticamente
> tanto no verbete quanto no hotspot do 3D.

### Exemplo de JSON de sementes (preenchimento manual)

```json
{
  "sectors": [
    { "slug": "conectividade", "name": "Conectividade", "description": "Infotainment, HUD, telemetria" }
  ],
  "people": [
    { "id": "p1", "name": "Fulano de Tal", "job_title": "Eng. de Software Embarcado", "email": "fulano@empresa", "sector_slug": "conectividade" }
  ],
  "sector_owners": [
    { "sector_slug": "conectividade", "person_id": "p1", "role": "titular" }
  ],
  "component_specialists": [
    { "person_id": "p1", "term_slug": "hud", "expertise_level": "referencia" }
  ]
}
```

## 5. Telas / UX (esboço)

- **Página "Quem procurar" (diretório)**: lista de setores → responsável de
  cada setor; busca por pessoa, setor ou componente.
- **No verbete do dicionário**: bloco "Especialista(s)" com nome, cargo,
  setor e forma de contato.
- **No hotspot do Explorador 3D**: além de nome + prévia, um link "Falar com o
  especialista" que abre o cartão da pessoa.
- **Cartão da pessoa**: nome, cargo, setor, contato, componentes em que é
  referência, setores que responde.

## 6. Segurança e privacidade (transversal)

- Dados de contato só visíveis para **usuários autenticados** (nunca públicos).
- Aplicar RBAC: `user` consulta; apenas `admin` cadastra/edita pessoas.
- Considerar LGPD: coletar/mostrar só o necessário, permitir marcar pessoa como
  inativa, evitar expor telefone pessoal se não for corporativo.
- Sem dados reais até a estratégia de hospedagem/segurança estar definida
  (mesma regra já adotada para o dicionário).

## 7. Fases sugeridas (encaixe no roadmap do PDR)

- **Protótipo (Fase 0.5)**: tela estática "Quem procurar" + bloco de
  especialista no verbete e no hotspot, com dados de exemplo (JSON de sementes).
- **Fase 1c (após dicionário)**: tabelas `sectors`, `people`,
  `sector_owners`, `component_specialists` + API de leitura.
- **Fase 3 (qualidade de vida)**: CRUD completo no painel admin, busca
  avançada, importação em lote.

## 8. Perguntas em aberto

1. Uma pessoa pode ser responsável por **mais de um setor**? (o modelo já
   permite, mas confirmar a regra de negócio).
2. Que dados de contato exibir? (e-mail corporativo apenas, ou também
   Teams/telefone/ramal?)
3. O vínculo especialista↔componente é por **termo do dicionário** (`term_slug`)
   ou também por **setor inteiro**? (proposta atual cobre os dois).
