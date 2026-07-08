/* ═══════════ Build 场景：键盘自动敲击，屏幕启动后进入复古桌面壁纸 ═══════════
   Timeline: keys tap automatically → terminal lines type out → progress bar
   fills → screen transitions to a warm retro desktop wallpaper.
   Click the screen → /blog. Hover → light parallax. Hidden below 1100px. */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

(function () {
  "use strict";

  var COL = {
    paper: "#F4EFE6", ink: "#1A1714", frame: 0x2f2a24, screenDark: "#1c1814",
    accent: "#F0652E", accentHex: 0xf0652e, skin: 0xf0c49b,
    kb: 0xe9e2d3, key: 0xc9c0b2, dim: "#9a938a", lit: "#e8e0d0",
  };
  var LINES = [
    "$ npm run blog",
    "starting Abel's Blog...",
    "loading latest notes...",
    "building homepage...",
    "ready.",
  ];
  var TOTAL_CHARS = LINES.join("").length;

  var cleanup = null;

  function init() {
    var root = document.querySelector("[data-buildscene]");
    if (!root || root.dataset.ready) return;
    if (window.innerWidth < 1100) return;
    var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    var canvas = root.querySelector("[data-buildscene-canvas]");
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { return; }
    root.dataset.ready = "1";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(34, 1.25, 0.1, 50);
    camera.position.set(0, 1.55, 8.6);
    camera.lookAt(0, 1.25, 0.4);

    scene.add(new THREE.AmbientLight(0xfff6ea, 0.95));
    var sun = new THREE.DirectionalLight(0xffffff, 0.75);
    sun.position.set(2.5, 5, 4);
    scene.add(sun);

    var group = new THREE.Group();
    scene.add(group);

    var mats = [], geos = [];
    function lambert(color) { var m = new THREE.MeshLambertMaterial({ color: color }); mats.push(m); return m; }
    function box(w, h, d, color, x, y, z, parent) {
      var g = new THREE.BoxGeometry(w, h, d); geos.push(g);
      var mesh = new THREE.Mesh(g, lambert(color));
      mesh.position.set(x, y, z);
      (parent || group).add(mesh);
      return mesh;
    }

    /* ── monitor ── */
    box(4.5, 3.0, 0.26, COL.frame, 0, 2.1, 0);
    box(0.42, 0.52, 0.22, COL.frame, 0, 0.36, -0.05);
    box(1.7, 0.12, 0.95, COL.frame, 0, 0.08, 0.05);
    var led = box(0.1, 0.06, 0.03, 0x6b6258, 2.0, 0.72, 0.15);

    /* screen = CanvasTexture, terminal → blog preview */
    var off = document.createElement("canvas");
    off.width = 512; off.height = 320;
    var octx = off.getContext("2d");
    var tex = new THREE.CanvasTexture(off);
    tex.colorSpace = THREE.SRGBColorSpace;
    var sg = new THREE.PlaneGeometry(4.02, 2.52); geos.push(sg);
    var screenMat = new THREE.MeshBasicMaterial({ map: tex }); mats.push(screenMat);
    var screen = new THREE.Mesh(sg, screenMat);
    screen.position.set(0, 2.1, 0.14);
    group.add(screen);

    /* ── keyboard ── */
    var kbGroup = new THREE.Group();
    kbGroup.position.set(0, 0.14, 1.62);
    kbGroup.rotation.x = -0.06;
    group.add(kbGroup);
    box(3.7, 0.14, 1.15, COL.kb, 0, 0, 0, kbGroup);
    var keys = [];
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 10; c++) {
        var k = box(0.26, 0.09, 0.26, COL.key, -1.55 + c * 0.345 + (r % 2) * 0.09, 0.11, -0.33 + r * 0.33, kbGroup);
        keys.push(k);
      }
    }
    var KEY_Y = 0.11;

    /* ── screen painting ── */
    function drawTerminal(chars, time) {
      octx.fillStyle = COL.screenDark;
      octx.fillRect(0, 0, 512, 320);
      octx.font = "20px ui-monospace, Menlo, Consolas, monospace";
      octx.textBaseline = "top";
      var left = 34, y = 30, shown = 0, lastX = left, lastY = y;
      for (var i = 0; i < LINES.length; i++) {
        var line = LINES[i];
        var take = Math.max(0, Math.min(line.length, chars - shown));
        var part = line.slice(0, take);
        if (i === 0) {
          octx.fillStyle = COL.accent;
          octx.fillText(part.slice(0, 1), left, y);
          octx.fillStyle = COL.lit;
          octx.fillText(part.slice(1), left + 14, y);
        } else {
          octx.fillStyle = i === LINES.length - 1 ? COL.accent : COL.dim;
          octx.fillText(part, left, y);
        }
        if (take > 0) { lastX = left + octx.measureText(part).width + (i === 0 ? 2 : 0); lastY = y; }
        shown += line.length;
        if (chars <= shown) break;
        y += 36;
      }
      if (time % 0.9 < 0.5) { // block cursor
        octx.fillStyle = COL.accent;
        octx.fillRect(lastX + 6, lastY + 1, 11, 20);
      }
      var pct = Math.min(1, chars / TOTAL_CHARS);
      octx.strokeStyle = "#57503f"; octx.lineWidth = 2;
      octx.strokeRect(34, 272, 380, 16);
      octx.fillStyle = COL.accent;
      octx.fillRect(37, 275, 374 * pct, 10);
      octx.font = "16px ui-monospace, monospace";
      octx.fillText(Math.round(pct * 100) + "%", 430, 272);
      tex.needsUpdate = true;
    }

    function drawFinal() {
      // Load the local desktop wallpaper
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        octx.drawImage(img, 0, 0, 512, 320);
        tex.needsUpdate = true;
      };
      img.onerror = function () {
        // Fallback: solid warm color if wallpaper fails to load
        octx.fillStyle = "#d4c4a8";
        octx.fillRect(0, 0, 512, 320);
        tex.needsUpdate = true;
      };
      img.src = "/assets/wallpaper.jpg";
    }

    /* ── timeline state ── */
    var phase = reduce ? "final" : "typing";
    var chars = 0, doneTime = 0, restEase = 1;
    var presses = [], pressTimer = 0;

    function pressRandomKey(side) {
      var pool = keys.filter(function (k) { return side < 0 ? k.position.x < 0 : k.position.x >= 0; });
      var k = pool[(Math.random() * pool.length) | 0];
      presses.push({ mesh: k, t0: performance.now() });
    }

    /* ── interaction: parallax + click screen ── */
    var ray = new THREE.Raycaster();
    var ptr = new THREE.Vector2();
    var targetRX = 0, targetRY = 0, hoverScreen = false;
    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      var ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      targetRY = nx * 0.13;
      targetRX = -ny * 0.06;
      ptr.set(nx, -ny);
      ray.setFromCamera(ptr, camera);
      hoverScreen = ray.intersectObject(screen).length > 0;
      canvas.style.cursor = hoverScreen ? "pointer" : "default";
    });
    canvas.addEventListener("pointerleave", function () { targetRX = targetRY = 0; hoverScreen = false; });
    canvas.addEventListener("click", function () {
      if (hoverScreen || reduce) location.href = "/blog";
    });

    /* ── sizing / loop ── */
    function resize() {
      var w = root.clientWidth || 500;
      renderer.setSize(w, w * 0.8, false);
    }
    resize();
    window.addEventListener("resize", resize);

    var raf = null, onScreenIO = true, last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var t = now * 0.001;

      if (phase === "typing") {
        chars += dt * 15;
        drawTerminal(Math.floor(chars), t);
        if (chars >= TOTAL_CHARS) { phase = "done"; doneTime = t; }
      } else if (phase === "done" && t - doneTime > 0.7) {
        phase = "final";
        drawFinal();
      }

      // auto key presses: random key taps while typing, slow down after
      var typing = phase === "typing" || phase === "done";
      restEase += ((typing ? 1 : 0) - restEase) * 0.04;
      pressTimer -= dt;
      if (pressTimer <= 0 && restEase > 0.1) {
        pressRandomKey(Math.random() < 0.5 ? -1 : 1);
        pressTimer = 0.12 + Math.random() * 0.14;
        if (!typing) pressTimer = 0.3 + Math.random() * 0.4; // slow down after done
      }

      // key presses spring back
      for (var p = presses.length - 1; p >= 0; p--) {
        var age = now - presses[p].t0;
        if (age > 240) { presses[p].mesh.position.y = KEY_Y; presses.splice(p, 1); }
        else presses[p].mesh.position.y = KEY_Y - 0.05 * Math.sin(Math.PI * age / 240);
      }

      // LED turns accent once running
      if (chars > 3) led.material.color.setHex(COL.accentHex);

      // parallax + float
      group.rotation.y += (targetRY - group.rotation.y) * 0.06;
      group.rotation.x += (targetRX - group.rotation.x) * 0.06;
      group.position.y = Math.sin(t * 0.85) * 0.05;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    function run() { if (!raf && onScreenIO && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }

    if (reduce) {
      drawFinal();
      renderer.render(scene, camera);
    } else {
      drawTerminal(0, 0);
      run();
    }

    new IntersectionObserver(function (entries) {
      onScreenIO = entries[0].isIntersecting;
      if (!onScreenIO) stop(); else if (!reduce) run();
    }, { rootMargin: "100px" }).observe(root);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else if (!reduce) run();
    });

    cleanup = function () {
      stop();
      window.removeEventListener("resize", resize);
      tex.dispose();
      geos.forEach(function (g) { g.dispose(); });
      mats.forEach(function (m) { m.dispose(); });
      renderer.dispose();
      cleanup = null;
    };
  }

  document.addEventListener("astro:before-swap", function () { if (cleanup) cleanup(); });
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("astro:page-load", init);
})();

