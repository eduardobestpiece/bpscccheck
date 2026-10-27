const menu = document.querySelector("#mobile-menu");
const menuToggle = document.querySelector(".menu-toggle");
const menuClose = document.querySelector(".menu-close");

function setMenu(open) {
  if (!menu || !menuToggle) {
    return;
  }
  menu.hidden = !open;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  document.body.classList.toggle("menu-open", open);
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    setMenu(menu.hidden);
  });
}

if (menuClose) {
  menuClose.addEventListener("click", () => {
    setMenu(false);
  });
}

if (menu) {
  menu.addEventListener("click", (event) => {
    if (event.target === menu) {
      setMenu(false);
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu && !menu.hidden) {
    setMenu(false);
    menuToggle.focus();
  }
});

const tabs = Array.from(document.querySelectorAll("[data-tab]"));
const panels = Array.from(document.querySelectorAll("[data-panel]"));

function selectTab(next) {
  tabs.forEach((tab) => {
    const active = tab === next;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  panels.forEach((panel) => {
    panel.hidden = panel.dataset.panel !== next.dataset.tab;
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    selectTab(tab);
  });

  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = tabs[(index + direction + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

const form = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!formStatus) {
      return;
    }
    formStatus.hidden = false;
    formStatus.textContent = "Este formulário é apenas visual. Nenhum dado foi enviado.";
  });
}
