# Briefing — Stellantis Dictionary (Agente de IA Introdutório)

> Última atualização: 2026-07-17.
> **Ampliado a partir do protótipo funcional do CEO** (SPA "Stellantis Dictionary &
> Training Portal", em `prototypes/portal-spa/`). O briefing original cobria
> dicionário + RAG + cockpit 3D + auth/RBAC; o protótipo revelou uma **visão
> ampliada** de portal de onboarding/engenharia, com sete famílias de módulos novas.
> Este documento incorpora essa visão. Deriva do inventário do protótipo (doc `20`);
> requisitos detalhados no doc `21` (55 RF, marcados `[PROTÓTIPO]`/`[FUTURO]`);
> encaixe arquitetural no doc `25`. **A fronteira de escopo do MVP (§5) e a decisão
> LGPD (doc `24`) permanecem em aberto — decisão do CEO** (ver §8).

## 1. Contexto
Colaboradores novos (ou em transição) no setor enfrentam uma barreira de entrada alta:
siglas, jargões e fluxos de trabalho internos que não estão documentados de forma
acessível. O conhecimento vive na cabeça de pessoas experientes ou espalhado em
documentos dispersos.

## 2. Objetivo
Criar uma aplicação web (página HTML/SPA) que funcione como um **agente de IA
introdutório**, servindo como estudo de caso prático de **dicionário + RAG**
(Retrieval-Augmented Generation), e que na prática ajude qualquer usuário do setor
a entender:
- Siglas e termos técnicos/administrativos do setor;
- Fluxos de trabalho (quem faz o quê, em que ordem, com quais ferramentas);
- Contexto do dia a dia (processos, políticas internas, glossário vivo).

> **Visão ampliada (revelada pelo protótipo).** Além do núcleo dicionário + RAG +
> cockpit 3D, o protótipo demonstrou um **portal de onboarding e engenharia**: um
> ambiente único onde o colaborador não só consulta termos, mas **estuda** (trilhas
> e flashcards), **se orienta na organização** (quem procurar, hierarquia, projetos,
> componentes por fornecedor), **trabalha** (notebook com apoio de IA) e **se
> engaja** (gamificação). O objetivo passa a abranger esse portal como destino de
> integração do novo colaborador — mantendo o dicionário + RAG como coração.

## 3. Proposta de valor
- **Uso pessoal, mas multiusuário**: cada colaborador tem sua conta, seu histórico
  de conversas e (futuramente) permissões diferenciadas.
- **Chatbot com RAG**: em vez de um FAQ estático, o usuário conversa em linguagem
  natural e recebe respostas fundamentadas no dicionário/base de conhecimento.
- **Explorador 3D do Cockpit (porta de entrada visual)**: na página principal, um
  veículo/cockpit 3D da Stellantis que o usuário gira com o mouse. Ao passar/clicar
  sobre partes do carro (HUD, cluster digital, central display, comandos do volante,
  alto-falantes/microfones, etc.), aparece o nome e uma prévia do que é; clicando no
  termo, o usuário é levado direto ao verbete correspondente no dicionário. Transforma
  o glossário abstrato em uma experiência visual e navegável — aprender "apontando"
  para o objeto real.
- **Dicionário vivo**: começa com cadastro manual de termos e evolui para ingestão
  de documentos reais do setor (PDFs, planilhas, manuais internos).
- **Segurança em primeiro lugar**: por lidar com informação potencialmente
  confidencial de um ambiente empresarial, autenticação, autorização e proteção de
  dados são requisitos de primeira classe, não um adendo.

### 3.1 Módulos da visão ampliada (do protótipo)
Famílias de valor que o protótipo acrescentou ao núcleo (detalhe no doc `21`;
encaixe arquitetural no doc `25` §2):
- **Treinamento**: trilhas/cursos técnicos e **flashcards 3D** (com autopreenchimento
  a partir do dicionário) — aprender e memorizar sem sair do portal (RF-035..RF-040).
- **Gamificação (engajamento, não permissão)**: XP, níveis e **insígnias** por
  cocriar conteúdo e concluir cursos, com timeline de contribuições. É **camada de
  engajamento** e **nunca** define permissões/acessos — o controle de acesso é o
  RBAC de papéis (`user`/`coordinator`/`admin`, ver §4 e PDR `03` D12/D13).
  (RF-055..RF-061; invariante no doc `25` §4.)
- **Notebook de engenharia com IA**: bloco de notas com autosave e ações assistidas
  (resumir, melhorar, extrair siglas) ao lado de um chat assistivo (RF-030..RF-034).
- **Diretório / Organograma + mapa global**: "quem procurar", hierarquia de
  liderança navegável e distribuição mundial de polos. **Envolve dados de pessoas —
  sensível/LGPD** (ver doc `24`; §8) (RF-041, RF-044, RF-045).
- **Catálogo de Projetos veiculares**: projetos com código interno, status e versões
  (RF-043).
- **Componentes de Infotainment por fornecedor**: componentes com filtro por
  fornecedor Tier-1 (Aptiv/Bosch/Harman/Marelli), ligáveis a verbete e especialista
  (RF-042).
- **Automações & IA**: vitrine de robôs/ferramentas de automação de engenharia, com
  atalho de ajuda no chat (RF-046).
- **Kit de onboarding e Canais oficiais**: cartões de integração com links rápidos e
  um diretório de portais corporativos de aprendizado (Academy, LXP, etc.)
  (RF-039, RF-040).

> **Fronteira importante:** a gamificação é **engajamento**, não um papel de
> permissão. Subir de nível/insígnia não concede nenhum acesso — quem autoriza é o
> RBAC (`user`/`coordinator`/`admin`, ver §4). Registrado como invariante no doc
> `25` §4.

## 4. Usuários-alvo
- **Novo colaborador / em transição** — público central do onboarding: consulta o
  dicionário e o chatbot, estuda (trilhas/flashcards), descobre quem procurar e se
  situa na organização.
- **Colaborador do setor** (usuário final, papel `user`) — consulta e **cocria**
  conteúdo (termos, componentes, projetos, etc.) em fluxo moderado.
- **Coordenador/Administrador** (papéis `coordinator`/`admin`) — cadastram/curam
  termos, moderam contribuições, revisam documentos ingeridos, gerenciam usuários e
  permissões.

> Os papéis acima são de **autorização (RBAC)** — distintos da gamificação (§3.1),
> que é engajamento e não concede acesso. Modelo de papéis no PDR `03` D12/D13 e
> SPEC `09`.

## 5. Escopo da v1 (MVP) vs. Visão futura
**MVP (fase 1):**
- Cadastro/login de usuários (multiusuário completo, com papéis).
- CRUD de termos/siglas do dicionário (cadastro manual).
- Chatbot com RAG consultando o dicionário cadastrado manualmente.
- Interface web simples e responsiva.

> Nota sobre o Explorador 3D: no MVP entra como uma **versão simplificada** —
> um modelo 3D único do cockpit com um conjunto pequeno de "hotspots" (pontos
> clicáveis) já ligados a termos do dicionário. A imagem "Cockpit Introduction"
> da Stellantis serve de referência para quais partes destacar (HUD, cluster
> digital, central display, comandos do volante, alto-falantes/amplificador/
> microfones, espelhamento de telefone, nuvem, etc.). O modelo 3D de alta
> fidelidade e a cobertura completa de peças ficam para fases seguintes.

> **Onde ficam os módulos da visão ampliada (§3.1)?** — *proposta, não decisão.* A
> **fronteira do MVP entre as sete famílias novas é pergunta em aberto ao CEO** (§8).
> Recomendação de Engenharia (doc `25` §11.1), a confirmar pelo Produto/CEO:
> - **Núcleo MVP permanece o do PDR `03` §3 Fase 1**: `dictionary`, `rag`,
>   `cockpit-3d`, `directory` ("quem procurar").
> - **Menor custo entre os novos** (candidatos a entrar cedo): `components` e
>   `projects` (CRUD + elo por `slug`).
> - **Mais adiável**: `gamification` (é engajamento, não função-núcleo) — forte
>   candidata a Fase 2+.
> - **A posicionar**: `training`, `notebook`, `automations`, Kit/Canais
>   (`resources`) — o CEO decide o corte.
>
> Nada acima é decisão fechada: ver a pergunta em aberto §8 e a nota sugerida ao
> PDR `03`.

**Visão futura (fases seguintes):**
- Modelo 3D de alta fidelidade e cobertura ampla de peças no Explorador 3D, com
  camadas (cockpit digital vs. físico) e possibilidade de "explodir" o veículo.
- Ingestão de documentos (PDF/DOCX/planilhas) para alimentar o RAG automaticamente.
- Base de conhecimento de fluxos de trabalho (não só termos, mas processos passo a
  passo).
- Auditoria/logs de uso, métricas de perguntas mais feitas (identificar lacunas de
  conhecimento).
- Controle de acesso mais granular (ex.: termos confidenciais visíveis só para
  certos papéis).
- Módulos da visão ampliada (§3.1) não incluídos no corte do MVP — priorizados por
  fase conforme decisão do CEO (§8).

## 6. Restrições e premissas
- Sistema tratado como **empresarial**: aplicar práticas rígidas de cibersegurança
  (senhas com hash forte, HTTPS, proteção contra OWASP Top 10, princípio do menor
  privilégio).
- Acesso via computador (rede interna/corporativa) — decisão de hospedagem
  (on-premise vs. cloud privada) a confirmar no SPEC.
- Provedor de LLM ainda em aberto (Claude ou OpenAI) — deve ser abstraído por uma
  camada de integração para não travar a arquitetura a um único fornecedor.
- Fonte de conteúdo do dicionário: cadastro manual **e** ingestão futura de
  documentos (híbrido).

## 7. Métricas de sucesso (iniciais)
- Usuário consegue cadastrar-se, logar e encontrar/adicionar um termo em < 2 min.
- Chatbot responde corretamente a perguntas sobre termos cadastrados, citando a
  fonte (o próprio termo/documento) usada na resposta.
- Nenhuma informação sensível exposta sem autenticação.

## 8. Perguntas em aberto (decisão do CEO)
> Abertas pela ampliação de escopo do protótipo (2026-07-17). Nada aqui foi decidido
> por outros agentes — o indefinido é apresentado como pergunta, conforme guardrail.

1. **Fronteira do MVP entre os módulos novos (§3.1/§5)** — quais das sete famílias
   (`training`, `resources` = Kit/Canais, `gamification`, `projects`, `components`,
   `automations`, `notebook`) entram no primeiro corte e quais viram Fase 2+? A
   recomendação de Engenharia (núcleo do PDR `03` §3 + `components`/`projects` de
   baixo custo; `gamification` a mais adiável) é **proposta**, não decisão.
   *— ainda em aberto.* → **Nota ao PDR `03`:** ao decidir, registrar como nova
   linha `Dn` (escopo dos módulos do portal ampliado no MVP).
2. **Gamificação no produto real** — entra em alguma fase do produto (e em qual) ou
   fica só como demonstração do protótipo? Confirmar que permanece **camada de
   engajamento, isolada do RBAC** (doc `25` §4). *— ainda em aberto.* → possível
   `Dn` dedicado no PDR `03`.
3. **LGPD / dados de pessoas** (Diretório, Organograma, Especialistas, avatares) —
   usar **pessoas reais** ou **seed fictício** até a migração segura? Recomendação
   de Segurança (doc `24`): fictício. *— decisão do CEO em aberto.*
4. **StellantisGPT simulado × RAG real** — em que fase o chat simulado do protótipo é
   substituído pelo RAG com citação de fontes (núcleo do MVP)? *— ainda em aberto.*

> As decisões de LLM (`D5`) e hospedagem (`D6`) seguem em aberto no PDR `03`, mas
> **não bloqueiam** esta etapa (tratadas como configuráveis — doc `25` §7).
