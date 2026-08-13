## Start here (fresh session)

Don't re-derive project context — it's all on disk:

1. [`README.md`](README.md) — stack, how to run it locally, known gaps
2. [`CONTEXT.md`](CONTEXT.md) — domain glossary (read in full, it's short)
3. [`docs/TASKS.md`](docs/TASKS.md) — what's next; each task names the exact files it touches (a Stitch screen in `docs/stitch-export/`, relevant ADRs). This is the source of truth, not the `TaskList` task tool — that's scoped per Claude Code *session* and goes empty across a `/clear` or a fresh session, even in this same directory. Mirror it into the task tool during a work session if useful, but check off/update `docs/TASKS.md` itself before the session ends.
4. Only read a [`docs/adr/`](docs/adr/) file if the task at hand references it, or something you're about to do looks like it contradicts one

Skip `docs/analise-inicial.md` and `docs/stitch-prompt.md` unless specifically relevant — they're history (the original spreadsheet analysis, and the Stitch generation prompts), not what a screen-building task needs day to day.

@AGENTS.md
