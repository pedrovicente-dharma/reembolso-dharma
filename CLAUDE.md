# CLAUDE.md — Dharma interno

> Gerado por `dharma-repo-bootstrap`. Contexto para agentes de IA (Claude Code / Cursor) que
> trabalham neste repositório. Revise os stubs `<!-- preencher -->` antes do merge.

## O que é este projeto

- **Cliente / produto:** Dharma interno
- **Sponsor interno:** Pedro
- **Stage:** descoberta
- **Perfil de stack:** nextjs-node (detectado por `diagnose.sh` — evidência: package.json;tsconfig.json)

<!-- preencher: 1-2 frases sobre o que o sistema faz e para quem -->

## Constituição

Este repo segue a **constituição Dharma** (`dharma-standards`): error handling explícito,
cobertura mínima, convenções de PR e SDD. Em conflito entre regra local e a constituição, a
constituição vence — divergências precisam de ADR.

- Erros são **expostos, nunca escondidos** — ver `dharma-standards/references/error-handling.md`.
- Desenvolvimento não-trivial passa por **SDD** (`dharma-sdd`); o contexto de código vive em
  `.specs/codebase/` e o de negócio em `.specs/project/`.

## Stack e comandos

Ver `.specs/codebase/STACK.md` para a stack detalhada.

<!-- preencher: comandos de build/test/lint/run específicos deste repo -->

## Dados sensíveis / compliance

Sem dados sensíveis ou requisitos de compliance identificados.
<!-- preencher: confirmar políticas de dados de cliente, segredos, LGPD se aplicável -->

## Idioma

Prosa em PT-BR; nomes de skills/arquivos/termos técnicos em inglês.
