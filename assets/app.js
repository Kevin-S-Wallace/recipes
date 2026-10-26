(function () {
  const jsonUrl = document.currentScript.dataset.json;
  const $ = (id) => document.getElementById(id);
  const DAY = 86400000;
  const today = new Date(new Date().toDateString());

  let recipes = [];
  const state = { q: "", sort: "due", tags: new Set(), hideNever: false };

  // Dates are YYYY-MM-DD; parse as local midnight so "days ago" is calendar days.
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const lastMade = (r) => (r.made.length ? parse(r.made[0]) : null);

  function readHash() {
    const p = new URLSearchParams(location.hash.slice(1));
    state.q = p.get("q") || "";
    state.sort = p.get("sort") || "due";
    state.tags = new Set((p.get("tags") || "").split(",").filter(Boolean));
    state.hideNever = p.get("made") === "1";
  }

  function writeHash() {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.sort !== "due") p.set("sort", state.sort);
    if (state.tags.size) p.set("tags", [...state.tags].join(","));
    if (state.hideNever) p.set("made", "1");
    history.replaceState(null, "", p.toString() ? "#" + p : location.pathname);
  }

  function filtered() {
    const q = state.q.toLowerCase();
    const out = recipes.filter((r) =>
      (!state.hideNever || r.made.length) &&
      [...state.tags].every((t) => r.tags.includes(t)) &&
      (!q || r.title.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q)))
    );
    const ts = (r) => { const d = lastMade(r); return d ? d.getTime() : -Infinity; };
    if (state.sort === "due") out.sort((a, b) => ts(a) - ts(b) || a.title.localeCompare(b.title));
    else if (state.sort === "recent") out.sort((a, b) => ts(b) - ts(a) || a.title.localeCompare(b.title));
    else out.sort((a, b) => a.title.localeCompare(b.title));
    return out;
  }

  function ago(r) {
    const d = lastMade(r);
    if (!d) return "Never made";
    const n = Math.round((today - d) / DAY);
    const when = n <= 0 ? "today" : n === 1 ? "yesterday" : n + " days ago";
    return "Made " + when + " · " + r.made.length + "×";
  }

  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    Object.assign(e, attrs);
    e.append(...kids);
    return e;
  }

  function renderTags() {
    const all = [...new Set(recipes.flatMap((r) => r.tags))].sort();
    $("tags").replaceChildren(...all.map((t) => {
      const b = el("button", { type: "button", className: "tag" + (state.tags.has(t) ? " on" : ""), textContent: t });
      b.onclick = () => { state.tags.has(t) ? state.tags.delete(t) : state.tags.add(t); update(); };
      return b;
    }));
  }

  function render() {
    const list = filtered();
    $("count").textContent = list.length + " of " + recipes.length + " recipes";
    $("list").replaceChildren(...list.map((r) =>
      el("li", {},
        el("a", { href: r.url, className: "title", textContent: r.title }),
        el("span", { className: "when" + (r.made.length ? "" : " never"), textContent: ago(r) }),
        el("span", { className: "rtags", textContent: r.tags.join(" · ") + (r.time ? (r.tags.length ? " · " : "") + r.time : "") })
      )
    ));
  }

  function update() { writeHash(); renderTags(); render(); }

  $("search").oninput = (e) => { state.q = e.target.value; update(); };
  $("sort").onchange = (e) => { state.sort = e.target.value; update(); };
  $("hidenever").onchange = (e) => { state.hideNever = e.target.checked; update(); };
  // Random pick from the least-recently-made third of whatever is currently filtered.
  $("surprise").onclick = () => {
    const pool = filtered();
    if (state.sort !== "due") pool.sort((a, b) => (lastMade(a) || 0) - (lastMade(b) || 0));
    const top = pool.slice(0, Math.max(1, Math.ceil(pool.length / 3)));
    if (top.length) location.href = top[Math.floor(Math.random() * top.length)].url;
  };
  window.addEventListener("hashchange", () => { readHash(); syncInputs(); renderTags(); render(); });

  function syncInputs() { $("search").value = state.q; $("sort").value = state.sort; $("hidenever").checked = state.hideNever; }

  fetch(jsonUrl).then((r) => r.json()).then((data) => {
    recipes = data;
    readHash(); syncInputs(); renderTags(); render();
  });
})();
