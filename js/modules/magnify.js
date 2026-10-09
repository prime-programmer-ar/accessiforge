/* ==========================================================================
 * AccessiForge — modules/magnify.js
 * Module 2b — Magnification, reflow, text-spacing and color-vision
 * simulation. Zooms the sample with relative font sizing, optionally
 * forces a 320px reflow viewport (SC 1.4.10), applies the SC 1.4.12 text
 * spacing overrides, and filters the sample through SVG matrices that
 * approximate protanopia, deuteranopia, tritanopia and achromatopsia.
 * ========================================================================== */
(function (AF) {
  "use strict";

  var modules = (AF.modules = AF.modules || {});

  var stage, verSelect, zoomRange, zoomOut, cvdSelect, reflowChk, spacingChk, statusEl;

  function renderStage() {
    var good = verSelect.value === "g";
    stage.innerHTML = AF.sample(good, good ? "vmg" : "vmb");
    applyStage();
  }

  function applyStage() {
    var z = Number(zoomRange.value);
    zoomOut.textContent = z + "%";
    stage.style.fontSize = (16 * z / 100) + "px";
    stage.style.width = reflowChk.checked ? "320px" : "";
    stage.classList.toggle("sp", spacingChk.checked);
    stage.style.filter = cvdSelect.value ? "url(#cvd-" + cvdSelect.value + ")" : "";

    var wrap = stage.parentElement;
    var scrolls = stage.scrollWidth > wrap.clientWidth + 1 ||
      (reflowChk.checked && stage.scrollWidth > 322);

    statusEl.textContent =
      (scrolls
        ? "Warning: content scrolls horizontally here, which fails reflow (SC 1.4.10) when it happens at 320px or 400% zoom."
        : "No horizontal scrolling detected.") +
      (spacingChk.checked ? " Check the sample for clipped or overlapping text (SC 1.4.12)." : "");
  }

  modules.magnify = {
    init: function () {
      stage = AF.$("#stage");
      verSelect = AF.$("#sampleVer");
      zoomRange = AF.$("#zoomRange");
      zoomOut = AF.$("#zoomOut");
      cvdSelect = AF.$("#cvdSelect");
      reflowChk = AF.$("#reflowChk");
      spacingChk = AF.$("#spacingChk");
      statusEl = AF.$("#magStatus");
      if (!stage) return;

      [
        [verSelect, "change", renderStage],
        [zoomRange, "input", applyStage],
        [cvdSelect, "change", applyStage],
        [reflowChk, "change", applyStage],
        [spacingChk, "change", applyStage]
      ].forEach(function (binding) {
        binding[0].addEventListener(binding[1], binding[2]);
      });

      renderStage();
    }
  };
})(window.AF = window.AF || {});
