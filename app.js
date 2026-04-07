const STORAGE_KEY = "colton_recruiting_os_v1";
const GH_SETTINGS_KEY = "colton_recruiting_os_github";
const TARGET_JOB_DRAFT_KEY = "colton_recruiting_target_job_draft";
const QUOTA_SETTINGS_KEY = "colton_recruiting_quota_settings";
const DAILY_QUOTA_KEY = "colton_recruiting_daily_quota";
const AUTO_SYNC_DELAY_MS = 1500;

const defaultData = {
  contacts: [],
  targetJobs: [],
  applications: [],
  casePractice: [],
  dsTopics: [],
  sqlProblems: [],
  leetcodeProblems: [],
};

let data = loadData();
let autoSyncTimer = null;
let autoSyncInFlight = false;

const defaultQuotaSettings = {
  hardLeetcode: 7,
  caseStudy: 5,
  networkingChats: 4,
  applications: 6,
  sqlProblems: 7,
  dsTopics: 5,
  hardLeetcodeMinutes: 45,
  caseStudyMinutes: 60,
  networkingChatsMinutes: 30,
  applicationsMinutes: 25,
  sqlProblemsMinutes: 25,
  dsTopicsMinutes: 40,
};

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
  queueAutoSync();
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultData);
    const parsed = JSON.parse(raw);
    return {
      contacts: parsed.contacts || [],
      targetJobs: parsed.targetJobs || [],
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
  document.getElementById("targetJobsCount").textContent = data.targetJobs.length;
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

function renderTargetJobs() {
  const tbody = document.getElementById("targetJobsTable");
  tbody.innerHTML = data.targetJobs
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row.role)}</td>
        <td>${escapeHtml(row.company)}</td>
        <td>${escapeHtml(row.industry)}</td>
        <td>${escapeHtml(row.priority)}</td>
        <td>${linkCell(row.link)}</td>
        <td>${escapeHtml(row.description || "")}</td>
        <td>${escapeHtml(row.notes || "")}</td>
        <td>${createDeleteButton("targetJobs", row.id)}</td>
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
  renderQuotaCard();
  renderCounts();
  renderContacts();
  renderTargetJobs();
  renderApplications();
  renderCasePractice();
  renderTopics();
  renderSql();
  renderLeetcode();
}

function todayKey() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function seededUnit(seedText) {
  let hash = 2166136261;
  for (let i = 0; i < seedText.length; i += 1) {
    hash ^= seedText.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return ((hash >>> 0) % 1000) / 1000;
}

function dayWeightFromDate(dateText) {
  const day = new Date(`${dateText}T00:00:00`).getDay();
  const weights = [0.7, 1.2, 1.15, 1.1, 1.05, 0.95, 0.8];
  return weights[day] || 1;
}

function dailyTargetFromWeekly(weeklyGoal, dateText, key) {
  if (weeklyGoal <= 0) return 0;
  const base = weeklyGoal / 7;
  const weight = dayWeightFromDate(dateText);
  const variance = 0.85 + seededUnit(`${dateText}_${key}`) * 0.4;
  const raw = base * weight * variance;
  const target = Math.round(raw);
  if (weeklyGoal >= 4) return Math.max(1, target);
  return Math.max(0, target);
}

function loadQuotaSettings() {
  try {
    const raw = localStorage.getItem(QUOTA_SETTINGS_KEY);
    if (!raw) return structuredClone(defaultQuotaSettings);
    const parsed = JSON.parse(raw);
    return {
      hardLeetcode: toInt(parsed.hardLeetcode, defaultQuotaSettings.hardLeetcode),
      caseStudy: toInt(parsed.caseStudy, defaultQuotaSettings.caseStudy),
      networkingChats: toInt(parsed.networkingChats, defaultQuotaSettings.networkingChats),
      applications: toInt(parsed.applications, defaultQuotaSettings.applications),
      sqlProblems: toInt(parsed.sqlProblems, defaultQuotaSettings.sqlProblems),
      dsTopics: toInt(parsed.dsTopics, defaultQuotaSettings.dsTopics),
      hardLeetcodeMinutes: toInt(parsed.hardLeetcodeMinutes, defaultQuotaSettings.hardLeetcodeMinutes),
      caseStudyMinutes: toInt(parsed.caseStudyMinutes, defaultQuotaSettings.caseStudyMinutes),
      networkingChatsMinutes: toInt(parsed.networkingChatsMinutes, defaultQuotaSettings.networkingChatsMinutes),
      applicationsMinutes: toInt(parsed.applicationsMinutes, defaultQuotaSettings.applicationsMinutes),
      sqlProblemsMinutes: toInt(parsed.sqlProblemsMinutes, defaultQuotaSettings.sqlProblemsMinutes),
      dsTopicsMinutes: toInt(parsed.dsTopicsMinutes, defaultQuotaSettings.dsTopicsMinutes),
    };
  } catch (error) {
    console.error("Could not load quota settings:", error);
    return structuredClone(defaultQuotaSettings);
  }
}

function saveQuotaSettings(settings) {
  localStorage.setItem(QUOTA_SETTINGS_KEY, JSON.stringify(settings));
}

function loadDailyQuota() {
  try {
    const raw = localStorage.getItem(DAILY_QUOTA_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Could not load daily quota:", error);
    return null;
  }
}

function saveDailyQuota(quota) {
  localStorage.setItem(DAILY_QUOTA_KEY, JSON.stringify(quota));
}

function createDailyQuota(settings) {
  const dateText = todayKey();
  return {
    date: dateText,
    goals: {
      hardLeetcode: dailyTargetFromWeekly(settings.hardLeetcode, dateText, "hardLeetcode"),
      caseStudy: dailyTargetFromWeekly(settings.caseStudy, dateText, "caseStudy"),
      networkingChats: dailyTargetFromWeekly(settings.networkingChats, dateText, "networkingChats"),
      applications: dailyTargetFromWeekly(settings.applications, dateText, "applications"),
      sqlProblems: dailyTargetFromWeekly(settings.sqlProblems, dateText, "sqlProblems"),
      dsTopics: dailyTargetFromWeekly(settings.dsTopics, dateText, "dsTopics"),
    },
    minutes: {
      hardLeetcode: settings.hardLeetcodeMinutes,
      caseStudy: settings.caseStudyMinutes,
      networkingChats: settings.networkingChatsMinutes,
      applications: settings.applicationsMinutes,
      sqlProblems: settings.sqlProblemsMinutes,
      dsTopics: settings.dsTopicsMinutes,
    },
  };
}

function getOrCreateTodayQuota() {
  const settings = loadQuotaSettings();
  const existing = loadDailyQuota();
  if (existing && existing.date === todayKey()) return existing;
  const created = createDailyQuota(settings);
  saveDailyQuota(created);
  return created;
}

function getTodayProgress() {
  const today = todayKey();
  const hardLeetcodeToday = data.leetcodeProblems.filter(
    (item) => item.date === today && String(item.difficulty).toLowerCase() === "hard"
  ).length;
  const caseStudyToday = data.casePractice.filter((item) => item.date === today).length;
  const networkingChatsToday = data.contacts.filter((item) => item.chatDate === today).length;
  const applicationsToday = data.applications.filter((item) => item.appliedDate === today).length;
  const sqlProblemsToday = data.sqlProblems.filter((item) => item.date === today).length;
  const dsTopicsToday = data.dsTopics.filter((item) => item.date === today).length;
  return {
    hardLeetcode: hardLeetcodeToday,
    caseStudy: caseStudyToday,
    networkingChats: networkingChatsToday,
    applications: applicationsToday,
    sqlProblems: sqlProblemsToday,
    dsTopics: dsTopicsToday,
  };
}

function renderQuotaCard() {
  const quota = getOrCreateTodayQuota();
  const progress = getTodayProgress();
  const dateLabel = document.getElementById("quotaDateLabel");
  const tableBody = document.getElementById("quotaTableBody");
  const totalTime = document.getElementById("quotaTotalTime");
  const formattedDate = new Date(`${quota.date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  dateLabel.textContent = `Plan for ${formattedDate}`;

  const rows = [
    { key: "hardLeetcode", label: "Hard LeetCode Problems" },
    { key: "caseStudy", label: "Case Studies" },
    { key: "networkingChats", label: "Networking Chats" },
    { key: "applications", label: "Applications Submitted" },
    { key: "sqlProblems", label: "SQL Problems" },
    { key: "dsTopics", label: "Data Science Topics" },
  ];

  tableBody.innerHTML = rows
    .map((row) => {
      const target = quota.goals[row.key] || 0;
      const done = progress[row.key] || 0;
      const minutesPerUnit = quota.minutes[row.key] || 0;
      const estimatedMinutes = target * minutesPerUnit;
      return `
        <tr>
          <td>${escapeHtml(row.label)}</td>
          <td>${target}</td>
          <td>${done}/${target}</td>
          <td>${estimatedMinutes} min</td>
        </tr>
      `;
    })
    .join("");

  const totalMinutes = rows.reduce((sum, row) => {
    return sum + (quota.goals[row.key] || 0) * (quota.minutes[row.key] || 0);
  }, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  totalTime.textContent = `Estimated focused time today: ${totalMinutes} minutes (${totalHours} hours).`;
}

function populateQuotaSettingsForm() {
  const settings = loadQuotaSettings();
  const form = document.getElementById("quotaSettingsForm");
  if (!form) return;
  Object.entries(settings).forEach(([name, value]) => {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement) {
      field.value = String(value);
    }
  });
}

function readQuotaSettingsFromForm() {
  const form = document.getElementById("quotaSettingsForm");
  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  return {
    hardLeetcode: toInt(values.hardLeetcode, defaultQuotaSettings.hardLeetcode),
    caseStudy: toInt(values.caseStudy, defaultQuotaSettings.caseStudy),
    networkingChats: toInt(values.networkingChats, defaultQuotaSettings.networkingChats),
    applications: toInt(values.applications, defaultQuotaSettings.applications),
    sqlProblems: toInt(values.sqlProblems, defaultQuotaSettings.sqlProblems),
    dsTopics: toInt(values.dsTopics, defaultQuotaSettings.dsTopics),
    hardLeetcodeMinutes: toInt(values.hardLeetcodeMinutes, defaultQuotaSettings.hardLeetcodeMinutes),
    caseStudyMinutes: toInt(values.caseStudyMinutes, defaultQuotaSettings.caseStudyMinutes),
    networkingChatsMinutes: toInt(values.networkingChatsMinutes, defaultQuotaSettings.networkingChatsMinutes),
    applicationsMinutes: toInt(values.applicationsMinutes, defaultQuotaSettings.applicationsMinutes),
    sqlProblemsMinutes: toInt(values.sqlProblemsMinutes, defaultQuotaSettings.sqlProblemsMinutes),
    dsTopicsMinutes: toInt(values.dsTopicsMinutes, defaultQuotaSettings.dsTopicsMinutes),
  };
}

function bindForm(formId, listKey, mapFn, options = {}) {
  const form = document.getElementById(formId);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    data[listKey].unshift({ id: uid(), ...mapFn(values) });
    saveData();
    renderAll();
    form.reset();
    if (typeof options.onSaved === "function") {
      options.onSaved();
    }
  });
}

function bindFormDraftPersistence(formId, draftStorageKey) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Restore any draft values from localStorage.
  try {
    const raw = localStorage.getItem(draftStorageKey);
    if (raw) {
      const draft = JSON.parse(raw);
      Object.entries(draft).forEach(([name, value]) => {
        const field = form.elements.namedItem(name);
        if (!field) return;
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
          field.value = value;
        }
      });
    }
  } catch (error) {
    console.error("Could not restore form draft:", error);
  }

  // Save draft values as user types.
  form.addEventListener("input", () => {
    try {
      const formData = new FormData(form);
      const draft = Object.fromEntries(formData.entries());
      localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    } catch (error) {
      console.error("Could not save form draft:", error);
    }
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
        targetJobs: imported.targetJobs || [],
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
    autoSync: document.getElementById("autoSyncToggle").checked,
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
    document.getElementById("autoSyncToggle").checked = saved.autoSync !== false;
  } catch (error) {
    console.error("Could not load GitHub settings:", error);
  }
}

function hasGithubSettings(settings) {
  return Boolean(settings.owner && settings.repo && settings.path && settings.token);
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

async function saveToGithub({ silent = false } = {}) {
  const settings = readGithubSettingsFromInputs();
  if (!hasGithubSettings(settings)) {
    if (!silent) {
      setGithubStatus("Fill in owner, repo, file path, and token first.", true);
    }
    return;
  }

  saveGithubSettings(settings);
  autoSyncInFlight = true;
  setGithubStatus(silent ? "Auto-syncing to GitHub..." : "Saving to GitHub...");

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
    setGithubStatus(silent ? "Auto-sync complete." : "Saved successfully to GitHub.");
  } catch (error) {
    console.error(error);
    setGithubStatus(`${silent ? "Auto-sync failed" : "Save failed"}: ${error.message}`, true);
  } finally {
    autoSyncInFlight = false;
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
      targetJobs: imported.targetJobs || [],
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
  ["ghOwner", "ghRepo", "ghBranch", "ghPath", "ghToken", "autoSyncToggle"].forEach((id) => {
    const input = document.getElementById(id);
    if (id === "autoSyncToggle") {
      input.checked = true;
      return;
    }
    input.value = id === "ghBranch" ? "main" : id === "ghPath" ? "data/recruiting_tracker.json" : "";
  });
  setGithubStatus("Cleared saved GitHub settings.");
}

function queueAutoSync() {
  const settings = readGithubSettingsFromInputs();
  if (!settings.autoSync || !hasGithubSettings(settings)) return;
  if (autoSyncInFlight) return;
  clearTimeout(autoSyncTimer);
  autoSyncTimer = setTimeout(() => {
    saveToGithub({ silent: true });
  }, AUTO_SYNC_DELAY_MS);
}

function bindGithubSettingsPersistence() {
  ["ghOwner", "ghRepo", "ghBranch", "ghPath", "ghToken", "autoSyncToggle"].forEach((id) => {
    const input = document.getElementById(id);
    const eventName = id === "autoSyncToggle" ? "change" : "input";
    input.addEventListener(eventName, () => {
      saveGithubSettings(readGithubSettingsFromInputs());
    });
  });
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
  document.getElementById("recalculateQuotaBtn").addEventListener("click", () => {
    const settings = readQuotaSettingsFromForm();
    saveQuotaSettings(settings);
    saveDailyQuota(createDailyQuota(settings));
    renderAll();
    saveData();
  });
}

function bindQuotaSettingsForm() {
  const form = document.getElementById("quotaSettingsForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const settings = readQuotaSettingsFromForm();
    saveQuotaSettings(settings);
    saveDailyQuota(createDailyQuota(settings));
    renderAll();
    saveData();
  });
}

function init() {
  bindForm("contactForm", "contacts", (v) => v);
  bindForm("targetJobForm", "targetJobs", (v) => v, {
    onSaved: () => localStorage.removeItem(TARGET_JOB_DRAFT_KEY),
  });
  bindForm("applicationForm", "applications", (v) => v);
  bindForm("caseForm", "casePractice", (v) => v);
  bindForm("topicForm", "dsTopics", (v) => v);
  bindForm("sqlForm", "sqlProblems", (v) => v);
  bindForm("leetcodeForm", "leetcodeProblems", (v) => v);

  bindDeleteHandler();
  bindButtons();
  bindQuotaSettingsForm();
  bindGithubSettingsPersistence();
  bindFormDraftPersistence("targetJobForm", TARGET_JOB_DRAFT_KEY);
  loadGithubSettingsToInputs();
  populateQuotaSettingsForm();
  renderAll();
}

init();
