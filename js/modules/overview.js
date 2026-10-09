/* ==========================================================================
 * AccessiForge — modules/overview.js
 * Module 0 — Progress dashboard: live stats across the lab, a quick-start
 * guide, POUR quick reference and quick navigation to every module.
 * All stats are read from the persistence store and refresh whenever a
 * module emits `af:progress`.
 * ========================================================================== */
(function (AF) {
  "use strict";

  var modules = (AF.modules = AF.modules || {});

  function workshopState() {
    return AF.store.get("workshop", { found: {}, fixed: {} });
  }
  function auditState() {
    return AF.store.get("audit", { ratings: {}, notes: {} });
  }
  function count(obj) {
    return Object.keys(obj || {}).filter(function (k) { return obj[k]; }).length;
  }

  function refresh() {
    var ws = workshopState();
    var au = auditState();
    var pairs = AF.store.get("contrast-history", []);

    var found = count(ws.found);
    var fixed = count(ws.fixed);
    var totalIssues = AF.data.issues.length;
    var rated = count(au.ratings);
    var totalSc = AF.data.checklist.length;

    setText("ov-found", found + " / " + totalIssues);
    setText("ov-fixed", fixed + " / " + totalIssues);
    setText("ov-rated", rated + " / " + totalSc);
    setText("ov-pairs", String(pairs.length));

    setMeter("ov-found-fill", found, totalIssues);
    setMeter("ov-fixed-fill", fixed, totalIssues);
    setMeter("ov-rated-fill", rated, totalSc);
    setMeter("ov-pairs-fill", pairs.length, 8);
  }

  function setText(id, value) {
    var el = AF.$("#" + id);
    if (el) el.textContent = value;
  }

  function setMeter(id, value, max) {
    var el = AF.$("#" + id);
    if (!el || !max) return;
    var pct = Math.round((value / max) * 100);
    el.style.width = pct + "%";
    el.classList.toggle("ok", pct >= 100);
  }

  function renderPourCounts() {
    var counts = {};
    AF.data.checklist.forEach(function (c) {
      counts[c.principle] = (counts[c.principle] || 0) + 1;
    });
    Object.keys(counts).forEach(function (p) {
      setText("pour-count-" + p, counts[p] + " criteria tracked");
    });
  }

  function bindReset() {
    var btn = AF.$("#resetProgressBtn");
    var dlg = AF.$("#resetDialog");
    if (!btn || !dlg) return;

    btn.addEventListener("click", function () {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else if (window.confirm("Reset all saved progress (issues, checklist, contrast history, theme)?")) {
        doReset();
      }
    });

    var confirmBtn = AF.$("#resetConfirmBtn");
    var cancelBtn = AF.$("#resetCancelBtn");
    if (confirmBtn) confirmBtn.addEventListener("click", function () { dlg.close(); doReset(); });
    if (cancelBtn) cancelBtn.addEventListener("click", function () { dlg.close(); });
  }

  function doReset() {
    AF.store.clearAll();
    AF.emit("af:progress", { source: "reset" });
    AF.emit("af:reset", {});
    AF.toast("All progress reset.");
    refresh();
  }

  modules.overview = {
    init: function () {
      // Quick navigation cards → switch modules.
      AF.$$(".quick-card[data-goto]").forEach(function (card) {
        card.addEventListener("click", function () {
          AF.tabs.activateByHash(card.getAttribute("data-goto"));
        });
      });

      renderPourCounts();
      bindReset();
      refresh();

      AF.on("af:progress", refresh);
    }
  };
})(window.AF = window.AF || {});
