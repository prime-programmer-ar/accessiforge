/* ==========================================================================
 * AccessiForge — core/dom.js
 * Tiny DOM helpers shared by every module.
 * ========================================================================== */
(function (AF) {
  "use strict";

  /** querySelector shorthand */
  AF.$ = function (sel, root) {
    return (root || document).querySelector(sel);
  };

  /** querySelectorAll → real Array */
  AF.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /** Escape a string for safe interpolation into innerHTML. */
  AF.esc = function (str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /** Human-friendly name of the focused/active element (for the key log). */
  AF.elementName = function (el) {
    if (!el) return "(nothing)";
    if (el.getAttribute) {
      var label = el.getAttribute("aria-label");
      if (label) return label;
    }
    if (el.labels && el.labels[0]) {
      var t = el.labels[0].textContent.trim();
      if (t) return t;
    }
    var txt = (el.textContent || "").trim();
    return txt.length > 30 ? txt.slice(0, 29) + "…" : (txt || el.tagName.toLowerCase());
  };

  /** Dispatch an app-wide CustomEvent on the document. */
  AF.emit = function (name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  };

  /** Subscribe to an app-wide event. Returns an unsubscribe function. */
  AF.on = function (name, handler) {
    document.addEventListener(name, handler);
    return function () { document.removeEventListener(name, handler); };
  };
})(window.AF = window.AF || {});
