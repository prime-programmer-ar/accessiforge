/* ==========================================================================
 * AccessiForge — modules/workshop.js
 * Module 3 — WCAG 2.1 remediation workshop. Compare the broken “Before”
 * storefront with the fixed “After” version, hunt the 14 planted issues,
 * and track findings with Found / Fixed checkboxes. Progress persists
 * across sessions and feeds the Overview dashboard.
 *
 * A11y note: only the changed card is re-rendered on toggle, and focus is
 * restored to the checkbox afterwards — a full-list re-render would
 * destroy keyboard focus (SC 2.4.3 / 3.2.2).
 * ========================================================================== */
(function (AF) {
  "use strict";

  var modules = (AF.modules = AF.modules || {});

  var STATE_KEY = "workshop";
  var currentFilter = "all";

  function state() {
    return AF.store.get(STATE_KEY, { found: {}, fixed: {} });
  }

  function saveState(s) {
    AF.store.set(STATE_KEY, s);
    AF.emit("af:progress", { source: "workshop" });
  }

  function countFlags(obj) {
    return Object.keys(obj || {}).filter(function (k) { return obj[k]; }).length;
  }

  /* ---- View switcher: Before / After / side by side ------------------------ */
  function initView() {
    var colB = AF.$("#colBefore");
    var colA = AF.$("#colAfter");
    AF.$$('input[name="wsView"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        var v = radio.value;
        colB.hidden = v === "a";
        colA.hidden = v === "b";
      });
    });
    AF.$("#wrapBefore").innerHTML = AF.sample(false, "b");
    AF.$("#wrapAfter").innerHTML = AF.sample(true, "a");
  }

  /* ---- Issue cards ------------------------------------------------------------ */
  function renderIssueCard(i) {
    var s = state();
    var issue = AF.data.issues[i];
    var found = !!s.found[i];
    var fixed = !!s.fixed[i];
    return '<article class="card issue-card' +
      (fixed ? " is-fixed" : found ? " is-found" : "") +
      '" data-issue="' + i + '">' +
      '<div class="issue-head">' +
      "<h4>" + (i + 1) + ". " + AF.esc(issue.title) + "</h4>" +
      '<span class="badge badge-level">SC ' + issue.sc + "</span>" +
      '<span class="badge badge-level">Level ' + issue.level + "</span>" +
      (fixed ? '<span class="badge badge-ok">Fixed</span>' : "") +
      "</div>" +
      '<p class="issue-sc">' + AF.esc(issue.scName) + " — " + AF.esc(issue.affects) + "</p>" +
      '<div class="issue-checks">' +
      '<label class="check-line"><input type="checkbox" class="fnd" data-i="' + i + '"' +
      (found ? " checked" : "") + '> <span>Found <span class="sr-only">: ' + AF.esc(issue.title) + "</span></span></label>" +
      '<label class="check-line"><input type="checkbox" class="fxd" data-i="' + i + '"' +
      (fixed ? " checked" : "") + '> <span>Fixed <span class="sr-only">: ' + AF.esc(issue.title) + "</span></span></label>" +
      "</div>" +
      "<details><summary>Details and fix</summary>" +
      "<p><strong>Detect:</strong> " + AF.esc(issue.detect) + "</p>" +
      "<p><strong>Fix:</strong> " + AF.esc(issue.fix) + "</p>" +
      "<p>Before:</p><pre><code>" + AF.esc(issue.before) + "</code></pre>" +
      "<p>After:</p><pre><code>" + AF.esc(issue.after) + "</code></pre>" +
      "</details></article>";
  }

  function renderIssues() {
    AF.$("#issueList").innerHTML = AF.data.issues.map(function (issue, i) {
      return renderIssueCard(i);
    }).join("");
  }

  /** Re-render one card in place, restoring focus to the toggled control. */
  function refreshCard(i, focusSelector) {
    var host = AF.$("#issueList");
    var old = host.querySelector('.issue-card[data-issue="' + i + '"]');
    if (!old) return;
    var holder = document.createElement("div");
    holder.innerHTML = renderIssueCard(i);
    var fresh = holder.firstElementChild;
    old.parentNode.replaceChild(fresh, old);
    if (focusSelector) {
      var toFocus = fresh.querySelector(focusSelector);
      if (toFocus) toFocus.focus();
    }
  }

  function applyFilter() {
    var s = state();
    AF.$$("#issueList .issue-card").forEach(function (card) {
      var i = Number(card.getAttribute("data-issue"));
      var found = !!s.found[i];
      var fixed = !!s.fixed[i];
      var show =
        currentFilter === "all" ? true :
        currentFilter === "todo" ? (!found && !fixed) :
        currentFilter === "found" ? (found && !fixed) :
        fixed; /* "fixed" */
      card.hidden = !show;
    });
    var none = AF.$("#noMatch");
    if (none) {
      none.hidden = AF.$$("#issueList .issue-card:not([hidden])").length > 0;
    }
  }

  function updateProgress() {
    var s = state();
    var total = AF.data.issues.length;
    var found = countFlags(s.found);
    var fixed = countFlags(s.fixed);

    AF.$("#wsProgressText").textContent =
      found + " of " + total + " issues found · " + fixed + " fixed";
    var bar = AF.$("#wsProgressBar");
    bar.max = total;
    bar.value = found;
    AF.$("#wsProgressLabel").textContent = found + " of " + total + " issues found";
  }

  function bindIssueEvents() {
    var host = AF.$("#issueList");
    host.addEventListener("change", function (e) {
      var input = e.target;
      if (input.tagName !== "INPUT" || !input.hasAttribute("data-i")) return;
      var i = Number(input.getAttribute("data-i"));
      var isFoundBox = input.classList.contains("fnd");
      var s = state();

      if (isFoundBox) {
        if (input.checked) s.found[i] = true; else delete s.found[i];
      } else {
        if (input.checked) s.fixed[i] = true; else delete s.fixed[i];
      }
      saveState(s);

      var focusSel = isFoundBox ? "input.fnd" : "input.fxd";
      var hadFocus = document.activeElement === input;
      refreshCard(i, hadFocus ? focusSel : null);
      applyFilter();
      updateProgress();
    });
  }

  function bindFilters() {
    AF.$$("#wsFilters .chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        currentFilter = chip.getAttribute("data-filter") || "all";
        AF.$$("#wsFilters .chip").forEach(function (c) {
          c.setAttribute("aria-pressed", c === chip ? "true" : "false");
        });
        applyFilter();
      });
    });
  }

  modules.workshop = {
    init: function () {
      initView();
      renderIssues();
      bindIssueEvents();
      bindFilters();
      applyFilter();
      updateProgress();

      // After a reset from the Overview module, re-render everything.
      AF.on("af:reset", function () {
        renderIssues();
        applyFilter();
        updateProgress();
      });
    }
  };
})(window.AF = window.AF || {});
