# Casos de Uso e Atores — Stellantis-Dictionary

> Status: **aprovado — gate 5 (Casos de Uso), 2026-07-17** (expandido com os casos
> reais do protótipo). Detalhamento dos CU-01..08 [FUTURO] segue pendente de decisões
> abertas (§4) — não afeta a DoD de cobertura RF→CU do gate 5.
> Última atualização: 2026-07-17.
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
| **Novo colaborador em onboarding** | **Persona central da integração** (recém-chegado ou em transição): ainda não domina siglas, fluxos nem a topografia organizacional. É o destinatário-alvo da jornada (consulta dicionário/chat, estuda, descobre "quem procurar", situa-se na organização). Em RBAC herda o papel **`user`** — a distinção é de **persona/jornada**, não de autorização. | briefing `01` §4; doc `26` §2 |
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

## 3.2 Casos de uso detalhados extraídos do protótipo

> Derivam dos fluxos observados em `prototypes/portal-spa/` (ver docs `20`, `21`,
> `22`). Numeração continua a série CU; o conteúdo anterior (CU-01..CU-08) é
> mantido. Cada CU aponta os `RF-###` cobertos (doc `21`).

### CU-09 — Buscar termo → detalhe → Perguntar ao StellantisGPT
- Ator(es): `user` (no protótipo, qualquer visitante local).
- Pré-condições: existir ao menos um termo no dicionário (semente ou cocriado).
- Fluxo principal:
  1. Usuário abre a aba Dicionário.
  2. Digita um trecho no campo de busca; o grid filtra em tempo real.
  3. (Opcional) seleciona uma categoria para refinar.
  4. Clica em um termo; abre o modal de detalhe (definição, categoria, autor).
  5. Aciona "Perguntar ao StellantisGPT".
  6. A SPA navega ao Chat IA com o campo pré-preenchido citando o termo.
  7. Usuário envia; a IA (simulada) responde em balão.
- Fluxos alternativos / exceções:
  - A1. Busca sem resultado → grid vazio; ao limpar, todos reaparecem.
  - A2. Usuário fecha o modal sem perguntar → volta ao grid mantendo filtros.
- Pós-condições: chat exibe a pergunta e a resposta simulada; dicionário inalterado.
- Regras de negócio relacionadas: chat é **simulado** nesta fase (sem LLM).
- Requisitos cobertos: RF-001, RF-002, RF-003, RF-004, RF-020, RF-023.

### CU-10 — Contribuir termo (cocriação, sem moderação, +50 XP)
- Ator(es): `user` (no protótipo, qualquer visitante local).
- Pré-condições: aba Dicionário aberta.
- Fluxo principal:
  1. Usuário aciona "adicionar termo"; abre o modal de cadastro.
  2. Preenche título, definição, categoria e autor.
  3. Salva.
  4. O termo aparece no grid, persiste em `localStorage` e concede +50 XP.
  5. A timeline do perfil registra a contribuição.
- Fluxos alternativos / exceções:
  - E1. Campos obrigatórios vazios → salvar bloqueado com validação.
- Pós-condições: novo termo persistido; XP e timeline atualizados.
- Regras de negócio relacionadas: **sem moderação** no protótipo (na visão-alvo,
  `user` propõe-e-aprova — RF-064, SPEC `09` §4).
- Requisitos cobertos: RF-006, RF-058, RF-061, RF-066.

### CU-11 — Termo → Criar Flashcard (autocomplete do dicionário)
- Ator(es): `user`.
- Pré-condições: termo existente aberto no modal de detalhe (ou aba Treinamento).
- Fluxo principal:
  1. No modal do termo, usuário aciona "Criar Flashcard".
  2. A SPA navega a Treinamento com o formulário pré-preenchido (frente=título,
     verso=definição).
  3. (Alternativa) no próprio formulário, busca uma sigla e o sistema autopreenche.
  4. Salva o flashcard; ele passa a girar (flip) na grade e persiste; +50 XP.
- Fluxos alternativos / exceções:
  - A1. Usuário edita frente/verso antes de salvar.
- Pós-condições: flashcard criado e persistido; XP/timeline atualizados.
- Requisitos cobertos: RF-005, RF-035, RF-036, RF-058.

### CU-12 — Concluir curso → XP/badge/level-up
- Ator(es): `user`.
- Pré-condições: aba Treinamento aberta; curso ainda não concluído.
- Fluxo principal:
  1. Usuário lê um curso (Bio-Hybrid / ADAS / Motores).
  2. Marca como concluído.
  3. Sistema concede +350 XP e ativa a insígnia técnica correspondente.
  4. Se `userXp` atinge o teto do nível, ocorre level-up com notificação e promoção
     de cargo/patente.
- Fluxos alternativos / exceções:
  - A1. Curso já concluído → não concede XP novamente.
  - A2. XP abaixo do teto → só ganha XP e insígnia, sem subir de nível.
- Pós-condições: XP, insígnia, (possível) nível e timeline persistidos.
- Requisitos cobertos: RF-037, RF-038, RF-056, RF-057, RF-060, RF-061.

### CU-13 — Contatar especialista
- Ator(es): `user`, Especialista/Responsável (alvo do contato).
- Pré-condições: aba Informações → Especialistas aberta.
- Fluxo principal:
  1. Usuário consulta a lista de especialistas (bio, especialidade).
  2. Clica em "Contatar Especialista".
  3. A SPA navega ao Chat IA com o campo pré-preenchido citando nome/departamento.
  4. Usuário envia a dúvida.
- Fluxos alternativos / exceções:
  - A1. Usuário edita a pergunta pré-digitada antes de enviar.
- Pós-condições: chat exibe a dúvida direcionada (resposta simulada nesta fase).
- Regras de negócio relacionadas: na visão-alvo, dados de pessoas só a autenticados
  e ligados por `term_slug` (RF-069, doc `22` RNF-031, SPEC `08`).
- Requisitos cobertos: RF-041, RF-023, RF-020.

### CU-14 — Navegar e editar o organograma
- Ator(es): `user` (no protótipo); na visão-alvo `coordinator`/`admin` para editar.
- Pré-condições: aba Informações → Organograma aberta.
- Fluxo principal:
  1. Usuário faz drill-down nos nós da árvore; breadcrumbs mostram o caminho.
  2. Oculta/reexibe ramos conforme necessário.
  3. (Modo gestão) edita nome/cargo de um nó, cadastra subordinado sob um líder ou
     exclui um ramo.
  4. As mudanças refletem na árvore e persistem.
  5. (Opcional) consulta o mapa global de polos.
- Fluxos alternativos / exceções:
  - A1. Sair do modo gestão sem salvar → árvore mantém o último estado persistido.
- Pós-condições: estrutura organizacional persistida em `localStorage`.
- Regras de negócio relacionadas: no protótipo o CRUD é livre; visão-alvo restringe
  por RBAC (RF-063) e prevê LGPD (doc `22` RNF-031).
- Requisitos cobertos: RF-044, RF-045, RF-045b, RF-066.

### CU-15 — Hotspot 3D → verbete do dicionário
- Ator(es): `user`.
- Pré-condições: Explorador 3D carregado (modelo `.glb` ou fallback procedural).
- Fluxo principal:
  1. Usuário orbita/dá zoom no veículo (arrastar/roda).
  2. (Opcional) alterna Sólido ↔ Wireframe.
  3. Clica em um hotspot; abre modal com sigla + definição.
  4. Navega do modal ao verbete correspondente no Dicionário.
- Fluxos alternativos / exceções:
  - E1. Sem WebGL / falha no `.glb` → fallback procedural é exibido, mantendo órbita
    e wireframe (doc `21` RF-015; doc `22` RNF-021).
- Pós-condições: usuário levado ao verbete; cena 3D permanece disponível.
- Requisitos cobertos: RF-010, RF-011, RF-012, RF-013, RF-015.

### CU-16 — Escrever no Notebook de Engenharia com IA assistiva
- Ator(es): `user` (autor da nota); Sistema RAG/IA (assistente, simulado nesta fase).
- Pré-condições: aba Notebook aberta.
- Fluxo principal:
  1. Usuário abre/cria uma nota no editor à esquerda; o chat assistivo fica à direita.
  2. Digita conteúdo; após ~1200 ms sem digitar, a nota é salva automaticamente
     (autosave com debounce).
  3. Aciona uma ação assistiva: **Resumir**, **Melhorar escrita** ou **Extrair
     Siglas**.
  4. O assistente processa o texto da nota e devolve o resultado no chat à direita,
     **sem** apagar a nota.
- Fluxos alternativos / exceções:
  - A1. "Extrair Siglas" sem siglas conhecidas → lista vazia/aviso, nota intacta.
  - A2. Reabrir a tela recupera o último conteúdo persistido.
- Pós-condições: nota persistida; resposta assistiva exibida; conteúdo **pessoal/
  privado** (não passa por moderação — doc `28` RN-20).
- Regras de negócio relacionadas: conteúdo pessoal não moderado, escrita exige `can()`
  sobre o próprio recurso (doc `28` RN-20); assistente **simulado** nesta fase (doc
  `20` §3).
- Requisitos cobertos: RF-030, RF-031, RF-032, RF-033, RF-034, RF-066.

### CU-17 — Inspecionar componente no 3D e registrar ideia
- Ator(es): `user`.
- Pré-condições: Explorador 3D carregado; hotspot selecionado.
- Fluxo principal:
  1. Usuário clica em um hotspot do veículo.
  2. Aciona **Inspecionar**: o painel `inspectedInfo` exibe nome + descrição técnica
     do componente e a câmera reenquadra a parte clicada.
  3. (Alternativa) aciona **"Anotar Ideia sobre esta parte"**: abre o modal de ideias
     já vinculado ao nome do componente.
  4. Salva a ideia; persiste e fica disponível para reconsulta.
- Fluxos alternativos / exceções:
  - A1. Usuário só inspeciona, sem anotar ideia → nenhuma persistência de ideia.
  - E1. Sem WebGL/falha do `.glb` → inspeção sobre o fallback procedural (RF-015).
- Pós-condições: (opcional) ideia persistida e vinculada ao componente.
- Requisitos cobertos: RF-014, RF-013, RF-011.

### CU-18 — Cocriar itens dos catálogos dos módulos (canais, kit, componentes, projetos, automações)
- Ator(es): `user` (cocria); `coordinator`/`admin` (editam direto — visão-alvo).
- Pré-condições: subaba do módulo aberta (Treinamento → Canais/Kit; Informações →
  Componentes/Projetos; Automações).
- Fluxo principal:
  1. Usuário aciona "adicionar" no catálogo desejado.
  2. Preenche o formulário (ex.: canal = título/descrição/URL; kit = instrução + até
     2 links; componente = nome/descrição/categoria/fornecedor Tier-1/imagem;
     projeto = código interno/status/ficha/versões; automação = nome/descrição/links).
  3. Salva; o item aparece no grid e persiste; concede **+50 XP** (RN-16) e registra
     na timeline.
  4. (Componentes) aplica **filtro cruzado** por Categoria e Fornecedor Tier-1
     (Aptiv/Bosch/Harman/Marelli) e vê a interseção.
  5. (Automações) aciona "perguntar ao chat" para ajuda operacional sobre a ferramenta.
- Fluxos alternativos / exceções:
  - E1. Campos obrigatórios vazios → salvar bloqueado por validação.
- Pós-condições: item persistido; XP/timeline atualizados.
- Regras de negócio relacionadas: no protótipo publica direto (doc `20` §6); na
  visão-alvo `user` **propõe-e-aprova** e o tipo entra no `target_type` polimórfico
  (doc `28` RN-05/RN-21).
- Requisitos cobertos: RF-039, RF-040, RF-042, RF-043, RF-046, RF-046b, RF-058,
  RF-061, RF-066.

### CU-19 — Consultar páginas institucionais (Diretrizes, Timeline, Veículos)
- Ator(es): `user`.
- Pré-condições: aba Informações aberta.
- Fluxo principal:
  1. Usuário abre **Diretrizes Globais** (FaSTLAne 2030, Net Zero 2038, valores).
  2. Abre **Marcos & Timeline** (marcos históricos e lançamentos futuros em ordem).
  3. Abre **Veículos** (modelos com destaques/ficha, ex.: Commander).
- Fluxos alternativos / exceções:
  - A1. Conteúdo é consulta somente-leitura; sem edição pelo `user`.
- Pós-condições: informação institucional consultada; sistema inalterado.
- Requisitos cobertos: RF-047, RF-048, RF-049.

### CU-20 — Gerenciar perfil e insígnia de setor
- Ator(es): `user`.
- Pré-condições: aba Perfil aberta.
- Fluxo principal:
  1. Usuário edita nome, cargo, setor e avatar (seleção/upload).
  2. Ao selecionar um setor válido, a **insígnia de setor** correspondente é ativada.
  3. As mudanças sincronizam no header e no dropdown e persistem.
- Fluxos alternativos / exceções:
  - A1. Trocar de setor troca a insígnia exibida.
- Pós-condições: perfil e insígnia de setor persistidos e refletidos na UI.
- Regras de negócio relacionadas: insígnia/nível são **engajamento, não permissão**
  (doc `28` RN-15).
- Requisitos cobertos: RF-055, RF-059, RF-056.

### CU-21 — Navegar pela SPA (shell de abas)
- Ator(es): `user`.
- Pré-condições: aplicação carregada.
- Fluxo principal:
  1. Usuário seleciona uma aba/link de navegação.
  2. A seção-alvo é exibida instantaneamente, sem recarregar a página
     (`switchSection`), preservando o estado das demais seções.
- Fluxos alternativos / exceções:
  - A1. Recarregar a página retorna à Home (sem hash router — doc `20` §2).
- Pós-condições: seção ativa trocada; estado local preservado.
- Requisitos cobertos: RF-065, RF-066.

## 4. Perguntas em aberto

1. **Granularidade dos casos de uso** — um CU por tela ou por objetivo de negócio?
   *aguardando alinhamento com o `product-lead`*.
2. **Rastreabilidade formal** — adotar matriz requisito→CU→teste (rastreável até o
   plano de homologação `16`)? *aguardando decisão*.
3. Casos de uso de **administração avançada** (Fase 3/4: métricas, SSO, MFA) ainda
   não foram elicitados — *fora do MVP, a detalhar depois*.
4. **CUs [FUTURO] ainda não detalhados** — moderação de contribuições (CU-06), Q&A
   (CU-07) e RAG com fontes (CU-03 na versão real) dependem de decisões abertas do
   PDR `03` e das SPECs `09`/`11`; os CUs do protótipo (CU-09..CU-21) cobrem hoje o
   comportamento observável, sem auth/RBAC. *— a reconciliar quando o MVP real for
   priorizado (ver `04`).*
5. **Rastreabilidade fechada (Etapa 5)** — a matriz do doc `21` §10 foi atualizada
   para **0 RF órfãos** com CU-16..CU-21; a única exceção justificada é RF-070
   (migração de infraestrutura, sem CU de usuário). As **regras de negócio** dos CUs
   estão consolidadas no doc `28` (Etapa 4). *— sem pendência de cobertura.*
