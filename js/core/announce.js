/* ==========================================================================
 * AccessiForge — core/announce.js
 * Two announcement channels (SC 4.1.3 Status Messages):
 *   AF.announce(msg) — polite screen-reader region + visible toast
 *   AF.toast(msg)    — visible toast that mirrors into the polite region
 * The live region is cleared first so identical consecutive messages are
 * still announced.
 * ========================================================================== */
(function (AF) {
  "use strict";

  var liveRegion = null;
  var toastEl = null;
  var toastTimer = null;
  var TOAST_MS = 3800;

  function ensureLiveRegion() {
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.className = "sr-only";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("role", "status");
      document.body.appendChild(liveRegion);
    }
    return liveRegion;
  }

  function ensureToast() {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    return toastEl;
  }

  /** Announce to screen readers only. */
  AF.announce = function (message) {
    var region = ensureLiveRegion();
    region.textContent = "";
    window.setTimeout(function () { region.textContent = message; }, 60);
  };

  /** Show a visible toast AND announce it politely. */
  AF.toast = function (message) {
    AF.announce(message);
    var el = ensureToast();
    el.textContent = message;
    el.classList.add("show");
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.classList.remove("show");
    }, TOAST_MS);
  };
})(window.AF = window.AF || {});
