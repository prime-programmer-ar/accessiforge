/* ==========================================================================
 * AccessiForge — modules/keyboard-lab.js
 * Module 1 — Keyboard & screen reader lab. Live ARIA patterns to test with
 * the keyboard only, plus an event log that makes focus order visible.
 *
 * Patterns: accordion · modal dialog · menu button · validated form ·
 *           toggle switch · key event log (with the deliberate trap
 *           used by the “Before” samples in modules 2 and 3).
 * ========================================================================== */
(function (AF) {
  "use strict";

  var modules = (AF.modules = AF.modules || {});
  var logPaused = false;
  var MAX_LOG = 10;

  /* ---- Accordion (aria-expanded + aria-controls) -------------------------- */
  function initAccordion() {
    AF.$$(".acc-trigger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        var panel = AF.$("#" + btn.getAttribute("aria-controls"));
        if (panel) panel.hidden = open;
      });
    });
  }

  /* ---- Modal dialog (native <dialog>: focus trap + Esc for free) ---------- */
  function initDialog() {
    var dlg = AF.$("#demoDialog");
    var opener = AF.$("#openDialogBtn");
    if (!dlg || !opener) return;

    opener.addEventListener("click", function () {
      if (typeof dlg.showModal === "function") dlg.showModal();
    });
    var closeBtn = AF.$("#closeDialogBtn");
    if (closeBtn) closeBtn.addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("close", function () { opener.focus(); });
  }

  /* ---- Menu button (ARIA APG pattern) -------------------------------------- */
  function initMenu() {
    var btn = AF.$("#menuBtn");
    var list = AF.$("#menuList");
    if (!btn || !list) return;
    var items = AF.$$("[role=menuitem]", list);

    function open(i) {
      list.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      items[i].focus();
    }
    function close(restore) {
      list.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      if (restore) btn.focus();
    }

    btn.addEventListener("click", function () {
      if (list.hidden) open(0); else close(true);
    });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); open(0); }
      else if (e.key === "ArrowUp") { e.preventDefault(); open(items.length - 1); }
    });
    list.addEventListener("keydown", function (e) {
      var i = items.indexOf(document.activeElement);
      var n = -1;
      if (e.key === "ArrowDown") n = (i + 1) % items.length;
      else if (e.key === "ArrowUp") n = (i - 1 + items.length) % items.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = items.length - 1;
      else if (e.key === "Escape") { close(true); return; }
      else if (e.key === "Tab") { close(false); return; }
      if (n > -1) { e.preventDefault(); items[n].focus(); }
    });
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        close(true);
        AF.toast("Chose: " + item.textContent);
      });
    });
  }

  /* ---- Validated form (error summary + focus management) ------------------- */
  function initForm() {
    var form = AF.$("#demoForm");
    var summary = AF.$("#errorSummary");
    if (!form || !summary) return;

    function check(id, message, test) {
      var field = AF.$("#" + id);
      var errEl = AF.$("#" + id + "-err");
      var ok = test(field.value);
      field.setAttribute("aria-invalid", String(!ok));
      errEl.textContent = ok ? "" : "Error: " + message;
      return ok ? null : { id: id, message: message };
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errs = [
        check("fname", "Enter your name.", function (v) { return v.trim() !== ""; }),
        check("femail", "Enter an email address like name@example.com.",
              function (v) { return /^\S+@\S+\.\S+$/.test(v); })
      ].filter(Boolean);

      if (errs.length) {
        summary.innerHTML =
          "<h3>" + errs.length + (errs.length > 1 ? " problems" : " problem") +
          " to fix</h3><ul>" +
          errs.map(function (er) {
            return '<li><a href="#' + er.id + '">' + AF.esc(er.message) + "</a></li>";
          }).join("") +
          "</ul>";
        summary.hidden = false;
        summary.focus();
      } else {
        summary.hidden = true;
        AF.toast("Form sent — everything validates.");
      }
    });

    // Error-summary links move focus to the offending field.
    summary.addEventListener("click", function (e) {
      var a = e.target.closest("a[href^='#']");
      if (!a) return;
      e.preventDefault();
      var field = AF.$(a.getAttribute("href"));
      if (field) field.focus();
    });
  }

  /* ---- Toggle switch (role=switch) ------------------------------------------ */
  function initSwitch() {
    var sw = AF.$("#switchDemo");
    var state = AF.$("#switchState");
    if (!sw) return;
    sw.addEventListener("click", function () {
      var on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", String(on));
      if (state) state.textContent = on
        ? "Announced: “Enhanced brewing, on”"
        : "Announced: “Enhanced brewing, off”";
      AF.announce(on ? "Enhanced brewing, on" : "Enhanced brewing, off");
    });
  }

  /* ---- Keyboard event log + deliberate trap ----------------------------------
   * Logs every keydown with the focused element (SC 2.4.3 focus order) and
   * implements the teaching keyboard trap: elements with class “trap”
   * swallow Tab until Escape is pressed. */
  function initKeyLog() {
    var log = AF.$("#keyLog");
    var pauseBtn = AF.$("#pauseKeyLog");
    var clearBtn = AF.$("#clearKeyLog");
    if (!log) return;

    function timeStr() {
      var d = new Date();
      return d.toLocaleTimeString([], { hour12: false });
    }

    document.addEventListener("keydown", function (e) {
      var el = document.activeElement;

      if (!logPaused) {
        var li = document.createElement("li");
        var key = document.createElement("span");
        key.className = "k-key";
        key.textContent = e.key === " " ? "Space" : e.key;
        var target = document.createElement("span");
        target.className = "k-target";
        target.textContent = "on <" + el.tagName.toLowerCase() + ">" +
          (el.getAttribute("role") ? " role=" + el.getAttribute("role") : "") +
          ' "' + AF.elementName(el) + '"';
        var when = document.createElement("span");
        when.className = "k-when";
        when.textContent = timeStr();
        li.appendChild(key);
        li.appendChild(target);
        li.appendChild(when);
        log.insertBefore(li, log.firstChild);
        while (log.children.length > MAX_LOG) log.removeChild(log.lastChild);
      }

      // The deliberate trap used by the “Before” samples.
      if (el.classList && el.classList.contains("trap")) {
        if (e.key === "Tab") e.preventDefault();
        if (e.key === "Escape") el.blur();
      }
    });

    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        logPaused = !logPaused;
        pauseBtn.setAttribute("aria-pressed", String(logPaused));
        pauseBtn.textContent = logPaused ? "Resume log" : "Pause log";
        AF.toast(logPaused ? "Key log paused." : "Key log resumed.");
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        log.innerHTML = "";
        AF.toast("Key log cleared.");
      });
    }
  }

  modules.keyboardLab = {
    init: function () {
      initAccordion();
      initDialog();
      initMenu();
      initForm();
      initSwitch();
      initKeyLog();
    }
  };
})(window.AF = window.AF || {});
