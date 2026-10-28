(function () {
  const jsonUrl = document.currentScript.dataset.json;
  const $ = (id) => document.getElementById(id);
  const CHECKED = "groceryChecked";

  let recipes = [];
  const pages = {}; // url -> [{ text, section }]
  const checked = new Set(load());

  function load() { try { return JSON.parse(localStorage.getItem(CHECKED)) || []; } catch (e) { return []; } }
  function save() { try { localStorage.setItem(CHECKED, JSON.stringify([...checked])); } catch (e) {} }

  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    Object.assign(e, attrs);
    e.append(...kids);
    return e;
  }

  // Pulls the list items under the recipe page's "Ingredients" heading, keeping any ### subsection name.
  function ingredients(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const h2 = [...doc.querySelectorAll(".recipe h2")].find((h) => /ingredients/i.test(h.textContent));
    const out = [];
    let section = "";
    for (let n = h2 && h2.nextElementSibling; n && n.tagName !== "H2"; n = n.nextElementSibling) {
      if (n.tagName === "H3") section = n.textContent.trim();
      if (n.tagName === "UL") n.querySelectorAll("li").forEach((li) => out.push({ text: li.textContent.trim(), section }));
    }
    return out;
  }

  // Strips amounts, units, and prep words so "2 garlic cloves, minced" and
  // "1 1/2 tablespoons minced garlic" both come out as "garlic" and land together.
  const UNITS = /\b(cups?|tablespoons?|tbsps?|teaspoons?|tsps?|lbs?|pounds?|oz|ounces?|g|kg|ml|l|liters?|cloves?|cans?|slices?|packets?|packages?|bags?|boxes?|sticks?|sprigs?|pinch(es)?|dash(es)?|bunch(es)?|heads?|quarts?|pints?|rounded|heaping|large|medium|small|of)\b/g;
  const PREP = /\b(minced|chopped|diced|grated|sliced|shredded|finely|freshly|fresh|crumbled|melted|softened|cubed|thick-cut|boneless|skinless|uncooked|unbaked|frozen|low-sodium|full-fat|juice)\b/g;
  function name(text) {
    return text.toLowerCase()
      .replace(/\([^)]*\)/g, " ")
      .split(",")[0]
      .replace(/[\d¼½¾⅓⅔⅛.\/\-–]+/g, " ")
      .replace(UNITS, " ")
      .replace(PREP, " ")
      .replace(/\s+/g, " ").trim() || text.toLowerCase();
  }
  const keyOf = (text) => name(text).replace(/(es|s)$/, "");

  function items() {
    return UpNext.all().flatMap((url) => {
      const r = recipes.find((x) => x.url === url);
      return r && pages[url] ? pages[url].map((i) => ({ ...i, recipe: r.title, key: keyOf(i.text) })) : [];
    });
  }

  function checkbox(key, label, ...detail) {
    const box = el("input", { type: "checkbox", checked: checked.has(key) });
    box.onchange = () => { box.checked ? checked.add(key) : checked.delete(key); save(); render(); };
    return el("li", { className: checked.has(key) ? "done" : "" },
      el("label", {}, box, el("span", {}, el("span", { className: "item", textContent: label }), ...detail)));
  }

  const muted = (text) => el("span", { className: "from", textContent: text });

  function groups(list) {
    const by = new Map();
    list.forEach((i) => { if (!by.has(i.key)) by.set(i.key, []); by.get(i.key).push(i); });
    return [...by.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }

  function renderCombined(list) {
    return el("ul", { className: "grocery" }, ...groups(list).map(([key, g]) => {
      if (g.length === 1) return checkbox(key, g[0].text, muted(g[0].recipe));
      const label = name(g[0].text);
      return checkbox(key, label.charAt(0).toUpperCase() + label.slice(1),
        ...g.map((i) => muted(i.text + " — " + i.recipe)));
    }));
  }

  function renderByRecipe(list) {
    return UpNext.all().map((url) => {
      const mine = list.filter((i) => i.recipe === (recipes.find((r) => r.url === url) || {}).title);
      if (!mine.length) return "";
      return el("section", {},
        el("h2", { textContent: mine[0].recipe }),
        el("ul", { className: "grocery" }, ...mine.map((i) => checkbox(i.key, i.text, i.section ? muted(i.section) : ""))));
    });
  }

  function renderPlanned() {
    const urls = UpNext.all();
    if (!urls.length) {
      $("planned").replaceChildren(el("p", { className: "empty" },
        "Nothing's up next yet. Tap ☆ on a recipe to add it, and its ingredients will show up here."));
      return;
    }
    $("planned").replaceChildren(
      el("h2", { textContent: "Up next" }),
      el("ul", { className: "list" }, ...urls.map((url) => {
        const r = recipes.find((x) => x.url === url);
        if (!r) return "";
        const b = el("button", { type: "button", className: "upnext-btn on", textContent: "★", title: "Remove from up next" });
        b.dataset.url = url;
        return el("li", { className: "next" }, el("span", { className: "head" }, b, el("a", { href: url, className: "title", textContent: r.title })));
      })),
      el("button", { type: "button", className: "quiet", id: "clearnext", textContent: "Clear up next",
        onclick: () => { if (confirm("Remove every recipe from up next?")) UpNext.clear(); } }));
  }

  function render() {
    renderPlanned();
    const list = items();
    $("tools").hidden = !list.length;
    if (!list.length) { $("groceries").replaceChildren(); return; }
    const left = groups(list).filter(([k]) => !checked.has(k)).length;
    $("groceries").replaceChildren(
      el("p", { className: "count", textContent: left + " of " + groups(list).length + " items left" }),
      ...[].concat($("view").value === "recipe" ? renderByRecipe(list) : renderCombined(list)));
  }

  // Fetches ingredient lists for any up-next recipes we haven't loaded yet.
  function refresh() {
    const missing = UpNext.all().filter((u) => !pages[u] && recipes.some((r) => r.url === u));
    render();
    Promise.all(missing.map((u) => fetch(u).then((r) => r.text()).then((h) => { pages[u] = ingredients(h); })))
      .then(render);
  }

  $("view").onchange = () => { try { localStorage.setItem("groceryView", $("view").value); } catch (e) {} render(); };
  try { $("view").value = localStorage.getItem("groceryView") || "combined"; } catch (e) {}

  $("uncheck").onclick = () => { checked.clear(); save(); render(); };

  $("copy").onclick = () => {
    const text = groups(items()).filter(([k]) => !checked.has(k))
      .map(([, g]) => "- " + g.map((i) => i.text).join("; ")).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      $("copy").textContent = "Copied";
      setTimeout(() => { $("copy").textContent = "Copy list"; }, 1500);
    });
  };

  document.addEventListener("upnextchange", refresh);

  fetch(jsonUrl).then((r) => r.json()).then((data) => { recipes = data; refresh(); });
})();
