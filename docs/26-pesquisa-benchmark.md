# 26 — Pesquisa, Benchmark e Contexto (Etapa 2)

Status: **rascunho para aprovação do gate (Etapa 2)**.
> Última atualização: 2026-07-17.
> Autoria: Analista de Requisitos (`requirements-analyst`), reporta ao Produto Lead
> (aprovador do gate da Etapa 2 do ciclo de vida `14-ciclo-de-vida-engenharia.md`).
> Cobre a **Etapa 2 (Pesquisa)** do ciclo `14` §2 — consolida o contexto,
> benchmark, restrições e **riscos iniciais** que hoje estão implícitos/dispersos,
> fechando o eixo Ideia→Pesquisa→Requisitos (etapas 1→2→3).
> Entradas: `01-briefing.md` (§1 contexto, §3.1 módulos), `20-prototipo-referencia.md`
> (inventário do protótipo), `21-requisitos-funcionais.md` (RF), `15-casos-de-uso.md`
> §1 (atores), `24-parecer-seguranca-prototipo.md` (LGPD/OWASP),
> `25-arquitetura-revisao-escopo-prototipo.md` (encaixe arquitetural),
> `03-pdr.md` (decisões `Dxx`, incl. `D5`/`D6` em aberto), e os documentos originais
> do protótipo `prototypes/portal-spa/PROTOTIPO-ORIGINAL-README.md` e
> `requirements_specification-original.md`.
> **Não reinterpreta código nem requisitos** — referencia por número (doc-standards §4).

---

## 1. Contexto e problema

Consolida o §1 do briefing `01`. O problema central é a **barreira de entrada** de
um colaborador novo ou em transição no setor automotivo/engenharia da Stellantis:

- **Siglas e jargões** técnicos e administrativos densos (ADAS, Bio-Hybrid, T270,
  eTCU, MultiAir, plataformas, códigos de projeto como `J3U`…) que não estão
  documentados de forma acessível.
- **Fluxos de trabalho** implícitos: quem faz o quê, em que ordem, com quais
  ferramentas — conhecimento que vive **na cabeça de pessoas experientes** ou
  **espalhado em documentos dispersos** (briefing `01` §1).
- **Contexto do dia a dia** (processos, políticas internas, glossário vivo) sem um
  ponto único de consulta.

A consequência é um *time-to-productivity* longo e dependente de tutoria informal.
A hipótese de valor (briefing `01` §2/§3) é que um **dicionário vivo + assistente
conversacional com RAG**, ancorado numa **porta de entrada visual (cockpit 3D)** e
cercado de módulos de onboarding, reduz essa barreira ao permitir "aprender
apontando" e "perguntar em linguagem natural com fonte citada".

O protótipo do CEO (doc `20`) ampliou o problema percebido: além de **consultar**, o
novo colaborador precisa **estudar** (trilhas/flashcards), **se orientar na
organização** (quem procurar, hierarquia, projetos, componentes por fornecedor),
**trabalhar** (notebook com IA) e **se engajar** (gamificação) — tudo num destino
único de integração (briefing `01` §2 "Visão ampliada", §3.1).

## 2. Atores / personas

Os atores do sistema estão catalogados no doc `15` §1 e **não são duplicados aqui**
(doc-standards §4). Referência por número:

- **Visitante**, **`user`**, **`coordinator`**, **`admin`**, **Sistema RAG/IA** e
  **Especialista/Responsável** — ver doc `15` §1 (fontes SPEC `02`/`08`/`09`).

Persona adicional que a pesquisa desta etapa torna explícita como **foco central do
onboarding** (já presente no briefing `01` §4, a promover a ator de primeira classe
na próxima revisão do doc `15` §1):

- **Novo colaborador em onboarding / em transição** — recém-chegado (ou mudando de
  área) que ainda não domina siglas, fluxos nem a topografia organizacional. É o
  **destinatário-alvo** da jornada de integração: consulta o dicionário e o chat,
  estuda (trilhas/flashcards), descobre "quem procurar" e se situa na organização
  (briefing `01` §4). Em termos de RBAC herda o papel **`user`** (doc `15` §1); a
  distinção é de **persona/jornada**, não de autorização.

> Nota de rastreabilidade: recomenda-se registrar esta persona no doc `15` §1 na
> Etapa 5, mapeando-a aos casos de uso CU-01..CU-04 e CU-08 (doc `15` §3).

## 3. Benchmark por categoria

O protótipo (doc `20`) **mistura quatro categorias de produto** que o mercado
costuma tratar separadamente. Esta seção posiciona o produto frente a cada uma:
o **padrão de mercado** (em nível de domínio, sem números externos) e **o que o
protótipo faz**. As referências reais abaixo são as **nominalmente citadas pelo
próprio protótipo** (README original L13; spec-original RF06; doc `20` §7) —
**Stellantis Academy**, **Cornerstone LXP**, **Android IVI Documentation** e
**Developer Portal**. Nenhum número de mercado, URL ou citação externa é inventado;
o que exigir pesquisa real está marcado em §7 como "a validar com fontes".

### 3.a Dicionário/glossário técnico + RAG / assistente conversacional

- **Padrão de mercado (domínio):** glossários técnicos costumam ser páginas
  estáticas ou wikis; a evolução recente é acoplar um **assistente conversacional
  com RAG** que responde em linguagem natural **citando a fonte** (o verbete/
  documento) em vez de um FAQ estático. Guardrails contra alucinação e
  rastreabilidade da resposta à fonte são o diferencial esperado.
- **O que o protótipo faz:** Dicionário com busca em tempo real, filtro por
  categoria, CRUD e modal de detalhe (doc `20` §3; RF-001..RF-005). O "StellantisGPT"
  é **chat simulado por palavras-chave** (`setTimeout` + `if/else`), **sem LLM e sem
  citação de fontes** (doc `20` §3; §6). A visão-alvo troca o motor por **RAG real
  com citação de fontes** preservando a UX conversacional (doc `20` §6; briefing `01`
  §3; SPEC `02` §3.3/§3.4). O produto se posiciona nesta categoria como **coração**
  (briefing `01` §2).

### 3.b Portal de onboarding / treinamento gamificado (LMS/LXP)

- **Padrão de mercado (domínio):** plataformas de aprendizado corporativo (LMS/LXP)
  entregam trilhas, cursos, certificações e engajamento; **Cornerstone** (citado como
  "LXP Cornerstone"/"Cornerstone LXP") e a **Stellantis Academy** são os portais
  corporativos de aprendizado que o próprio protótipo referencia como destino
  externo (README original L13; spec-original RF06; doc `20` §3). O padrão é que o
  LMS/LXP seja o **sistema de registro** de aprendizado; gamificação (XP, insígnias,
  níveis) é camada de engajamento.
- **O que o protótipo faz:** Centro de Treinamento com **Kit Colaborador**,
  **Flashcards 3D**, **Cursos técnicos** (Bio-Hybrid/ADAS/MultiAir com conclusão →
  XP e insígnias) e **Canais Oficiais** — este último um **diretório de links** que
  aponta para os portais reais (Academy, Cornerstone LXP, Android IVI Documentation,
  Developer Portal) (doc `20` §3; RF-035..RF-040, RF-055..RF-061). Ou seja, o
  produto **não substitui** o LMS/LXP corporativo: posiciona-se como **camada leve de
  onboarding** que **cataloga e encaminha** para os sistemas oficiais, mais uma
  gamificação própria de engajamento. Invariante: gamificação é **engajamento, não
  permissão** (briefing `01` §3.1/§8; doc `25` §4).

### 3.c Diretório "quem procurar" / organograma

- **Padrão de mercado (domínio):** diretórios corporativos e organogramas navegáveis
  (do tipo "people directory") permitem achar a pessoa/especialista certa e situar-se
  na hierarquia. **Envolvem dados de pessoas** e, portanto, são o ponto mais sensível
  do ponto de vista de **LGPD/privacidade**.
- **O que o protótipo faz:** **Especialistas** ("quem procurar", contato via chat),
  **Estrutura & Equipe** (organograma em árvore drill-down com breadcrumbs, CRUD de
  nós e **mapa global por país**) (doc `20` §3; RF-041, RF-044, RF-045). O diferencial
  do produto é **ligar o especialista ao componente/verbete** por `term_slug` (doc
  `15` §1; SPEC `08`). O organograma e a lista de especialistas do protótipo exibem
  **nomes aparentemente reais** — tratado como risco/LGPD (doc `20` §7; doc `24`;
  briefing `01` §8 Q3).

### 3.d Explorador 3D de produto

- **Padrão de mercado (domínio):** visualizadores 3D/WebGL de produto (configuradores,
  "digital twins", documentação interativa) permitem girar/inspecionar um objeto e
  saltar para informação contextual. No domínio automotivo/IVI, a documentação de
  referência citada pelo protótipo é a **Android IVI Documentation** e um **Developer
  Portal** (README original L13; doc `20` §3).
- **O que o protótipo faz:** Home com **hotspots 2D** sobre imagem do Jeep e um
  **Explorador 3D** em three.js (r128) com `OrbitControls`, `GLTFLoader` de um `.glb`
  local, alternância wireframe/sólido, hotspots que saltam para o verbete e
  **fallback procedural** se o `.glb` falhar (doc `20` §2/§3; RF-010..RF-015). O
  diferencial do produto é usar o 3D como **porta de entrada visual do glossário**:
  hotspots ligados ao dicionário por `term_slug` (briefing `01` §3; doc `20` §6). No
  MVP entra como **versão simplificada** (modelo único + poucos hotspots) — briefing
  `01` §5.

> **Posicionamento consolidado:** nenhum concorrente único cobre as quatro
> categorias juntas; o valor do produto é **a integração** (glossário↔chat↔3D↔
> pessoas↔treino) para o público de onboarding, **não** competir de frente com o
> LMS/LXP corporativo (que permanece o sistema oficial, referenciado via Canais).

## 4. Restrições

Herdadas do briefing `01` §6, do parecer de segurança (doc `24`) e da arquitetura
(doc `25`). Não são redecididas aqui — apenas consolidadas:

- **Stack-alvo:** monólito modular **Node.js/TypeScript + Postgres/`pgvector`**, RAG
  e RBAC (doc `20` §2/§6; doc `25` §2; SPEC `02` §2). O protótipo é SPA 100% cliente
  em `localStorage` **sem backend/auth** e **não** é implementação de referência da
  arquitetura (doc `20` §1/§6) — é fonte de escopo/UX.
- **Segurança empresarial:** hash forte de senha, HTTPS, OWASP Top 10, menor
  privilégio (briefing `01` §6; doc `24`). Publicação externa do protótipo está
  **BLOQUEADA** até tratar achados CRÍTICO/ALTO (doc `24` §1).
- **LGPD / dados de pessoas:** Diretório, Organograma, Especialistas e avatares
  envolvem PII; recomendação de Segurança é **seed fictício** até migração segura
  (doc `24`; doc `20` §7; briefing `01` §8 Q3) — **decisão do CEO em aberto**.
- **Decisões voláteis em aberto — `D5` (provedor de LLM: Claude × OpenAI) e `D6`
  (hospedagem: on-premise × cloud privada):** tratadas como **configuráveis por
  port/adapter** e **não bloqueiam** as etapas de planejamento (briefing `01` §6/§8;
  doc `25` §7; PDR `03`).
- **Portabilidade / independência de fornecedor:** o provedor de LLM deve ser
  abstraído por camada de integração (`LlmProvider`) para não travar a arquitetura a
  um único fornecedor (briefing `01` §6; doc `20` §6; doc `25` §7).
- **Fronteira de escopo do MVP em aberto:** quais das sete famílias novas (§3.1 do
  briefing) entram no primeiro corte é **pergunta ao CEO** (briefing `01` §5/§8 Q1;
  doc `25` §11) — restrição de planejamento que condiciona priorização (ver §7).
- **Conteúdo de terceiros:** logotipos das 14 marcas, avatares e imagens estilo
  Unsplash — verificar licença antes de qualquer uso público (doc `20` §7).

## 5. Riscos iniciais (obrigatório na DoD)

Levantamento inicial de riscos (DoD Etapa 2, doc `14` L69). Mitigações são
**iniciais/propostas**, não decisões.

| # | Risco | Categoria | Impacto | Mitigação inicial |
|---|---|---|---|---|
| R1 | **Escopo crescer demais** — protótipo demonstra 4 categorias + 7 famílias de módulos; tentar entregar tudo no MVP dilui o núcleo (dicionário+RAG). | Produto/escopo | Alto | Fixar núcleo MVP (dicionário, RAG, cockpit-3d, diretório — doc `25` §11.1) e submeter a fronteira das 7 famílias ao CEO como pergunta (briefing `01` §5/§8 Q1); adiar `gamification`/`notebook`/`training` para Fase 2+ conforme corte. |
| R2 | **LGPD / dados reais de pessoas** — organograma e especialistas exibem nomes aparentemente reais (doc `20` §7); exposição de PII, sobretudo se publicado. | Segurança/legal | Alto | Adotar **seed fictício** até migração segura (recomendação do doc `24`); manter publicação externa **bloqueada** até tratar achados; confirmar decisão com CEO (briefing `01` §8 Q3). |
| R3 | **Alucinação do RAG** — respostas plausíveis porém erradas ou sem fonte minam a confiança no assistente. | IA/qualidade | Alto | Exigir **citação de fontes** e guardrails na resposta (SPEC `02` §3.3/§3.4; doc `20` §6); restringir o RAG à base curada do dicionário; métrica "resposta cita a fonte usada" (briefing `01` §7). |
| R4 | **Dependência de CDNs** — three.js r128, OrbitControls, GLTFLoader e Lucide via CDN (doc `20` §2); indisponibilidade/CORS quebra 3D e ícones, e rede interna pode bloquear CDNs. | Técnico/operacional | Médio | Auto-hospedar libs no produto-alvo (empacotar no build); manter **fallback procedural** do 3D (doc `20` §3); validar política de rede interna (ver §7). |
| R5 | **Complexidade do 3D / WebGL** — modelo de alta fidelidade, hotspots e performance em máquinas corporativas heterogêneas elevam custo e risco de UX. | Técnico | Médio | MVP com **modelo único + poucos hotspots** (briefing `01` §5); degradar para hotspots 2D/imagem quando WebGL indisponível; adiar alta fidelidade/"explodir veículo" para fases seguintes (briefing `01` §5 visão futura). |
| R6 | **Gamificação virar dívida** — XP/níveis/insígnias acoplados indevidamente a permissões, ou esforço de manutenção sem retorno de engajamento. | Produto/técnico | Médio | Manter invariante **gamificação = engajamento, nunca permissão** (briefing `01` §3.1/§8 Q2; doc `25` §4); isolar do RBAC; tratar como forte candidata a **Fase 2+** (doc `25` §11.1). |
| R7 | **`StellantisGPT` simulado × RAG real** — expectativa criada pela demo (chat por palavras-chave) diverge do RAG real; risco de sobre-promessa. | Produto/expectativa | Médio | Comunicar que o chat do protótipo é **simulado** (doc `20` §3/§6); definir em que fase o RAG real substitui a simulação (briefing `01` §8 Q4). |
| R8 | **Provedor de LLM e hospedagem indefinidos (`D5`/`D6`)** — decisão tardia pode travar integração se a arquitetura acoplar a um fornecedor. | Arquitetura/dependência | Médio | Abstrair por **port/adapter** (`LlmProvider`) e manter configurável (doc `25` §7; briefing `01` §6); tratar como não-bloqueante nesta fase (briefing `01` §8). |
| R9 | **Reimplementação a partir do protótipo** — `localStorage`/SPA sem backend precisa virar CRUD `rota→serviço→repositório`, auth/RBAC/moderação inexistentes no protótipo (doc `20` §6). | Técnico/esforço | Médio | Usar o protótipo só como fonte de UX/escopo; mapear cada CRUD a permissão nomeada e a estados de publicação/moderação (doc `20` §6; SPEC `09`/`11`); requisitos `[FUTURO]` no doc `21` §11. |
| R10 | **Taxonomia de categorias inconsistente** — protótipo usa {motorizacao, tecnologia, componentes, plataformas} e a spec-original cita {Tecnologia, Engenharia, Negócios, Gestão} (doc `20` §8 Q4). | Dados/requisitos | Baixo | **RESOLVIDO (2026-07-17):** adotada a taxonomia do protótipo como canônica (diretriz "o protótipo manda", CEO); ver doc `21` RF-002/RF-006 e §12 pergunta 7. Nota ao PDR `03` (nova linha `Dn`). |

## 6. Referências

**Internas (por número — doc-standards §4):**
- `01-briefing.md` — §1 contexto, §2 objetivo/visão ampliada, §3/§3.1 proposta e
  módulos, §4 usuários-alvo, §5 escopo MVP, §6 restrições, §7 métricas, §8 perguntas.
- `03-pdr.md` — decisões `Dxx` (incl. `D5`/`D6`, `D12`/`D13`/`D14`).
- `14-ciclo-de-vida-engenharia.md` §2 — Etapa 2 (esta etapa) e DoD (L69).
- `15-casos-de-uso.md` §1 (atores) e §3 (casos CU-01..CU-08).
- `20-prototipo-referencia.md` — inventário fiel do protótipo (§2 stack, §3 módulos,
  §6 divergências, §7 terceiros/LGPD, §8 perguntas).
- `21-requisitos-funcionais.md` — RF-001..RF-061 e `[FUTURO]` §11.
- `24-parecer-seguranca-prototipo.md` — LGPD/OWASP, veredito e recomendações.
- `25-arquitetura-revisao-escopo-prototipo.md` — encaixe dos módulos (§2/§3), port/
  adapter para `D5`/`D6` (§7), invariante da gamificação (§4), MVP proposto (§11).
- `prototypes/portal-spa/PROTOTIPO-ORIGINAL-README.md` e
  `prototypes/portal-spa/requirements_specification-original.md` — RF01–RF09 /
  RNF01–RNF05 originais.

**Externas (citadas nominalmente pelo protótipo — sem links; não inventadas):**
- **Stellantis Academy** — portal corporativo de aprendizado (LMS/Academy).
- **Cornerstone LXP** ("LXP Cornerstone") — plataforma de experiência de aprendizado.
- **Android IVI Documentation** — documentação de infotainment veicular (IVI).
- **Developer Portal** — portal de documentação técnica para desenvolvedores.
- **Bibliotecas de UI/3D do protótipo:** three.js (r128) + OrbitControls + GLTFLoader,
  Lucide Icons (via CDN — doc `20` §2). Fornecedores Tier-1 citados: Aptiv, Bosch,
  Harman, Marelli (doc `20` §3).

> As referências externas acima são registradas **como o protótipo as nomeia**;
> qualquer dado de mercado, URL, versão canônica ou comparação quantitativa **não**
> foi validado com fonte e está listado em §7 como "a validar com fontes".

## 7. Perguntas em aberto

Herdadas do briefing `01` §8, doc `20` §8 e desta pesquisa. Nada aqui é decidido —
o indefinido é apresentado como pergunta (doc-standards §5).

1. **Fronteira do MVP entre as 7 famílias novas** (briefing `01` §5/§8 Q1; doc `25`
   §11) — quais entram no primeiro corte? Recomendação de Engenharia é **proposta**,
   não decisão. *— ainda em aberto (decisão do CEO).*
2. **Gamificação no produto real** — entra em alguma fase (qual) ou fica só como demo?
   (briefing `01` §8 Q2). *— ainda em aberto.*
3. **LGPD: pessoas reais × seed fictício** no Diretório/Organograma/Especialistas
   (briefing `01` §8 Q3; doc `24`). *— ainda em aberto (decisão do CEO).*
4. **`StellantisGPT` simulado × RAG real** — em que fase o chat simulado é
   substituído pelo RAG com citação de fontes? (briefing `01` §8 Q4). *— ainda em
   aberto.*
5. ~~**Taxonomia de categorias de termo** — {motorizacao, tecnologia, componentes,
   plataformas} do protótipo × {Tecnologia, Engenharia, Negócios, Gestão} da
   spec-original (doc `20` §8 Q4).~~ — **RESOLVIDO (2026-07-17):** adotada a do
   protótipo como canônica (diretriz "o protótipo manda", CEO); ver doc `21`
   RF-002/RF-006 e §12 pergunta 7; nota ao PDR `03` (nova linha `Dn`).
6. **Dados de mercado e benchmark quantitativo** (participação, comparativos de
   concorrentes, métricas de LMS/LXP, boas práticas anti-alucinação com números) —
   exigem pesquisa externa real com fontes que esta etapa **não** tem acesso.
   *— a validar com fontes (fora do escopo desta etapa).*
7. **Referências externas canônicas** — versões/escopo oficiais de Stellantis
   Academy, Cornerstone LXP, Android IVI Documentation e Developer Portal (o
   protótipo apenas as nomeia). *— a validar com fontes.*
8. **Política de rede interna quanto a CDNs** (R4) — a rede corporativa bloqueia
   CDNs públicas? Define se libs devem ser auto-hospedadas já no MVP.
   *— a validar com Infra/Segurança.*
9. **Hospedagem (`D6`) e provedor de LLM (`D5`)** — seguem em aberto no PDR `03`;
   **não bloqueiam** esta etapa (configuráveis, doc `25` §7). *— ainda em aberto.*

> Aprovação do gate da Etapa 2 pendente do **Produto Lead** (`product-lead`).
