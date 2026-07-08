/* ═══════════ Hero 头像粒子：从左聚合 → 粒子头像成形 → hover 扰动 ═══════════ */
/* 原图作为像素采样源，成形后再低透明叠回，canvas 负责粒子质感与 hover 扰动。 */
(function () {
  "use strict";

  var ALPHA = 120;
  function isBg(r, g, b, a) {
    if (a < ALPHA) return true;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return (mx + mn) / 2 > 205 && mx - mn < 42;
  }
  function colorFor(r, g, b) {
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var L = (mx + mn) / 2, S = mx - mn;
    var f;
    if (r >= g && g >= b && S > 26 && r > 70) {
      f = Math.max(0.82, Math.min(1.12, L / 132));
      return [Math.min(255, 238 * f) | 0, Math.min(255, 78 * f) | 0, Math.min(255, 28 * f) | 0];
    }
    f = Math.max(0.72, Math.min(1.12, L / 76));
    return [(18 * f) | 0, (15 * f) | 0, (13 * f) | 0];
  }

  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var rafId = null;

  function init() {
    var fig = document.querySelector(".portrait[data-portrait]");
    if (!fig) return;
    var media = fig.querySelector(".portrait__media");
    var img = fig.querySelector(".portrait__img");

    // Guard: if canvas already exists (VT re-nav same-page), do nothing
    if (fig.querySelector(".portrait__particles")) return;

    if (!media || !img) return;
    if (!img.complete || !img.naturalWidth) {
      img.addEventListener("load", init, { once: true });
      return;
    }

    // Kill any lingering animation loop
    if (rafId) cancelAnimationFrame(rafId);

    var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    // dpr capped at 1.5: at 2 the canvas is ~4M pixels and clearing+drawing it
    // every frame dominates scroll jank on mid-range machines.
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var EXT = 0.62;

    var canvas = document.createElement("canvas");
    canvas.className = "portrait__particles";
    canvas.setAttribute("aria-hidden", "true");
    // Positioning must be set inline: this canvas is created via JS and never
    // receives Astro's scoped-style attribute, so the scoped `.portrait__particles`
    // rule (position:absolute; z-index; pointer-events) does not apply to it.
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.zIndex = "2";
    canvas.style.pointerEvents = "none";
    fig.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    fig.classList.remove("is-base-visible");
    fig.classList.add("is-particle-ready");

    var boxW = 0, boxH = 0, extPx = 0, W = 0, H = 0;
    var particles = [];
    var TARGET = window.innerWidth < 760 ? 6000 : 12000;
    var t0 = 0, settleStart = 1600;
    var baseRevealStart = settleStart + 360;
    var baseVisible = false;
    var mouse = { x: -9999, y: -9999, on: false };

    function sample() {
      var nat = img.naturalWidth, natH = img.naturalHeight;
      // Offscreen buffer matches the on-screen box aspect ratio so particles
      // map 1:1 onto the media box.
      var sw = window.innerWidth < 760 ? 340 : 420;
      var sh = Math.max(1, Math.round(sw * (boxH / boxW)));
      var off = document.createElement("canvas");
      off.width = sw; off.height = sh;
      var octx = off.getContext("2d");
      // Replicate the static <img> object-fit: cover with object-position 50% 50%
      // so the particle avatar lines up pixel-for-pixel with the base image.
      var boxAR = sw / sh, imgAR = nat / natH, sx, sy, sWidth, sHeight;
      if (imgAR > boxAR) {
        sHeight = natH;
        sWidth = natH * boxAR;
        sx = (nat - sWidth) * 0.5;
        sy = 0;
      } else {
        sWidth = nat;
        sHeight = nat / boxAR;
        sx = 0;
        sy = (natH - sHeight) * 0.5;
      }
      octx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, sw, sh);
      var data = octx.getImageData(0, 0, sw, sh).data;
      var w2 = sw, h2 = sh;

      var subj = 0, i;
      for (i = 0; i < data.length; i += 4) {
        if (!isBg(data[i], data[i + 1], data[i + 2], data[i + 3])) subj++;
      }
      var step = Math.max(2, Math.round(Math.sqrt(subj / TARGET)));

      particles = [];
      for (var y = 0; y < h2; y += step) {
        for (var x = 0; x < w2; x += step) {
          var idx = (y * w2 + x) * 4;
          if (isBg(data[idx], data[idx + 1], data[idx + 2], data[idx + 3])) continue;
          var c = colorFor(data[idx], data[idx + 1], data[idx + 2]);
          var nx = x / w2, ny = y / h2;
          var drift = Math.max(0, (0.13 - nx) / 0.13);
          particles.push({
            nx: nx, ny: ny, r: c[0], g: c[1], b: c[2],
            drift: drift,
            life: Math.random(),
            phase: Math.random() * 6.28,
            size: 0.72 + Math.random() * 0.9,
            delay: nx * 640 + Math.random() * 240,
            dur: 760 + Math.random() * 460,
            x: 0, y: 0, tx: 0, ty: 0, sx: 0, sy: 0,
          });
        }
      }
      layoutTargets(true);
    }

    function measure() {
      var r = media.getBoundingClientRect();
      boxW = r.width; boxH = r.height;
      extPx = boxW * EXT;
      canvas.style.left = (-extPx) + "px";
      canvas.style.top = "0px";
      canvas.style.width = (boxW + extPx) + "px";
      canvas.style.height = boxH + "px";
      W = boxW + extPx; H = boxH;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function layoutTargets(first) {
      for (var k = 0; k < particles.length; k++) {
        var p = particles[k];
        p.tx = extPx + p.nx * boxW;
        p.ty = p.ny * boxH;
        if (first) {
          p.sx = extPx * (0.08 + Math.random() * 0.72);
          p.sy = p.ty + (Math.random() - 0.5) * 140;
          p.x = p.sx; p.y = p.sy;
        }
      }
    }

    function frame(now) {
      var elapsed = now - t0;
      if (!baseVisible && (reduce || elapsed >= baseRevealStart)) {
        fig.classList.remove("is-particle-ready");
        fig.classList.add("is-base-visible");
        baseVisible = true;
      }
      ctx.clearRect(0, 0, W, H);

      var time = now * 0.001;
      for (var k = 0; k < particles.length; k++) {
        var p = particles[k], a, px, py, hoverBoost = 0;
        if (!reduce && elapsed < settleStart) {
          var lp = (elapsed - p.delay) / p.dur;
          var prog = lp <= 0 ? 0 : lp >= 1 ? 1 : easeOut(lp);
          px = p.sx + (p.tx - p.sx) * prog;
          py = p.sy + (p.ty - p.sy) * prog;
          a = Math.max(0, Math.min(1, lp + 0.12));
        } else {
          a = 1;
          p.life += 0.006;
          if (p.life > 1) p.life -= 1;
          var k2 = p.life;
          px = p.tx - 10 * p.drift * k2 + Math.sin(time + p.phase) * 0.38;
          py = p.ty + Math.cos(time * 0.8 + p.phase) * 0.5;
          if (mouse.on) {
            var dx = px - mouse.x, dy = py - mouse.y, d2 = dx * dx + dy * dy;
            var hoverR = Math.max(115, Math.min(180, boxW * 0.2));
            if (d2 < hoverR * hoverR) {
              var d = Math.sqrt(d2) || 1;
              var hover = 1 - d / hoverR;
              hoverBoost = hover;
              var f = hover * 24;
              px += dx / d * f + Math.sin(time * 8 + p.phase) * hover * 4;
              py += dy / d * f + Math.cos(time * 7 + p.phase) * hover * 4;
              a = Math.max(a, Math.pow(hover, 0.72) * 0.94);
            }
          }
        }
        if (a <= 0.01) continue;
        ctx.fillStyle = "rgb(" + p.r + "," + p.g + "," + p.b + ")";
        var drawSize = p.size * (1 + hoverBoost * 0.75);
        // Glow pass only for hover-disturbed particles: doing it for all
        // particles doubles draw calls for an effect that reads as noise.
        if (hoverBoost > 0.01) {
          ctx.globalAlpha = a * 0.09;
          ctx.fillRect(px - 0.15, py - 0.15, drawSize + 0.3, drawSize + 0.3);
        }
        ctx.globalAlpha = a;
        ctx.fillRect(px, py, drawSize, drawSize);
      }
      ctx.globalAlpha = 1;
      if (!reduce) rafId = requestAnimationFrame(frame);
    }

    window.addEventListener("resize", function () {
      clearTimeout(window._particleResize);
      window._particleResize = setTimeout(function () { measure(); layoutTargets(false); }, 160);
    });
    window.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.on = mouse.x >= 0 && mouse.x <= W && mouse.y >= 0 && mouse.y <= H;
    });
    fig.addEventListener("pointerleave", function () { mouse.on = false; });
    var paused = false;
    function pauseLoop() {
      if (paused) return;
      paused = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }
    function resumeLoop() {
      if (!paused) return;
      paused = false;
      // Skip re-playing the entrance: resume in the settled/idle phase.
      t0 = performance.now() - (settleStart + 100);
      rafId = requestAnimationFrame(frame);
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pauseLoop();
      else if (isOnScreen) resumeLoop();
    });

    // Stop burning frames while the portrait is scrolled out of view —
    // this loop was previously running for the whole page lifetime.
    var isOnScreen = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        isOnScreen = entries[0].isIntersecting;
        if (!isOnScreen) pauseLoop();
        else if (!document.hidden) resumeLoop();
      }, { rootMargin: "80px" }).observe(fig);
    }

    measure();
    sample();
    t0 = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("astro:page-load", init);
})();
