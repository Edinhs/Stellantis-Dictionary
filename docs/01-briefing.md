# Briefing — Stellantis Dictionary (Agente de IA Introdutório)

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

## 3. Proposta de valor
- **Uso pessoal, mas multiusuário**: cada colaborador tem sua conta, seu histórico
  de conversas e (futuramente) permissões diferenciadas.
- **Chatbot com RAG**: em vez de um FAQ estático, o usuário conversa em linguagem
  natural e recebe respostas fundamentadas no dicionário/base de conhecimento.
- **Dicionário vivo**: começa com cadastro manual de termos e evolui para ingestão
  de documentos reais do setor (PDFs, planilhas, manuais internos).
- **Segurança em primeiro lugar**: por lidar com informação potencialmente
  confidencial de um ambiente empresarial, autenticação, autorização e proteção de
  dados são requisitos de primeira classe, não um adendo.

## 4. Usuários-alvo
- Colaboradores do setor (usuários finais) — consultam o dicionário e o chatbot.
- Administrador(es) do dicionário — cadastram/curam termos, revisam documentos
  ingeridos, gerenciam usuários e permissões.

## 5. Escopo da v1 (MVP) vs. Visão futura
**MVP (fase 1):**
- Cadastro/login de usuários (multiusuário completo, com papéis).
- CRUD de termos/siglas do dicionário (cadastro manual).
- Chatbot com RAG consultando o dicionário cadastrado manualmente.
- Interface web simples e responsiva.

**Visão futura (fases seguintes):**
- Ingestão de documentos (PDF/DOCX/planilhas) para alimentar o RAG automaticamente.
- Base de conhecimento de fluxos de trabalho (não só termos, mas processos passo a
  passo).
- Auditoria/logs de uso, métricas de perguntas mais feitas (identificar lacunas de
  conhecimento).
- Controle de acesso mais granular (ex.: termos confidenciais visíveis só para
  certos papéis).

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
