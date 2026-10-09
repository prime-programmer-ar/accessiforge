/* ==========================================================================
 * AccessiForge — data/sample.js
 * The “Brew & Bean” demo storefront used by the magnification stage and
 * the remediation workshop. The *Before* version deliberately contains
 * 14 WCAG failures (see data/issues.js); the *After* version fixes each.
 * The sample keeps a fixed light surface so Before/After compare fairly in
 * every theme.
 * ========================================================================== */
(function (AF) {
  "use strict";

  var IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23c8a27a'/%3E%3C/svg%3E";

  /**
   * Build the sample UI.
   * @param {boolean} good  true → accessible “After”, false → broken “Before”
   * @param {string}  p     unique id prefix for status spans
   */
  AF.sample = function (good, p) {
    var add = "document.getElementById('" + p + "st').textContent='Added to cart'";

    if (good) {
      return '<div class="sm good">' +
        '<header style="padding:0;display:flex;justify-content:space-between;align-items:center">' +
        "<h2>Brew &amp; Bean</h2>" +
        '<button type="button" aria-label="Search">\uD83D\uDD0D</button></header>' +
        "<h3>Our beans</h3>" +
        '<img src="' + IMG + '" alt="Bag of medium-roast Ethiopian beans" width="80" height="60">' +
        '<p>Small-batch coffee, roasted weekly. ' +
        '<a href="#" onclick="return false">Read our roasting guide</a></p>' +
        '<button type="button" onclick="' + add + '">Add to cart</button> ' +
        '<span id="' + p + 'st" role="status"></span>' +
        '<form onsubmit="return false">' +
        '<label for="' + p + 'e">Email</label>' +
        '<input id="' + p + 'e" type="email" aria-invalid="true" aria-describedby="' + p + 'ee" value="bob@">' +
        '<span id="' + p + 'ee" class="er">\u26A0 Error: enter a full email address.</span></form>' +
        "<table><caption>Prices</caption><thead><tr><th scope=\"col\">Bag</th><th scope=\"col\">Price</th></tr></thead>" +
        "<tbody><tr><td>250 g</td><td>$9</td></tr></tbody></table></div>";
    }

    return '<div class="sm bad">' +
      '<div class="hd"><h2>Brew &amp; Bean</h2><button type="button">\uD83D\uDD0D</button></div>' +
      "<h5>Our beans</h5>" +
      '<img src="' + IMG + '">' +
      '<p class="lc">Small-batch coffee, roasted weekly. To learn more ' +
      '<a href="#" onclick="return false" tabindex="5">click here</a></p>' +
      '<div class="clk" onclick="' + add + '">Add to cart</div>' +
      '<span id="' + p + 'st"></span>' +
      '<form onsubmit="return false">' +
      '<input class="redb" placeholder="Email" value="bob@"><br><br>' +
      '<input class="trap" value="Tab is trapped here. Press Esc to leave."></form>' +
      "<table><tr><td>Bag</td><td>Price</td></tr><tr><td>250 g</td><td>$9</td></tr></table></div>";
  };
})(window.AF = window.AF || {});
