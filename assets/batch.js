// Switches a recipe page between batch sizes written out in its Markdown
// (<div class="batch" data-batch="Double">…</div>). Nothing is calculated;
// it just shows the matching block. The choice is remembered per recipe so
// the grocery list uses the same batch.
window.Batch = (function () {
  const key = (url) => "batch:" + url;
  const get = (url) => { try { return localStorage.getItem(key(url)); } catch (e) { return null; } };
  const set = (url, name) => { try { localStorage.setItem(key(url), name); } catch (e) {} };

  function init() {
    const buttons = [...document.querySelectorAll(".batch-switch button[data-batch]")];
    if (!buttons.length) return;
    const url = location.pathname;
    const names = buttons.map((b) => b.dataset.batch);
    const show = (name) => {
      if (!names.includes(name)) name = names[0];
      buttons.forEach((b) => { b.classList.toggle("on", b.dataset.batch === name); b.setAttribute("aria-pressed", b.dataset.batch === name); });
      document.querySelectorAll(".batch[data-batch], .batch-servings[data-batch]")
        .forEach((e) => { e.hidden = e.dataset.batch !== name; });
    };
    buttons.forEach((b) => { b.onclick = () => { set(url, b.dataset.batch); show(b.dataset.batch); }; });
    show(get(url));
  }

  document.addEventListener("DOMContentLoaded", init);
  return { get };
})();
