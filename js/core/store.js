/* ==========================================================================
 * AccessiForge — core/store.js
 * Safe localStorage wrapper. All user progress lives under one namespace
 * so "Reset progress" can wipe it atomically. Storage failures (private
 * mode, quota, file:// restrictions) degrade silently to in-memory only.
 * ========================================================================== */
(function (AF) {
  "use strict";

  var NS = "accessiforge:";
  var memory = {};   // fallback when localStorage is unavailable
  var hasLS = false;

  try {
    var probe = NS + "__probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    hasLS = true;
  } catch (e) {
    hasLS = false;
  }

  AF.storageAvailable = function () { return hasLS; };

  AF.store = {
    /** Read a JSON value; returns `fallback` when missing or corrupt. */
    get: function (key, fallback) {
      var raw = hasLS ? window.localStorage.getItem(NS + key) : memory[key];
      if (raw === null || raw === undefined) return fallback;
      try { return JSON.parse(raw); }
      catch (e) { return fallback; }
    },

    /** Persist a JSON value. Returns true on success. */
    set: function (key, value) {
      var raw = JSON.stringify(value);
      if (hasLS) {
        try { window.localStorage.setItem(NS + key, raw); return true; }
        catch (e) { return false; }
      }
      memory[key] = raw;
      return true;
    },

    /** Remove a single key. */
    remove: function (key) {
      if (hasLS) window.localStorage.removeItem(NS + key);
      else delete memory[key];
    },

    /** Remove every AccessiForge key (used by “Reset progress”). */
    clearAll: function () {
      if (!hasLS) { memory = {}; return; }
      var doomed = [];
      for (var i = 0; i < window.localStorage.length; i++) {
        var k = window.localStorage.key(i);
        if (k && k.indexOf(NS) === 0) doomed.push(k);
      }
      doomed.forEach(function (k) { window.localStorage.removeItem(k); });
      memory = {};
    }
  };
})(window.AF = window.AF || {});
