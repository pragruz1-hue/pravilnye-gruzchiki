/* Blog index — bento filter chips + live search + deep links (#rub-<tag>) */
(function () {
  "use strict";

  var chips = Array.prototype.slice.call(document.querySelectorAll(".b-chip"));
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".bento .tile[data-tag]"));
  var search = document.getElementById("blog-search-input");
  var empty = document.querySelector(".b-empty");

  if (!tiles.length) return;

  var activeTag = "all";

  function norm(s) {
    return (s || "").toLowerCase().replace(/ё/g, "е");
  }

  function apply() {
    var q = norm(search && search.value).trim();
    var visible = 0;

    tiles.forEach(function (tile) {
      var okTag = activeTag === "all" || tile.getAttribute("data-tag") === activeTag;
      var hay = norm(tile.getAttribute("data-text") || tile.textContent);
      var okQuery = !q || hay.indexOf(q) !== -1;
      var show = okTag && okQuery;
      tile.classList.toggle("is-hidden", !show);
      if (show) visible++;
    });

    if (empty) empty.classList.toggle("on", visible === 0);
  }

  function selectChip(chip, pushHash) {
    chips.forEach(function (c) {
      var on = c === chip;
      c.classList.toggle("on", on);
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
    activeTag = chip.getAttribute("data-f") || "all";
    if (pushHash !== false && window.history && history.replaceState) {
      history.replaceState(null, "", activeTag === "all" ?
        location.pathname : location.pathname + "#rub-" + activeTag);
    }
    apply();
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () { selectChip(chip); });
  });

  /* deep link: index.html#rub-<tag> preselects the rubric (e.g. from an article) */
  function applyHash() {
    var m = (location.hash || "").match(/^#rub-([a-z]+)$/);
    if (!m) return;
    var target = null;
    chips.forEach(function (c) {
      if (c.getAttribute("data-f") === m[1]) target = c;
    });
    if (target) selectChip(target, false);
  }
  applyHash();
  window.addEventListener("hashchange", applyHash);

  if (search) {
    search.addEventListener("input", apply);
    search.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { search.value = ""; apply(); }
    });
  }

  if (empty) {
    var resetBtn = empty.querySelector("button");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (search) search.value = "";
        var all = null;
        chips.forEach(function (c) {
          if (c.getAttribute("data-f") === "all") all = c;
        });
        if (all) selectChip(all);
      });
    }
  }
})();
