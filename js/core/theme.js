/* ==========================================================================
 * AccessiForge — core/theme.js
 * Theme manager. Priority: explicit choice (persisted) > OS preference >
 * light. Runs as early as possible (a tiny bootstrap also sets the
 * attribute in <head> to avoid a flash of the wrong theme).
 * ========================================================================== */
(function (AF) {
  "use strict";

  var VALUES = ["light", "dark", "contrast"];
  var LABELS = {
    light: "Light",
    dark: "Dark",
    contrast: "High contrast"
  };
  var KEY = "theme";

  function current() {
    var v = document.documentElement.getAttribute("data-theme");
    return VALUES.indexOf(v) > -1 ? v : "light";
  }

  function set(value, options) {
    options = options || {};
    if (VALUES.indexOf(value) === -1) value = "light";
    document.documentElement.setAttribute("data-theme", value);
    if (options.persist !== false) AF.store.set(KEY, value);
    AF.emit("af:theme-change", { theme: value });

    // Keep every theme <select> in sync.
    AF.$$("select[data-theme-select]").forEach(function (sel) {
      sel.value = value;
    });
    return value;
  }

  function detectInitial() {
    var stored = AF.store.get(KEY, null);
    if (stored && VALUES.indexOf(stored) > -1) return stored;
    var prefersDark = false;
    try { prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches; }
    catch (e) { prefersDark = false; }
    return prefersDark ? "dark" : "light";
  }

  function cycle() {
    var next = VALUES[(VALUES.indexOf(current()) + 1) % VALUES.length];
    set(next);
    AF.toast("Theme: " + LABELS[next]);
  }

  AF.theme = {
    VALUES: VALUES,
    LABELS: LABELS,
    current: current,
    set: set,
    cycle: cycle,
    init: function () {
      set(detectInitial(), { persist: false });
      AF.$$("select[data-theme-select]").forEach(function (sel) {
        sel.addEventListener("change", function () {
          set(sel.value);
          AF.toast("Theme: " + LABELS[sel.value]);
        });
      });
    }
  };
})(window.AF = window.AF || {});
