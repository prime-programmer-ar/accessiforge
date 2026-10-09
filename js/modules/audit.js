/* ==========================================================================
 * AccessiForge — modules/audit.js
 * Module 4 — Audit report & checklist. Rate 18 tracked WCAG 2.1 success
 * criteria (pass / fail / n/a) with notes, watch per-principle score
 * meters, then generate, copy, print, export (Markdown / JSON) or import
 * the audit. Everything persists locally and feeds the Overview dashboard.
 * ========================================================================== */
(function (AF) {
  "use strict";

  var modules = (AF.modules = AF.modules || {});

  var STATE_KEY = "audit";

  function state() {
    return AF.store.get(STATE_KEY, { ratings: {}, notes: {} });
  }

  function saveState(s) {
    AF.store.set(STATE_KEY, s);
    AF.emit("af:progress", { source: "audit" });
  }

  /* ---- Checklist rendering --------------------------------------------------- */
  function renderChecklist() {
    var host = AF.$("#checklist");
    var s = state();

    host.innerHTML = AF.data.principles.map(function (P) {
      return "<h3>" + P + "</h3>" +
        AF.data.checklist.map(function (c, i) {
          if (c.principle !== P) return "";
          var rated = s.ratings[i] || "";
          return '<fieldset class="audit-fieldset"><legend>SC ' + c.sc + " " + AF.esc(c.name) + "</legend>" +
            '<p class="field-hint" style="margin-top:0">' + AF.esc(c.hint) + "</p>" +
            ["pass:Pass", "fail:Fail", "na:Not applicable"].map(function (o) {
              var parts = o.split(":");
              return '<label class="radio-line"><input type="radio" name="c' + i + '" value="' + parts[0] + '"' +
                (rated === parts[0] ? " checked" : "") + "> " + parts[1] + "</label>";
            }).join("") +
            '<div class="field audit-notes"><label for="n' + i + '">Notes for SC ' + c.sc + "</label>" +
            '<input type="text" id="n' + i + '" data-note="' + i + '" ' +
            'value="' + AF.esc(s.notes[i] || "") + '" style="width:100%"></div>' +
            "</fieldset>";
        }).join("");
    }).join("");
  }

  function bindChecklist() {
    var host = AF.$("#checklist");

    host.addEventListener("change", function (e) {
      var input = e.target;
      var s = state();
      if (input.type === "radio" && input.name && /^c\d+$/.test(input.name)) {
        var i = input.name.slice(1);
        s.ratings[i] = input.value;
        saveState(s);
        updateSummary();
      }
    });

    host.addEventListener("input", function (e) {
      var input = e.target;
      if (input.hasAttribute && input.hasAttribute("data-note")) {
        var s = state();
        s.notes[input.getAttribute("data-note")] = input.value;
        AF.store.set(STATE_KEY, s);   // notes don’t change the dashboard stats
      }
    });
  }

  /* ---- Summary meters ----------------------------------------------------------- */
  function updateSummary() {
    var s = state();
    AF.data.principles.forEach(function (P) {
      var pass = 0, fail = 0, na = 0, unrated = 0;
      AF.data.checklist.forEach(function (c, i) {
        if (c.principle !== P) return;
        var v = s.ratings[i];
        if (v === "pass") pass++;
        else if (v === "fail") fail++;
        else if (v === "na") na++;
        else unrated++;
      });
      var rated = pass + fail;
      var pct = rated ? Math.round((100 * pass) / rated) : 0;

      AF.$("#ps-score-" + P.replace(/[^A-Za-z]/g, ""))
        .textContent = pass + " pass / " + fail + " fail / " + na + " n/a / " + unrated + " not rated" +
        (rated ? " (" + pct + "% of rated)" : "");
      var fill = AF.$("#ps-fill-" + P.replace(/[^A-Za-z]/g, ""));
      fill.style.width = pct + "%";
      fill.classList.toggle("ok", rated > 0 && pct >= 100);
    });
  }

  /* ---- Report builders ------------------------------------------------------------ */
  function collect() {
    var s = state();
    var fails = [];
    var totals = {};
    AF.data.principles.forEach(function (P) {
      totals[P] = { pass: 0, fail: 0, na: 0, unrated: 0 };
    });
    AF.data.checklist.forEach(function (c, i) {
      var v = s.ratings[i];
      var t = totals[c.principle];
      if (v === "pass") t.pass++;
      else if (v === "fail") { t.fail++; fails.push(c); }
      else if (v === "na") t.na++;
      else t.unrated++;
    });
    return { state: s, totals: totals, fails: fails };
  }

  function buildTextReport() {
    var r = collect();
    var L = [
      "AccessiForge — WCAG 2.1 audit report",
      "Generated: " + new Date().toLocaleString(),
      ""
    ];
    AF.data.principles.forEach(function (P) {
      var t = r.totals[P];
      var rated = t.pass + t.fail;
      L.push(P + ": " + t.pass + " pass, " + t.fail + " fail, " + t.na + " n/a, " + t.unrated + " not rated" +
        (rated ? " (pass rate " + Math.round((100 * t.pass) / rated) + "% of rated items)" : ""));
    });
    L.push("", "Failed items:");
    if (r.fails.length) {
      r.fails.forEach(function (c) {
        var i = AF.data.checklist.indexOf(c);
        L.push("SC " + c.sc + " " + c.name + ": " + (r.state.notes[i] || "(no notes)"));
      });
    } else {
      L.push("None recorded");
    }
    L.push("", "Note: automated tools catch only some issues; confirm with manual and assistive technology tests.");
    return L.join("\n");
  }

  function buildMarkdownReport() {
    var r = collect();
    var md = [
      "# AccessiForge — WCAG 2.1 audit report",
      "",
      "_Generated: " + new Date().toLocaleString() + "_",
      ""
    ];
    md.push("| Principle | Pass | Fail | N/A | Not rated | Pass rate (rated) |");
    md.push("| --- | --- | --- | --- | --- | --- |");
    AF.data.principles.forEach(function (P) {
      var t = r.totals[P];
      var rated = t.pass + t.fail;
      md.push("| " + P + " | " + t.pass + " | " + t.fail + " | " + t.na + " | " + t.unrated + " | " +
        (rated ? Math.round((100 * t.pass) / rated) + "%" : "—") + " |");
    });
    md.push("", "## Failed items", "");
    if (r.fails.length) {
      r.fails.forEach(function (c) {
        var i = AF.data.checklist.indexOf(c);
        md.push("- **SC " + c.sc + " " + c.name + "** — " + (r.state.notes[i] || "(no notes)"));
      });
    } else {
      md.push("None recorded.");
    }
    md.push("", "> Note: automated tools catch only some issues; confirm with manual and assistive technology tests.");
    return md.join("\n");
  }

  function buildJsonExport() {
    var r = collect();
    return JSON.stringify({
      app: "AccessiForge",
      version: 1,
      exported: new Date().toISOString(),
      ratings: r.state.ratings,
      notes: r.state.notes,
      checklist: AF.data.checklist.map(function (c) {
        return { principle: c.principle, sc: c.sc, name: c.name };
      })
    }, null, 2);
  }

  /* ---- Actions ---------------------------------------------------------------------- */
  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function stamp() {
    var d = new Date();
    function pad(n) { return String(n).padStart(2, "0"); }
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + pad(d.getHours()) + pad(d.getMinutes());
  }

  function showReport(text) {
    var out = AF.$("#reportOut");
    out.textContent = text;
    out.focus();
  }

  function importJson(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data || typeof data !== "object" || !data.ratings) {
          throw new Error("missing ratings");
        }
        var s = state();
        Object.keys(data.ratings || {}).forEach(function (i) {
          if (["pass", "fail", "na"].indexOf(data.ratings[i]) > -1) s.ratings[i] = data.ratings[i];
        });
        Object.keys(data.notes || {}).forEach(function (i) {
          if (typeof data.notes[i] === "string") s.notes[i] = data.notes[i];
        });
        saveState(s);
        renderChecklist();
        updateSummary();
        AF.toast("Audit imported from " + file.name + ".");
      } catch (err) {
        AF.toast("Import failed: not a valid AccessiForge audit file.");
      }
    };
    reader.readAsText(file);
  }

  modules.audit = {
    buildTextReport: buildTextReport,     // exposed for teaching/tests
    init: function () {
      renderChecklist();
      bindChecklist();
      updateSummary();

      AF.$("#genReportBtn").addEventListener("click", function () {
        showReport(buildTextReport());
        AF.toast("Report generated.");
      });

      AF.$("#copyReportBtn").addEventListener("click", function () {
        var text = buildTextReport();
        showReport(text);
        var status = AF.$("#copyStatus");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function () { status.textContent = "Report copied to clipboard."; },
            function () {
              status.textContent = "Copy was blocked — select the report text and copy it manually.";
            }
          );
        } else {
          status.textContent = "Copy is unavailable here — select the report text and copy it manually.";
        }
      });

      AF.$("#downloadMdBtn").addEventListener("click", function () {
        download("accessiforge-audit-" + stamp() + ".md", buildMarkdownReport(), "text/markdown");
        AF.toast("Markdown report downloaded.");
      });

      AF.$("#exportJsonBtn").addEventListener("click", function () {
        download("accessiforge-audit-" + stamp() + ".json", buildJsonExport(), "application/json");
        AF.toast("Audit exported as JSON.");
      });

      var importBtn = AF.$("#importJsonBtn");
      var importFile = AF.$("#importJsonFile");
      importBtn.addEventListener("click", function () { importFile.click(); });
      importFile.addEventListener("change", function () {
        if (importFile.files && importFile.files[0]) importJson(importFile.files[0]);
        importFile.value = "";
      });

      AF.$("#printBtn").addEventListener("click", function () {
        showReport(buildTextReport());
        window.print();
      });

      AF.on("af:reset", function () {
        renderChecklist();
        updateSummary();
      });
    }
  };
})(window.AF = window.AF || {});
