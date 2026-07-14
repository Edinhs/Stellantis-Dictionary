---
name: ui-design-system
description: >-
  Use ao construir ou revisar telas da SPA do Stellantis-Dictionary (login,
  dicionário, chat RAG, comunidade/Q&A, diretório, painel admin, página principal
  com 3D). Aplica quando o trabalho envolve paleta/cores, componentes, tipografia,
  layout responsivo, acessibilidade (a11y) ou estados de UI. Gatilhos: "nova tela",
  "componente", "CSS", "responsivo", "acessibilidade", "cor/paleta", "botão",
  "card", "formulário".
---

# UI / Design System — SPA Stellantis-Dictionary

Fonte da verdade visual: `prototypes/main-3d-explorer.html` (paleta e wordmark já
definidos). Especificação: `docs/02-spec.md` (§3), telas em `docs/11` (§1) e `08`
(§5). Idioma da UI: **português (pt-BR)**.

## Identidade e marca

- **NÃO usar o logotipo oficial da Stellantis** (marca registrada). Usar wordmark
  próprio, como no protótipo. Modelo 3D é placeholder/genérico, sem asset oficial.
- Tom: painel corporativo/automotivo, escuro, "cockpit digital".

## Paleta (tokens CSS já usados no protótipo — reutilizar, não reinventar)

```css
--bg-0:#070B1A; --bg-1:#101A38;              /* fundos */
--blue-deep:#1B2A6B; --blue:#26389F;
--blue-grad-a:#2B3FA6; --blue-grad-b:#4C74FF;
--blue-vivid-a:#3E63FF; --blue-vivid-b:#5B8CFF;
--cyan:#6FA8FF; --cyan-light:#8FD0FF;
--on-dark:#F3F6FF; --on-dark-soft:#AEB9D9;   /* texto sobre escuro */
--hot-red:#ff3b3b; --hot-red-soft:#ff6a6a;   /* hotspot / alerta */
--radius-pill:999px;
--ff-serif: Georgia, "Times New Roman", serif;
--ff-sans: "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
```

- Azul é a cor de ação/identidade; vermelho reservado a hotspots e estados de
  erro/perigo — não usar vermelho como decoração.
- Definir os tokens em `:root` uma única vez; componentes consomem variáveis,
  nunca hex soltos.

## Componentes base (padronizar antes de multiplicar telas)

- **Botão** (primário azul-gradiente / secundário contorno / perigo vermelho),
  com estados hover/focus/disabled/loading visíveis.
- **Campo de formulário** com label associado (`<label for>`), mensagem de erro
  ligada por `aria-describedby`, estado inválido não só por cor.
- **Card** (usado em termos, perguntas do Q&A, pessoas do diretório).
- **Tag/chip** (tags do Q&A; tag que é `term_slug` linka o verbete).
- **Painel lateral / tooltip** (prévia do hotspot 3D, especialistas).
- **Toast/alerta** para feedback de ação (aprovado, rejeitado, erro).

## Acessibilidade (requisito de primeira classe — SPEC 02 §5)

- **Contraste** mínimo WCAG AA (4.5:1 texto normal). Texto sobre escuro usa
  `--on-dark`; `--on-dark-soft` só para texto secundário grande.
- **Foco visível** em todo elemento interativo (nunca `outline:none` sem
  substituto). Ordem de tab lógica; navegação por teclado completa.
- **Semântica**: HTML nativo (`<button>`, `<nav>`, `<main>`, `<h1..h6>` em ordem)
  antes de ARIA. Landmarks e um único `<h1>` por tela.
- **Formulários**: todo input com label; erros anunciados (`aria-live` ou
  `aria-describedby`), não sinalizados só por cor.
- **Imagens/ícones** com `alt`/`aria-label`; ícone puramente decorativo `aria-hidden`.
- **`prefers-reduced-motion`**: desligar animações (drift do fundo, pulsar de
  hotspot) — o protótipo já faz isso; manter.
- Live region para respostas do chat que chegam em streaming.

## Responsividade

- Mobile-first; `clamp()` para espaçamento/tipografia fluida (padrão do protótipo:
  `padding: 0 clamp(18px,4vw,44px)`).
- Conteúdo em coluna única no mobile; painel lateral (especialistas, prévia
  hotspot) vira drawer/acordeão abaixo do conteúdo no mobile.
- `overflow-x: hidden` no body; nada deve estourar horizontalmente.
- O canvas 3D redimensiona ao viewport e cede espaço em telas pequenas.

## Padrões por tela

- **Login/cadastro**: cadastro nunca oferece escolher cargo (é sempre `user`).
- **Dicionário**: verbete inclui bloco "Especialista(s)" e "Perguntas da
  comunidade" quando há `term_slug`; se não houver especialista, o bloco **some**
  (nunca card vazio quebrado — SPEC 08 §5).
- **Chat RAG**: sempre exibir as **fontes citadas** junto da resposta; estado de
  "pensando"/streaming; mensagem clara quando não há contexto suficiente.
- **Comunidade/Q&A**: Markdown renderizado **sanitizado** (anti-XSS); optimistic
  UI em votos confirmada pela API (reverter se falhar); ações escondidas/desabilitadas
  conforme permissão (`can`), não só visualmente.
- **Explorador 3D**: ver skill `3d-cockpit`; sempre com fallback sem WebGL.

## Camadas isoladas (SPEC 08 §0)

- A UI **nunca** lê o banco direto — só a API REST. Dados → API → UI; cada camada
  evolui só. Não embutir regra de autorização na UI como segurança (só como UX);
  a autoridade é o backend (`can`).

## Checklist antes de entregar uma tela

- [ ] Usa tokens de `:root`, sem hex solto; azul=ação, vermelho=hotspot/erro.
- [ ] Contraste AA; foco visível; navegável por teclado.
- [ ] Labels + erros acessíveis nos formulários (não só cor).
- [ ] Responsiva (mobile → desktop) sem overflow horizontal.
- [ ] `prefers-reduced-motion` respeitado.
- [ ] Ações condicionadas a permissão (UX), com backend como autoridade.
- [ ] Markdown/conteúdo do usuário sanitizado.
- [ ] Blocos opcionais somem graciosamente quando sem dados.
- [ ] Entrega revisada por QA Lead (a11y/responsividade).
