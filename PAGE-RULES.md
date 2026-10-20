You're editing julietorrisi.com/home/design-ai, Julie Torrisi-Coffey's "How I use AI" page. Follow every rule below. If a request conflicts with a rule, ask before breaking it.

PURPOSE
- Answer the interview question "How do you use AI, and how do you know it's not slop?" Show depth, keep it simple.
- Julie is a principal product designer who works close to engineering. Never call her "Staff." Don't mention Goldman Sans or being an early Figma evangelist.
- This is NOT the Cadence product page (julietorrisi.com/about-jf3b8). Mention Cadence only as a build in the ledger.

VOICE (Reddit tone)
- Plain, short, a little dry. Write like you're explaining it to a smart friend. First person.
- No jargon or hype words (revolutionary, unlock, leverage, delve). Few em dashes.
- Say each thing once. If a point is already on the page, cut it, don't rephrase it.
- Keep the page short. Every section earns its place or goes.

LAYOUT
- One long page that scrolls vertically only. No slides, carousels, horizontal scroll, or snap sections. No footer.
- Black background with a fine dot screen across the whole page (the look of Julie's deck).
- Sentences run full width. No widows: a line never ends with one word by itself.
- Works from 375px phones up. The dot pitch shrinks on smaller screens (5px desktop, 4px tablet, 3px phone).

TYPE (jtc-dots.js)
- All headlines, sentences and kickers are drawn as lit dots on the same grid as the background, using the deck's Doto letter shapes.
- Use `<p class="jtc" data-role="…">`. Roles: hero (name, flips in, scales to fit, can break after a hyphen on phones), h2 (section headline, flips in), lead (white sentence), body (grey sentence), kicker (grey caps, starts with "> ").
- `<em>` turns one word red. Max one red word per headline.
- Small labels, numbers and buttons use the Doto web font.

COLOR (only these)
- Background #0b0c0c · unlit dots #161918 · dim #30353a · grey #9da3a1 · ink #f7f8f8 · signal red #ff5a60.
- Red means one thing: a decision point or what matters most (AI share, shipped, a check). Never decoration.

ICONS
- Use Cadence Kit dot icons only (from cadence/packages/plugin/src/ui/icons.tsx): shield, frame, edit, compose, rocket, clock, check, bell, settings, error, image. No other icon sets.
- Current mapping: standards = shield, system = frame, brief = edit, shipped = rocket, in progress = clock, done = check.
- Workflow steps: spec = edit, load the system = frame, plan = compose, build = settings, check = check, unstick = error, ship and retro = rocket.
- Next-steps milestones each carry their own icon in ship-log.json (`icon` field): define = edit, golden set = frame, test = shield, public repo = compose, ship = rocket. A finished milestone switches to check.

MOTION
- Everything animates once, when scrolled into view, then stays still. Headlines flip like a departures board, sentences type on, charts draw in.
- The hero cursor is the only looping animation.
- Respect reduced motion: show the final state with no animation.

DATA VISUALS (jtc-visuals.js)
- Charts are drawn with the same dots as the background, snapped to the same grid.
- Use the right chart for the job: line (trend over time), donut/pie (share of a whole), bar (comparing counts). Hover or tap shows exact numbers.
- Live data comes only from data/stats.json, rebuilt every morning by a GitHub Action from Julie's public GitHub plus data/ship-log.json. Never hard-code her numbers in the page.
- Current charts: trend (line: commits per week and how many had AI as co-author), share (donut: % of commits with AI), blocks (bars: skills, rules files, prompts, evals in her repos), ledger (builds with proof links), next (milestones).

PROOF
- Only public builds with at least one real https link appear. No private builds, no counts of private work, no "X shipped / Y in progress" totals.
- Julie's only output metric: did it ship, and can someone else click it?
- Never show launch dates or countdowns unless Julie confirms the date. Use the ship log's `stage` field for status in plain words (Cadence today: "Submitting to Figma for plugin review"). Cadence isn't a published plugin yet, so don't call it one.
- The Cadence repo is private, so Cadence is marked shipped by hand in data/ship-log.json once Figma publishes it, with the Figma Community link as proof.

HONESTY
- Never invent a metric, quote, tool, project or date. If something's missing, leave a visible placeholder and ask Julie.
- Every outside claim links to its source. Paraphrase sources; quote no more than a few words.
- Sample data is only for previews and must be labeled as sample.

THE 3-LAYER SYSTEM (keep this the centerpiece)
1. Standards (always on): her standing rules for every session. Check: would I put my name on it?
2. System (per project): the design system written so a model can follow it, plus tests and lessons. Check: does it pass the tests?
3. Brief (per task): a short spec: the problem, the limits, what done looks like. Check: did it ship?
If layers disagree, the brief wins. Hard rules always win. Below the layers sits "My workflow, with the prompts I actually use": 7 steps (Spec it, Load the system, Plan it, Build one step, Check it, Unstick it, Ship it then retro), each collapsed with a copyable prompt.
- Layer 1 is her standing rules, loaded into every session in Claude, Claude Code and Cursor (spec-first, no scope creep). Layer 3 is a short spec: problem, limits, what done means.
- Her retro agent runs after each session and turns what went wrong into new rules. Mention it once, right after the layers.
- Stop rule: 2 or 3 prompts with no progress = stop and fix the spec. Always check the real thing on a real device.
- Her output measures: did it ship, how many rounds it took, and whether it held up in the system. Shipped and clickable comes first.

SECTIONS (in order)
Hero → 01 The setup (3 layers) → 02 The receipts (live charts) → 03 Avoiding slop (METR study + stop rule) → 04 Proof (ledger) → 05 Where this is going (timeline of companies grading AI use) → 06 Next (the grader she's building + contact buttons).

BEFORE YOU CALL IT DONE
- No console errors. No horizontal scroll at 375px. No widows anywhere.
- Every chart animates once and shows accurate hover values.
- Rebuild with `python3 build.py` and check design-ai-preview.html at phone and desktop width.
