# Stellantis Dictionary & Training Portal — Protótipo (SPA)

Protótipo funcional da SPA **"Stellantis Dictionary & Training Portal"**, construído
originalmente pelo CEO com apoio de outra IA. Este diretório preserva esse código
**exatamente como foi entregue** — apenas organizado, sem alteração de comportamento,
lógica, IDs, classes ou UX. É a referência de paridade 1:1 para a futura reconstrução
em Node.js/TypeScript + PostgreSQL/pgvector.

> Nenhuma regra de negócio foi reescrita aqui. Se algo divergir do protótipo original,
> é bug de organização e deve ser tratado como regressão.

---

## O que é

Uma SPA estática (sem build, sem backend) que roda 100% no navegador. Cobre:

- **Dicionário de termos** técnicos (busca, filtros, CRUD local).
- **Treinamento / cursos**, flashcards e cadernos de anotações.
- **Explorador 3D** do cockpit (Jeep Grand Commander) com hotspots — `car-interactivity.js`.
- **Diretório / hierarquia organizacional**, setores, especialistas, canais.
- **Gamificação** (XP, níveis, badges), ideias/sugestões, projetos e automações.

Todo o estado do usuário é persistido em `localStorage` (ver abaixo). Não há chamadas
a nenhuma API própria — apenas CDNs externas e imagens do Unsplash.

---

## Como servir localmente

A SPA **precisa ser servida por HTTP** (não abra via `file://`), porque o
`car-interactivity.js` carrega o modelo `.glb` por `fetch`/XHR, que é bloqueado pela
política de mesma origem em `file://`.

Opções (escolha uma), a partir deste diretório (`prototypes/portal-spa/`):

```bash
# Node
npx serve .

# Python 3
python3 -m http.server 8000

# VS Code: extensão "Live Server" -> botão "Go Live" com o index.html aberto
```

Depois abra `http://localhost:8000/` (ou a porta indicada) e carregue `index.html`.

> **Requer internet.** As dependências abaixo vêm por CDN; offline, o layout, os ícones,
> as fontes e o 3D não funcionam.

---

## Dependências externas (CDN)

Carregadas no `<head>`/`<body>` do `index.html`:

| Dependência              | Origem                                                        |
|--------------------------|---------------------------------------------------------------|
| Lucide (ícones)          | `unpkg.com/lucide@latest`                                     |
| three.js **r128**        | `cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`   |
| OrbitControls            | `cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/`    |
| GLTFLoader               | `cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/`     |
| Google Fonts             | `Inter`, `Outfit`, `Playfair Display`                          |
| Imagens Unsplash         | vários `images.unsplash.com/...` (avatares/banners padrão)    |

> A versão do three.js está fixada em **r128**. OrbitControls e GLTFLoader precisam
> ser da mesma linha (0.128.0). Não atualize — o código depende dessa API.

---

## Persistência (`localStorage`)

O estado é salvo no navegador sob chaves com prefixo `stellantis_*`. Limpar o
`localStorage` (ou usar aba anônima) restaura os dados padrão (mock inline no `app.js`).
Chaves usadas:

- `stellantis_terms` — termos do dicionário
- `stellantis_notebooks` — cadernos de anotações
- `stellantis_custom_flashcards` — flashcards criados pelo usuário
- `stellantis_user_name`, `stellantis_user_role`, `stellantis_user_sector`
- `stellantis_user_avatar_url`
- `stellantis_user_xp`, `stellantis_user_level`, `stellantis_user_badges`
- `stellantis_hierarchy` — hierarquia organizacional
- `stellantis_ideas` — ideias/sugestões
- `stellantis_kit_items` — itens de kit
- `stellantis_channels` — canais
- `stellantis_specialists` — especialistas
- `stellantis_infotainment` — conteúdo de infotainment
- `stellantis_projects` — projetos
- `stellantis_automations` — automações

> Ao salvar certas configurações, o `car-interactivity.js` executa `location.reload()`
> para reaplicar o estado visual — comportamento intencional do protótipo.

---

## O caminho especial `Carro 3D/`

O modelo 3D fica em `Carro 3D/2021_jeep_grand_commander_k8.glb` (~19 MB). O nome da
pasta contém um espaço; o `car-interactivity.js` carrega a URL **já escapada**:

```js
loader.load('Carro%203D/2021_jeep_grand_commander_k8.glb', ...)
```

**Não renomeie a pasta nem o arquivo.** Se o `.glb` falhar (CORS, offline, WebGL
indisponível), o código aplica um **fallback procedural** e apenas emite um
`console.warn` — a página continua funcionando.

---

## Pendência conhecida: `avatar_2.png`

O arquivo `assets/avatars/avatar_2.png` foi **truncado no upload** (exatamente 524288
bytes / 512 KB) e é um **JPEG incompleto** (sem o marcador de fim de imagem `FF D9`).
Ele é servido normalmente (HTTP 200), mas **não renderiza** — aparecerá quebrado onde
for usado (`index.html` linha 2503).

> **Ação pendente:** reenviar o `avatar_2.png` íntegro. **Não** tente "consertar" o
> binário truncado. (Observação: todos os `avatar_*.png` são, na verdade, JPEG
> renomeados para `.png` — o navegador lê pelo conteúdo, então funciona; mantido como
> no original por paridade.)

---

## Estrutura de arquivos

```
prototypes/portal-spa/
├── index.html                     # SPA (marcação + CDNs + telas)
├── style.css                      # Estilos
├── app.js                         # Monólito: dados mock + toda a lógica
│                                  #   num único addEventListener('DOMContentLoaded')
├── car-interactivity.js           # Explorador 3D (three.js r128) + fallback
├── Carro 3D/
│   └── 2021_jeep_grand_commander_k8.glb   # modelo 3D (~19 MB)
├── assets/
│   ├── avatars/  avatar_1..8.png  # JPEG renomeados; avatar_2 truncado (pendência)
│   └── logos/    <14 marcas>.png  # abarth, alfa-romeo, chrysler, citroen, dodge,
│                                  #   ds, fiat, jeep, lancia, maserati, opel,
│                                  #   peugeot, ram, vauxhall
├── PROTOTIPO-ORIGINAL-README.md          # README original de referência
└── requirements_specification-original.md# requisitos originais de referência
```

### Ordem de carregamento dos scripts (não alterar)

No fim do `index.html`:

1. `app.js`
2. `car-interactivity.js`

Ambos são independentes e se anexam ao evento `DOMContentLoaded`; a ordem reflete o
original e deve ser preservada em qualquer reorganização futura.

---

## Verificação de integridade (07/2026)

Todos os caminhos locais referenciados resolvem (HTTP 200 ao servir estático):
os 14 `assets/logos/*.png`, os 8 `assets/avatars/*.png`, o `.glb` em `Carro 3D/`,
e os scripts `app.js` / `car-interactivity.js` / `style.css`. **Nenhuma referência
quebrada** — exceto o conteúdo truncado do `avatar_2.png` (pendência de reenvio acima).
