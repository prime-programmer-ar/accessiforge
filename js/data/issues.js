/* ==========================================================================
 * AccessiForge — data/issues.js
 * The 14 deliberately-broken patterns in the “Before” sample, each mapped
 * to its WCAG 2.1 success criterion and its verified fix.
 * Fields: title, sc, scName, level, affects, detect, fix, before, after
 * ========================================================================== */
(function (AF) {
  "use strict";

  AF.data = AF.data || {};

  AF.data.issues = [
    {
      title: "Low-contrast text",
      sc: "1.4.3", scName: "Contrast (Minimum)", level: "AA",
      affects: "People with low vision, or anyone reading in bright light",
      detect: "Contrast checker: #aaa on white is about 2.3:1.",
      fix: "Use at least 4.5:1 for normal text.",
      before: '<p style="color:#aaa">',
      after: '<p style="color:#444">'
    },
    {
      title: "Image without alt text",
      sc: "1.1.1", scName: "Non-text Content", level: "A",
      affects: "Screen reader users",
      detect: "Inspect the img: no alt, so the file name may be read.",
      fix: "Describe meaningful images; use alt=\"\" for decorative ones.",
      before: '<img src="beans.png">',
      after: '<img src="beans.png" alt="Bag of Ethiopian beans">'
    },
    {
      title: "Clickable div",
      sc: "2.1.1", scName: "Keyboard", level: "A",
      affects: "Keyboard, switch and screen reader users",
      detect: "Press Tab: the div never gets focus.",
      fix: "Use a native button.",
      before: '<div onclick="add()">Add</div>',
      after: '<button type="button" onclick="add()">Add</button>'
    },
    {
      title: "Placeholder-only field",
      sc: "3.3.2", scName: "Labels or Instructions", level: "A",
      affects: "Screen reader and cognitive-disability users",
      detect: "Type in the field: the hint disappears and there is no label.",
      fix: "Add a visible label tied with for and id.",
      before: '<input placeholder="Email">',
      after: '<label for="e">Email</label><input id="e">'
    },
    {
      title: "Error shown by color only",
      sc: "1.4.1", scName: "Use of Color", level: "A",
      affects: "Color-blind and low-vision users",
      detect: "Apply the achromatopsia filter: the red border is the only cue.",
      fix: "Add text and an icon, and link it with aria-describedby.",
      before: '<input class="redb">',
      after: '<input aria-invalid="true" aria-describedby="m"><span id="m">Error: ...</span>'
    },
    {
      title: "No visible focus indicator",
      sc: "2.4.7", scName: "Focus Visible", level: "AA",
      affects: "Keyboard users",
      detect: "Tab through: you cannot see where focus is.",
      fix: "Remove outline:none or provide a clear replacement.",
      before: "*:focus{outline:none}",
      after: ":focus-visible{outline:3px solid #0a4fa3}"
    },
    {
      title: "Positive tabindex",
      sc: "2.4.3", scName: "Focus Order", level: "A",
      affects: "Keyboard and screen reader users",
      detect: "Tab: the link with tabindex=5 is reached out of order.",
      fix: "Use tabindex 0 or -1 only and follow the DOM order.",
      before: '<a tabindex="5">',
      after: '<a href="#">'
    },
    {
      title: "Skipped heading level",
      sc: "1.3.1", scName: "Info and Relationships", level: "A",
      affects: "Screen reader users who navigate by headings",
      detect: "Headings list jumps from h2 to h5. (Strictly a best practice unless the structure is misrepresented.)",
      fix: "Use heading levels that reflect the outline.",
      before: "<h2>..</h2><h5>..</h5>",
      after: "<h2>..</h2><h3>..</h3>"
    },
    {
      title: "Vague link text",
      sc: "2.4.4", scName: "Link Purpose (In Context)", level: "A",
      affects: "Screen reader users who list links",
      detect: 'Links list shows "click here".',
      fix: "Make the link text describe its destination.",
      before: "<a>click here</a>",
      after: "<a>Read our roasting guide</a>"
    },
    {
      title: "Icon-only button without a name",
      sc: "4.1.2", scName: "Name, Role, Value", level: "A",
      affects: "Screen reader and voice control users",
      detect: "Accessibility tree shows an empty name.",
      fix: "Add aria-label or visible text.",
      before: "<button>🔍</button>",
      after: '<button aria-label="Search">🔍</button>'
    },
    {
      title: "Table without headers",
      sc: "1.3.1", scName: "Info and Relationships", level: "A",
      affects: "Screen reader users",
      detect: "Cells are read with no column context.",
      fix: "Use th with scope, plus a caption.",
      before: "<td>Bag</td>",
      after: '<th scope="col">Bag</th>'
    },
    {
      title: "Fixed pixel width",
      sc: "1.4.10", scName: "Reflow", level: "AA",
      affects: "Low-vision users who zoom",
      detect: "Set 320px in the Contrast & zoom module: horizontal scroll appears.",
      fix: "Use max-width and relative units.",
      before: "width:600px",
      after: "max-width:100%"
    },
    {
      title: "Status not announced",
      sc: "4.1.3", scName: "Status Messages", level: "AA",
      affects: "Screen reader users",
      detect: "Press Add to cart: nothing is spoken.",
      fix: 'Put the message in a role="status" region.',
      before: '<span id="st"></span>',
      after: '<span id="st" role="status"></span>'
    },
    {
      title: "Keyboard trap",
      sc: "2.1.2", scName: "No Keyboard Trap", level: "A",
      affects: "Keyboard users",
      detect: "Focus the last field and press Tab: focus never leaves. (Esc is the escape hatch here.)",
      fix: "Never intercept Tab without an exit.",
      before: "onkeydown: Tab -> preventDefault",
      after: "(no handler)"
    }
  ];
})(window.AF = window.AF || {});
