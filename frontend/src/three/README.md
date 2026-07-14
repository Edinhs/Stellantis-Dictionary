# three — Explorador 3D do cockpit

Render glTF/`.glb`, orbit controls, hotspots ligados a `term_slug`, tooltip
(nome + prévia), clique → navega para `/dicionario/{slug}`. Ref.: SPEC `02` §3.5
e doc `05-cockpit-3d-reference.md`.

- `viewer/` — render do modelo e controles de câmera.
- `hotspots/` — pontos âncorados no modelo, cada um referenciando um `term_slug`
  (fonte única da verdade; nunca duplica texto do dicionário).
- `fallback/` — sem WebGL: imagem estática com áreas clicáveis (image-map)
  apontando aos mesmos termos.

O asset `.glb` é estático e não embarca dado confidencial.
