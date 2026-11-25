document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  const alwaysWhite = navbar.dataset.alwaysWhite === "true";

  const onScroll = () => {
    if (alwaysWhite || window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };

  onScroll();
  window.addEventListener("scroll", onScroll);

  const sections = document.querySelectorAll("section[id]");
  const anchorLinks = document.querySelectorAll(".nav-links a:not(.nav-cta)");
  const homeLink = document.querySelector('.nav-links a[href="index.html"]');

  if (sections.length && anchorLinks.length) {
    const onSectionScroll = () => {
      const scrollPos = window.scrollY + 160;
      let activeId = null;

      sections.forEach((section) => {
        if (section.offsetTop <= scrollPos) {
          activeId = section.id;
        }
      });

      anchorLinks.forEach((link) => link.classList.remove("active"));

      if (activeId) {
        const match = document.querySelector(`.nav-links a[href$="#${activeId}"]`);
        if (match) match.classList.add("active");
      } else if (homeLink) {
        homeLink.classList.add("active");
      }
    };

    onSectionScroll();
    window.addEventListener("scroll", onSectionScroll);
  }

  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      const isHomePage = /(^|\/)index\.html$/.test(window.location.pathname) || window.location.pathname.endsWith("/");
      if (isHomePage) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.setAttribute("novalidate", "");

    const clearError = (field) => {
      field.classList.remove("has-error");
      const msg = field.parentElement.querySelector(".field-error-text");
      if (msg) msg.remove();
    };

    const showError = (field, message) => {
      field.classList.add("has-error");
      let msg = field.parentElement.querySelector(".field-error-text");
      if (!msg) {
        msg = document.createElement("span");
        msg.className = "field-error-text";
        field.parentElement.appendChild(msg);
      }
      msg.textContent = message;
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneAllowedPattern = /^[0-9+\-\s()]+$/;

    const validateField = (field) => {
      if (field.validity.valid) {
        if (field.type === "email" && field.value && !emailPattern.test(field.value)) {
          showError(field, "Geben Sie eine gültige E-Mail-Adresse ein.");
          return false;
        }
        if (field.type === "tel" && field.value) {
          const digitCount = (field.value.match(/\d/g) || []).length;
          if (!phoneAllowedPattern.test(field.value)) {
            showError(field, "Geben Sie eine gültige Telefonnummer ein.");
            return false;
          }
          if (digitCount < 9) {
            showError(field, "Die Telefonnummer muss mindestens 9 Ziffern enthalten.");
            return false;
          }
        }
        clearError(field);
        return true;
      }
      let message = "Dieses Feld ist erforderlich.";
      if (field.validity.typeMismatch && field.type === "email") {
        message = "Geben Sie eine gültige E-Mail-Adresse ein.";
      } else if (field.validity.valueMissing && field.tagName === "SELECT") {
        message = "Bitte wählen Sie eine Option aus.";
      }
      showError(field, message);
      return false;
    };

    contactForm.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("input", () => {
        if (field.classList.contains("has-error")) validateField(field);
      });
      field.addEventListener("change", () => {
        if (field.classList.contains("has-error")) validateField(field);
      });
    });

    contactForm.addEventListener("submit", (e) => {
      let isValid = true;
      contactForm.querySelectorAll("input, select, textarea").forEach((field) => {
        if (!validateField(field)) isValid = false;
      });
      e.preventDefault();
      if (!isValid) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Wird gesendet…";

      let status = contactForm.querySelector(".form-status");
      if (!status) {
        status = document.createElement("p");
        status.className = "form-status";
        status.setAttribute("role", "status");
        contactForm.appendChild(status);
      }
      status.textContent = "";
      status.classList.remove("success", "error");

      fetch(contactForm.action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Formspree error");
          contactForm.reset();
          status.classList.add("success");
          status.textContent = "Vielen Dank! Ihre Nachricht wurde gesendet. Wir melden uns bald bei Ihnen.";
        })
        .catch(() => {
          status.classList.add("error");
          status.textContent = "Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie an info@bess-immo.ch.";
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navLinks.classList.remove("open"));
    });

    const closeOnOutside = (e) => {
      if (!navLinks.classList.contains("open")) return;
      if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
      navLinks.classList.remove("open");
    };
    document.addEventListener("click", closeOnOutside);
    document.addEventListener("touchstart", closeOnOutside, { passive: true });
  }

  // Sanftes Einblenden beim Scrollen
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const gridSelector = ".cards-grid, .team-grid, .footer-grid";
    const targets = new Set();
    const delays = new Map();

    document.querySelectorAll(".section .container, .cta-banner .container").forEach((container) => {
      Array.from(container.children).forEach((child) => {
        if (child.matches(gridSelector)) return;
        targets.add(child);
      });
    });
    document.querySelectorAll(gridSelector).forEach((grid) => {
      Array.from(grid.children).forEach((child, i) => {
        targets.add(child);
        delays.set(child, i * 120);
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => {
      el.classList.add("reveal");
      if (delays.has(el)) el.style.transitionDelay = delays.get(el) + "ms";
      observer.observe(el);
    });
  }
});
