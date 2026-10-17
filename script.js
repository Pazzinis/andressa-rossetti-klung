document.documentElement.classList.add("js");
document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");
let menuCloseAnimation = null;

function closeMenu({ restoreFocus = false, immediate = false } = {}) {
  if (!menu.classList.contains("open")) {
    if (immediate && menu.classList.contains("closing")) {
      menuCloseAnimation?.cancel();
      menuCloseAnimation = null;
      menu.classList.remove("closing");
      menu.inert = false;
    }
    return;
  }
  const currentOpacity = getComputedStyle(menu).opacity;
  menu.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
  menu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  if (!immediate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    menu.classList.add("closing");
    menu.inert = true;
    menuCloseAnimation = menu.animate(
      [
        { opacity: currentOpacity, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-14px)" },
      ],
      { duration: 250, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" },
    );
    menuCloseAnimation.finished.then(() => {
      menu.classList.remove("closing");
      menuCloseAnimation = null;
    }).catch(() => {});
  } else {
    menu.classList.remove("closing");
    menu.inert = false;
  }
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener("click", () => {
  if (menu.classList.contains("open")) {
    closeMenu();
    return;
  }
  menuCloseAnimation?.cancel();
  menuCloseAnimation = null;
  menu.classList.remove("closing");
  menu.inert = false;
  menu.classList.add("open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Fechar menu");
});

menu.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu.classList.contains("open")) {
    closeMenu({ restoreFocus: true });
  }
});
document.addEventListener("click", (event) => {
  if (!menu.contains(event.target) && !menuToggle.contains(event.target))
    closeMenu();
});
window
  .matchMedia("(min-width: 1101px)")
  .addEventListener("change", () => closeMenu({ immediate: true }));

const galleryButtons = [...document.querySelectorAll(".space-open")];
const gallery = document.querySelector(".gallery-dialog");
const galleryImage = document.getElementById("gallery-image");
const galleryCaption = document.getElementById("gallery-caption");
const galleryCount = document.querySelector(".gallery-count");
const galleryClose = document.querySelector(".gallery-close");
const galleryStage = document.querySelector(".gallery-stage");
let galleryIndex = 0;
let galleryTrigger = null;
let previousOverflow = "";
let touchStart = null;

function showPhoto(index) {
  galleryIndex = (index + galleryButtons.length) % galleryButtons.length;
  const figure = galleryButtons[galleryIndex].closest("figure");
  const image = figure.querySelector("img");
  galleryImage.src = image.getAttribute("src");
  galleryImage.alt = image.alt;
  galleryCaption.textContent = figure.querySelector("figcaption").textContent;
  galleryCount.textContent = `Foto ${galleryIndex + 1} de ${galleryButtons.length}`;
  photoChoices.querySelectorAll("button").forEach((button, i) => button.setAttribute("aria-pressed", String(i === galleryIndex)));
}

galleryButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    galleryTrigger = button;
    showPhoto(index);
    previousOverflow = document.body.style.overflow;
    gallery.showModal();
    document.body.style.overflow = "hidden";
    galleryClose.focus();
  });
});
document
  .querySelector(".gallery-prev")
  .addEventListener("click", () => showPhoto(galleryIndex - 1));
document
  .querySelector(".gallery-next")
  .addEventListener("click", () => showPhoto(galleryIndex + 1));
galleryClose.addEventListener("click", () => gallery.close());
gallery.addEventListener("click", (event) => {
  const rect = gallery.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;
  if (event.target === gallery && outside) gallery.close();
});
gallery.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    const controls = [...gallery.querySelectorAll("button")];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    showPhoto(galleryIndex + (event.key === "ArrowRight" ? 1 : -1));
  }
});
galleryStage.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  },
  { passive: true },
);
galleryStage.addEventListener(
  "touchend",
  (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5)
      showPhoto(galleryIndex + (dx < 0 ? 1 : -1));
    touchStart = null;
  },
  { passive: true },
);
galleryStage.addEventListener("touchcancel", () => {
  touchStart = null;
});
gallery.addEventListener("close", () => {
  document.body.style.overflow = previousOverflow;
  touchStart = null;
  galleryTrigger?.focus({ preventScroll: true });
});

// Motion is optional; base HTML remains visible without JavaScript.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const runningAnimations = new Set();
function animateEntrance(element, distance = 32, duration = 720, delay = 0, paused = false) {
  if (reducedMotion.matches || !element.animate) return null;
  const animation = element.animate(
    [{ opacity: 0, transform: `translateY(${distance}px)` },
     { opacity: 1, transform: "translateY(0)" }],
    { duration, delay, fill: "both", easing: "cubic-bezier(.16,1,.3,1)" },
  );
  if (paused) animation.pause();
  runningAnimations.add(animation);
  animation.finished.catch(() => {}).finally(() => {
    runningAnimations.delete(animation);
    animation.cancel();
  });
  return animation;
}
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) runningAnimations.forEach(animation => animation.cancel());
});
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const pendingReveals = new Map();
  const revealObserver = new IntersectionObserver(entries => {
    let sequence = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const animation = pendingReveals.get(entry.target);
      if (animation) {
        animation.effect.updateTiming({ delay: Math.min(sequence++ * 100, 300) });
        if (reducedMotion.matches) animation.cancel();
        else animation.play();
        pendingReveals.delete(entry.target);
      }
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
  const targets = document.querySelectorAll(".hero-grid > *, main > section:not(.hero) .section-title, .experience-grid blockquote, .help-grid article, .step, .space-grid figure, .about-grid > *, .contact-panel, .closing h2");
  targets.forEach(element => {
    if (element.matches(".hero .actions")) {
      animateEntrance(element, 14, 500);
      return;
    }
    // Content above a restored scroll position must stay immediately available.
    if (element.getBoundingClientRect().bottom < 0) return;
    const animation = animateEntrance(element, 36, 850, 0, true);
    if (animation) pendingReveals.set(element, animation);
    revealObserver.observe(element);
  });
  document.addEventListener("focusin", event => {
    pendingReveals.forEach((animation, element) => {
      if (element.contains(event.target)) {
        animation.cancel();
        pendingReveals.delete(element);
        revealObserver.unobserve(element);
      }
    });
  });
}
menuToggle.addEventListener("click", () => {
  // Cancel an interrupted opening before starting another sequence.
  if (!menu.classList.contains("open")) return;
  menu.getAnimations({ subtree: true }).forEach(animation => animation.cancel());
  animateEntrance(menu, -18, 350);
  menu.querySelectorAll("a").forEach((link, index) => {
    animateEntrance(link, 18, 480, 90 + index * 70);
  });
});
// A quiet reading indicator and a keyboard-accessible shortcut on long pages.
const readingProgress = document.createElement("div");
readingProgress.className = "reading-progress";
readingProgress.setAttribute("aria-hidden", "true");
document.body.append(readingProgress);
const backToTop = document.createElement("a");
backToTop.className = "back-to-top";
backToTop.href = "#inicio";
backToTop.setAttribute("aria-label", "Voltar ao início da página");
backToTop.title = "Voltar ao início";
backToTop.textContent = "↑";
backToTop.hidden = true;
document.body.append(backToTop);
backToTop.addEventListener("click", (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "instant" : "smooth" });
  const heading = document.querySelector(".hero h1");
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
  heading.addEventListener("blur", () => heading.removeAttribute("tabindex"), { once: true });
});
const sectionLinks = [...menu.querySelectorAll('a[href^="#"]')];
const linkedSections = sectionLinks.map(link => document.querySelector(link.getAttribute("href")));
let scrollFrame = null;
function updateScrollUI() {
  scrollFrame = null;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  readingProgress.style.transform = `scaleX(${maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0})`;
  backToTop.hidden = window.scrollY < window.innerHeight;
  let active = -1;
  linkedSections.forEach((section, index) => {
    if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.35) active = index;
  });
  sectionLinks.forEach((link, index) => {
    if (index === active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}
function scheduleScrollUI() {
  if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateScrollUI);
}
window.addEventListener("scroll", scheduleScrollUI, { passive: true });
window.addEventListener("resize", scheduleScrollUI);
window.addEventListener("load", scheduleScrollUI);
updateScrollUI();

// Direct photo selection complements arrows, swipe, and keyboard navigation.
const photoChoices = document.createElement("div");
photoChoices.className = "gallery-choices";
photoChoices.setAttribute("role", "group");
photoChoices.setAttribute("aria-label", "Escolher foto do consultório");
galleryButtons.forEach((source, index) => {
  const choice = document.createElement("button");
  choice.type = "button";
  choice.textContent = String(index + 1);
  choice.setAttribute("aria-label", source.getAttribute("aria-label").replace("Ampliar foto:", "Ver foto:"));
  choice.addEventListener("click", () => showPhoto(index));
  photoChoices.append(choice);
});
galleryCount.after(photoChoices);
galleryImage.addEventListener("load", () => animateEntrance(galleryImage, 0, 220));
