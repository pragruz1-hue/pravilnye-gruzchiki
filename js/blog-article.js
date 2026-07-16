/* Blog article — reading progress ring + copy-link button for the sticky rail */
(function () {
  "use strict";

  var ring = document.querySelector(".rail .ring");
  var copyBtn = document.querySelector(".rail [data-copy]");

  /* reading progress ring */
  if (ring) {
    var ticking = false;
    var update = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? Math.min(100, Math.round((h.scrollTop / max) * 100)) : 0;
      ring.style.setProperty("--p", p);
      ring.setAttribute("data-p", p + "%");
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* copy article link */
  if (copyBtn) {
    var note = document.querySelector(".rail .copied-note");
    copyBtn.addEventListener("click", function () {
      var url = copyBtn.getAttribute("data-copy") || location.href;
      var done = function () {
        if (note) {
          note.classList.add("on");
          setTimeout(function () { note.classList.remove("on"); }, 1600);
        }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(done);
      } else {
        var ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });
  }
})();
