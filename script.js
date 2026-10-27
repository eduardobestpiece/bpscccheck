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

const step1 = document.querySelector("[data-step='1']");
const step2 = document.querySelector("[data-step='2']");
const reject = document.querySelector("[data-step='reject']");
const qualified = new Set(["mid", "high"]);
const blocked = new Set(["low", "once"]);

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.choice;
    if (blocked.has(choice)) {
      step1.hidden = true;
      step2.hidden = true;
      reject.hidden = false;
      return;
    }
    if (!qualified.has(choice)) {
      return;
    }
    step1.hidden = true;
    reject.hidden = true;
    step2.hidden = false;
    const nameField = step2.querySelector("input[name='nome']");
    if (nameField) {
      nameField.focus();
    }
  });
});

if (step2) {
  step2.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(step2);
    const nome = String(data.get("nome") || "").trim();
    const firstName = nome.split(/\s+/)[0] || "";
    const message = `Olá, tudo bem? Me chamo ${firstName} e gostaria de contratar e entender mais sobre consultas recorrentes na Serasa`;
    const url = `https://wa.me/5561981365986?text=${encodeURIComponent(message)}`;
    window.location.assign(url);
  });
}
