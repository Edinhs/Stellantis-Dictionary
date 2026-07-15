# Casos de Uso e Atores — Stellantis-Dictionary

> Status: **rascunho**.
> Última atualização: 2026-07-15.
> Autoria: Analista de Requisitos (`requirements-analyst`), reporta ao Produto Lead.
> Consolida os **casos de uso (etapa 5)** e serve de artefato de rastreabilidade das
> **etapas 2–5** (Pesquisa, Requisitos, Regras de Negócio e Casos de Uso) do ciclo
> de vida `14-ciclo-de-vida-engenharia.md`.
> Deriva de / consolida o que hoje está **implícito** nas SPECs `02-spec.md`,
> `08-responsaveis-especialistas-spec.md`, `09-plataforma-comunitaria-cargos-spec.md`
> e `11-comunidade-qa-spec.md`.

Este documento reúne, num só lugar, os **atores** e os **casos de uso** do sistema.
Ainda é rascunho: os casos candidatos estão listados; o detalhamento completo de
cada um é preenchido conforme as etapas 3–5 avançarem para cada área (ver ciclo
`14`).

## 1. Atores

| Ator | Descrição | Fonte |
|---|---|---|
| **Visitante** | Não autenticado; acesso mínimo (cadastro/login). | `02` §3.1 |
| **`user`** | Usuário comum (default no cadastro); consulta e **propõe-e-aprova** contribuições moderadas. | `09` §2, `D12`/`D14` |
| **`coordinator`** | Coordenador; edita conteúdo direto e modera. | `09` §2/§3 |
| **`admin`** | Administrador; gestão de cargos, usuários e conteúdo. | `09` §2/§3 |
| **Sistema RAG/IA** | Ator não humano: responde no chat com citação de fontes. | `02` §3.3/§3.4 |
| **Especialista/Responsável** | Pessoa do diretório "quem procurar", ligada por `term_slug`. | `08` |

## 2. Template de caso de uso

Todo caso de uso segue este template:

```
### CU-NN — <Nome do caso de uso>
- Ator(es): <quem inicia / participa>
- Pré-condições: <o que precisa ser verdade antes>
- Fluxo principal:
  1. <passo>
  2. <passo>
- Fluxos alternativos / exceções:
  - A1. <desvio e tratamento>
  - E1. <erro e tratamento>
- Pós-condições: <estado do sistema ao final>
- Regras de negócio relacionadas: <ref. SPEC §>
- Requisitos cobertos: <rastreabilidade>
```

## 3. Casos de uso candidatos (a detalhar)

Lista consolidada dos casos já conhecidos. Cada um receberá o detalhamento do
template §2 conforme sua área passar pelas etapas 3–5.

| ID | Caso de uso | Ator(es) | Fonte (SPEC) |
|---|---|---|---|
| CU-01 | Cadastro e login (auth, cargo `user` default) | Visitante → `user` | `02` §3.1, `09` §2 |
| CU-02 | Buscar termo no dicionário (lista, busca, verbete por `slug`) | `user`+ | `02` §3.2 |
| CU-03 | Perguntar no chat RAG (resposta com fontes citadas) | `user`, Sistema RAG | `02` §3.3/§3.4 |
| CU-04 | Explorar o cockpit 3D (hotspot → verbete por `term_slug`) | `user`+ | `02` §3.5, `05` |
| CU-05 | Contribuir conteúdo (propor-e-aprovar / editar direto) | `user`/`coordinator`/`admin` | `09` §4, `D14` |
| CU-06 | Moderar contribuições (aprovar/rejeitar, rollback) | `coordinator`/`admin` | `09` §4/§6 |
| CU-07 | Comunidade Q&A (perguntar, responder, votar, aceitar) | `user`+ | `11` |
| CU-08 | Consultar diretório "quem procurar" (especialista por componente) | `user`+ | `08` |

### 3.1 Detalhamento inicial (exemplo)

```
### CU-01 — Cadastro e login
- Ator(es): Visitante (torna-se `user`)
- Pré-condições: e-mail ainda não cadastrado.
- Fluxo principal:
  1. Visitante informa e-mail e senha e envia o cadastro.
  2. Sistema valida entrada, cria conta com cargo `user` (default), hash da senha.
  3. Visitante faz login; sistema emite JWT (access + refresh em cookie httpOnly).
- Fluxos alternativos / exceções:
  - E1. E-mail já cadastrado → erro de validação, sem revelar detalhe sensível.
  - E2. Credencial inválida no login → mensagem genérica (anti-enumeração).
- Pós-condições: usuário autenticado com cargo `user`.
- Regras de negócio relacionadas: `09` §2 (cargos), `02` §3.1 (auth).
- Requisitos cobertos: a mapear na etapa 3.
```

## 4. Perguntas em aberto

1. **Granularidade dos casos de uso** — um CU por tela ou por objetivo de negócio?
   *aguardando alinhamento com o `product-lead`*.
2. **Rastreabilidade formal** — adotar matriz requisito→CU→teste (rastreável até o
   plano de homologação `16`)? *aguardando decisão*.
3. Casos de uso de **administração avançada** (Fase 3/4: métricas, SSO, MFA) ainda
   não foram elicitados — *fora do MVP, a detalhar depois*.
