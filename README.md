# recipes

My recipe collection, with a cook rotation so I can see what's due.

**Site:** https://kevin-s-wallace.github.io/recipes/ — search, filter by tag, and sort by when I last made something.

## How it works

- Each recipe is a Markdown file in [`_recipes/`](_recipes/) following [`templates/recipe.md`](templates/recipe.md).
- The `made:` list in each recipe's frontmatter holds the dates I cooked it, newest first. The site sorts on that.
- Pushing to `main` rebuilds the GitHub Pages site (deployed from the `main` branch).
- To save a recipe on the go, drop it into [`incoming-recipes/`](incoming-recipes/) on the `incoming` branch: a paste, a link, or a photo. That branch doesn't trigger a rebuild.

## With Claude Code

- `/add-recipe <url, pasted recipe, or photo>` — formats a new recipe, commits it, and opens a PR. Or just send a photo of a recipe card and say "add this". Card photos are saved in [`images/`](images/) and shown on the recipe page.
- Drop a recipe file in [`incoming-recipes/`](incoming-recipes/) and run `/add-recipe` with nothing else to process the whole folder.
- `/log-cook <recipe> [date]` — records that I made something (or just say "I made X last night").

You can also log a cook by editing a recipe's `made:` line in the GitHub web/mobile editor.

## Local preview

```sh
docker run --rm -p 4000:4000 -v "$PWD":/srv/jekyll -w /srv/jekyll ruby:3.3 \
  sh -c 'gem install github-pages webrick && jekyll serve --host 0.0.0.0'
```
