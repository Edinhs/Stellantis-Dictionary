# Revisão de siglas — tradução PT + categoria sugerida (RASCUNHO)

> Gerado pela Engenharia para **revisão do CEO**. Nada foi publicado.
> Todos os termos permanecem `status=draft` e `category=null` no campo real;
> as sugestões vivem apenas em `metadata.suggested_*`. Decisão item a item é do CEO.

- **Total de siglas:** 682
- **Traduzidas (PT sugerida):** 682 (100%)
- **Confiança:** alta=525, media=149, baixa=8
- **Cabem nas 4 categorias canônicas:** 189
- **NÃO cabem (suggested_category=null):** 493

## Distribuição por categoria sugerida

| categoria | qtd |
|---|---|
| componentes | 120 |
| tecnologia | 63 |
| plataformas | 4 |
| motorizacao | 2 |
| (nao cabe nas 4) | 493 |

## "Buckets" naturais das que NÃO cabem (insumo p/ possível categoria nova)

| bucket sugerido | qtd | descrição |
|---|---|---|
| processos-qualidade | 217 | FMEA, APQP, PPAP, AS IS/TO BE, auditorias, confiabilidade, papéis RASI, benestare |
| organizacao-gestao | 82 | áreas/comitês/cargos (PMO, líderes, engenheiros, R&D, comitês) |
| ti-sistemas | 71 | softwares e sistemas internos (CAD, Teamcenter, BOM/EBOM, portais, configuradores) |
| normas-especificacoes | 53 | normas e termos de spec (ISO, DIN, CISPR, SHALL/SHOULD, especificações técnicas) |
| comercial-mercado | 37 | vendas, pedidos, opcionais, pesquisa de cliente, estoques |
| glossario-generico | 26 | termos genéricos/método (release, milestone, kick-off, protótipo, N/A) |
| geografia | 5 | regiões (LATAM, EMEA, APAC, NAFTA, ROTW) |
| rh | 2 | recursos humanos (HR, FTE) |

Recomendação de Produto/Engenharia: os dois maiores baldes — **processos-qualidade** e
**organizacao-gestao** — sozinhos somam a maioria das siglas. Vale ao CEO decidir se cria
1–2 categorias novas (ex.: "processos-e-qualidade" e "organizacao-e-gestao") antes de publicar em massa.
NÃO alteramos o schema/CHECK agora (apenas migração 0003 permanece: motorizacao/tecnologia/componentes/plataformas).

## Como o CEO revisa/publica

1. Abrir `data/revisao-siglas-pt.csv` (planilha) — colunas: sigla, significado EN, tradução PT, categoria sugerida, cabe na taxonomia?, confiança, nota, bucket.
2. Priorizar as marcadas **confiança=baixa** (8) e **media** (149) — são as que mais pedem olhar humano.
3. Para publicar um termo: editar o card no admin, colar/ajustar a tradução PT no campo `definition` (ou campo PT), definir a `category` real (só entre as 4 até haver decisão de taxonomia) e mudar `status` para publicado.
4. As 493 que "não cabem" ficam à espera da decisão sobre criar categoria nova; até lá, seguem draft sem categoria.

## Termos com confiança BAIXA (revisar primeiro)

| sigla | EN | PT sugerida | nota |
|---|---|---|---|
| ATB | Air Temperature To Boil | Temperatura do Ar para Ebulição | Termo obscuro; significado incerto no contexto. |
| C3 | Cost Regional Capacity Control | Controle Regional de Capacidade de Custo | Sigla obscura; expansão incerta. |
| CRM | L3C (LCCC) | CRM — L3C (LCCC) | Sem definição clara na fonte. |
| DCSD | Tela desassociada da silver box | Tela desassociada da silver box | Termo obscuro; sem expansão clara. |
| DMC | Delta Medium Coast | Delta Medium Coast | Sigla obscura; significado incerto. |
| FCT | Total Order End | Total Order End / Teste Customizado Fiat (software) | Múltiplos significados; expansão incerta. |
| I-PC | Integration PC | PC de Integração (Project Chief de Integração) | Sigla obscura. |
| SDF | específica de diagnóstico | Específica/arquivo de diagnóstico | Termo obscuro; expansão incerta. |

