
const TDEE = 2500;
const STORAGE_KEY = "basic_fitness_tracker_entries";

const inputs = {
  date: document.getElementById("date"),
  weight: document.getElementById("weight"),
  calories: document.getElementById("calories"),
  run: document.getElementById("run"),
  walk: document.getElementById("walk"),
  pushups: document.getElementById("pushups"),
  plank: document.getElementById("plank"),
  abs: document.getElementById("abs")
};

const dailyDeficit = document.getElementById("dailyDeficit");
const saveButton = document.getElementById("saveButton");
const clearButton = document.getElementById("clearButton");
const savedMessage = document.getElementById("savedMessage");
const historyList = document.getElementById("historyList");

const entryScreen = document.getElementById("entryScreen");
const historyScreen = document.getElementById("historyScreen");
const entryTab = document.getElementById("entryTab");
const historyTab = document.getElementById("historyTab");

const avgIntake7 = document.getElementById("avgIntake7");
const avgDeficit7 = document.getElementById("avgDeficit7");
const avgIntake30 = document.getElementById("avgIntake30");
const avgDeficit30 = document.getElementById("avgDeficit30");

function todayString() {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today - timezoneOffset).toISOString().split("T")[0];
}

function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function numberOrNull(value) {
  if (value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function intOrNull(value) {
  if (value === "") return null;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function updateDeficitPreview() {
  const calories = intOrNull(inputs.calories.value);

  if (calories === null) {
    dailyDeficit.textContent = "—";
    dailyDeficit.className = "metric-value";
    return;
  }

  const deficit = TDEE - calories;
  dailyDeficit.textContent = deficit.toString();
  dailyDeficit.className = deficit >= 0 ? "metric-value positive" : "metric-value negative";
}

function currentEntryFromForm() {
  const calories = intOrNull(inputs.calories.value);

  return {
    date: inputs.date.value,
    weight: numberOrNull(inputs.weight.value),
    calories,
    deficit: calories === null ? null : TDEE - calories,
    run: numberOrNull(inputs.run.value),
    walk: numberOrNull(inputs.walk.value),
    pushups: intOrNull(inputs.pushups.value),
    plank: numberOrNull(inputs.plank.value),
    abs: inputs.abs.checked
  };
}

function saveCurrentEntry() {
  const entry = currentEntryFromForm();
  if (!entry.date) return;

  const entries = loadEntries();
  const existingIndex = entries.findIndex(item => item.date === entry.date);

  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }

  entries.sort((a, b) => a.date.localeCompare(b.date));
  saveEntries(entries);
  renderHistory();

  savedMessage.textContent = "Saved";
  setTimeout(() => {
    savedMessage.textContent = "";
  }, 1200);
}

function clearForm() {
  inputs.weight.value = "";
  inputs.calories.value = "";
  inputs.run.value = "";
  inputs.walk.value = "";
  inputs.pushups.value = "";
  inputs.plank.value = "";
  inputs.abs.checked = false;
  updateDeficitPreview();
}

function loadEntryForDate() {
  const entries = loadEntries();
  const entry = entries.find(item => item.date === inputs.date.value);

  if (!entry) {
    clearForm();
    return;
  }

  inputs.weight.value = entry.weight ?? "";
  inputs.calories.value = entry.calories ?? "";
  inputs.run.value = entry.run ?? "";
  inputs.walk.value = entry.walk ?? "";
  inputs.pushups.value = entry.pushups ?? "";
  inputs.plank.value = entry.plank ?? "";
  inputs.abs.checked = Boolean(entry.abs);
  updateDeficitPreview();
}

function averageRecent(entries, days, key) {
  const recentValues = entries
    .slice(-days)
    .map(entry => entry[key])
    .filter(value => typeof value === "number" && Number.isFinite(value));

  if (recentValues.length === 0) return null;
  return recentValues.reduce((sum, value) => sum + value, 0) / recentValues.length;
}

function setAverage(element, value) {
  element.textContent = value === null ? "—" : Math.round(value).toString();
}

function renderHistory() {
  const entries = loadEntries();

  setAverage(avgIntake7, averageRecent(entries, 7, "calories"));
  setAverage(avgDeficit7, averageRecent(entries, 7, "deficit"));
  setAverage(avgIntake30, averageRecent(entries, 30, "calories"));
  setAverage(avgDeficit30, averageRecent(entries, 30, "deficit"));

  if (entries.length === 0) {
    historyList.innerHTML = '<p class="empty-state">No entries yet.</p>';
    return;
  }

  historyList.innerHTML = entries
    .slice()
    .reverse()
    .map(entry => {
      const details = [
        entry.weight !== null ? `Weight ${entry.weight} kg` : null,
        entry.calories !== null ? `Calories ${entry.calories}` : null,
        entry.deficit !== null ? `Deficit ${entry.deficit}` : null,
        entry.run !== null ? `Run ${entry.run} km` : null,
        entry.walk !== null ? `Walk ${entry.walk} km` : null,
        entry.pushups !== null ? `Pushups ${entry.pushups}` : null,
        entry.plank !== null ? `Plank ${entry.plank} min` : null,
        entry.abs ? "Abs" : null
      ].filter(Boolean).join(" · ");

      return `
        <div class="history-item">
          <div class="history-date">${entry.date}</div>
          <div class="history-details">${details || "No details entered"}</div>
        </div>
      `;
    })
    .join("");
}

function showScreen(screenName) {
  const showingEntry = screenName === "entry";

  entryScreen.classList.toggle("active", showingEntry);
  historyScreen.classList.toggle("active", !showingEntry);
  entryTab.classList.toggle("active", showingEntry);
  historyTab.classList.toggle("active", !showingEntry);

  if (!showingEntry) renderHistory();
}

inputs.date.value = todayString();
loadEntryForDate();
renderHistory();

inputs.calories.addEventListener("input", updateDeficitPreview);
inputs.date.addEventListener("change", loadEntryForDate);
saveButton.addEventListener("click", saveCurrentEntry);
clearButton.addEventListener("click", clearForm);
entryTab.addEventListener("click", () => showScreen("entry"));
historyTab.addEventListener("click", () => showScreen("history"));
