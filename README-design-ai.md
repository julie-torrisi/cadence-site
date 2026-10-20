# How I Use AI — julietorrisi.com/home/design-ai

- `design-ai.src.html`: edit this. `python3 build.py` makes `design-ai.html` (icons inlined) and `design-ai-preview.html` (one file, sample data).
- `PAGE-RULES.md`: every rule for this page, as one prompt. Give it to Claude Code with any change request.
- `jtc-dots.js`: dot-screen background and dot type. `jtc-visuals.js`: live dot charts. `icons.json`: Cadence Kit icons.
- `data/ship-log.json`: the only data file you edit. Public builds with real links only.
- `data/stats.json`: rebuilt every morning by `.github/workflows/ai-output-stats.yml`.

Setup (once): put this folder in the root of julie-torrisi/cadence-site → Settings → Actions → Workflow permissions: Read and write → Settings → Pages: main / root → Actions → Update AI output stats → Run workflow.

Cadence launch: the Cadence repo is private, so when Figma publishes the plugin, set Cadence to "shipped" in data/ship-log.json, add today's date, remove its "stage" line, and add the Figma Community link to its proof.
