/* ═══════════ 最新文章 3D 封面流 ═══════════
   Covers float as bent paper sheets on a horizontal spiral (ref: spiral showreel).
   Drag / arrows / auto-play advance the focus; click opens the focused post.
   Progressive enhancement: without WebGL (or on mobile / reduced motion)
   the plain list below stays as-is. */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";

(function () {
  "use strict";

  var cleanup = null;

  function init() {
    var root = document.querySelector("[data-posts3d]");
    if (!root || root.dataset.ready) return;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    if (window.innerWidth < 860) return;

    var canvas = root.querySelector("[data-posts3d-canvas]");
    var dataEl = root.querySelector("[data-posts3d-data]");
    var linkEl = root.querySelector("[data-posts3d-link]");
    var metaEl = root.querySelector("[data-posts3d-meta]");
    var infoEl = root.querySelector(".posts3d__info");
    var posts;
    try { posts = JSON.parse(dataEl.textContent); } catch (e) { return; }
    if (!posts || posts.length < 2) return;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { return; }
    root.dataset.ready = "1";
    root.closest(".blog-section").classList.add("has-3d");

    var N = posts.length;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 2, 0.1, 60);
    camera.position.set(0, 0, 7.4);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

    /* Bent-paper card: vertex wave = page mid-flip feel */
    var geo = new THREE.PlaneGeometry(3.6, 1.9, 28, 6);
    var meshes = posts.map(function (post, i) {
      var mat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          uMap: { value: null },
          uHasMap: { value: 0 },
          uTime: { value: 0 },
          uPhase: { value: i * 1.7 },
          uBend: { value: 0.22 },
          uAlpha: { value: 1 },
          uTint: { value: new THREE.Color("#c9c0b2") },
        },
        vertexShader: [
          "uniform float uTime; uniform float uPhase; uniform float uBend;",
          "varying vec2 vUv;",
          "void main(){",
          "  vUv = uv; vec3 p = position;",
          "  p.z += sin(uv.x*3.1416 + uTime*1.1 + uPhase) * uBend;",
          "  p.z += sin(uv.y*2.4 + uTime*0.7 + uPhase*1.6) * uBend*0.45;",
          "  gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);",
          "}",
        ].join("\n"),
        fragmentShader: [
          "uniform sampler2D uMap; uniform float uAlpha; uniform float uHasMap; uniform vec3 uTint;",
          "varying vec2 vUv;",
          "void main(){",
          "  vec3 col = uHasMap > 0.5 ? texture2D(uMap, vUv).rgb : uTint;",
          "  gl_FragColor = vec4(col, uAlpha);",
          "}",
        ].join("\n"),
      });
      var mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      return mesh;
    });

    var loader = new THREE.TextureLoader();
    posts.forEach(function (post, i) {
      if (!post.cover) return;
      loader.load(post.cover, function (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        meshes[i].material.uniforms.uMap.value = tex;
        meshes[i].material.uniforms.uHasMap.value = 1;
      });
    });

    /* ── layout: horizontal spiral around the focus ── */
    var focus = 0, target = 0;
    function wrapT(i) {
      var t = i - focus;
      t -= Math.round(t / N) * N; // endless loop
      return t;
    }
    function layout(time) {
      for (var i = 0; i < N; i++) {
        var t = wrapT(i);
        var m = meshes[i];
        var a = Math.abs(t);
        m.position.x = t * 2.75;
        m.position.y = Math.sin(t * 0.82) * 1.15 + Math.sin(time * 0.5 + i) * 0.05;
        m.position.z = -a * 1.7;
        m.rotation.y = Math.max(-1.05, Math.min(1.05, -t * 0.34));
        m.rotation.z = Math.sin(t * 0.42) * 0.12;
        var s = Math.max(0.6, 1 - a * 0.07);
        m.scale.setScalar(s);
        m.material.uniforms.uAlpha.value = Math.max(0, 1 - a * 0.16);
        m.material.uniforms.uTime.value = time;
        m.renderOrder = -a;
      }
    }

    /* ── info bar ── */
    var shownIdx = -1;
    function mod(n) { return ((n % N) + N) % N; }
    function updateInfo() {
      var idx = mod(Math.round(target));
      if (idx === shownIdx) return;
      shownIdx = idx;
      infoEl.classList.add("is-switching");
      setTimeout(function () {
        var p = posts[idx];
        linkEl.textContent = p.title;
        linkEl.href = p.url;
        metaEl.textContent = p.date + (p.tags.length ? "  ·  " + p.tags.map(function (t) { return "#" + t; }).join(" ") : "");
        infoEl.classList.remove("is-switching");
      }, 200);
    }
    updateInfo();

    /* ── controls ── */
    function go(dir) { target += dir; updateInfo(); resetAuto(); }
    root.querySelector("[data-posts3d-prev]").addEventListener("click", function () { go(-1); });
    root.querySelector("[data-posts3d-next]").addEventListener("click", function () { go(1); });

    var dragging = false, dragX = 0, dragT0 = 0, moved = 0;
    canvas.addEventListener("pointerdown", function (e) {
      dragging = true; moved = 0; dragX = e.clientX; dragT0 = target;
      canvas.classList.add("is-dragging");
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragX;
      moved = Math.max(moved, Math.abs(dx));
      target = dragT0 - dx / 260;
    });
    canvas.addEventListener("pointerup", function (e) {
      dragging = false;
      canvas.classList.remove("is-dragging");
      if (moved < 6) {
        // treat as click: center third opens the post, sides navigate
        var r = canvas.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        if (x < 0.33) go(-1);
        else if (x > 0.67) go(1);
        else location.href = posts[mod(Math.round(target))].url;
        return;
      }
      target = Math.round(target);
      updateInfo(); resetAuto();
    });

    var auto = null;
    function resetAuto() {
      if (auto) clearInterval(auto);
      auto = setInterval(function () { target += 1; updateInfo(); }, 5000);
    }
    resetAuto();
    root.addEventListener("pointerenter", function () { if (auto) { clearInterval(auto); auto = null; } });
    root.addEventListener("pointerleave", function () { if (!dragging) resetAuto(); });

    /* ── sizing / loop / lifecycle ── */
    function resize() {
      var w = root.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    var raf = null, onScreen = true;
    function frame(now) {
      focus += (target - focus) * 0.075;
      layout(now * 0.001);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
    function run() { if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame); }
    run();

    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (!onScreen) stop(); else run();
    }, { rootMargin: "100px" }).observe(root);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else run();
    });

    cleanup = function () {
      stop();
      if (auto) clearInterval(auto);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      geo.dispose();
      meshes.forEach(function (m) {
        if (m.material.uniforms.uMap.value) m.material.uniforms.uMap.value.dispose();
        m.material.dispose();
      });
      cleanup = null;
    };
  }

  document.addEventListener("astro:before-swap", function () { if (cleanup) cleanup(); });
  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("astro:page-load", init);
})();

