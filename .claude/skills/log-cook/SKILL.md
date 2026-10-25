---
name: log-cook
description: Record that a recipe was cooked on a given date so the rotation stays current. Use when the user says they made, cooked, or had a recipe ("I made the tikka masala last night").
---

# Log a cook

1. **Find the recipe.** Match the user's description against `title:` lines in `_recipes/*.md` (case-insensitive, partial words OK). If several match, or none, list the candidates and ask.
2. **Resolve the date** in `YYYY-MM-DD`. Default to today; interpret "yesterday", "Sunday", "last Friday" relative to today's date. Never use a future date.
3. **Update `made:`** in the frontmatter: insert the date at the front so the list stays newest-first (`made: [2026-10-24, 2026-09-01]`). If the date is already present, say so and don't duplicate it. Keep the list sorted newest-first if the date is older than existing entries.
4. **Notes (optional).** If the user mentions how it went or a tweak ("needed more salt", "doubled the garlic"), append a dated bullet under `## Notes`: `- 2026-10-24: doubled the garlic, good call.`
5. Report the recipe, date, and new times-made count. Don't commit unless asked.
