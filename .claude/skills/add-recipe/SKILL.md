---
name: add-recipe
description: Add a recipe to the collection from a URL, pasted text, or a photo of a recipe card, formatted to the house template, then commit, push, and open a PR. Use when the user shares a recipe link, pastes a recipe, sends a photo of a recipe, drops something in incoming-recipes/, or asks to add/save a recipe.
---

# Add a recipe

Turn a link, pasted recipe, or recipe-card photo into `_recipes/<slug>.md` following `templates/recipe.md` exactly, then ship it as a PR.

## Steps

1. **Get the source.**
   - URL: fetch the page. Prefer the schema.org `Recipe` JSON-LD (`<script type="application/ld+json">`) when present; fall back to the page text. Ignore the blog story, ads, and comments. If the fetch is blocked (a 403, or a page with no actual recipe in it), see **Blocked links** below.
   - Pasted text: use it as-is.
   - Photo of a handwritten or printed card: transcribe it carefully, including crossed-out words and margin notes. See **Recipe cards** below.
   - Nothing attached? Check `incoming-recipes/` for files other than `readme.md` and process each one. Delete the incoming file in the same commit once its recipe is written.
2. **Check for duplicates.** Look in `_recipes/` for the same dish or the same `source`. If one exists, ask before overwriting.
3. **Pick tags** from the fixed vocabulary below. Tags exist to filter the list, so a tag that would only ever match one recipe doesn't earn a spot. Dish words like `cake`, `pasta`, or `teriyaki` belong in the title, where search already finds them.
   - **Course** (always exactly one): `main`, `side`, `dessert`, `breakfast`, `sauce`
   - **Protein** (savory dishes, when one defines the dish): `beef`, `chicken`, `pork` (sausage counts), `fish`, `vegetarian` (no meat, fish, or meat broth)
   - **Method** (any that apply): `one-pot` (a single pot or skillet), `sheet-pan`, `casserole` (baked in a dish), `slow-cooker`, `pressure-cooker`, `grill`
   - **Occasion** (any that apply): `weeknight` (about 45 min or less, hands-on), `make-ahead`
   - **Cuisine** (only when it's a reason to pick the dish): reuse an existing one (`grep -h '^tags:' _recipes/*.md`), e.g. `indian`, `tex-mex`, `french`

   Do not invent a tag outside this list on your own. If nothing fits and a new one seems worth it, ask the user first and, if they agree, add it to this list in the same PR.
4. **Write the file** at `_recipes/<kebab-case-title>.md`:
   - Frontmatter keys in this order: `title`, `tags`, `source`, `servings`, `time`, `made`.
   - `tags: [a, b]` inline list. `made: []` for a new recipe.
   - `source` is the URL; omit the line for pasted recipes and recipe cards.
   - `time` is total time in a short form like `45 min` or `1 hr 30 min`; omit if unknown.
   - Do not repeat the title as an `# H1` — the layout renders it.
   - `## Ingredients`: one `- ` bullet per ingredient, quantity first (`1 1/2 cups flour, sifted`). Use plain fractions, not unicode glyphs. If the original groups ingredients (e.g. "For the sauce"), use `### Sauce` sub-headings.
   - `## Instructions`: numbered steps, one action-focused step per item, temperatures and times kept inline. Drop filler.
   - **Repeat quantities in the steps.** Every time a step uses an ingredient, state its amount right there ("toss with 2 tablespoons olive oil and 4 teaspoons tamari"), not just "add the oil". The cook should never have to glance back at the ingredient list. If an ingredient is split across steps, give each step its portion. The amounts in the steps must add up to the amount in the ingredient list.
   - **Scaling** (e.g. "double it"): scale both the ingredient list and every inline amount in the steps, and adjust `servings`. Also adjust the equipment if needed (more pans, a bigger pot), and mention the scaling in `## Notes`.
   - **Link sub-recipes.** When an ingredient is itself a recipe in `_recipes/` (a sauce, dough, spice mix), link it by filename in both the ingredient list and the step that uses it: `[teriyaki sauce](teriyaki-sauce.md)`. Add a "Used in [Other Recipe](other-recipe.md)" bullet to the sub-recipe's Notes. These links work on GitHub and on the site.
   - `## Notes`: carry over useful tips from the source (substitutions, storage). Leave the heading empty if none.
5. **Ship it.** Without waiting to be asked:
   - Start from the latest `main` (`git fetch origin main` and branch from `origin/main`) unless a session branch is designated; if that branch's earlier PR is already merged, reset it onto `origin/main` first.
   - Commit the recipe (plus any card image and removed incoming file) with a message like `Add <title> recipe`, push, and open a PR into `main`.
   - In the PR body list the tags (call out new ones) and every open question from the card.
   - If the push or PR is refused for lack of GitHub access, say so in one line and point the user to https://claude.ai/connect-github; the commit stays local until access is fixed.
6. **Report back** with the PR link, the tags chosen, and any open questions, so the user can answer them in one reply.

## Blocked links

Some sites refuse automated fetches. Treat the link as blocked when the fetch returns 403, or when it comes back OK but has no recipe in it: no `Recipe` JSON-LD and no ingredient list, just a "verify you are human" / "enable JavaScript" / access-denied page. Don't retry with tricks and don't rebuild the recipe from memory or search results. Open a GitHub issue so the recipe isn't forgotten:

- First search open issues for the same URL; if one exists, point the user to it instead of opening a duplicate.
- Title: `Need recipe text: <site or recipe name>`.
- Body: the link, what happened (403, or the page loaded without the recipe), and the ask: open the recipe's print page, select all, copy, and paste it as a comment on the issue, in the chat, or as a file in `incoming-recipes/`. Everything on the print page is fine; the skill strips what isn't needed.
- Write no recipe file and open no PR for it. Reply with the issue link in one line. Once the text arrives, carry on from step 2 with `source` set to the original URL (not the print page URL), and close the issue from the PR (`Closes #<n>`).

## Recipe cards

Family cards are keepsakes as much as instructions.

- **Credit the cook.** First Notes bullet: `From the kitchen of <name as written on the card>.`
- **Keep the original.** Save the photo to `images/<slug>.jpg`: rotate upright, crop to the card, shrink to about 1200px wide, save as JPEG quality ~85, and strip EXIF (phone photos carry GPS location). With Pillow: `ImageOps.exif_transpose`, `crop`, `thumbnail((1200, 1200))`, then `save` without passing `exif`. End `## Notes` with `![<Name>'s handwritten recipe card](../images/<slug>.jpg)` as its own paragraph after the bullets. That relative path works on GitHub and on the site.
- **Translate old shorthand.** Fill in standard sizes when the card assumes them ("1 can" soup → `1 can (10.5 oz)`, "small carton" sour cream → `8 oz`), and explain discontinued or regional brands in Notes (Post Toasties → corn flakes, oleo → margarine).
- **Keep the card's corrections.** If a word is crossed out and replaced, use the replacement and mention the change in Notes.
- **Flag, don't guess.** If something is unclear or doesn't add up (an arrow to a stray amount, a smudged number), use the most likely reading, explain it in Notes, and list it as an open question in the PR and the reply.
- Omit `servings` and `time` only if you can't reasonably estimate them; a bake time on the card plus prep is enough to estimate `time`.
