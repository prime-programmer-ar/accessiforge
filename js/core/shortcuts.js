/* ==========================================================================
 * AccessiForge — core/shortcuts.js
 * Global keyboard shortcuts. All shortcuts are documented in the help
 * dialog (?) and are ignored while the user is typing in a field.
 *
 *   Alt+1 … Alt+5   jump straight to a module
 *   Alt+T           cycle theme (light → dark → high contrast)
 *   ?               open shortcut help (Esc closes)
 * ========================================================================== */
(function (AF) {
  "use strict";

  function isTyping(el) {
    if (!el) return false;
    var tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" ||
           el.isContentEditable === true;
  }

  function openHelp() {
    var dlg = AF.$("#helpDialog");
    if (dlg && typeof dlg.showModal === "function") dlg.showModal();
  }

  AF.shortcuts = {
    openHelp: openHelp,
    init: function () {
      var helpBtn = AF.$("#helpBtn");
      if (helpBtn) helpBtn.addEventListener("click", openHelp);
      var closeBtn = AF.$("#helpCloseBtn");
      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          var dlg = AF.$("#helpDialog");
          if (dlg) dlg.close();
        });
      }

      document.addEventListener("keydown", function (e) {
        var mainList = AF.tabs.listById("mainTabs");

        // Alt+1..5 → module shortcuts
        if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey &&
            mainList && e.key >= "1" && e.key <= "5") {
          e.preventDefault();
          AF.tabs.activateInList(mainList, Number(e.key) - 1);
          return;
        }

        // Alt+T → cycle theme
        if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey &&
            (e.key === "t" || e.key === "T")) {
          e.preventDefault();
          AF.theme.cycle();
          return;
        }

        // "?" → help dialog (never while typing)
        if (e.key === "?" && !e.altKey && !e.ctrlKey && !e.metaKey) {
          if (isTyping(e.target)) return;
          e.preventDefault();
          openHelp();
        }
      });
    }
  };
})(window.AF = window.AF || {});
