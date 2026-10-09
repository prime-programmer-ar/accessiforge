/* ==========================================================================
 * AccessiForge — data/checklist.js
 * Audit checklist: 18 frequently-applied WCAG 2.1 success criteria,
 * grouped by the four POUR principles. `hint` = one-line manual test.
 * ========================================================================== */
(function (AF) {
  "use strict";

  AF.data = AF.data || {};

  AF.data.checklist = [
    { principle: "Perceivable",   sc: "1.1.1",  name: "Non-text Content",
      hint: "Every image has appropriate alt text (or alt=\"\" if decorative)." },
    { principle: "Perceivable",   sc: "1.3.1",  name: "Info and Relationships",
      hint: "Headings, lists, tables and labels are marked up, not styled text." },
    { principle: "Perceivable",   sc: "1.4.1",  name: "Use of Color",
      hint: "Color is never the only cue for errors, links or required fields." },
    { principle: "Perceivable",   sc: "1.4.3",  name: "Contrast (Minimum)",
      hint: "Normal text ≥ 4.5:1, large text ≥ 3:1 (check with the Contrast lab)." },
    { principle: "Perceivable",   sc: "1.4.4",  name: "Resize Text",
      hint: "Text scales to 200% without loss of content or function." },
    { principle: "Perceivable",   sc: "1.4.10", name: "Reflow",
      hint: "No horizontal scrolling at 320px width / 400% zoom." },
    { principle: "Perceivable",   sc: "1.4.11", name: "Non-text Contrast",
      hint: "UI components and meaningful graphics have ≥ 3:1 against adjacent colors." },
    { principle: "Perceivable",   sc: "1.4.12", name: "Text Spacing",
      hint: "Layout survives increased line/letter/word spacing without clipping." },

    { principle: "Operable",      sc: "2.1.1",  name: "Keyboard",
      hint: "Every control is reachable and usable with the keyboard alone." },
    { principle: "Operable",      sc: "2.1.2",  name: "No Keyboard Trap",
      hint: "Focus can always leave a component (Tab or a documented Esc exit)." },
    { principle: "Operable",      sc: "2.4.3",  name: "Focus Order",
      hint: "Focus order follows the visual/logical reading order." },
    { principle: "Operable",      sc: "2.4.4",  name: "Link Purpose (In Context)",
      hint: "Link text (or its context) describes the destination." },
    { principle: "Operable",      sc: "2.4.7",  name: "Focus Visible",
      hint: "A clearly visible focus indicator appears on every control." },

    { principle: "Understandable", sc: "3.1.1", name: "Language of Page",
      hint: "The page declares its default language with a valid lang attribute." },
    { principle: "Understandable", sc: "3.3.1", name: "Error Identification",
      hint: "Input errors are described in text, not color alone." },
    { principle: "Understandable", sc: "3.3.2", name: "Labels or Instructions",
      hint: "Fields have visible labels; unusual input has instructions." },

    { principle: "Robust",        sc: "4.1.2",  name: "Name, Role, Value",
      hint: "Custom widgets expose correct names, roles, states and values." },
    { principle: "Robust",        sc: "4.1.3",  name: "Status Messages",
      hint: "Dynamic status changes are announced without moving focus." }
  ];

  AF.data.principles = ["Perceivable", "Operable", "Understandable", "Robust"];
})(window.AF = window.AF || {});
