const STORAGE_KEY = "colton_recruiting_os_v1";
const GH_SETTINGS_KEY = "colton_recruiting_os_github";

const defaultData = {
  contacts: [],
  applications: [],
  casePractice: [],
  dsTopics: [],
  sqlProblems: [],
  leetcodeProblems: [],
};

let data = loadData();

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultData);
    const parsed = JSON.parse(raw);
    return {
      contacts: parsed.contacts || [],
      applications: parsed.applications || [],
      casePractice: parsed.casePractice || [],
      dsTopics: parsed.dsTopics || [],
      sqlProblems: parsed.sqlProblems || [],
      leetcodeProblems: parsed.leetcodeProblems || [],
    };
  } catch (error) {
    console.error("Failed to load data:", error);
    return structuredClone(defaultData);
  }
}

function renderCounts() {
  document.getElementById("contactsCount").textContent = data.contacts.length;
  document.getElementById("applicationsCount").textContent = data.applications.length;
  document.getElementById("caseCount").textContent = data.casePractice.length;
  document.getElementById("topicsCount").textContent = data.dsTopics.length;
  document.getElementById("sqlCount").textContent = data.sqlProblems.length;
  document.getElementById("leetcodeCount").textContent = data.leetcodeProblems.length;
}

function linkCell(url) {
  if (!url) return "";
  const safeUrl = escapeHtml(url);
  return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open</a>`;
}

function createDeleteButton(type, id) {
  return `<button class="delete-btn" data-type="${type}" data-id="${id}">Delete</button>`;
}

function renderContacts() {
  const tbody = document.getElementById("contactsTable");
  tbody.innerHTML = data.contacts
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.company)}</td>
        <td>${escapeHtml(row.industry)}</td>
        <td>${escapeHtml(row.chatDate)}</td>
        <td>${escapeHtml(row.notes || "")}</td>
        <td>${createDeleteButton("contacts", row.id)}</td>
      </tr>
    `
    )
    .join("");
}

function renderApplications() {
  const tbody = document.getElementById("applicationsTable");
  tbody.innerHTML = data.applications
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.role)}</td>
        <td>${escapeHtml(row.company)}</td>
        <td>${escapeHtml(row.industry)}</td>
        <td>${escapeHtml(row.appliedDate)}</td>
        <td>${escapeHtml(row.status)}</td>
        <td>${linkCell(row.link)}</td>
        <td>${escapeHtml(row.notes || "")}</td>
        <td>${createDeleteButton("applications", row.id)}</td>
      </tr>
    `
    )
    .join("");
}

function renderCasePractice() {
  const tbody = document.getElementById("caseTable");
  tbody.innerHTML = data.casePractice
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.date)}</td>
        <td>${escapeHtml(row.prompt)}</td>
        <td>${escapeHtml(row.type)}</td>
        <td>${escapeHtml(String(row.score || ""))}</td>
        <td>${escapeHtml(row.notes || "")}</td>
        <td>${createDeleteButton("casePractice", row.id)}</td>
      </tr>
    `
    )
    .join("");
}

function renderTopics() {
  const tbody = document.getElementById("topicsTable");
  tbody.innerHTML = data.dsTopics
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.date)}</td>
        <td>${escapeHtml(row.topic)}</td>
        <td>${escapeHtml(String(row.minutes || ""))}</td>
        <td>${escapeHtml(row.notes || "")}</td>
        <td>${createDeleteButton("dsTopics", row.id)}</td>
      </tr>
    `
    )
    .join("");
}

function renderSql() {
  const tbody = document.getElementById("sqlTable");
  tbody.innerHTML = data.sqlProblems
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.date)}</td>
        <td>${escapeHtml(row.problem)}</td>
        <td>${escapeHtml(row.difficulty)}</td>
        <td>${linkCell(row.link)}</td>
        <td>${escapeHtml(row.notes || "")}</td>
        <td>${createDeleteButton("sqlProblems", row.id)}</td>
      </tr>
    `
    )
    .join("");
}

function renderLeetcode() {
  const tbody = document.getElementById("leetcodeTable");
  tbody.innerHTML = data.leetcodeProblems
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.date)}</td>
        <td>${escapeHtml(row.problem)}</td>
        <td>${escapeHtml(row.difficulty)}</td>
        <td>${linkCell(row.link)}</td>
        <td>${escapeHtml(row.notes || "")}</td>
        <td>${createDeleteButton("leetcodeProblems", row.id)}</td>
      </tr>
    `
    )
    .join("");
}

function renderAll() {
  renderCounts();
  renderContacts();
  renderApplications();
  renderCasePractice();
  renderTopics();
  renderSql();
  renderLeetcode();
}

function bindForm(formId, listKey, mapFn) {
  const form = document.getElementById(formId);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    data[listKey].unshift({ id: uid(), ...mapFn(values) });
    saveData();
    renderAll();
    form.reset();
  });
}

function bindDeleteHandler() {
  document.body.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    if (!target.classList.contains("delete-btn")) return;
    const listType = target.dataset.type;
    const id = target.dataset.id;
    if (!listType || !id) return;
    data[listType] = data[listType].filter((item) => item.id !== id);
    saveData();
    renderAll();
  });
}

function exportData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    profile: {
      name: "Colton Mikolajczyk",
      program: "Master's in Business Analytics, MIT",
      focusRoles: ["Consulting", "Data Science Consulting", "Private Equity"],
    },
    data,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "recruiting_tracker_backup.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const imported = parsed.data || parsed;
      data = {
        contacts: imported.contacts || [],
        applications: imported.applications || [],
        casePractice: imported.casePractice || [],
        dsTopics: imported.dsTopics || [],
        sqlProblems: imported.sqlProblems || [],
        leetcodeProblems: imported.leetcodeProblems || [],
      };
      saveData();
      renderAll();
      alert("Import successful.");
    } catch (error) {
      console.error(error);
      alert("Import failed. Please select a valid JSON backup.");
    }
  };
  reader.readAsText(file);
}

function readGithubSettingsFromInputs() {
  return {
    owner: document.getElementById("ghOwner").value.trim(),
    repo: document.getElementById("ghRepo").value.trim(),
    branch: document.getElementById("ghBranch").value.trim() || "main",
    path: document.getElementById("ghPath").value.trim() || "data/recruiting_tracker.json",
    token: document.getElementById("ghToken").value.trim(),
  };
}

function loadGithubSettingsToInputs() {
  try {
    const raw = localStorage.getItem(GH_SETTINGS_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    document.getElementById("ghOwner").value = saved.owner || "";
    document.getElementById("ghRepo").value = saved.repo || "";
    document.getElementById("ghBranch").value = saved.branch || "main";
    document.getElementById("ghPath").value = saved.path || "data/recruiting_tracker.json";
    document.getElementById("ghToken").value = saved.token || "";
  } catch (error) {
    console.error("Could not load GitHub settings:", error);
  }
}

function saveGithubSettings(settings) {
  localStorage.setItem(GH_SETTINGS_KEY, JSON.stringify(settings));
}

function setGithubStatus(message, isError = false) {
  const status = document.getElementById("githubStatus");
  status.textContent = message;
  status.style.color = isError ? "#b42318" : "";
}

function toBase64Unicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64Unicode(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

async function githubRequest(settings, method, body, includePath = true) {
  const endpoint = includePath
    ? `https://api.github.com/repos/${settings.owner}/${settings.repo}/contents/${settings.path}`
    : `https://api.github.com/repos/${settings.owner}/${settings.repo}`;

  const response = await fetch(endpoint, {
    method,
    headers: {
      Authorization: `Bearer ${settings.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const parsed = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = parsed?.message || `GitHub API error (${response.status})`;
    throw new Error(message);
  }

  return parsed;
}

async function loadFileMetadata(settings) {
  try {
    const result = await githubRequest(settings, "GET");
    return result;
  } catch (error) {
    if (String(error.message).includes("Not Found")) return null;
    throw error;
  }
}

async function saveToGithub() {
  const settings = readGithubSettingsFromInputs();
  if (!settings.owner || !settings.repo || !settings.path || !settings.token) {
    setGithubStatus("Fill in owner, repo, file path, and token first.", true);
    return;
  }

  saveGithubSettings(settings);
  setGithubStatus("Saving to GitHub...");

  try {
    const existing = await loadFileMetadata(settings);
    const payload = {
      updatedAt: new Date().toISOString(),
      data,
    };

    const body = {
      message: `Update recruiting tracker (${new Date().toLocaleString()})`,
      content: toBase64Unicode(JSON.stringify(payload, null, 2)),
      branch: settings.branch,
    };
    if (existing?.sha) {
      body.sha = existing.sha;
    }

    await githubRequest(settings, "PUT", body);
    setGithubStatus("Saved successfully to GitHub.");
  } catch (error) {
    console.error(error);
    setGithubStatus(`Save failed: ${error.message}`, true);
  }
}

async function loadFromGithub() {
  const settings = readGithubSettingsFromInputs();
  if (!settings.owner || !settings.repo || !settings.path || !settings.token) {
    setGithubStatus("Fill in owner, repo, file path, and token first.", true);
    return;
  }

  saveGithubSettings(settings);
  setGithubStatus("Loading from GitHub...");

  try {
    const file = await githubRequest(settings, "GET");
    const decoded = fromBase64Unicode(file.content.replaceAll("\n", ""));
    const parsed = JSON.parse(decoded);
    const imported = parsed.data || parsed;
    data = {
      contacts: imported.contacts || [],
      applications: imported.applications || [],
      casePractice: imported.casePractice || [],
      dsTopics: imported.dsTopics || [],
      sqlProblems: imported.sqlProblems || [],
      leetcodeProblems: imported.leetcodeProblems || [],
    };
    saveData();
    renderAll();
    setGithubStatus("Loaded latest data from GitHub.");
  } catch (error) {
    console.error(error);
    setGithubStatus(`Load failed: ${error.message}`, true);
  }
}

function clearGithubSettings() {
  localStorage.removeItem(GH_SETTINGS_KEY);
  ["ghOwner", "ghRepo", "ghBranch", "ghPath", "ghToken"].forEach((id) => {
    const input = document.getElementById(id);
    input.value = id === "ghBranch" ? "main" : id === "ghPath" ? "data/recruiting_tracker.json" : "";
  });
  setGithubStatus("Cleared saved GitHub settings.");
}

function bindButtons() {
  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("importInput").addEventListener("change", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.files?.length) return;
    importData(target.files[0]);
    target.value = "";
  });
  document.getElementById("resetBtn").addEventListener("click", () => {
    const confirmed = confirm("Reset all tracked data? This cannot be undone.");
    if (!confirmed) return;
    data = structuredClone(defaultData);
    saveData();
    renderAll();
  });
  document.getElementById("saveGithubBtn").addEventListener("click", saveToGithub);
  document.getElementById("loadGithubBtn").addEventListener("click", loadFromGithub);
  document.getElementById("clearGithubBtn").addEventListener("click", clearGithubSettings);
}

function init() {
  bindForm("contactForm", "contacts", (v) => v);
  bindForm("applicationForm", "applications", (v) => v);
  bindForm("caseForm", "casePractice", (v) => v);
  bindForm("topicForm", "dsTopics", (v) => v);
  bindForm("sqlForm", "sqlProblems", (v) => v);
  bindForm("leetcodeForm", "leetcodeProblems", (v) => v);

  bindDeleteHandler();
  bindButtons();
  loadGithubSettingsToInputs();
  renderAll();
}

init();
