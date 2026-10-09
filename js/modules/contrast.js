/* ==========================================================================
 * AccessiForge — modules/contrast.js
 * Module 2a — WCAG 2.x contrast checker. Relative luminance and ratio
 * computed exactly as WCAG defines them (sRGB → linear → L; ratio always
 * rounded DOWN so a “4.5” display really passes 4.5). Includes a hue-
 * preserving fix suggestion, color swap, and a saved-pairs history.
 * ========================================================================== */
(function (AF) {
  "use strict";

  var modules = (AF.modules = AF.modules || {});
  var HISTORY_KEY = "contrast-history";
  var HISTORY_MAX = 8;

  var TESTS = [
    ["Normal text AA", 4.5],
    ["Large text AA", 3],
    ["UI component or graphic AA (SC 1.4.11)", 3],
    ["Normal text AAA", 7],
    ["Large text AAA", 4.5]
  ];

  /* ---- WCAG math ------------------------------------------------------------ */
  function norm(h) {
    h = (h || "").trim();
    if (/^#[0-9a-f]{3}$/i.test(h)) {
      h = "#" + h.slice(1).split("").map(function (c) { return c + c; }).join("");
    }
    return /^#[0-9a-f]{6}$/i.test(h) ? h.toLowerCase() : null;
  }

  function lum(h) {
    var c = [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16) / 255; })
      .map(function (v) { return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function ratio(a, b) {
    var x = lum(a), y = lum(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }

  function mix(h, target, p) {
    return "#" + [1, 3, 5].map(function (i) {
      return Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - p) + target * p)
        .toString(16).padStart(2, "0");
    }).join("");
  }

  /** Blend fg toward black or white (whichever direction meets the target)
   * until the ratio passes — keeps the hue. */
  function suggest(fg, bg, target) {
    if (ratio(fg, bg) >= target) return fg;
    var to = lum(bg) > 0.179 ? 0 : 255;
    for (var k = 1; k <= 100; k++) {
      var c = mix(fg, to, k / 100);
      if (ratio(c, bg) >= target) return c;
    }
    return to ? "#ffffff" : "#000000";
  }

  /* ---- UI wiring -------------------------------------------------------------- */
  function bindPair(pickerId, hexId) {
    var picker = AF.$("#" + pickerId);
    var hex = AF.$("#" + hexId);
    if (!picker || !hex) return;
    picker.addEventListener("input", function () {
      hex.value = picker.value;
      update();
    });
    hex.addEventListener("input", function () {
      var n = norm(hex.value);
      if (n) { picker.value = n; update(); }
    });
  }

  function currentPair() {
    var f = norm(AF.$("#fgHex").value);
    var b = norm(AF.$("#bgHex").value);
    return (f && b) ? { fg: f, bg: b } : null;
  }

  var ICON_OK = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true" focusable="false"><path d="M4 12.5l5 5L20 6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_NO = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/></svg>';

  function update() {
    var pair = currentPair();
    if (!pair) return;
    var r = ratio(pair.fg, pair.bg);

    // Displayed ratio is always rounded DOWN, never up.
    AF.$("#ratioValue").textContent = (Math.floor(r * 100) / 100).toFixed(2);

    AF.$("#testResults").innerHTML = TESTS.map(function (t) {
      var ok = r >= t[1];
      return "<li>" +
        (ok ? '<span class="pass">' + ICON_OK + "</span>" : '<span class="fail">' + ICON_NO + "</span>") +
        '<span class="t-name">' + t[0] + "</span>" +
        '<span class="t-need">needs ' + t[1] + ":1 · yours " + r.toFixed(2) + ":1</span>" +
        "</li>";
    }).join("");

    var pv = AF.$("#previewBox");
    pv.style.color = pair.fg;
    pv.style.background = pair.bg;
  }

  /* ---- Saved pair history ------------------------------------------------------- */
  function getHistory() {
    return AF.store.get(HISTORY_KEY, []);
  }

  function renderHistory() {
    var wrap = AF.$("#pairHistory");
    var list = getHistory();
    if (!wrap) return;

    if (!list.length) {
      wrap.innerHTML = '<p class="empty-state" style="flex:1 1 100%">No saved pairs yet — pick two colors and press “Save pair”.</p>';
      return;
    }
    wrap.innerHTML = list.map(function (p, i) {
      var label = "Load pair " + p.fg + " on " + p.bg + ", ratio " + p.ratio + " to 1";
      return '<button type="button" class="chip" data-i="' + i + '" aria-label="' + AF.esc(label) + '">' +
        '<span class="swatch" style="background:' + p.fg + '" aria-hidden="true"></span>' +
        '<span class="swatch" style="background:' + p.bg + '" aria-hidden="true"></span>' +
        "<span>" + p.fg + " / " + p.bg + '</span> <span class="ratio-chip">' + p.ratio + ":1</span></button>";
    }).join("");
  }

  function savePair() {
    var pair = currentPair();
    if (!pair) {
      AF.toast("Enter two valid hex colors first.");
      return;
    }
    var list = getHistory().filter(function (p) {
      return !(p.fg === pair.fg && p.bg === pair.bg);
    });
    list.unshift({ fg: pair.fg, bg: pair.bg, ratio: (Math.floor(ratio(pair.fg, pair.bg) * 100) / 100).toFixed(2) });
    if (list.length > HISTORY_MAX) list.length = HISTORY_MAX;
    AF.store.set(HISTORY_KEY, list);
    renderHistory();
    AF.emit("af:progress", { source: "contrast" });
    AF.toast("Pair saved (" + list.length + "/" + HISTORY_MAX + ").");
  }

  function loadPair(i) {
    var p = getHistory()[i];
    if (!p) return;
    AF.$("#fgHex").value = p.fg;
    AF.$("#fgPicker").value = p.fg;
    AF.$("#bgHex").value = p.bg;
    AF.$("#bgPicker").value = p.bg;
    update();
    AF.toast("Loaded " + p.fg + " on " + p.bg + ".");
  }

  /* ---- Module init ------------------------------------------------------------------ */
  modules.contrast = {
    norm: norm, lum: lum, ratio: ratio, suggest: suggest,   // exposed for tests/teaching
    init: function () {
      bindPair("fgPicker", "fgHex");
      bindPair("bgPicker", "bgHex");

      AF.$("#swapBtn").addEventListener("click", function () {
        var pair = currentPair();
        if (!pair) { AF.toast("Enter two valid hex colors first."); return; }
        AF.$("#fgHex").value = pair.bg; AF.$("#fgPicker").value = pair.bg;
        AF.$("#bgHex").value = pair.fg; AF.$("#bgPicker").value = pair.fg;
        update();
        AF.toast("Colors swapped.");
      });

      AF.$("#suggestBtn").addEventListener("click", function () {
        var pair = currentPair();
        if (!pair) { AF.toast("Enter two valid hex colors first."); return; }
        var s = suggest(pair.fg, pair.bg, 4.5);
        AF.$("#fgHex").value = s;
        AF.$("#fgPicker").value = s;
        update();
        AF.toast("Text color set to " + s + " (4.5:1 or better).");
      });

      AF.$("#savePairBtn").addEventListener("click", savePair);

      AF.$("#clearHistoryBtn").addEventListener("click", function () {
        if (!getHistory().length) { AF.toast("History is already empty."); return; }
        AF.store.set(HISTORY_KEY, []);
        renderHistory();
        AF.emit("af:progress", { source: "contrast" });
        AF.toast("Saved pairs cleared.");
      });

      AF.$("#pairHistory").addEventListener("click", function (e) {
        var chip = e.target.closest(".chip[data-i]");
        if (chip) loadPair(Number(chip.getAttribute("data-i")));
      });

      renderHistory();
      update();
    }
  };
})(window.AF = window.AF || {});
