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

const VOLUME_QUESTION = "Você precisa fazer consultas com frequência?";
const REFUSAL = "Infelizmente não podemos ajudar, como parceiros Serasa atuamos apenas com empresas que fazem mais de 4 consultas mensais";
const NAME_ERROR = "Informe nome e sobrenome.";
const PHONE_ERROR = "Informe um telefone válido.";
const CHOICES = [
  { id: "low", label: "Sim, de 1 a 3 consultas mensais" },
  { id: "mid", label: "Sim, de 4 a 10 consultas mensais" },
  { id: "high", label: "Sim, mais de 10 consultas mensais" },
  { id: "once", label: "Não, quero fazer apenas uma consulta pontual" },
];
const QUALIFIED = new Set(["mid", "high"]);
const BLOCKED = new Set(["low", "once"]);
const QUALIFIED_LABELS = new Set(
  CHOICES.filter((choice) => QUALIFIED.has(choice.id)).map((choice) => choice.label),
);
const COUNTRIES = [
  { iso: "br", name: "Brasil", dial: "55", min: 10, max: 11 },
  { iso: "pt", name: "Portugal", dial: "351", min: 9, max: 9, mask: "### ### ###" },
  { iso: "us", name: "Estados Unidos", dial: "1", min: 10, max: 10, mask: "(###) ###-####" },
  { iso: "ca", name: "Canadá", dial: "1", min: 10, max: 10, mask: "(###) ###-####" },
  { iso: "ar", name: "Argentina", dial: "54", min: 10, max: 10, mask: "## ####-####" },
  { iso: "uy", name: "Uruguai", dial: "598", min: 8, max: 8 },
  { iso: "py", name: "Paraguai", dial: "595", min: 9, max: 9 },
  { iso: "cl", name: "Chile", dial: "56", min: 9, max: 9, mask: "# #### ####" },
  { iso: "bo", name: "Bolívia", dial: "591", min: 8, max: 8 },
  { iso: "pe", name: "Peru", dial: "51", min: 9, max: 9 },
  { iso: "co", name: "Colômbia", dial: "57", min: 10, max: 10 },
  { iso: "ve", name: "Venezuela", dial: "58", min: 10, max: 10 },
  { iso: "ec", name: "Equador", dial: "593", min: 9, max: 9 },
  { iso: "mx", name: "México", dial: "52", min: 10, max: 10, mask: "## #### ####" },
  { iso: "es", name: "Espanha", dial: "34", min: 9, max: 9, mask: "### ### ###" },
  { iso: "fr", name: "França", dial: "33", min: 9, max: 9, mask: "# ## ## ## ##" },
  { iso: "de", name: "Alemanha", dial: "49", min: 10, max: 11 },
  { iso: "it", name: "Itália", dial: "39", min: 9, max: 10 },
  { iso: "gb", name: "Reino Unido", dial: "44", min: 10, max: 10, mask: "#### ######" },
  { iso: "ie", name: "Irlanda", dial: "353", min: 9, max: 9 },
  { iso: "nl", name: "Países Baixos", dial: "31", min: 9, max: 9 },
  { iso: "be", name: "Bélgica", dial: "32", min: 9, max: 9 },
  { iso: "ch", name: "Suíça", dial: "41", min: 9, max: 9 },
  { iso: "at", name: "Áustria", dial: "43", min: 10, max: 13 },
  { iso: "se", name: "Suécia", dial: "46", min: 7, max: 10 },
  { iso: "no", name: "Noruega", dial: "47", min: 8, max: 8 },
  { iso: "dk", name: "Dinamarca", dial: "45", min: 8, max: 8 },
  { iso: "fi", name: "Finlândia", dial: "358", min: 9, max: 10 },
  { iso: "pl", name: "Polônia", dial: "48", min: 9, max: 9 },
  { iso: "ro", name: "Romênia", dial: "40", min: 9, max: 9 },
  { iso: "cz", name: "Tchéquia", dial: "420", min: 9, max: 9 },
  { iso: "gr", name: "Grécia", dial: "30", min: 10, max: 10 },
  { iso: "tr", name: "Turquia", dial: "90", min: 10, max: 10 },
  { iso: "ru", name: "Rússia", dial: "7", min: 10, max: 10 },
  { iso: "ua", name: "Ucrânia", dial: "380", min: 9, max: 9 },
  { iso: "il", name: "Israel", dial: "972", min: 9, max: 9 },
  { iso: "ae", name: "Emirados Árabes", dial: "971", min: 9, max: 9 },
  { iso: "sa", name: "Arábia Saudita", dial: "966", min: 9, max: 9 },
  { iso: "za", name: "África do Sul", dial: "27", min: 9, max: 9 },
  { iso: "ng", name: "Nigéria", dial: "234", min: 10, max: 10 },
  { iso: "eg", name: "Egito", dial: "20", min: 10, max: 10 },
  { iso: "ma", name: "Marrocos", dial: "212", min: 9, max: 9 },
  { iso: "ao", name: "Angola", dial: "244", min: 9, max: 9 },
  { iso: "mz", name: "Moçambique", dial: "258", min: 9, max: 9 },
  { iso: "cv", name: "Cabo Verde", dial: "238", min: 7, max: 7 },
  { iso: "jp", name: "Japão", dial: "81", min: 10, max: 10 },
  { iso: "cn", name: "China", dial: "86", min: 11, max: 11 },
  { iso: "kr", name: "Coreia do Sul", dial: "82", min: 9, max: 10 },
  { iso: "in", name: "Índia", dial: "91", min: 10, max: 10 },
  { iso: "au", name: "Austrália", dial: "61", min: 9, max: 9 },
  { iso: "nz", name: "Nova Zelândia", dial: "64", min: 8, max: 10 },
];

let phoneDocBound = false;
let consultationLocked = false;

function digitsOnly(value) {
  return String(value).replace(/\D/g, "");
}

function maskDigits(digits, pattern) {
  let index = 0;
  let out = "";
  for (const char of pattern) {
    if (index >= digits.length) {
      break;
    }
    if (char === "#") {
      out += digits[index];
      index += 1;
    } else {
      out += char;
    }
  }
  return out;
}

function formatNational(country, digits) {
  const capped = digits.slice(0, country.max);
  if (country.iso === "br") {
    if (capped.length > 10) {
      return maskDigits(capped, "(##) #####-####");
    }
    if (capped.length > 2) {
      return maskDigits(capped, "(##) ####-####");
    }
    return capped;
  }
  if (country.mask) {
    return maskDigits(capped, country.mask);
  }
  return capped.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

function formatPersonName(raw) {
  const trailingSpace = /\s$/.test(raw);
  let value = raw.normalize("NFC").replace(/[^\p{L}\s'’-]/gu, "");
  value = value.replace(/\s{2,}/g, " ").replace(/^\s+/, "");
  value = value.replace(/(^|[\s'’-])(\p{L})([^\s'’-]*)/gu, (_, sep, first, rest) => {
    return sep + first.toLocaleUpperCase("pt-BR") + rest.toLocaleLowerCase("pt-BR");
  });
  if (trailingSpace && value.length > 0 && !value.endsWith(" ")) {
    value += " ";
  }
  return value;
}

function isFullName(value) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return false;
  }
  return parts.every((part) => (part.match(/\p{L}/gu) || []).length >= 2);
}

function firstNameOf(value) {
  return value.trim().split(/\s+/)[0] || "";
}

function whatsappUrl(fullName) {
  const message = `Olá, tudo bem? Me chamo ${firstNameOf(fullName)} e gostaria de contratar e entender mais sobre consultas recorrentes na Serasa`;
  return `https://wa.me/5561981365986?text=${encodeURIComponent(message)}`;
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function phoneWithDdi(control) {
  const digits = digitsOnly(control?.display() || "");
  if (!digits) {
    return "";
  }
  return `${control.dial()}${digits}`;
}

const VISITOR_KEY = "scc-visitor-id";
let memoryVisitorId = "";
let latestConsultas = "";
let attemptOpen = false;
let chatAttemptOpen = false;
let terminalSent = false;

function visitorId() {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) {
      return existing;
    }
    const created = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, created);
    return created;
  } catch (error) {
    if (!memoryVisitorId) {
      memoryVisitorId = crypto.randomUUID();
    }
    return memoryVisitorId;
  }
}

function navigationFields() {
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid") || "";
  let fbc = readCookie("_fbc");
  if (!fbc && fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
  }
  return {
    url: window.location.href,
    fbc,
    fbp: readCookie("_fbp"),
    id: visitorId(),
  };
}

function knownName() {
  const candidates = [savedName, nameInput?.value, chatNameInput?.value];
  let best = "";
  candidates.forEach((value) => {
    const formatted = formatPersonName(value || "").trim();
    if (formatted.length > best.length) {
      best = formatted;
    }
  });
  return best;
}

function knownPhone() {
  const options = [phoneWithDdi(formPhone), phoneWithDdi(chatPhone)];
  return options.sort((left, right) => right.length - left.length)[0] || "";
}

function leadPayload(evento, overrides = {}) {
  return {
    nome: knownName(),
    telefone: knownPhone(),
    consultas: latestConsultas,
    evento,
    ...navigationFields(),
    ...overrides,
  };
}

function markAttempt(source) {
  if (terminalSent) {
    return;
  }
  attemptOpen = true;
  if (source === "chat") {
    chatAttemptOpen = true;
  }
}

function sendProgress(reason) {
  if (terminalSent || leadBusy || !attemptOpen) {
    return;
  }
  if (reason === "chat" && !chatAttemptOpen) {
    return;
  }
  attemptOpen = false;
  chatAttemptOpen = false;
  const body = JSON.stringify(leadPayload("registro em andamento"));
  if (navigator.sendBeacon) {
    const queued = navigator.sendBeacon("/api/lead", new Blob([body], { type: "application/json" }));
    if (queued) {
      return;
    }
  }
  fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch((error) => {
    console.warn("Webhook do lead falhou", error);
  });
}

async function postEvent(evento, overrides = {}) {
  if (evento === "registro completo" || evento === "desqualificado") {
    terminalSent = true;
    attemptOpen = false;
    chatAttemptOpen = false;
  }
  const response = await fetch("/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(leadPayload(evento, overrides)),
    keepalive: true,
  });
  const result = await response.json();
  if (!result.webhookOk) {
    console.warn("Webhook do lead falhou", result.webhookError || response.status);
  }
  return result;
}

async function finishQualifiedLead(nome, telefone, consultas) {
  if (leadBusy || terminalSent || !QUALIFIED_LABELS.has(consultas)) {
    return;
  }
  leadBusy = true;
  terminalSent = true;
  attemptOpen = false;
  chatAttemptOpen = false;
  try {
    const result = await postEvent("registro completo", { nome, telefone, consultas });
    if (result.eventId) {
      await fireLeadPixels(result.eventId, telefone);
    }
  } catch (error) {
    console.warn("Não foi possível registrar o lead", error);
  }
  window.location.assign(whatsappUrl(nome));
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    sendProgress("page");
  }
});
window.addEventListener("pagehide", () => {
  sendProgress("page");
});

const ADS_LEAD_SEND_TO = "AW-11068275414/HPQgCIvL7KwdENb14Z0p";
const GCLID_KEY = "scc-gclid";

function storedGclid() {
  const fromUrl = new URLSearchParams(window.location.search).get("gclid") || "";
  if (fromUrl) {
    try {
      sessionStorage.setItem(GCLID_KEY, fromUrl);
    } catch (error) {
      return fromUrl;
    }
    return fromUrl;
  }
  try {
    return sessionStorage.getItem(GCLID_KEY) || "";
  } catch (error) {
    return "";
  }
}

function rememberGclidCookie(gclid) {
  if (!gclid || document.cookie.split("; ").some((item) => item.startsWith("_gcl_aw="))) {
    return;
  }
  const seconds = Math.floor(Date.now() / 1000);
  document.cookie = `_gcl_aw=GCL.${seconds}.${gclid}; path=/; max-age=7776000; SameSite=Lax`;
}

async function sha256Hex(value) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function fireLeadPixels(eventId, telefone) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      resolve();
    };
    const send = async () => {
      const phoneDigits = digitsOnly(telefone || "");
      rememberGclidCookie(storedGclid());
      if (typeof window.gtag === "function") {
        const conversion = {
          send_to: ADS_LEAD_SEND_TO,
          transaction_id: eventId,
        };
        if (phoneDigits) {
          conversion.user_data = { sha256_phone_number: await sha256Hex(phoneDigits) };
        }
        window.gtag("event", "conversion", conversion);
        window.gtag("event", "generate_lead", {
          send_to: "G-WWBCSP30L3",
          event_id: eventId,
          event_callback: finish,
        });
      }
    };
    send().catch((error) => {
      console.warn("Não foi possível enviar a conversão", error);
      finish();
    });
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead", {}, { eventID: eventId });
    }
    window.setTimeout(finish, 800);
  });
}

function bindNameInput(input) {
  input.addEventListener("input", () => {
    const atEnd = input.selectionStart === input.value.length;
    const next = formatPersonName(input.value);
    if (next === input.value) {
      return;
    }
    const caret = input.selectionStart;
    input.value = next;
    const pos = atEnd ? next.length : Math.min(caret, next.length);
    input.setSelectionRange(pos, pos);
  });
}

function createPhoneControl() {
  let selected = COUNTRIES[0];
  const root = document.createElement("div");
  root.className = "phone-field";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "ddi-button";
  button.setAttribute("aria-haspopup", "listbox");
  button.setAttribute("aria-expanded", "false");
  const flag = document.createElement("img");
  flag.alt = "";
  flag.width = 22;
  flag.height = 16;
  const dial = document.createElement("span");
  button.append(flag, dial);
  const input = document.createElement("input");
  input.type = "tel";
  input.name = "telefone";
  input.inputMode = "tel";
  input.autocomplete = "tel-national";
  input.setAttribute("aria-label", "Telefone");
  const menu = document.createElement("div");
  menu.className = "ddi-menu";
  menu.hidden = true;
  menu.setAttribute("role", "listbox");
  const search = document.createElement("input");
  search.type = "search";
  search.className = "ddi-search";
  search.placeholder = "Buscar país";
  search.setAttribute("aria-label", "Buscar país");
  const list = document.createElement("div");
  menu.append(search, list);
  root.append(button, input, menu);

  function paint() {
    flag.src = `/assets/flags/${selected.iso}.svg`;
    dial.textContent = `+${selected.dial}`;
    button.setAttribute("aria-label", `${selected.name} +${selected.dial}`);
    input.value = formatNational(selected, digitsOnly(input.value));
  }

  function closeMenu() {
    menu.hidden = true;
    root.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
  }

  function renderOptions(query) {
    const needle = query.trim().toLocaleLowerCase("pt-BR");
    list.replaceChildren();
    COUNTRIES.filter((country) => {
      if (!needle) {
        return true;
      }
      return country.name.toLocaleLowerCase("pt-BR").includes(needle) || `+${country.dial}`.includes(needle);
    }).forEach((country) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "ddi-option";
      option.setAttribute("role", "option");
      if (country.iso === selected.iso) {
        option.classList.add("is-active");
      }
      const img = document.createElement("img");
      img.alt = "";
      img.src = `/assets/flags/${country.iso}.svg`;
      img.width = 22;
      img.height = 16;
      const name = document.createElement("strong");
      name.textContent = country.name;
      const code = document.createElement("span");
      code.textContent = `+${country.dial}`;
      option.append(img, name, code);
      option.addEventListener("click", () => {
        selected = country;
        closeMenu();
        paint();
        input.focus();
      });
      list.append(option);
    });
  }

  function openMenu() {
    menu.hidden = false;
    root.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
    search.value = "";
    renderOptions("");
    search.focus();
  }

  button.addEventListener("click", () => {
    if (menu.hidden) {
      openMenu();
      return;
    }
    closeMenu();
  });
  search.addEventListener("input", () => {
    renderOptions(search.value);
  });
  search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });
  input.addEventListener("input", () => {
    input.value = formatNational(selected, digitsOnly(input.value));
  });
  root.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  if (!phoneDocBound) {
    document.addEventListener("click", () => {
      document.querySelectorAll(".phone-field.is-open").forEach((field) => {
        field.classList.remove("is-open");
        const openMenuEl = field.querySelector(".ddi-menu");
        const trigger = field.querySelector(".ddi-button");
        if (openMenuEl) {
          openMenuEl.hidden = true;
        }
        if (trigger) {
          trigger.setAttribute("aria-expanded", "false");
        }
      });
    });
    phoneDocBound = true;
  }
  paint();
  return {
    element: root,
    input,
    dial() {
      return selected.dial;
    },
    display() {
      return input.value;
    },
    isValid() {
      const count = digitsOnly(input.value).length;
      return count >= selected.min && count <= selected.max;
    },
    focus() {
      input.focus();
    },
  };
}

const step1 = document.querySelector("[data-step='1']");
const step2 = document.querySelector("[data-step='2']");
const reject = document.querySelector("[data-step='reject']");
const nameInput = step2?.querySelector("input[name='nome']");
const nameField = document.querySelector("[data-field='nome']");
const phoneFieldWrap = document.querySelector("[data-field='telefone']");
const nameError = document.querySelector("[data-error='nome']");
const phoneError = document.querySelector("[data-error='telefone']");
const formPhoneHost = document.querySelector("[data-phone-field]");
const formPhone = formPhoneHost ? createPhoneControl() : null;
if (formPhone) {
  formPhoneHost.append(formPhone.element);
}
if (nameInput) {
  bindNameInput(nameInput);
}

function setFieldError(field, error, show) {
  field?.classList.toggle("is-invalid", show);
  if (error) {
    error.hidden = !show;
  }
}

function applyFormRefusal() {
  if (step1) {
    step1.hidden = true;
  }
  if (step2) {
    step2.hidden = true;
  }
  if (reject) {
    reject.hidden = false;
  }
}

const panel = document.querySelector(".wa-panel");
const launcher = document.querySelector(".wa-launcher");
const log = document.querySelector(".wa-log");
const composer = document.querySelector(".wa-composer");
const chatError = document.querySelector(".wa-error");
const chatNameWrap = document.querySelector(".wa-name");
const chatNameInput = chatNameWrap?.querySelector("input");
const chatPhoneWrap = document.querySelector(".wa-phone");
const chatPhone = chatPhoneWrap ? createPhoneControl() : null;
if (chatPhone) {
  chatPhoneWrap.append(chatPhone.element);
}
if (chatNameInput) {
  bindNameInput(chatNameInput);
  chatNameInput.addEventListener("input", () => {
    markAttempt("chat");
  });
}
chatPhone?.input.addEventListener("input", () => {
  markAttempt("chat");
});

let chatStarted = false;
let refusalShown = false;
let savedName = "";
let chatConsultas = "";
let formConsultas = "";
let leadBusy = false;
let optionsBox = null;
const TYPING_MS = 700;

function scrollLog() {
  if (log) {
    log.scrollTop = log.scrollHeight;
  }
}

function addMessage(text, kind) {
  const item = document.createElement("p");
  item.className = `wa-msg is-${kind}`;
  item.textContent = text;
  log.append(item);
  scrollLog();
}

function showTyping() {
  const node = document.createElement("div");
  node.className = "wa-msg is-bot wa-typing";
  node.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));
  log.append(node);
  scrollLog();
  return node;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function say(text) {
  const typing = showTyping();
  await wait(TYPING_MS);
  typing.remove();
  if (consultationLocked && text !== REFUSAL) {
    return;
  }
  addMessage(text, "bot");
}

function hideOptions() {
  optionsBox?.remove();
  optionsBox = null;
}

function showChatError(message) {
  if (!chatError) {
    return;
  }
  chatError.hidden = false;
  chatError.textContent = message;
}

function clearChatError() {
  if (!chatError) {
    return;
  }
  chatError.hidden = true;
  chatError.textContent = "";
}

function showComposer(mode) {
  composer.hidden = false;
  chatNameWrap.hidden = mode !== "name";
  chatPhoneWrap.hidden = mode !== "phone";
  clearChatError();
  if (mode === "name") {
    chatNameInput.focus();
  } else {
    chatPhone.focus();
  }
  scrollLog();
}

function hideComposer() {
  if (composer) {
    composer.hidden = true;
  }
  clearChatError();
}

function showOptions() {
  hideOptions();
  const box = document.createElement("div");
  box.className = "wa-options";
  CHOICES.forEach((choice) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wa-choice";
    button.textContent = choice.label;
    button.addEventListener("click", () => {
      onChatChoice(choice);
    });
    box.append(button);
  });
  log.append(box);
  optionsBox = box;
  scrollLog();
}

async function showRefusalInChat() {
  hideOptions();
  hideComposer();
  if (refusalShown || panel.hidden) {
    return;
  }
  refusalShown = true;
  await say(REFUSAL);
}

function lockConsultation() {
  if (consultationLocked) {
    return;
  }
  consultationLocked = true;
  applyFormRefusal();
  showRefusalInChat();
}

async function onChatChoice(choice) {
  if (consultationLocked) {
    return;
  }
  addMessage(choice.label, "user");
  chatConsultas = choice.label;
  latestConsultas = choice.label;
  hideOptions();
  if (BLOCKED.has(choice.id)) {
    consultationLocked = true;
    applyFormRefusal();
    refusalShown = true;
    postEvent("desqualificado", { consultas: choice.label }).catch((error) => {
      console.warn("Webhook do lead falhou", error);
    });
    await say(REFUSAL);
    return;
  }
  if (!QUALIFIED.has(choice.id)) {
    return;
  }
  markAttempt("chat");
  await say("Ótimo, e qual é o seu nome e sobrenome?");
  if (!consultationLocked) {
    showComposer("name");
  }
}

async function beginChat() {
  if (consultationLocked) {
    await showRefusalInChat();
    return;
  }
  if (chatStarted) {
    return;
  }
  chatStarted = true;
  await say(VOLUME_QUESTION);
  if (!consultationLocked) {
    showOptions();
  }
}

document.querySelectorAll("[data-choice]").forEach((button) => {
  button.addEventListener("click", () => {
    if (consultationLocked) {
      return;
    }
    const choice = button.dataset.choice;
    latestConsultas = button.textContent.trim();
    if (BLOCKED.has(choice)) {
      postEvent("desqualificado", { consultas: latestConsultas }).catch((error) => {
        console.warn("Webhook do lead falhou", error);
      });
      lockConsultation();
      return;
    }
    if (!QUALIFIED.has(choice)) {
      return;
    }
    formConsultas = latestConsultas;
    markAttempt("form");
    step1.hidden = true;
    reject.hidden = true;
    step2.hidden = false;
    nameInput?.focus();
  });
});

if (step2) {
  nameInput?.addEventListener("input", () => {
    setFieldError(nameField, nameError, false);
    markAttempt("form");
  });
  formPhone?.input.addEventListener("input", () => {
    setFieldError(phoneFieldWrap, phoneError, false);
    markAttempt("form");
  });
  step2.addEventListener("submit", (event) => {
    event.preventDefault();
    if (consultationLocked || leadBusy) {
      return;
    }
    const nome = formatPersonName(nameInput.value).trim();
    nameInput.value = nome;
    const nameOk = isFullName(nome);
    const phoneOk = formPhone.isValid();
    setFieldError(nameField, nameError, !nameOk);
    setFieldError(phoneFieldWrap, phoneError, !phoneOk);
    if (!nameOk || !phoneOk) {
      return;
    }
    finishQualifiedLead(nome, phoneWithDdi(formPhone), formConsultas);
  });
}

if (launcher && panel) {
  launcher.addEventListener("click", () => {
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    launcher.hidden = willOpen;
    launcher.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      beginChat();
    }
  });
  document.querySelector(".wa-close")?.addEventListener("click", () => {
    panel.hidden = true;
    launcher.hidden = false;
    launcher.setAttribute("aria-expanded", "false");
    sendProgress("chat");
  });
  composer?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (consultationLocked) {
      return;
    }
    if (!chatNameWrap.hidden) {
      const nome = formatPersonName(chatNameInput.value).trim();
      chatNameInput.value = nome;
      if (!isFullName(nome)) {
        showChatError(NAME_ERROR);
        return;
      }
      clearChatError();
      savedName = nome;
      addMessage(nome, "user");
      chatNameWrap.hidden = true;
      composer.hidden = true;
      markAttempt("chat");
      await say(`Perfeito ${firstNameOf(nome)}, agora qual é o seu telefone com whatsapp?`);
      if (!consultationLocked) {
        showComposer("phone");
      }
      return;
    }
    if (!chatPhone.isValid()) {
      showChatError(PHONE_ERROR);
      return;
    }
    clearChatError();
    addMessage(`+${chatPhone.dial()} ${chatPhone.display()}`, "user");
    finishQualifiedLead(savedName, phoneWithDdi(chatPhone), chatConsultas);
  });
}

const testimonialScroller = document.querySelector("[data-testimonials]");
const testimonialPrev = document.querySelector("[data-testimonials-prev]");
const testimonialNext = document.querySelector("[data-testimonials-next]");

function scrollTestimonials(direction) {
  if (!testimonialScroller) {
    return;
  }
  const card = testimonialScroller.querySelector(".testimonial");
  if (!card) {
    return;
  }
  const gap = parseFloat(getComputedStyle(testimonialScroller).columnGap) || 22;
  const delta = card.getBoundingClientRect().width + gap;
  const max = testimonialScroller.scrollWidth - testimonialScroller.clientWidth;
  const next = testimonialScroller.scrollLeft + direction * delta;
  if (next > max + 4) {
    testimonialScroller.scrollTo({ left: 0, behavior: "smooth" });
    return;
  }
  if (next < -4) {
    testimonialScroller.scrollTo({ left: max, behavior: "smooth" });
    return;
  }
  testimonialScroller.scrollBy({ left: direction * delta, behavior: "smooth" });
}

testimonialPrev?.addEventListener("click", () => {
  scrollTestimonials(-1);
});

testimonialNext?.addEventListener("click", () => {
  scrollTestimonials(1);
});

const institutionalVideo = document.querySelector("[data-institutional-video]");
if (institutionalVideo) {
  institutionalVideo.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.className = "institutional-frame";
    frame.src = "https://www.youtube-nocookie.com/embed/kBgloL8dciU?autoplay=1";
    frame.title = "Vídeo institucional SCC Check";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    institutionalVideo.replaceWith(frame);
  });
}
