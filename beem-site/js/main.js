/* beem — shared behaviour: nav, scroll reveal, shade pickers */
(function () {
  "use strict";

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Header shadow on scroll
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile menu
  var toggle = document.querySelector(".nav__toggle");
  var links = document.querySelector(".nav__links");
  if (toggle && links) {
    var close = function () {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("is-open");
    };
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("is-open", !open);
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    window.matchMedia("(min-width: 901px)").addEventListener("change", close);
  }

  // Scroll reveal
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Shade pickers (shop page): update the shade label + waitlist link
  document.querySelectorAll("[data-shade-group]").forEach(function (group) {
    var product = group.getAttribute("data-product");
    var label = group.querySelector(".shade-name strong");
    var cta = group.querySelector("[data-waitlist-link]");

    function update() {
      var checked = group.querySelector('input[type="radio"]:checked');
      if (!checked) return;
      var shade = checked.value;
      if (label) label.textContent = shade;
      if (cta) {
        cta.href = "waitlist.html?product=" + encodeURIComponent(product) +
                   "&shade=" + encodeURIComponent(shade);
      }
    }
    group.addEventListener("change", update);
    update();
  });
})();
