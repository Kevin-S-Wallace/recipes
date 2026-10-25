---
name: add-recipe
description: Add a recipe to the collection from a URL or pasted text, formatted to the house template. Use when the user shares a recipe link, pastes a recipe, or asks to add/save a recipe.
---

# Add a recipe

Turn a link or pasted recipe into `_recipes/<slug>.md` following `templates/recipe.md` exactly.

## Steps

1. **Get the source.**
   - URL: fetch the page. Prefer the schema.org `Recipe` JSON-LD (`<script type="application/ld+json">`) when present; fall back to the page text. Ignore the blog story, ads, and comments.
   - Pasted text or image: use it as-is.
2. **Check for duplicates.** Look in `_recipes/` for the same dish or the same `source`. If one exists, ask before overwriting.
3. **Pick tags.** Run `grep -h '^tags:' _recipes/*.md` and reuse existing tags wherever they fit. Aim for 2–5 lowercase, hyphenated tags covering main ingredient, cuisine, and occasion (e.g. `weeknight`, `make-ahead`, `dessert`). Only invent a new tag when nothing existing fits.
4. **Write the file** at `_recipes/<kebab-case-title>.md`:
   - Frontmatter keys in this order: `title`, `tags`, `source`, `servings`, `time`, `made`.
   - `tags: [a, b]` inline list. `made: []` for a new recipe.
   - `source` is the URL; omit the line for pasted recipes with no source.
   - `time` is total time in a short form like `45 min` or `1 hr 30 min`; omit if unknown.
   - Do not repeat the title as an `# H1` — the layout renders it.
   - `## Ingredients`: one `- ` bullet per ingredient, quantity first (`1 1/2 cups flour, sifted`). Use plain fractions, not unicode glyphs. If the original groups ingredients (e.g. "For the sauce"), use `### Sauce` sub-headings.
   - `## Instructions`: numbered steps, one action-focused step per item, temperatures and times kept inline. Drop filler.
   - **Repeat quantities in the steps.** Every time a step uses an ingredient, state its amount right there ("toss with 2 tablespoons olive oil and 4 teaspoons tamari"), not just "add the oil". The cook should never have to glance back at the ingredient list. If an ingredient is split across steps, give each step its portion. The amounts in the steps must add up to the amount in the ingredient list.
   - **Scaling** (e.g. "double it"): scale both the ingredient list and every inline amount in the steps, and adjust `servings`. Also adjust the equipment if needed (more pans, a bigger pot), and mention the scaling in `## Notes`.
   - **Link sub-recipes.** When an ingredient is itself a recipe in `_recipes/` (a sauce, dough, spice mix), link it by filename in both the ingredient list and the step that uses it: `[teriyaki sauce](teriyaki-sauce.md)`. Add a "Used in [Other Recipe](other-recipe.md)" bullet to the sub-recipe's Notes. These links work on GitHub and on the site.
   - `## Notes`: carry over useful tips from the source (substitutions, storage). Leave the heading empty if none.
5. **Report back** with the file path and the tags chosen. Don't commit unless asked.
