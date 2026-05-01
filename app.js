
const DEFAULT_TDEE = 2500;
const STORAGE_KEY = "basic_fitness_tracker_entries";
const GOALS_KEY = "fitness_tracker_monthly_goals";
const SETTINGS_KEY = "fitness_tracker_settings";
let graphRangeMode = "monthly";
let graphMode = "average";
let entryCalendarMonth = new Date();
entryCalendarMonth.setDate(1);

const inputs = { date: document.getElementById("date"), weight: document.getElementById("weight"), calories: document.getElementById("calories"), run: document.getElementById("run"), walk: document.getElementById("walk"), pushups: document.getElementById("pushups"), abs: document.getElementById("abs"), notes: document.getElementById("workoutNotes") };
const settingInputs = { name: document.getElementById("settingName"), tdee: document.getElementById("settingTdee"), weightUnit: document.getElementById("settingWeightUnit"), showWeight: document.getElementById("showWeight"), showCalories: document.getElementById("showCalories"), showRun: document.getElementById("showRun"), showWalk: document.getElementById("showWalk"), showPushups: document.getElementById("showPushups"), showAbs: document.getElementById("showAbs"), showNotes: document.getElementById("showNotes") };
const goalInputs = { runStart: document.getElementById("runStart"), runGoal: document.getElementById("runGoal"), pushupStart: document.getElementById("pushupStart"), pushupGoal: document.getElementById("pushupGoal"), absGoal: document.getElementById("absGoal") };
const dailyDeficit = document.getElementById("dailyDeficit");
const saveButton = document.getElementById("saveButton");
const clearButton = document.getElementById("clearButton");
const savedMessage = document.getElementById("savedMessage");
const historyList = document.getElementById("historyList");
const exportButton = document.getElementById("exportButton");
const importButton = document.getElementById("importButton");
const importFile = document.getElementById("importFile");
const backupMessage = document.getElementById("backupMessage");
const entryScreen = document.getElementById("entryScreen");
const settingsScreen = document.getElementById("settingsScreen");
const historyScreen = document.getElementById("historyScreen");
const graphsScreen = document.getElementById("graphsScreen");
const calendarScreen = document.getElementById("calendarScreen");
const entryTab = document.getElementById("entryTab");
const settingsTab = document.getElementById("settingsTab");
const graphsTab = document.getElementById("graphsTab");
const calendarTab = document.getElementById("calendarTab");
const avgIntake7 = document.getElementById("avgIntake7");
const avgDeficit7 = document.getElementById("avgDeficit7");
const avgIntake30 = document.getElementById("avgIntake30");
const avgDeficit30 = document.getElementById("avgDeficit30");
const calendarAvgIntake7 = document.getElementById("calendarAvgIntake7");
const calendarAvgDeficit7 = document.getElementById("calendarAvgDeficit7");
const calendarAvgIntake30 = document.getElementById("calendarAvgIntake30");
const calendarAvgDeficit30 = document.getElementById("calendarAvgDeficit30");
const previousMonthButton = document.getElementById("previousMonth");
const nextMonthButton = document.getElementById("nextMonth");
const calendarMonthTitle = document.getElementById("calendarMonthTitle");
const calendarMonthPicker = document.getElementById("calendarMonthPicker");
const calendarGrid = document.getElementById("calendarGrid");
const calendarGoalSummary = document.getElementById("calendarGoalSummary");
const calendarCaloriesCard = document.getElementById("calendarCaloriesCard");
const currentBestsCard = document.getElementById("currentBestsCard");
const calendarDayDetails = document.getElementById("calendarDayDetails");
const calendarDayDetailsTitle = document.getElementById("calendarDayDetailsTitle");
const calendarDayDetailsBody = document.getElementById("calendarDayDetailsBody");
const saveGoalsButton = document.getElementById("saveGoalsButton");
const goalsMessage = document.getElementById("goalsMessage");
const saveSettingsButton = document.getElementById("saveSettingsButton");
const settingsMessage = document.getElementById("settingsMessage");
const bodyCard = document.getElementById("bodyCard");
const exerciseCard = document.getElementById("exerciseCard");
const weightField = document.getElementById("weightField");
const caloriesField = document.getElementById("caloriesField");
const runField = document.getElementById("runField");
const walkField = document.getElementById("walkField");
const pushupsField = document.getElementById("pushupsField");
const absField = document.getElementById("absField");
const notesField = document.getElementById("notesField");
const dailyDeficitMetric = document.getElementById("dailyDeficitMetric");
const tdeeMetric = document.getElementById("tdeeMetric");
const tdeeDisplay = document.getElementById("tdeeDisplay");
const weightLabel = document.getElementById("weightLabel");
const runStartGoalField = document.getElementById("runStartGoalField");
const runEndGoalField = document.getElementById("runEndGoalField");
const pushupStartGoalField = document.getElementById("pushupStartGoalField");
const pushupEndGoalField = document.getElementById("pushupEndGoalField");
const absGoalField = document.getElementById("absGoalField");
const weightGraphCard = document.getElementById("weightGraphCard");
const deficitGraphCard = document.getElementById("deficitGraphCard");
const runGraphCard = document.getElementById("runGraphCard");
const walkGraphCard = document.getElementById("walkGraphCard");
const pushupGraphCard = document.getElementById("pushupGraphCard");
const graphStartDateInput = document.getElementById("graphStartDate");
const averageGraphMode = document.getElementById("averageGraphMode");
const dailyGraphMode = document.getElementById("dailyGraphMode");
const entryPreviousMonth = document.getElementById("entryPreviousMonth");
const entryNextMonth = document.getElementById("entryNextMonth");
const entryCalendarMonthTitle = document.getElementById("entryCalendarMonthTitle");
const entryCalendarGrid = document.getElementById("entryCalendarGrid");

let calendarMonth = new Date();
calendarMonth.setDate(1);

function todayString() { const today = new Date(); const timezoneOffset = today.getTimezoneOffset() * 60000; return new Date(today - timezoneOffset).toISOString().split("T")[0]; }
function dateStringFromParts(year, monthIndex, day) { const date = new Date(year, monthIndex, day); const timezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date - timezoneOffset).toISOString().split("T")[0]; }
function monthKeyFromDate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
function dateFromString(dateString) { return new Date(`${dateString}T00:00:00`); }
function setCalendarMonthFromKey(monthKey) { const [year, month] = monthKey.split("-").map(Number); calendarMonth = new Date(year, month - 1, 1); }
function setEntryCalendarMonthFromDateString(dateString) { const date = dateFromString(dateString); entryCalendarMonth = new Date(date.getFullYear(), date.getMonth(), 1); }
function loadEntries() { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return []; try { return JSON.parse(raw); } catch { return []; } }
function saveEntries(entries) { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); }
function loadGoals() { const raw = localStorage.getItem(GOALS_KEY); if (!raw) return {}; try { return JSON.parse(raw); } catch { return {}; } }
function defaultSettings() { return { name: "Spencer", tdee: 2500, weightUnit: "lb", showWeight: true, showCalories: true, showRun: true, showWalk: true, showPushups: true, showAbs: true, showNotes: true }; }
function loadSettings() { const raw = localStorage.getItem(SETTINGS_KEY); if (!raw) return defaultSettings(); try { return { ...defaultSettings(), ...JSON.parse(raw) }; } catch { return defaultSettings(); } }
function saveSettings(settings) { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
function saveGoals(goals) { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); }
function getGoalsForMonth(date) { const allGoals = loadGoals(); return allGoals[monthKeyFromDate(date)] || { runStart:null, runGoal:null, pushupStart:null, pushupGoal:null, absGoal:null }; }
function numberOrNull(value) { if (value === "") return null; const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; }
function intOrNull(value) { if (value === "") return null; const parsed = parseInt(value, 10); return Number.isFinite(parsed) ? parsed : null; }
function displayNumber(value) {
  if (!Number.isFinite(value)) return "";
  return Math.round(value).toString();
}

function currentTdee() { return loadSettings().tdee || DEFAULT_TDEE; }
function updateDeficitPreview() { const calories = intOrNull(inputs.calories.value); if (calories === null) { dailyDeficit.textContent = "—"; dailyDeficit.className = "metric-value"; return; } const deficit = currentTdee() - calories; dailyDeficit.textContent = deficit.toString(); dailyDeficit.className = deficit >= 0 ? "metric-value positive" : "metric-value negative"; }
function currentEntryFromForm() { const calories = intOrNull(inputs.calories.value); return { date: inputs.date.value, weight: numberOrNull(inputs.weight.value), calories, deficit: calories === null ? null : currentTdee() - calories, run: numberOrNull(inputs.run.value), walk: numberOrNull(inputs.walk.value), pushups: intOrNull(inputs.pushups.value), abs: inputs.abs.checked, notes: inputs.notes.value.trim() }; }
function saveCurrentEntry() { const entry = currentEntryFromForm(); if (!entry.date) return; const entries = loadEntries(); const existingIndex = entries.findIndex(item => item.date === entry.date); if (existingIndex >= 0) entries[existingIndex] = entry; else entries.push(entry); entries.sort((a,b) => a.date.localeCompare(b.date)); saveEntries(entries); refreshAllViews(); savedMessage.textContent = "Saved"; setTimeout(() => savedMessage.textContent = "", 1200); }
function clearForm() { inputs.weight.value = ""; inputs.calories.value = ""; inputs.run.value = ""; inputs.walk.value = ""; inputs.pushups.value = ""; inputs.abs.checked = false; inputs.notes.value = ""; updateDeficitPreview(); }
function loadEntryForDate() { const entry = loadEntries().find(item => item.date === inputs.date.value); if (!entry) { clearForm(); renderEntryCalendar(); return; } inputs.weight.value = entry.weight ?? ""; inputs.calories.value = entry.calories ?? ""; inputs.run.value = entry.run ?? ""; inputs.walk.value = entry.walk ?? ""; inputs.pushups.value = entry.pushups ?? ""; inputs.abs.checked = Boolean(entry.abs); inputs.notes.value = entry.notes ?? ""; updateDeficitPreview(); renderEntryCalendar(); }
function editEntry(dateString) { inputs.date.value = dateString; setEntryCalendarMonthFromDateString(dateString); loadEntryForDate(); showScreen("entry"); window.scrollTo({ top:0, behavior:"smooth" }); }

function renderEntryCalendar() { const entries = loadEntries(); const entryDates = new Set(entries.map(entry => entry.date)); const selectedDate = inputs.date.value; const year = entryCalendarMonth.getFullYear(); const monthIndex = entryCalendarMonth.getMonth(); const monthName = entryCalendarMonth.toLocaleString("default", { month:"long", year:"numeric" }); const firstDay = new Date(year, monthIndex, 1).getDay(); const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); entryCalendarMonthTitle.textContent = monthName; entryCalendarGrid.innerHTML = ""; for (let i = 0; i < firstDay; i++) { const emptyCell = document.createElement("button"); emptyCell.className = "entry-calendar-day empty"; emptyCell.disabled = true; entryCalendarGrid.appendChild(emptyCell); } for (let day = 1; day <= daysInMonth; day++) { const dateString = dateStringFromParts(year, monthIndex, day); const button = document.createElement("button"); button.className = "entry-calendar-day"; if (entryDates.has(dateString)) button.classList.add("has-data"); if (dateString === selectedDate) button.classList.add("selected"); button.textContent = day; button.addEventListener("click", () => { inputs.date.value = dateString; loadEntryForDate(); }); entryCalendarGrid.appendChild(button); } }

function syncSettingsForm() {
  const settings = loadSettings();
  settingInputs.name.value = settings.name;
  settingInputs.tdee.value = settings.tdee;
  settingInputs.weightUnit.value = settings.weightUnit;
  settingInputs.showWeight.checked = settings.showWeight;
  settingInputs.showCalories.checked = settings.showCalories;
  settingInputs.showRun.checked = settings.showRun;
  settingInputs.showWalk.checked = settings.showWalk;
  settingInputs.showPushups.checked = settings.showPushups;
  settingInputs.showAbs.checked = settings.showAbs;
  settingInputs.showNotes.checked = settings.showNotes;
}

function saveSettingsFromForm() {
  const settings = {
    name: settingInputs.name.value.trim() || "Fitness",
    tdee: intOrNull(settingInputs.tdee.value) || 2500,
    weightUnit: settingInputs.weightUnit.value,
    showWeight: settingInputs.showWeight.checked,
    showCalories: settingInputs.showCalories.checked,
    showRun: settingInputs.showRun.checked,
    showWalk: settingInputs.showWalk.checked,
    showPushups: settingInputs.showPushups.checked,
    showAbs: settingInputs.showAbs.checked,
    showNotes: settingInputs.showNotes.checked
  };

  saveSettings(settings);
  applySettings();
  refreshAllViews();
  settingsMessage.textContent = "Settings saved";
  setTimeout(() => settingsMessage.textContent = "", 1200);
}

function setVisible(element, visible) { element.classList.toggle("hidden-setting", !visible); }

function applySettings() {
  const settings = loadSettings();
  document.querySelector("#entryScreen h1").textContent = `${settings.name}'s Fitness Tracker`;
  weightLabel.textContent = `Weight ${settings.weightUnit}`;
  tdeeDisplay.textContent = settings.tdee;

  setVisible(weightField, settings.showWeight);
  setVisible(caloriesField, settings.showCalories);
  setVisible(runField, settings.showRun);
  setVisible(walkField, settings.showWalk);
  setVisible(pushupsField, settings.showPushups);
  setVisible(absField, settings.showAbs);
  setVisible(notesField, settings.showNotes);
  setVisible(dailyDeficitMetric, settings.showCalories);
  setVisible(tdeeMetric, settings.showCalories);
  setVisible(bodyCard, settings.showWeight || settings.showCalories);
  setVisible(exerciseCard, settings.showRun || settings.showWalk || settings.showPushups || settings.showAbs || settings.showNotes);

  setVisible(runStartGoalField, settings.showRun);
  setVisible(runEndGoalField, settings.showRun);
  setVisible(pushupStartGoalField, settings.showPushups);
  setVisible(pushupEndGoalField, settings.showPushups);
  setVisible(absGoalField, settings.showAbs);

  setVisible(weightGraphCard, settings.showWeight);
  setVisible(deficitGraphCard, settings.showCalories);
  setVisible(runGraphCard, settings.showRun);
  setVisible(walkGraphCard, settings.showWalk);
  setVisible(pushupGraphCard, settings.showPushups);
  setVisible(calendarCaloriesCard, settings.showCalories);
}

function shouldShowField(key) { return loadSettings()[`show${key}`] !== false; }

function loadGoalsForCalendarMonth() { const goals = getGoalsForMonth(calendarMonth); calendarMonthPicker.value = monthKeyFromDate(calendarMonth); goalInputs.runStart.value = goals.runStart ?? ""; goalInputs.runGoal.value = goals.runGoal ?? ""; goalInputs.pushupStart.value = goals.pushupStart ?? ""; goalInputs.pushupGoal.value = goals.pushupGoal ?? ""; goalInputs.absGoal.value = goals.absGoal ?? ""; }
function saveGoalsForCalendarMonth() { const allGoals = loadGoals(); allGoals[monthKeyFromDate(calendarMonth)] = { runStart: numberOrNull(goalInputs.runStart.value), runGoal: numberOrNull(goalInputs.runGoal.value), pushupStart: intOrNull(goalInputs.pushupStart.value), pushupGoal: intOrNull(goalInputs.pushupGoal.value), absGoal: intOrNull(goalInputs.absGoal.value) }; saveGoals(allGoals); renderCalendar(); goalsMessage.textContent = "Goals saved"; setTimeout(() => goalsMessage.textContent = "", 1200); }
function averageRecent(entries, days, key) { const recentValues = entries.slice(-days).map(entry => entry[key]).filter(value => typeof value === "number" && Number.isFinite(value)); if (recentValues.length === 0) return null; return recentValues.reduce((sum,value) => sum + value, 0) / recentValues.length; }
function setAverage(element, value) { element.textContent = value === null ? "—" : Math.round(value).toString(); }

function renderCalorieTracking() {
  const entries = loadEntries();
  
  setAverage(calendarAvgIntake7, averageRecent(entries, 7, "calories"));
  setAverage(calendarAvgDeficit7, averageRecent(entries, 7, "deficit"));
  setAverage(calendarAvgIntake30, averageRecent(entries, 30, "calories"));
  setAverage(calendarAvgDeficit30, averageRecent(entries, 30, "deficit"));
}

function renderHistory() { const entries = loadEntries(); renderCalorieTracking(); if (entries.length === 0) { historyList.innerHTML = '<p class="empty-state">No entries yet.</p>'; return; } historyList.innerHTML = entries.slice().reverse().map(entry => { const details = [shouldShowField("Weight") && entry.weight !== null ? `Weight ${entry.weight} ${loadSettings().weightUnit}` : null, shouldShowField("Calories") && entry.calories !== null ? `Calories ${entry.calories}` : null, shouldShowField("Calories") && entry.deficit !== null ? `Deficit ${entry.deficit}` : null, shouldShowField("Run") && entry.run !== null ? `Run ${entry.run} km` : null, shouldShowField("Walk") && entry.walk !== null ? `Walk ${entry.walk} km` : null, shouldShowField("Pushups") && entry.pushups !== null ? `Pushups ${entry.pushups}` : null, shouldShowField("Abs") && entry.abs ? "Abs" : null, shouldShowField("Notes") && entry.notes ? `Workout: ${entry.notes}` : null].filter(Boolean).join(" · "); return `<button class="history-item" data-date="${entry.date}"><div class="history-date">${entry.date}</div><div class="history-details">${details || "No details entered"}</div></button>`; }).join(""); document.querySelectorAll(".history-item").forEach(item => item.addEventListener("click", () => editEntry(item.dataset.date))); }

function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function graphDateWindow() {
  const pickedStart = graphStartDateInput?.value ? dateFromString(graphStartDateInput.value) : null;
  let start;
  let end;

  if (graphRangeMode === "weekly") {
    start = pickedStart || startOfWeek(new Date());
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    end = new Date(start);
    end.setDate(start.getDate() + 6);
  } else if (graphRangeMode === "year") {
    start = pickedStart || new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    start = new Date(start.getFullYear(), start.getMonth(), 1);
    end = new Date(start);
    end.setFullYear(start.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
  } else {
    start = pickedStart || new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    end = new Date(start);
    end.setMonth(start.getMonth() + 1);
    end.setDate(end.getDate() - 1);
  }

  return { start, end };
}

function graphTitleText() {
  const { start, end } = graphDateWindow();
  const longDate = date => date.toLocaleString("default", { month: "long", day: "numeric", year: "numeric" });
  const monthYear = date => date.toLocaleString("default", { month: "long", year: "numeric" });

  if (graphRangeMode === "weekly") return `Week of ${longDate(start)}`;
  return monthYear(start);
}

function filteredEntriesForGraph(entries) {
  if (entries.length === 0) return [];
  const { start, end } = graphDateWindow();

  return entries.filter(entry => {
    const entryDate = dateFromString(entry.date);
    return entryDate >= start && entryDate <= end;
  });
}

function rollingAverageData(entries, days, key) {
  return entries.map((entry, index) => {
    const windowEntries = entries.slice(Math.max(0, index - days + 1), index + 1);
    const values = windowEntries.map(item => item[key]).filter(value => typeof value === "number" && Number.isFinite(value));
    if (values.length === 0) return { date: entry.date, value: null };
    return { date: entry.date, value: values.reduce((sum, value) => sum + value, 0) / values.length };
  });
}

function dailyData(entries, key) {
  return entries.map(entry => ({ date: entry.date, value: typeof entry[key] === "number" && Number.isFinite(entry[key]) ? entry[key] : null })).filter(point => point.value !== null);
}

function renderGraphs() {
  const entries = filteredEntriesForGraph(loadEntries());
  if (shouldShowField("Weight")) drawChart("weightChart", entries, "weight");
  if (shouldShowField("Calories")) drawChart("deficitChart", entries, "deficit");
  if (shouldShowField("Run")) drawChart("runChart", entries, "run");
  if (shouldShowField("Walk")) drawChart("walkChart", entries, "walk");
  if (shouldShowField("Pushups")) drawChart("pushupChart", entries, "pushups");
}

function drawChart(canvasId, entries, key) {
  if (graphMode === "daily") drawBarChart(canvasId, entries, key);
  else drawAverageChart(canvasId, entries, key);
}

function setupCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const context = canvas.getContext("2d");
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(280, Math.floor(rect.width));
  const height = Math.max(210, Math.floor(rect.height || 220));

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, width, height);

  return { canvas, context, width, height };
}

function drawEmpty(context, message = "No data for selected range") {
  context.fillStyle = "#a1a1a6";
  context.font = "15px system-ui";
  context.fillText(message, 12, 45);
}

function getAxisScale(values, key) {
  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);

  if (minValue === maxValue) {
    const singleBuffer = key === "weight" ? 2 : Math.max(Math.abs(minValue) * 0.08, 1);
    return { minValue: minValue - singleBuffer, maxValue: maxValue + singleBuffer };
  }

  const range = maxValue - minValue;
  let buffer;

  if (key === "weight") buffer = Math.max(range * 0.25, 1.5);
  else if (key === "deficit") buffer = Math.max(range * 0.18, 100);
  else buffer = Math.max(range * 0.2, maxValue < 10 ? 0.5 : 2);

  return { minValue: minValue - buffer, maxValue: maxValue + buffer };
}

function drawAverageChart(canvasId, entries, key) {
  const setup = setupCanvas(canvasId);
  if (!setup) return;
  const { context, width, height } = setup;

  const weekly = rollingAverageData(entries, 7, key).filter(point => point.value !== null);
  const allValues = weekly.map(point => point.value);

  drawGraphTitle(context, width);

  if (entries.length === 0 || allValues.length === 0) {
    drawEmpty(context);
    return;
  }

  const padding = { top: 38, right: 10, bottom: 42, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  let { minValue, maxValue } = getAxisScale(allValues, key);
  if (key !== "deficit") minValue = Math.max(0, minValue);
  const { start, end } = graphDateWindow();
  const totalDays = Math.max(1, Math.round((end - start) / 86400000));

  const xForDate = date => {
    const dayOffset = Math.round((dateFromString(date) - start) / 86400000);
    return padding.left + (dayOffset / totalDays) * chartWidth;
  };

  const yForValue = value => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  drawGrid(context, width, height, padding, chartHeight, maxValue, minValue);
  drawZeroLineIfNeeded(context, width, padding, chartHeight, minValue, maxValue, key);
  drawLine(context, weekly, xForDate, yForValue, "#0a84ff", 3);
  drawGraphXAxis(context, padding, chartWidth, chartHeight);
}

function drawBarChart(canvasId, entries, key) {
  const setup = setupCanvas(canvasId);
  if (!setup) return;
  const { context, width, height } = setup;
  const data = groupedBarData(entries, key);
  const visibleData = data.filter(point => point.value !== null);

  if (entries.length === 0 || visibleData.length === 0) {
    drawEmpty(context);
    return;
  }

  const padding = { top: 38, right: 10, bottom: 42, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const allValues = visibleData.map(point => point.value);
  let { minValue, maxValue } = getAxisScale(allValues, key);

  if (key !== "deficit") minValue = Math.max(0, minValue);
  if (key !== "weight" && key !== "deficit" && minValue > 0) minValue = 0;

  drawGrid(context, width, height, padding, chartHeight, maxValue, minValue);
  drawZeroLineIfNeeded(context, width, padding, chartHeight, minValue, maxValue, key);

  const slotWidth = chartWidth / data.length;
  const barWidth = graphRangeMode === "weekly"
    ? Math.max(20, slotWidth * 0.78)
    : Math.max(2, slotWidth * 0.72);

  data.forEach((point, index) => {
    if (point.value === null) return;

    const x = padding.left + (index + 0.5) * slotWidth - barWidth / 2;
    const baselineValue = key === "weight" ? minValue : 0;
    const baselineY = padding.top + chartHeight - ((baselineValue - minValue) / (maxValue - minValue)) * chartHeight;
    const y = padding.top + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;

    context.fillStyle = "#0a84ff";
    context.fillRect(x, Math.min(y, baselineY), barWidth, Math.max(2, Math.abs(baselineY - y)));
  });

  drawGroupedBarXAxis(context, data, padding, chartWidth, chartHeight);
}

function groupedBarData(entries, key) {
  const raw = dailyData(entries, key);
  const rawMap = new Map(raw.map(point => [point.date, point.value]));
  const { start, end } = graphDateWindow();
  const data = [];

  if (graphRangeMode === "year") {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(cursor.getFullYear(), cursor.getMonth() + month, 1);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const monthValues = [];

      for (let day = new Date(monthStart); day <= monthEnd; day.setDate(day.getDate() + 1)) {
        const dateKey = dateStringFromParts(day.getFullYear(), day.getMonth(), day.getDate());
        if (rawMap.has(dateKey)) monthValues.push(rawMap.get(dateKey));
      }

      data.push({
        label: monthStart.toLocaleString("default", { month: "short" }),
        value: combineGroupedValues(monthValues, key)
      });
    }

    return data;
  }

  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const dateKey = dateStringFromParts(day.getFullYear(), day.getMonth(), day.getDate());
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    data.push({
      label: graphRangeMode === "weekly" ? weekdays[day.getDay()] : String(day.getDate()),
      value: rawMap.has(dateKey) ? rawMap.get(dateKey) : null
    });
  }

  return data;
}

function combineGroupedValues(values, key) {
  if (values.length === 0) return null;
  if (key === "weight") return values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + value, 0);
}

function drawGraphTitle(context, width) {
  // graph title removed
}

function drawZeroLineIfNeeded(context, width, padding, chartHeight, minValue, maxValue, key) {
  if (key !== "deficit" || minValue > 0 || maxValue < 0) return;

  const zeroY = padding.top + chartHeight - ((0 - minValue) / (maxValue - minValue)) * chartHeight;
  context.strokeStyle = "#ffffff";
  context.lineWidth = 2;
  context.setLineDash([6, 6]);
  context.beginPath();
  context.moveTo(padding.left, zeroY);
  context.lineTo(width - padding.right, zeroY);
  context.stroke();
  context.setLineDash([]);
}

function drawGraphXAxis(context, padding, chartWidth, chartHeight) {
  const { start, end } = graphDateWindow();
  const totalDays = Math.max(1, Math.round((end - start) / 86400000));
  const visibleDays = totalDays + 1;
  const labelY = padding.top + chartHeight + 22;
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  context.fillStyle = "#a1a1a6";
  context.font = "11px system-ui";
  context.textAlign = "center";

  if (graphRangeMode === "weekly") {
    for (let i = 0; i < visibleDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const x = padding.left + (i + 0.5) * (chartWidth / visibleDays);
      context.fillText(weekdays[date.getDay()], x, labelY);
    }
  } else if (graphRangeMode === "year") {
    for (let i = 0; i < 12; i++) {
      const date = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const x = padding.left + (i + 0.5) * (chartWidth / 12);
      context.fillText(date.toLocaleString("default", { month: "short" }), x, labelY);
    }
  } else {
    const labelInterval = graphRangeMode === "sixMonth" ? 28 : 7;
    for (let i = 0; i < visibleDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const isFirstDay = i === 0;
      const isInterval = i % labelInterval === 0;

      if (isFirstDay || isInterval) {
        const x = padding.left + (i + 0.5) * (chartWidth / visibleDays);
        context.fillText(String(date.getDate()), x, labelY);
      }
    }
  }

  context.textAlign = "left";
}

function drawGroupedBarXAxis(context, data, padding, chartWidth, chartHeight) {
  const labelY = padding.top + chartHeight + 22;
  const slotWidth = chartWidth / data.length;

  context.fillStyle = "#a1a1a6";
  context.font = "11px system-ui";
  context.textAlign = "center";

  if (graphRangeMode === "monthly") {
    [7, 14, 21, 28].forEach(offset => {
      const index = offset - 1;
      if (index >= data.length) return;

      const x = padding.left + (index + 0.5) * slotWidth;
      const { start } = graphDateWindow();
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      context.strokeStyle = "rgba(161,161,166,0.35)";
      context.lineWidth = 1;
      context.setLineDash([3, 5]);
      context.beginPath();
      context.moveTo(x, padding.top);
      context.lineTo(x, padding.top + chartHeight);
      context.stroke();
      context.setLineDash([]);

      context.fillStyle = "#a1a1a6";
      context.fillText(String(date.getDate()), x, labelY);
    });
  } else {
    data.forEach((point, index) => {
      const x = padding.left + (index + 0.5) * slotWidth;
      context.fillText(point.label || "", x, labelY);
    });
  }

  context.textAlign = "left";
}

function drawBarXAxis(context, startDate, visibleDays, padding, chartWidth, chartHeight) {
  drawGraphXAxis(context, padding, chartWidth, chartHeight);
}

function drawGrid(context, width, height, padding, chartHeight, maxValue, minValue) {
  context.strokeStyle = "#3a3a3c";
  context.lineWidth = 1;
  context.fillStyle = "#a1a1a6";
  context.font = "11px system-ui";
  context.textAlign = "right";

  const labels = makeAxisLabels(minValue, maxValue, 5);
  labels.forEach(value => {
    const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillText(displayNumber(value), padding.left - 8, y + 4);
  });

  context.textAlign = "left";
}

function makeAxisLabels(minValue, maxValue, targetCount) {
  const minLabel = Math.floor(minValue);
  const maxLabel = Math.ceil(maxValue);
  if (minLabel === maxLabel) return [minLabel];

  const range = maxLabel - minLabel;
  const step = Math.max(1, Math.ceil(range / Math.max(1, targetCount - 1)));
  const labels = [];

  for (let value = minLabel; value <= maxLabel; value += step) {
    labels.push(value);
  }

  if (labels[labels.length - 1] !== maxLabel) labels.push(maxLabel);
  return [...new Set(labels)];
}

function drawLegend(context, height, padding) {
  // legend removed
}
function drawLine(context, points, xForDate, yForValue, color, lineWidth) { if (points.length === 0) return; context.strokeStyle = color; context.lineWidth = lineWidth; context.lineCap = "round"; context.lineJoin = "round"; context.beginPath(); points.forEach((point, index) => { const x = xForDate(point.date); const y = yForValue(point.value); if (index === 0) context.moveTo(x, y); else context.lineTo(x, y); }); context.stroke(); }

function monthEntriesWithBests(entries, year, monthIndex) { let bestRun = 0, bestPushups = 0, cumulativeAbs = 0; const result = new Map(); const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); const entryMap = new Map(entries.map(entry => [entry.date, entry])); for (let day = 1; day <= daysInMonth; day++) { const dateString = dateStringFromParts(year, monthIndex, day); const entry = entryMap.get(dateString); bestRun = Math.max(bestRun, typeof entry?.run === "number" ? entry.run : 0); bestPushups = Math.max(bestPushups, typeof entry?.pushups === "number" ? entry.pushups : 0); cumulativeAbs += entry?.abs ? 1 : 0; result.set(dateString, { entry, bestRun, bestPushups, cumulativeAbs }); } return result; }
function performanceGoalClass(actual, start, goal, day, daysInMonth) { if (start === null || start === undefined || goal === null || goal === undefined) return ""; if (goal <= start) return ""; const expected = start + ((goal - start) * ((day - 1) / Math.max(1, daysInMonth - 1))); const allowedGap = Math.max((goal - start) * 0.08, 1); const difference = actual - expected; if (difference >= allowedGap * 2) return "goal-green-strong"; if (difference >= 0) return "goal-green"; if (difference >= -allowedGap) return "goal-neutral"; if (difference >= -allowedGap * 2) return "goal-red"; return "goal-red-strong"; }
function countGoalClass(actual, goal, day, daysInMonth) { if (goal === null || goal === undefined || goal <= 0) return ""; const expected = goal * (day / daysInMonth); const difference = actual - expected; const allowedGap = Math.max(goal * 0.08, 1); if (difference >= allowedGap * 2) return "goal-green-strong"; if (difference >= 0) return "goal-green"; if (difference >= -allowedGap) return "goal-neutral"; if (difference >= -allowedGap * 2) return "goal-red"; return "goal-red-strong"; }
function renderCalendar() { const entries = loadEntries(); calendarDayDetails.classList.add("hidden"); const year = calendarMonth.getFullYear(); const monthIndex = calendarMonth.getMonth(); const monthName = calendarMonth.toLocaleString("default", { month:"long", year:"numeric" }); const firstDay = new Date(year, monthIndex, 1).getDay(); const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); const goals = getGoalsForMonth(calendarMonth); const monthData = monthEntriesWithBests(entries, year, monthIndex); const finalTotals = monthData.get(dateStringFromParts(year, monthIndex, daysInMonth)) || { bestRun:0, bestPushups:0, cumulativeAbs:0 }; calendarMonthTitle.textContent = monthName; calendarMonthPicker.value = monthKeyFromDate(calendarMonth); calendarGrid.innerHTML = ""; for (let i = 0; i < firstDay; i++) { const emptyCell = document.createElement("div"); emptyCell.className = "calendar-day empty"; calendarGrid.appendChild(emptyCell); } for (let day = 1; day <= daysInMonth; day++) { const dateString = dateStringFromParts(year, monthIndex, day); const dayData = monthData.get(dateString); const entry = dayData?.entry; const cell = document.createElement("div"); cell.className = "calendar-day"; const pushups = shouldShowField("Pushups") ? entry?.pushups ?? null : null; const run = shouldShowField("Run") ? entry?.run ?? null : null; const walk = shouldShowField("Walk") ? entry?.walk ?? null : null; const abs = shouldShowField("Abs") ? Boolean(entry?.abs) : false; const runClass = run !== null && run > 0 ? performanceGoalClass(run, goals.runStart, goals.runGoal, day, daysInMonth) : ""; const pushupClass = pushups !== null && pushups > 0 ? performanceGoalClass(pushups, goals.pushupStart, goals.pushupGoal, day, daysInMonth) : ""; const absClass = abs ? countGoalClass(dayData.cumulativeAbs, goals.absGoal, day, daysInMonth) : "";
    const dayValues = [];
    if (pushups !== null && pushups > 0) dayValues.push(`<div class="day-value has-value ${pushupClass}">P: ${pushups}</div>`);
    if (run !== null && run > 0) dayValues.push(`<div class="day-value has-value ${runClass}">R: ${run}</div>`);
    if (walk !== null && walk > 0) dayValues.push(`<div class="day-value has-value">W: ${walk}</div>`);
    if (abs) dayValues.push(`<div class="day-value abs-done ${absClass}">Abs: ✓</div>`);
    if (shouldShowField("Notes") && entry?.notes) dayValues.push(`<div class="day-value workout-line">${shortWorkoutText(entry.notes)}</div>`);
    cell.innerHTML = `<div class="day-number">${day}</div><div class="day-values">${dayValues.join("")}</div>`;
    if (entry) {
      cell.classList.add("clickable");
      cell.addEventListener("click", () => showCalendarDayDetails(dateString));
    }
    calendarGrid.appendChild(cell); } const bestRows = [];
  if (shouldShowField("Run")) bestRows.push(`<div class="goal-summary-row"><span>Best run</span><span>${finalTotals.bestRun.toFixed(1)} / ${goals.runGoal ?? "—"} km</span></div>`);
  if (shouldShowField("Pushups")) bestRows.push(`<div class="goal-summary-row"><span>Best pushups</span><span>${finalTotals.bestPushups} / ${goals.pushupGoal ?? "—"}</span></div>`);
  if (shouldShowField("Abs")) bestRows.push(`<div class="goal-summary-row"><span>Ab workouts</span><span>${finalTotals.cumulativeAbs} / ${goals.absGoal ?? "—"}</span></div>`);

  calendarGoalSummary.innerHTML = bestRows.join("");
  setVisible(currentBestsCard, bestRows.length > 0); }

function shortWorkoutText(text) {
  if (!text) return "";
  const firstLine = text.split("\n")[0].trim();
  return firstLine.length > 18 ? `${firstLine.slice(0, 18)}…` : firstLine;
}

function showCalendarDayDetails(dateString) {
  const entry = loadEntries().find(item => item.date === dateString);

  if (!entry) {
    calendarDayDetails.classList.add("hidden");
    return;
  }

  const details = [];
  if (shouldShowField("Weight") && entry.weight !== null) details.push(`<div class="calendar-details-row"><span>Weight</span><span>${entry.weight} ${loadSettings().weightUnit}</span></div>`);
  if (shouldShowField("Calories") && entry.calories !== null) details.push(`<div class="calendar-details-row"><span>Calories</span><span>${entry.calories}</span></div>`);
  if (shouldShowField("Calories") && entry.deficit !== null) details.push(`<div class="calendar-details-row"><span>Deficit</span><span>${entry.deficit}</span></div>`);
  if (shouldShowField("Run") && entry.run !== null && entry.run > 0) details.push(`<div class="calendar-details-row"><span>Run</span><span>${entry.run} km</span></div>`);
  if (shouldShowField("Walk") && entry.walk !== null && entry.walk > 0) details.push(`<div class="calendar-details-row"><span>Walk</span><span>${entry.walk} km</span></div>`);
  if (shouldShowField("Pushups") && entry.pushups !== null && entry.pushups > 0) details.push(`<div class="calendar-details-row"><span>Pushups</span><span>${entry.pushups}</span></div>`);
  if (shouldShowField("Abs") && entry.abs) details.push(`<div class="calendar-details-row"><span>Ab workout</span><span>Yes</span></div>`);
  if (shouldShowField("Notes") && entry.notes) details.push(`<div class="calendar-note"><strong>Workout</strong><br>${entry.notes}</div>`);

  calendarDayDetailsTitle.textContent = dateString;
  calendarDayDetailsBody.innerHTML = details.length > 0 ? details.join("") : `<p class="empty-state">No details entered.</p>`;
  calendarDayDetails.classList.remove("hidden");
}

function exportData() { const backup = { app:"Spencer's Fitness Tracker", version:6, exportedAt:new Date().toISOString(), entries:loadEntries(), goals:loadGoals() }; const blob = new Blob([JSON.stringify(backup, null, 2)], { type:"application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `fitness-tracker-backup-${todayString()}.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); backupMessage.textContent = "Exported"; setTimeout(() => backupMessage.textContent = "", 1500); }
function importData(file) { const reader = new FileReader(); reader.onload = event => { try { const parsed = JSON.parse(event.target.result); const importedEntries = Array.isArray(parsed) ? parsed : parsed.entries; if (!Array.isArray(importedEntries)) throw new Error("Invalid backup format"); const cleanedEntries = importedEntries.filter(entry => typeof entry.date === "string").map(entry => { const calories = typeof entry.calories === "number" ? entry.calories : null; return { date:entry.date, weight:typeof entry.weight === "number" ? entry.weight : null, calories, deficit:calories === null ? null : currentTdee() - calories, run:typeof entry.run === "number" ? entry.run : null, walk:typeof entry.walk === "number" ? entry.walk : null, pushups:typeof entry.pushups === "number" ? entry.pushups : null, abs:Boolean(entry.abs), notes:typeof entry.notes === "string" ? entry.notes : "" }; }).sort((a,b) => a.date.localeCompare(b.date)); saveEntries(cleanedEntries); if (parsed.goals && typeof parsed.goals === "object") saveGoals(parsed.goals); loadEntryForDate(); loadGoalsForCalendarMonth(); refreshAllViews(); backupMessage.textContent = "Imported"; setTimeout(() => backupMessage.textContent = "", 1500); } catch { backupMessage.textContent = "Import failed"; setTimeout(() => backupMessage.textContent = "", 1800); } }; reader.readAsText(file); }
function refreshAllViews() { applySettings(); renderCalorieTracking(); renderHistory(); renderGraphs(); renderCalendar(); renderEntryCalendar(); }
function showScreen(screenName) {
  const showingEntry = screenName === "entry";
  const showingCalendar = screenName === "calendar";
  const showingGraphs = screenName === "graphs";
  const showingSettings = screenName === "settings";

  entryScreen.classList.toggle("active", showingEntry);
  calendarScreen.classList.toggle("active", showingCalendar);
  graphsScreen.classList.toggle("active", showingGraphs);
  historyScreen.classList.remove("active");
  settingsScreen.classList.toggle("active", showingSettings);

  entryTab.classList.toggle("active", showingEntry);
  calendarTab.classList.toggle("active", showingCalendar);
  graphsTab.classList.toggle("active", showingGraphs);
  settingsTab.classList.toggle("active", showingSettings);

  if (showingEntry) renderEntryCalendar();
  if (showingCalendar) { loadGoalsForCalendarMonth(); renderCalendar(); }
  if (showingGraphs) renderGraphs();
  if (showingSettings) { syncSettingsForm(); renderHistory(); }
}

inputs.date.value = todayString();
graphStartDateInput.value = dateStringFromParts(startOfWeek(new Date()).getFullYear(), startOfWeek(new Date()).getMonth(), startOfWeek(new Date()).getDate());
setEntryCalendarMonthFromDateString(inputs.date.value);
syncSettingsForm();
applySettings();
loadEntryForDate();
loadGoalsForCalendarMonth();
refreshAllViews();
inputs.calories.addEventListener("input", updateDeficitPreview);
saveButton.addEventListener("click", saveCurrentEntry);
saveSettingsButton.addEventListener("click", saveSettingsFromForm);
clearButton.addEventListener("click", clearForm);
entryTab.addEventListener("click", () => showScreen("entry"));
settingsTab.addEventListener("click", () => showScreen("settings"));
graphsTab.addEventListener("click", () => showScreen("graphs"));
calendarTab.addEventListener("click", () => showScreen("calendar"));
previousMonthButton.addEventListener("click", () => {
  calendarMonth.setMonth(calendarMonth.getMonth() - 1);
  loadGoalsForCalendarMonth();
  renderCalendar();
  if (graphRangeMode === "monthly") renderGraphs();
});
nextMonthButton.addEventListener("click", () => {
  calendarMonth.setMonth(calendarMonth.getMonth() + 1);
  loadGoalsForCalendarMonth();
  renderCalendar();
  if (graphRangeMode === "monthly") renderGraphs();
});
calendarMonthPicker.addEventListener("change", () => {
  setCalendarMonthFromKey(calendarMonthPicker.value);
  loadGoalsForCalendarMonth();
  renderCalendar();
  if (graphRangeMode === "monthly") renderGraphs();
});
saveGoalsButton.addEventListener("click", saveGoalsForCalendarMonth);
exportButton.addEventListener("click", exportData);
importButton.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", event => { const file = event.target.files[0]; if (file) importData(file); event.target.value = ""; });
entryPreviousMonth.addEventListener("click", () => { entryCalendarMonth.setMonth(entryCalendarMonth.getMonth() - 1); renderEntryCalendar(); });
entryNextMonth.addEventListener("click", () => { entryCalendarMonth.setMonth(entryCalendarMonth.getMonth() + 1); renderEntryCalendar(); });
document.querySelectorAll(".range-button").forEach(button => button.addEventListener("click", () => {
  graphRangeMode = button.dataset.range;
  document.querySelectorAll(".range-button").forEach(item => item.classList.remove("active"));
  button.classList.add("active");
  renderGraphs();
}));
averageGraphMode.addEventListener("click", () => { graphMode = "average"; averageGraphMode.classList.add("active"); dailyGraphMode.classList.remove("active"); renderGraphs(); });
dailyGraphMode.addEventListener("click", () => { graphMode = "daily"; dailyGraphMode.classList.add("active"); averageGraphMode.classList.remove("active"); renderGraphs(); });
graphStartDateInput.addEventListener("change", renderGraphs);
function updateSettingsFieldCollapse() {
  const groups = [
    { checkbox: settingInputs.showWeight, selector: ".weight-config" },
    { checkbox: settingInputs.showCalories, selector: ".calories-config" },
    { checkbox: settingInputs.showRun, selector: ".run-config" },
    { checkbox: settingInputs.showWalk, selector: ".walk-config" },
    { checkbox: settingInputs.showPushups, selector: ".pushups-config" },
    { checkbox: settingInputs.showAbs, selector: ".abs-config" }
  ];

  groups.forEach(group => {
    document.querySelectorAll(group.selector).forEach(element => {
      element.classList.toggle("hidden-setting", !group.checkbox.checked);
    });
  });
}

[
  settingInputs.showWeight,
  settingInputs.showCalories,
  settingInputs.showRun,
  settingInputs.showWalk,
  settingInputs.showPushups,
  settingInputs.showAbs
].forEach(checkbox => {
  checkbox.addEventListener("change", updateSettingsFieldCollapse);
});

updateSettingsFieldCollapse();
window.addEventListener("resize", renderGraphs);