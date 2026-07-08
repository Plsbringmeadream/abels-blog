/* ═══════════ Abel's Blog — 交互与动效 ═══════════ */
/* 适配当前页面结构: hero → writing(blog-section) → build → contact */

const reduceMotion = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
const hasGSAP = typeof window.gsap !== "undefined";

function initAnimations() {
  if (!hasGSAP || reduceMotion) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ── ① Landing 入场: 文字逐行浮现 ── */
  const heroItems = gsap.utils.toArray("#hero [data-reveal]");
  if (heroItems.length) {
    gsap.set(heroItems, { opacity: 0, y: 20 });
    gsap.to(heroItems, {
      opacity: 1, y: 0, duration: 1, ease: "power3.out",
      stagger: 0.14, delay: 0.25,
    });
  }

  /* ── ② 后续区块: 滚动进入时内容逐项浮现 ── */
  ["#writing", "#build", "#contact"].forEach((sel) => {
    const section = document.querySelector(sel);
    const items = gsap.utils.toArray(sel + " [data-reveal]");
    if (!section || !items.length) return;
    gsap.set(items, { opacity: 0, y: 30 });
    gsap.to(items, {
      opacity: 1, y: 0, duration: 1.4, ease: "power3.out", stagger: 0.2,
      scrollTrigger: { trigger: section, start: "top 76%" },
    });
  });

  /* ── ③ 平滑滚动 ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); }
    });
  });
}

// First paint
document.addEventListener("DOMContentLoaded", initAnimations);
// View Transitions navigation
document.addEventListener("astro:page-load", initAnimations);
