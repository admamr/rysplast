// ===== DOM ready =====
(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    // ---------- Header solid on scroll ----------
    const header = document.getElementById("siteHeader");
    const onScroll = () => {
      if (!header) return;
      window.scrollY > 24
        ? header.classList.add("header--solid")
        : header.classList.remove("header--solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll);

    // ---------- Mobile menu ----------
    const menuBtn = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    menuBtn?.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("hidden") === false;
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    mobileMenu?.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        menuBtn?.setAttribute("aria-expanded", "false");
      })
    );
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) {
        mobileMenu?.classList.add("hidden");
        menuBtn?.setAttribute("aria-expanded", "false");
      }
    });

    // ---------- Footer year ----------
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    // ---------- Newsletter (MVP) ----------
    document
      .getElementById("newsletterForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = /** @type {HTMLInputElement} */ (
          document.getElementById("newsletterEmail")
        ).value.trim();
        const ok = document.getElementById("newsletterSuccess");
        const err = document.getElementById("newsletterError");
        ok?.classList.add("hidden");
        err?.classList.add("hidden");
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!valid) {
          err?.classList.remove("hidden");
          err.textContent = "כתובת אימייל לא תקינה.";
          return;
        }
        // TODO: send to provider
        ok?.classList.remove("hidden");
        /** @type {HTMLFormElement} */ (e.currentTarget).reset();
      });

    // ---------- Clients carousel (true seamless loop) ----------
    const wrap = document.getElementById("logoMarquee");
    const track = document.getElementById("logoTrack");
    if (!wrap || !track) return;

    const SPEED_DESKTOP = 60; // px/sec
    const SPEED_MOBILE = 36;
    let speed = window.innerWidth < 640 ? SPEED_MOBILE : SPEED_DESKTOP;

    // Duplicate content once for seamless effect (guard)
    if (!track.dataset.cloned) {
      track.innerHTML += track.innerHTML;
      track.dataset.cloned = "true";
    }

    let x = 0,
      last = performance.now(),
      paused = false,
      running = false,
      oneSetWidth = 0;

    function measureOneSetWidth() {
      const kids = Array.from(track.children);
      const half = kids.length / 2;
      const gap = parseFloat(getComputedStyle(track).gap || "0") || 0;
      let total = 0;
      for (let i = 0; i < half; i++) {
        total += kids[i].getBoundingClientRect().width;
        if (i < half - 1) total += gap;
      }
      oneSetWidth = total || track.scrollWidth / 2;
    }

    function animate(now) {
      if (!running) return;
      const dt = (now - last) / 1000;
      if (!paused) {
        x -= speed * dt;
        if (-x >= oneSetWidth) x += oneSetWidth; // wrap seamlessly
        track.style.transform = `translate3d(${x}px,0,0)`;
      }
      last = now;
      requestAnimationFrame(animate);
    }

    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(animate);
    }

    // Start after images load (correct widths), and ASAP for cached images
    const imgs = Array.from(track.querySelectorAll("img"));
    Promise.all(
      imgs.map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((r) => (img.onload = img.onerror = r))
      )
    ).then(() => {
      measureOneSetWidth();
      start();
    });
    measureOneSetWidth();
    start();

    // Pause on hover
    wrap.addEventListener("mouseenter", () => (paused = true));
    wrap.addEventListener("mouseleave", () => (paused = false));

    // Recompute on resize
    window.addEventListener("resize", () => {
      speed = window.innerWidth < 640 ? SPEED_MOBILE : SPEED_DESKTOP;
      measureOneSetWidth();
    });
  }
})();
