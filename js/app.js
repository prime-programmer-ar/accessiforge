/* ==========================================================================
 * AccessiForge — app.js
 * Bootstrap: initialises shared services, then every module in order.
 * Each module owns its DOM bindings; nothing runs before DOMContentLoaded.
 * ========================================================================== */
(function (AF) {
  "use strict";

  function init() {
    AF.theme.init();
    AF.tabs.init();
    AF.shortcuts.init();

    AF.modules.overview.init();
    AF.modules.keyboardLab.init();
    AF.modules.contrast.init();
    AF.modules.magnify.init();
    AF.modules.workshop.init();
    AF.modules.audit.init();

    // Footer year
    var y = AF.$("#year");
    if (y) y.textContent = String(new Date().getFullYear());

    AF.emit("af:ready", {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window.AF = window.AF || {});
