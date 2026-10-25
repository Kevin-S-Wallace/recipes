# recipes

My recipe collection, with a cook rotation so I can see what's due.

**Site:** https://kevin-s-wallace.github.io/recipes/ — search, filter by tag, and sort by when I last made something.

## How it works

- Each recipe is a Markdown file in [`_recipes/`](_recipes/) following [`templates/recipe.md`](templates/recipe.md).
- The `made:` list in each recipe's frontmatter holds the dates I cooked it, newest first. The site sorts on that.
- Pushing to `main` rebuilds the GitHub Pages site (`.github/workflows/pages.yml`).

## With Claude Code

- `/add-recipe <url or pasted recipe>` — formats and saves a new recipe.
- `/log-cook <recipe> [date]` — records that I made something (or just say "I made X last night").

You can also log a cook by editing a recipe's `made:` line in the GitHub web/mobile editor.

## Local preview

```sh
docker run --rm -p 4000:4000 -v "$PWD":/srv/jekyll -w /srv/jekyll ruby:3.3 \
  sh -c 'gem install github-pages webrick && jekyll serve --host 0.0.0.0'
```
