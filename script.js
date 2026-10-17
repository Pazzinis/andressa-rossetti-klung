document.documentElement.classList.add("js");
document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.querySelector(".menu-toggle");
const menu = document.getElementById("menu");

function closeMenu({ restoreFocus = false } = {}) {
  menu.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener("click", () => {
  if (menu.classList.contains("open")) {
    closeMenu();
    return;
  }
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
  .addEventListener("change", () => closeMenu());

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
