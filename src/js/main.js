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
      if (!isValid) {
        e.preventDefault();
      }
    });
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => navLinks.classList.remove("open"));
    });
  }
});
