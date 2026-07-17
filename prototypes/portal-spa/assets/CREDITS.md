# Créditos e Proveniência de Assets — Protótipo `portal-spa`

> Última atualização: 2026-07-17.
> Criado a pedido da auditoria de conformidade (`docs/27`, lacuna A5) e do parecer de
> Segurança (`docs/24`, recomendação R6 / MÉDIO). Objetivo: registrar **proveniência e
> licença** dos assets usados neste protótipo interno de referência.
>
> **Regra deste documento:** não afirmar licença/autoria que não possa ser comprovada.
> O que não estiver confirmado fica marcado como **"a confirmar"** / **"a validar"** —
> pendência a resolver com o CEO/Jurídico **antes de qualquer publicação externa**.
> Este arquivo é apenas descritivo; não concede nem presume direitos de uso.

---

## 1. Logos de marcas — `assets/logos/`

14 arquivos PNG, uma por marca do grupo Stellantis:

`abarth.png`, `alfa-romeo.png`, `chrysler.png`, `citroen.png`, `dodge.png`, `ds.png`,
`fiat.png`, `jeep.png`, `lancia.png`, `maserati.png`, `opel.png`, `peugeot.png`,
`ram.png`, `vauxhall.png`.

- **Natureza:** marcas nominativas e figurativas **registradas de terceiros**
  (Stellantis N.V. e suas subsidiárias). São propriedade intelectual dos respectivos
  titulares.
- **Uso neste repositório:** exclusivamente em **protótipo interno de referência**
  (carrossel/ticker de marcas na tela Início), a título ilustrativo.
- **Licença:** **não há licença de uso concedida comprovável.** Não é possível afirmar
  autorização de uso das marcas.
- **Restrição:** **publicação/distribuição externa exige aprovação prévia de
  Marca/Jurídico** dos titulares. Enquanto não houver aprovação, manter uso restrito ao
  ambiente interno.
- **Origem dos arquivos de imagem:** **a confirmar** (não há registro da fonte de onde
  os PNGs foram obtidos).

---

## 2. Avatares locais — `assets/avatars/`

8 arquivos: `avatar_1.png` … `avatar_8.png` (estilo claymorphic, 1024×1024).

- **Formato real:** todos são **JPEG** (JFIF) **renomeados com extensão `.png`**
  (confirmado por inspeção binária: `JPEG image data, JFIF standard 1.01 … 1024x1024`).
  A extensão não corresponde ao conteúdo — anotar para a Engenharia.
- **Proveniência/licença:** **NÃO confirmada** — **a confirmar com o CEO.** O protótipo
  original sugeria origem tipo Unsplash, mas **não há comprovação** (sem metadados de
  autor, sem link de origem, sem registro de licença). Não afirmar licença.
- **Pendência `avatar_2.png`:** arquivo com **exatamente 524288 bytes (512 KB)**,
  tamanho "redondo" atípico frente aos demais (≈480–700 KB variados), **indício de
  arquivo truncado**. Verificar integridade/renderização; possivelmente reexportar.

---

## 3. Imagens externas via Unsplash (referenciadas por URL)

Diversas imagens são carregadas **por URL remota** (`images.unsplash.com/...`), não
armazenadas no repositório. Ocorrências em `index.html`, `style.css` e `app.js`, usadas em:

- **Avatares padrão / foto de perfil** (ex.: `photo-1535713875002-...` em
  `index.html` L155/163/1696 e `app.js` L1509).
- **Imagens de componentes de infotainment e cards de projeto** (`app.js` L4494–4539,
  L4632/4678/4725, L5049/5059; `index.html` L1379–1543, L2230, L2408).
- **Imagem de fundo do mapa global** (`style.css` L2744,
  `photo-1614730321146-...`).

- **Licença Unsplash:** a Unsplash License é permissiva (uso gratuito comercial e não
  comercial, sem atribuição obrigatória), **porém** é preciso **confirmar que cada URL
  corresponde de fato a uma foto do acervo Unsplash sob essa licença**, e não a conteúdo
  hotlinkado indevidamente. **Status: a validar** antes de publicação.
- **Recomendação técnica (não altera licença):** hotlink a domínio externo é
  dependência frágil e vaza requisições a terceiros; considerar **baixar e servir
  localmente** os assets aprovados, registrando aqui a origem confirmada.

---

## 4. Modelo 3D — `Carro 3D/2021_jeep_grand_commander_k8.glb`

- **Arquivo:** modelo glTF binário (`.glb`), **~19,3 MB** (19.308.492 bytes),
  representando o Jeep Grand Commander (K8, 2021).
- **Origem/licença:** **a confirmar.** Não há arquivo de licença nem registro de autor
  acompanhando o modelo.
- **Contexto de decisão:** o PDR `03` (decisão D9) previa uso de **placeholder de
  licença livre** para o Explorador 3D. Este modelo é de um veículo específico da marca
  e **não** está comprovado como asset de licença livre.
- **Restrição:** **verificar direitos/licença de uso e redistribuição antes de
  publicar.** Se a origem não for esclarecida ou a licença não permitir, substituir por
  modelo com licença livre comprovada (CC0 / CC-BY com atribuição) conforme D9.

---

## 5. Bibliotecas de terceiros via CDN (licenças conhecidas)

Carregadas por CDN em `index.html`; licenças públicas e verificáveis:

| Biblioteca | Versão | Licença | Origem (CDN) |
|---|---|---|---|
| three.js | r128 | **MIT** | `cdnjs` / `cdn.jsdelivr.net` (three@0.128.0) |
| three.js `OrbitControls` / `GLTFLoader` | 0.128.0 (examples) | **MIT** (mesmo projeto three.js) | `cdn.jsdelivr.net` |
| Lucide (ícones) | `@latest` | **ISC** | `unpkg.com/lucide@latest` |
| Google Fonts — Outfit | — | **SIL Open Font License 1.1** | `fonts.googleapis.com` |
| Google Fonts — Inter | — | **SIL Open Font License 1.1** | `fonts.googleapis.com` |
| Google Fonts — Playfair Display | — | **SIL Open Font License 1.1** | `fonts.googleapis.com` |

Observações:
- Lucide (`@latest`) não fixa versão — recomendável **pin** de versão para
  reprodutibilidade (não afeta a licença ISC).
- OFL permite uso/embutir das fontes; se as fontes forem **auto-hospedadas** no futuro,
  incluir o arquivo `OFL.txt` de cada família.

---

## 6. Pendências consolidadas (para o CEO/Jurídico)

1. **Logos de marca** — obter aprovação de Marca/Jurídico ou remover antes de publicação
   externa; confirmar origem dos PNGs.
2. **Avatares locais** — confirmar proveniência/licença com o CEO; corrigir extensão
   (`.png` que são JPEG); **reexportar `avatar_2.png` (suspeita de truncamento em 512 KB)**.
3. **Imagens Unsplash** — validar que cada URL é acervo Unsplash sob a licença aplicável;
   avaliar auto-hospedagem dos assets aprovados.
4. **Modelo 3D `.glb`** — confirmar licença/direitos; se não comprovável, substituir por
   modelo de licença livre (PDR `03` D9).
5. **CDNs** — fixar versão do Lucide; se auto-hospedar fontes/libs, incluir os textos de
   licença (MIT/ISC/OFL).

> Nenhuma licença ou autoria foi inventada neste documento. Itens marcados "a confirmar"
> / "a validar" permanecem **não comprovados** até decisão registrada do CEO.
