(() => {
  const STATE = new WeakMap();

  function setupHero(root) {
    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const panels = Array.from(root.querySelectorAll("[data-hero-panel]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    const prevBtn = root.querySelector("[data-hero-prev]");
    const nextBtn = root.querySelector("[data-hero-next]");

    if (!slides.length) return;

    // Limpieza de init previa (timer + listeners)
    const prevState = STATE.get(root);
    if (prevState) {
      if (prevState.timer) clearInterval(prevState.timer);
      if (prevState.abort) prevState.abort.abort();
    }

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const autoplay = root.getAttribute("data-autoplay") !== "false";
    const interval = Number(root.getAttribute("data-interval") || "6500");

    const abort = new AbortController();
    const state = {
      timer: null,
      index: 0,
      abort,
    };
    STATE.set(root, state);

    const setActive = (next) => {
      if (!slides.length) return;
      state.index = (next + slides.length) % slides.length;

      slides.forEach((el, i) => {
        el.classList.toggle("opacity-100", i === state.index);
        el.classList.toggle("opacity-0", i !== state.index);
      });

      panels.forEach((el, i) => {
        el.classList.toggle("opacity-100", i === state.index);
        el.classList.toggle("opacity-0", i !== state.index);
        el.classList.toggle("pointer-events-none", i !== state.index);
      });

      dotsRef.forEach((el, i) => {
        el.setAttribute("aria-selected", i === state.index ? "true" : "false");
        el.classList.toggle("scale-110", i === state.index);
        el.classList.toggle("bg-white", i === state.index);
        el.classList.toggle("bg-white/40", i !== state.index);
      });
    };

    const stop = () => {
      if (state.timer) clearInterval(state.timer);
      state.timer = null;
    };

    const start = () => {
      if (!autoplay || reduceMotion || slides.length <= 1) return;
      stop();
      state.timer = setInterval(() => {
        setActive(state.index + 1);
      }, Math.max(2000, interval));
    };

    // Rebind seguro: clonar botones y dots para borrar listeners previos
    const safeRebind = (el) => {
      if (!el) return null;
      const clone = el.cloneNode(true);
      el.replaceWith(clone);
      return clone;
    };

    const prevSafe = safeRebind(prevBtn);
    const nextSafe = safeRebind(nextBtn);

    dots.forEach((d) => safeRebind(d));
    const dotsRef = Array.from(root.querySelectorAll("[data-hero-dot]"));

    // Reset visual fuerte (evita estados inconsistentes al volver con ClientRouter)
    slides.forEach((el, i) => {
      el.classList.remove("opacity-100", "opacity-0");
      el.classList.add(i === 0 ? "opacity-100" : "opacity-0");
    });

    panels.forEach((el, i) => {
      el.classList.remove("opacity-100", "opacity-0", "pointer-events-none");
      el.classList.add(i === 0 ? "opacity-100" : "opacity-0");
      if (i !== 0) el.classList.add("pointer-events-none");
    });

    dotsRef.forEach((el, i) => {
      el.setAttribute("aria-selected", i === 0 ? "true" : "false");
      el.classList.toggle("scale-110", i === 0);
      el.classList.toggle("bg-white", i === 0);
      el.classList.toggle("bg-white/40", i !== 0);
    });

    if (prevSafe) {
      prevSafe.addEventListener(
        "click",
        () => {
          setActive(state.index - 1);
          start();
        },
        { signal: abort.signal }
      );
    }

    if (nextSafe) {
      nextSafe.addEventListener(
        "click",
        () => {
          setActive(state.index + 1);
          start();
        },
        { signal: abort.signal }
      );
    }

    dotsRef.forEach((btn) => {
      btn.addEventListener(
        "click",
        () => {
          const n = Number(btn.getAttribute("data-index") || "0");
          setActive(n);
          start();
        },
        { signal: abort.signal }
      );
    });

    // Listeners del root con cleanup automático
    root.addEventListener("mouseenter", stop, { signal: abort.signal });
    root.addEventListener("mouseleave", start, { signal: abort.signal });

    root.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "ArrowLeft") {
          setActive(state.index - 1);
          start();
        }
        if (e.key === "ArrowRight") {
          setActive(state.index + 1);
          start();
        }
      },
      { signal: abort.signal }
    );

    // Importante: defer 1 frame para asegurar DOM ya pintado tras ClientRouter swap
    requestAnimationFrame(() => {
      setActive(0);
      start();
    });
  }

  function initAllHeros() {
    document.querySelectorAll("[data-hero]").forEach((root) => setupHero(root));
  }

  //Con ClientRouter, usa solo page-load para evitar doble init
  document.addEventListener("astro:page-load", initAllHeros);

  // Fallback carga inicial sin ClientRouter
  if (document.readyState !== "loading") initAllHeros();
  else document.addEventListener("DOMContentLoaded", initAllHeros);
})();