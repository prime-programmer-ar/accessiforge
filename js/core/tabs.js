/* ==========================================================================
 * AccessiForge — core/tabs.js
 * Tab controller implementing the WAI-ARIA Tabs pattern:
 *   · one Tab stop per tablist (roving tabindex)
 *   · Left / Right / Home / End move focus & activate (automatic activation)
 *   · aria-selected + aria-controls drive panel visibility
 *   · deep links: activating a tab updates the URL hash without scrolling;
 *     loading the page with #module-hash re-opens that module
 * ========================================================================== */
(function (AF) {
  "use strict";

  var lists = [];

  function tabsOf(list) {
    return AF.$$("[role=tab]", list);
  }

  function activateByElement(tab, options) {
    options = options || {};
    var list = tab.closest("[role=tablist]");
    if (!list) return;
    var activePanel = null;
    tabsOf(list).forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        panel.hidden = !on;
        if (on) activePanel = panel;
      }
    });

    // When the user was scrolled deep inside the previous panel, bring the
    // newly shown panel back into view (below the sticky header).
    if (activePanel && options.scroll !== false && window.pageYOffset > 0) {
      var header = AF.$(".site-header");
      var headerH = header ? header.offsetHeight : 0;
      var target = activePanel.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
      if (target < 0) target = 0;
      if (window.pageYOffset > target) {
        var smooth = false;
        try {
          smooth = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
        } catch (e) { smooth = false; }
        window.scrollTo({ top: target, behavior: smooth ? "smooth" : "auto" });
      }
    }

    if (!options.silent && list.id) {
      AF.emit("af:tab-change", {
        tablist: list.id,
        tabId: tab.id,
        hash: tab.getAttribute("data-hash") || null
      });
    }

    var hash = tab.getAttribute("data-hash");
    if (hash && options.updateHash !== false) {
      try {
        history.replaceState(null, "", "#" + hash);
      } catch (e) { /* file:// or privacy modes — ignore */ }
    }
  }

  function activateByHash(hash, options) {
    var tab = AF.$('[role=tab][data-hash="' + hash + '"]');
    if (tab) { activateByElement(tab, options); return true; }
    return false;
  }

  function activateInList(list, index, options) {
    var tabs = tabsOf(list);
    if (tabs[index]) activateByElement(tabs[index], options);
  }

  function bindList(list) {
    if (lists.indexOf(list) > -1) return;
    lists.push(list);

    tabsOf(list).forEach(function (tab) {
      tab.addEventListener("click", function () {
        activateByElement(tab);
      });
    });

    list.addEventListener("keydown", function (e) {
      var tabs = tabsOf(list);
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var n = -1;
      if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      if (n > -1) {
        e.preventDefault();
        tabs[n].focus();
        activateByElement(tabs[n]);   // automatic activation
      }
    });
  }

  AF.tabs = {
    activateByElement: activateByElement,
    activateByHash: activateByHash,
    activateInList: activateInList,
    listById: function (id) {
      return lists.filter(function (l) { return l.id === id; })[0] || null;
    },
    init: function () {
      AF.$$("[role=tablist]").forEach(bindList);

      // Deep link on load — fall back to the first tab.
      var hash = (location.hash || "").replace("#", "");
      if (hash) {
        if (!activateByHash(hash, { silent: true, scroll: false })) {
          activateInList(lists[0], 0, { silent: true, updateHash: false, scroll: false });
        }
      } else {
        activateInList(lists[0], 0, { silent: true, updateHash: false, scroll: false });
      }

      // After reload, browsers restore the previous scroll position — which
      // can leave the deep-linked panel hidden under the sticky header.
      // Re-align once the load event has settled.
      if (window.pageYOffset === 0 && document.readyState !== "complete") {
        window.addEventListener("load", alignActivePanel);
      } else {
        alignActivePanel();
      }

      // Manual hash edits and saved bookmarks navigate without a reload.
      window.addEventListener("hashchange", function () {
        var h = (location.hash || "").replace("#", "");
        if (h) activateByHash(h);
      });
    }
  };

  function alignActivePanel() {
    var active = AF.$('[role=tabpanel]:not([hidden])');
    if (!active) return;
    var header = AF.$(".site-header");
    var headerH = header ? header.offsetHeight : 0;
    var target = active.getBoundingClientRect().top + window.pageYOffset - headerH - 16;
    if (target < 0) target = 0;
    if (window.pageYOffset > target) window.scrollTo(0, target);
  }
})(window.AF = window.AF || {});
