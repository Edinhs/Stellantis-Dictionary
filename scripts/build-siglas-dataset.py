#!/usr/bin/env python3
"""Gera o artefato de dados REAIS `data/siglas-lista-geral-2.json` a partir do
Excel enviado pelo CEO (primeira leva de conteudo real: sigla + significado em
ingles).

NAO confundir com `seeds/*.json` (exemplos ficticios). Este e um artefato de
carga OPERACIONAL, versionado apenas como insumo do loader idempotente
`scripts/import-siglas.ts` — nunca aplicado automaticamente em producao.

Limpeza determinística (documentada no README de `data/`):
  - Normaliza espacos e non-breaking spaces (\xa0); faz trim.
  - DESCARTA linhas-lixo: sigla sem nenhum caractere alfanumerico (ex.: `[`),
    ou significado vazio (ex.: `NLC`).
  - DEDUPLICA por sigla (case-insensitive): mantem UMA entrada e ACUMULA os
    significados distintos em `metadata.source_meanings` (ordem de aparicao).
    A `definition` primaria e o PRIMEIRO significado distinto.
  - slug determinístico e unico; colisoes recebem sufixo -2, -3... na ordem de
    aparicao.

Uso:  python3 scripts/build-siglas-dataset.py <caminho-do-xlsx>
Saida: data/siglas-lista-geral-2.json  (+ estatisticas no stderr)
"""
import json
import re
import sys
import unicodedata
from collections import OrderedDict
from pathlib import Path

SOURCE_BATCH = "siglas-lista-geral-2"
OUT = Path(__file__).resolve().parent.parent / "data" / "siglas-lista-geral-2.json"


def clean(v):
    if v is None:
        return ""
    s = str(v).replace("\xa0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def slugify(text):
    norm = unicodedata.normalize("NFKD", text)
    ascii_txt = norm.encode("ascii", "ignore").decode("ascii").lower()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_txt).strip("-")
    return slug


def main():
    if len(sys.argv) < 2:
        print("uso: build-siglas-dataset.py <xlsx>", file=sys.stderr)
        sys.exit(2)
    import openpyxl  # noqa: local import so the script self-documents the dep

    wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
    ws = wb["Plan1"]
    rows = list(ws.iter_rows(min_row=2, values_only=True))  # min_row=2 pula cabecalho

    total = 0
    discarded = []  # (motivo, sigla, def)
    groups = OrderedDict()  # key -> {display, meanings:[]}

    for r in rows:
        total += 1
        sigla = clean(r[1])
        definition = clean(r[2])
        # lixo: sigla sem alfanumerico (ex.: '[')
        if not re.search(r"[A-Za-z0-9]", sigla):
            discarded.append(("sigla-sem-alfanumerico", sigla, definition))
            continue
        # lixo: sem significado (ex.: 'NLC')
        if not definition:
            discarded.append(("significado-vazio", sigla, definition))
            continue
        key = sigla.lower()
        if key not in groups:
            groups[key] = {"display": sigla, "meanings": []}
        # acumula significados distintos (case-insensitive), preservando ordem
        if definition.lower() not in {m.lower() for m in groups[key]["meanings"]}:
            groups[key]["meanings"].append(definition)

    # monta entradas + slug unico
    entries = []
    used_slugs = {}
    for g in groups.values():
        base = slugify(g["display"]) or "sigla"
        slug = base
        n = used_slugs.get(base, 0)
        if n:
            slug = f"{base}-{n + 1}"
        used_slugs[base] = n + 1
        meanings = g["meanings"]
        entries.append(
            OrderedDict(
                [
                    ("slug", slug),
                    ("term", g["display"]),
                    ("definition", meanings[0]),
                    ("category", None),  # a classificar — trabalho manual do CEO
                    ("synonyms", []),
                    ("source_type", "manual"),
                    ("status", "draft"),
                    (
                        "metadata",
                        OrderedDict(
                            [
                                ("pending_translation", True),
                                ("pending_category", True),
                                ("lang_definition", "en"),
                                ("source_batch", SOURCE_BATCH),
                                ("has_multiple_meanings", len(meanings) > 1),
                                ("source_meanings", meanings),
                            ]
                        ),
                    ),
                ]
            )
        )

    payload = OrderedDict(
        [
            (
                "_comment",
                "DADOS REAIS do dicionario (1a leva, CEO 2026-07-23). NAO e seed de "
                "exemplo. Gerado por scripts/build-siglas-dataset.py a partir de "
                "Lista_Geral_de_Siglas_2.xlsx. definition em INGLES (provisorio: o CEO "
                "traduz para PT e classifica a categoria manualmente, editando cada "
                "card). Carregado por scripts/import-siglas.ts (idempotente, com guard "
                "de NODE_ENV=production). Ver data/README.md.",
            ),
            ("source_batch", SOURCE_BATCH),
            ("source_file", "Lista_Geral_de_Siglas_2.xlsx"),
            ("generated_from_rows", total),
            ("imported", len(entries)),
            ("discarded", len(discarded)),
            ("terms", entries),
        ]
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"linhas de dados         : {total}", file=sys.stderr)
    print(f"siglas unicas importadas: {len(entries)}", file=sys.stderr)
    print(f"descartadas             : {len(discarded)}", file=sys.stderr)
    for motivo, sig, _ in discarded:
        print(f"   - [{motivo}] sigla={sig!r}", file=sys.stderr)
    dup = sum(1 for g in groups.values() if len(g["meanings"]) > 1)
    print(f"siglas com multiplos significados (acumulados): {dup}", file=sys.stderr)
    print(f"artefato: {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
