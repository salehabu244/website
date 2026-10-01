/* =========================================================
   PieIt.net — main.js
   Navigation, scroll effects, reveal, counters, FAQ, back-to-top
   ========================================================= */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  var navList = document.querySelector(".nav-list");
  var navToggle = document.querySelector(".nav-toggle");
  var backdrop = document.querySelector(".nav-backdrop");

  /* Sticky header shadow + back-to-top */
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Mobile navigation */
  function closeNav() {
    if (navList) navList.classList.remove("open");
    if (backdrop) backdrop.classList.remove("open");
    document.body.style.overflow = "";
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }
  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      var open = navList.classList.toggle("open");
      if (backdrop) backdrop.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (backdrop) backdrop.addEventListener("click", closeNav);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* Mobile submenu toggles (top-level links that open dropdowns on desktop) */
  document.querySelectorAll(".nav-link[data-submenu]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (window.matchMedia("(max-width:1080px)").matches) {
        e.preventDefault();
        var item = link.closest(".nav-item");
        if (item) item.classList.toggle("open");
      }
    });
  });

  /* Reveal on scroll */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var delay = el.getAttribute("data-delay");
          if (delay) el.style.transitionDelay = delay + "ms";
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* Animated counters */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var ans = item.querySelector(".faq-a");
      var isOpen = item.classList.contains("open");
      item.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
      ans.style.maxHeight = isOpen ? null : ans.scrollHeight + "px";
    });
  });

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
