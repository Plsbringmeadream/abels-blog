/* ═══════════ Hero Pac-Man: follows the cursor, ghosts trail, eats pellets ═══════════ */
/* Active only inside #hero. Pac eases toward the pointer; ghosts chain-follow with a
   fixed spacing; pellets are scattered in the hero and respawn after being eaten. */
(function () {
  "use strict";

  function init() {
    var hero = document.getElementById("hero");
    var orbit = hero && hero.querySelector(".pac-orbit");
    if (!hero || !orbit) return;
    if (orbit.dataset.pacReady) return; // guard against View-Transitions re-init
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    orbit.dataset.pacReady = "1";

    var pac = orbit.querySelector(".pac-man");
    var ghosts = Array.prototype.slice.call(orbit.querySelectorAll(".pac-ghost"));
    if (!pac) return;

    var W = orbit.clientWidth, H = orbit.clientHeight;

    // Chain positions: index 0 is Pac-Man, the rest are ghosts.
    var pts = [{ x: W * 0.5, y: H * 0.6 }];
    ghosts.forEach(function () { pts.push({ x: W * 0.5, y: H * 0.6 }); });

    var prev = { x: pts[0].x, y: pts[0].y };
    var angle = 0;
    var mouse = { x: W * 0.5, y: H * 0.5, active: false };
    var SPACING = 30;   // px gap kept between each chain link
    var EASE = 0.16;    // how quickly Pac catches the cursor
    var TRAIL = 0.4;    // how quickly ghosts close the gap

    // ── Pellets ──
    var PELLET_COUNT = 10, EAT_DIST = 22, RESPAWN_MS = 1500;
    var pellets = [];
    function randPos() {
      return { x: 40 + Math.random() * (Math.max(120, W) - 80),
               y: 40 + Math.random() * (Math.max(120, H) - 80) };
    }
    for (var i = 0; i < PELLET_COUNT; i++) {
      var el = document.createElement("span");
      el.className = "pac-pellet";
      var p = randPos();
      el.style.left = p.x + "px";
      el.style.top = p.y + "px";
      orbit.appendChild(el);
      pellets.push({ el: el, x: p.x, y: p.y, eaten: false });
    }
    function respawn(pel) {
      var p = randPos();
      pel.x = p.x; pel.y = p.y; pel.eaten = false;
      pel.el.style.left = p.x + "px";
      pel.el.style.top = p.y + "px";
      pel.el.classList.remove("eaten");
    }

    // ── Pointer tracking (hero-relative, only while inside the hero) ──
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    });
    hero.addEventListener("pointerleave", function () { mouse.active = false; });

    function render() {
      pac.style.transform =
        "translate(" + (pts[0].x - 15) + "px," + (pts[0].y - 15) + "px) rotate(" + angle + "rad)";
      for (var g = 0; g < ghosts.length; g++) {
        ghosts[g].style.transform =
          "translate(" + (pts[g + 1].x - 14) + "px," + (pts[g + 1].y - 15) + "px)";
      }
    }

    window.addEventListener("resize", function () {
      W = orbit.clientWidth; H = orbit.clientHeight;
    });

    var raf = null;
    function frame() {
      var lead = pts[0];
      if (mouse.active) {
        lead.x += (mouse.x - lead.x) * EASE;
        lead.y += (mouse.y - lead.y) * EASE;
      }
      var dx = lead.x - prev.x, dy = lead.y - prev.y;
      if (Math.abs(dx) + Math.abs(dy) > 0.35) angle = Math.atan2(dy, dx);
      prev.x = lead.x; prev.y = lead.y;

      // Ghosts trail behind, keeping SPACING from the link ahead.
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i];
        var gx = a.x - b.x, gy = a.y - b.y;
        var d = Math.sqrt(gx * gx + gy * gy) || 1;
        if (d > SPACING) {
          var t = ((d - SPACING) / d) * TRAIL;
          b.x += gx * t; b.y += gy * t;
        }
      }

      render();

      // Eat pellets Pac passes over.
      for (var k = 0; k < pellets.length; k++) {
        var pel = pellets[k];
        if (pel.eaten) continue;
        var ex = pts[0].x - pel.x, ey = pts[0].y - pel.y;
        if (ex * ex + ey * ey < EAT_DIST * EAT_DIST) {
          pel.eaten = true;
          pel.el.classList.add("eaten");
          setTimeout(respawn.bind(null, pel), RESPAWN_MS);
        }
      }

      raf = requestAnimationFrame(frame);
    }

    render();
    orbit.classList.add("is-ready");
    raf = requestAnimationFrame(frame);

    var heroVisible = true;
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    function go() { if (!raf) raf = requestAnimationFrame(frame); }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (heroVisible) go();
    });

    // Pause the chase loop while the hero section is scrolled out of view.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        if (!heroVisible) stop();
        else if (!document.hidden) go();
      }, { rootMargin: "60px" }).observe(hero);
    }
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("astro:page-load", init);
})();
