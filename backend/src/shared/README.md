# shared — Contratos e tipos comuns

Somente **tipos e contratos**, sem dependência de infra (não importa `core` nem
`modules`). Backend e frontend referenciam os mesmos contratos para o contrato
de API não divergir. Ver `docs/13-arquitetura-modular.md` §4.2.

`contracts/` — ex.: `Permission` (união de strings nomeadas como
`dictionary.approve`, `qa.moderate`), shape de `Contribution` e
`ContentRevision` (com `target_type` polimórfico), envelope padrão de resposta.
