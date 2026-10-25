---
name: process-incoming
description: Format the raw recipes dropped in incoming-recipes/ on the `incoming` branch and move them into _recipes/ on main. Use when the user says to process, sort, or check incoming recipes, or asks what's in the inbox.
---

# Process incoming recipes

Kevin drops raw recipes into `incoming-recipes/` on the `incoming` branch (from his phone or the GitHub web editor), so `main` and the Pages site don't rebuild for every drop. This skill turns them into finished recipes on `main`.

## 1. Sync

1. Run `git status`. If there are uncommitted changes, stop and ask what to do with them.
2. `git fetch origin`, `git switch main`, `git pull --ff-only`.
3. `git merge --no-edit origin/incoming` to bring the new files onto `main`. If it conflicts, stop and show the conflict.

## 2. Find the work

List everything in `incoming-recipes/` except `readme.md`. Any of these can show up:
- a Markdown or text file with a pasted recipe, often messy (`> >` quoting, star ratings, ads, affiliate links)
- a file that's just a URL, or a pasted recipe with its URL at the top or bottom
- a photo or screenshot of a recipe (read the image)
- one file holding several recipes, separated by headings or rules

If the folder is empty, say so and stop.

## 3. Format each recipe

Follow `.claude/skills/add-recipe/SKILL.md` for every recipe: check for duplicates, reuse tags, use the house template, put amounts in every step, and link sub-recipes.
- Pasted text is the source of truth. Only fetch a URL when the file has nothing but the link, or when the pasted text is clearly cut off.
- Many recipe sites block automated fetches. If a fetch fails and there's no pasted text, leave that file in `incoming-recipes/`, and in the summary ask Kevin to paste the recipe or save the page's print view.
- Don't guess at missing amounts or steps. Write the recipe with what's there and list each gap in the summary.

Delete each incoming file once its recipe or recipes are written to `_recipes/`. Leave `readme.md` in place.

## 4. Commit, review, and push

1. Commit on `main` with a message listing the recipes added, e.g. `Add recipes: Garlic Butter Rice, Naan Bread`.
2. Summarize for Kevin: each new file with its tags, anything guessed or missing, and any files left in the inbox and why.
3. Ask before pushing. Once he says yes:
   - `git push origin main`
   - `git push origin main:incoming`, which fast-forwards `incoming` so it starts clean next time. If git rejects it because `incoming` got new commits since the fetch, don't force it. Tell Kevin there's new stuff in the inbox and offer to run this again.
