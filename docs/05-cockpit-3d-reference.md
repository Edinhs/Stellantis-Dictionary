# Referência — Explorador 3D do Cockpit

Este documento guia o desenho do Explorador 3D (ver SPEC §3.5). A imagem de
referência interna "Cockpit Introduction" (Smart Cockpit / Digital Cockpit da
Stellantis) é usada **apenas como guia** de quais peças destacar — não é o modelo
3D em si, e não deve ser redistribuída.

## Peças candidatas a hotspot (semente inicial)
Cada peça vira um hotspot no 3D e deve ter um verbete correspondente no dicionário
(campo `slug` entre parênteses — provisório):

| Peça (label) | slug provisório | Tipo | Observação da referência |
|---|---|---|---|
| Head-Up Display (HUD) | `hud` | Digital Cockpit | Projeção de informações no para-brisa |
| Cluster / Painel Digital | `cluster-digital` | Digital Cockpit | Painel de instrumentos do motorista |
| Central Display | `central-display` | Digital Cockpit | Tela central de informação/entretenimento |
| Comandos do Volante | `comandos-volante` | Physical Cockpit | Botões físicos de controle no volante |
| Alto-falantes / Amplificador / Microfones | `audio-sistema` | — | Áudio e captação de voz |
| Espelhamento de Telefone | `phone-mirroring` | — | Android Auto / CarPlay |
| Nuvem (Cloud) | `cloud` | — | Conectividade e serviços online |
| Cockpit (visão geral) | `cockpit` | — | Área de comando do motorista |

> A lista é um ponto de partida. O `admin` poderá adicionar/editar hotspots depois
> (fase posterior). No MVP, isto pode ser um JSON de sementes.

## Conceitos a explicar (glossário do domínio)
- **Digital Cockpit**: sistema de telas/software do veículo (borda vermelha na ref.).
- **Physical Cockpit**: controles físicos (borda roxa na ref.).
- **Smart Cockpit**: camada de experiência de marca sobre o Digital Cockpit.
- As "4 coisas centrais": comunicar, entreter/informar, navegar, controlar o veículo.

## Comportamento esperado (resumo, ver SPEC §3.5)
1. Modelo 3D na página principal, girável com o mouse.
2. Hover/clique no hotspot → nome + prévia curta do verbete.
3. Clique no termo → navega para `/dicionario/{slug}` (explicação completa + RAG).
4. Sem WebGL → imagem estática com áreas clicáveis apontando aos mesmos termos.
