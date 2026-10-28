// "Up next" list, kept in this browser's localStorage as an array of recipe URLs.
window.UpNext = (function () {
  const KEY = "upNext";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const write = (list) => {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
    changed();
  };
  const changed = () => { sync(); document.dispatchEvent(new Event("upnextchange")); };

  const all = () => read();
  const has = (url) => read().includes(url);
  const toggle = (url) => { const l = read(); write(l.includes(url) ? l.filter((u) => u !== url) : l.concat(url)); };
  const clear = () => write([]);

  // Refreshes the header badge and any static "Up next" buttons (e.g. on a recipe page).
  function sync() {
    const n = read().length;
    document.querySelectorAll(".upnext-count").forEach((e) => { e.textContent = n ? n : ""; });
    document.querySelectorAll(".upnext-btn[data-url]").forEach(paint);
  }

  function paint(b) {
    const on = has(b.dataset.url);
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on);
    b.title = on ? "Remove from up next" : "Add to up next";
    if (b.dataset.label !== undefined) b.textContent = on ? "★ Up next" : "☆ Up next";
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest(".upnext-btn[data-url]");
    if (b) { e.preventDefault(); toggle(b.dataset.url); }
  });
  // Keep other open tabs in step.
  window.addEventListener("storage", (e) => { if (e.key === KEY) changed(); });
  document.addEventListener("DOMContentLoaded", sync);

  return { all, has, toggle, clear, sync };
})();
