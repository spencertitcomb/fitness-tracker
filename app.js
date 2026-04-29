
const TDEE = 2500;
const STORAGE_KEY = "basic_fitness_tracker_entries";
const GOALS_KEY = "fitness_tracker_monthly_goals";
let graphRangeMode = "monthly";
let graphMode = "average";
let entryCalendarMonth = new Date();
entryCalendarMonth.setDate(1);

const inputs = { date: document.getElementById("date"), weight: document.getElementById("weight"), calories: document.getElementById("calories"), run: document.getElementById("run"), walk: document.getElementById("walk"), pushups: document.getElementById("pushups"), abs: document.getElementById("abs") };
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
const historyScreen = document.getElementById("historyScreen");
const graphsScreen = document.getElementById("graphsScreen");
const calendarScreen = document.getElementById("calendarScreen");
const entryTab = document.getElementById("entryTab");
const historyTab = document.getElementById("historyTab");
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
const saveGoalsButton = document.getElementById("saveGoalsButton");
const goalsMessage = document.getElementById("goalsMessage");
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
function saveGoals(goals) { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); }
function getGoalsForMonth(date) { const allGoals = loadGoals(); return allGoals[monthKeyFromDate(date)] || { runStart:null, runGoal:null, pushupStart:null, pushupGoal:null, absGoal:null }; }
function numberOrNull(value) { if (value === "") return null; const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; }
function intOrNull(value) { if (value === "") return null; const parsed = parseInt(value, 10); return Number.isFinite(parsed) ? parsed : null; }
function displayNumber(value) {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) >= 1000) return Math.round(value).toString();
  if (Math.abs(value) >= 100) return value.toFixed(0);
  if (Math.abs(value) >= 10) return value.toFixed(1);
  return value.toFixed(1);
}

function updateDeficitPreview() { const calories = intOrNull(inputs.calories.value); if (calories === null) { dailyDeficit.textContent = "—"; dailyDeficit.className = "metric-value"; return; } const deficit = TDEE - calories; dailyDeficit.textContent = deficit.toString(); dailyDeficit.className = deficit >= 0 ? "metric-value positive" : "metric-value negative"; }
function currentEntryFromForm() { const calories = intOrNull(inputs.calories.value); return { date: inputs.date.value, weight: numberOrNull(inputs.weight.value), calories, deficit: calories === null ? null : TDEE - calories, run: numberOrNull(inputs.run.value), walk: numberOrNull(inputs.walk.value), pushups: intOrNull(inputs.pushups.value), abs: inputs.abs.checked }; }
function saveCurrentEntry() { const entry = currentEntryFromForm(); if (!entry.date) return; const entries = loadEntries(); const existingIndex = entries.findIndex(item => item.date === entry.date); if (existingIndex >= 0) entries[existingIndex] = entry; else entries.push(entry); entries.sort((a,b) => a.date.localeCompare(b.date)); saveEntries(entries); refreshAllViews(); savedMessage.textContent = "Saved"; setTimeout(() => savedMessage.textContent = "", 1200); }
function clearForm() { inputs.weight.value = ""; inputs.calories.value = ""; inputs.run.value = ""; inputs.walk.value = ""; inputs.pushups.value = ""; inputs.abs.checked = false; updateDeficitPreview(); }
function loadEntryForDate() { const entry = loadEntries().find(item => item.date === inputs.date.value); if (!entry) { clearForm(); renderEntryCalendar(); return; } inputs.weight.value = entry.weight ?? ""; inputs.calories.value = entry.calories ?? ""; inputs.run.value = entry.run ?? ""; inputs.walk.value = entry.walk ?? ""; inputs.pushups.value = entry.pushups ?? ""; inputs.abs.checked = Boolean(entry.abs); updateDeficitPreview(); renderEntryCalendar(); }
function editEntry(dateString) { inputs.date.value = dateString; setEntryCalendarMonthFromDateString(dateString); loadEntryForDate(); showScreen("entry"); window.scrollTo({ top:0, behavior:"smooth" }); }

function renderEntryCalendar() { const entries = loadEntries(); const entryDates = new Set(entries.map(entry => entry.date)); const selectedDate = inputs.date.value; const year = entryCalendarMonth.getFullYear(); const monthIndex = entryCalendarMonth.getMonth(); const monthName = entryCalendarMonth.toLocaleString("default", { month:"long", year:"numeric" }); const firstDay = new Date(year, monthIndex, 1).getDay(); const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); entryCalendarMonthTitle.textContent = monthName; entryCalendarGrid.innerHTML = ""; for (let i = 0; i < firstDay; i++) { const emptyCell = document.createElement("button"); emptyCell.className = "entry-calendar-day empty"; emptyCell.disabled = true; entryCalendarGrid.appendChild(emptyCell); } for (let day = 1; day <= daysInMonth; day++) { const dateString = dateStringFromParts(year, monthIndex, day); const button = document.createElement("button"); button.className = "entry-calendar-day"; if (entryDates.has(dateString)) button.classList.add("has-data"); if (dateString === selectedDate) button.classList.add("selected"); button.textContent = day; button.addEventListener("click", () => { inputs.date.value = dateString; loadEntryForDate(); }); entryCalendarGrid.appendChild(button); } }

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

function renderHistory() { const entries = loadEntries(); renderCalorieTracking(); if (entries.length === 0) { historyList.innerHTML = '<p class="empty-state">No entries yet.</p>'; return; } historyList.innerHTML = entries.slice().reverse().map(entry => { const details = [entry.weight !== null ? `Weight ${entry.weight} lb` : null, entry.calories !== null ? `Calories ${entry.calories}` : null, entry.deficit !== null ? `Deficit ${entry.deficit}` : null, entry.run !== null ? `Run ${entry.run} km` : null, entry.walk !== null ? `Walk ${entry.walk} km` : null, entry.pushups !== null ? `Pushups ${entry.pushups}` : null, entry.abs ? "Abs" : null].filter(Boolean).join(" · "); return `<button class="history-item" data-date="${entry.date}"><div class="history-date">${entry.date}</div><div class="history-details">${details || "No details entered"}</div></button>`; }).join(""); document.querySelectorAll(".history-item").forEach(item => item.addEventListener("click", () => editEntry(item.dataset.date))); }

function filteredEntriesForGraph(entries) {
  if (entries.length === 0) return [];

  let start;
  let end;

  if (graphRangeMode === "weekly") {
    const today = new Date();
    end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    start = new Date(end);
    start.setDate(start.getDate() - 6);
  } else {
    start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
  }

  return entries.filter(entry => {
    const entryDate = dateFromString(entry.date);
    return entryDate >= start && entryDate <= end;
  });
}
function rollingAverageData(entries, days, key) { return entries.map((entry, index) => { const windowEntries = entries.slice(Math.max(0, index - days + 1), index + 1); const values = windowEntries.map(item => item[key]).filter(value => typeof value === "number" && Number.isFinite(value)); if (values.length === 0) return { date: entry.date, value: null }; return { date: entry.date, value: values.reduce((sum,value) => sum + value, 0) / values.length }; }); }
function dailyData(entries, key) { return entries.map(entry => ({ date: entry.date, value: typeof entry[key] === "number" && Number.isFinite(entry[key]) ? entry[key] : null })).filter(point => point.value !== null); }
function renderGraphs() { const entries = filteredEntriesForGraph(loadEntries()); drawChart("weightChart", entries, "weight"); drawChart("deficitChart", entries, "deficit"); drawChart("runChart", entries, "run"); drawChart("walkChart", entries, "walk"); drawChart("pushupChart", entries, "pushups"); }
function drawChart(canvasId, entries, key) { if (graphMode === "daily") drawBarChart(canvasId, entries, key); else drawAverageChart(canvasId, entries, key); }

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
function drawEmpty(context, message = "No data for selected range") { context.fillStyle = "#a1a1a6"; context.font = "15px system-ui"; context.fillText(message, 12, 35); }
function getAxisScale(values, key) {
  let minValue = Math.min(...values);
  let maxValue = Math.max(...values);

  if (minValue === maxValue) {
    const singleBuffer = key === "weight" ? 2 : Math.max(Math.abs(minValue) * 0.08, 1);
    return { minValue: minValue - singleBuffer, maxValue: maxValue + singleBuffer };
  }

  const range = maxValue - minValue;
  let buffer;

  if (key === "weight") {
    buffer = Math.max(range * 0.25, 1.5);
  } else if (key === "deficit") {
    buffer = Math.max(range * 0.18, 100);
  } else {
    buffer = Math.max(range * 0.2, maxValue < 10 ? 0.5 : 2);
  }

  return { minValue: minValue - buffer, maxValue: maxValue + buffer };
}

function drawAverageChart(canvasId, entries, key) {
  const setup = setupCanvas(canvasId);
  if (!setup) return;
  const { context, width, height } = setup;

  const weekly = rollingAverageData(entries, 7, key).filter(point => point.value !== null);
  const monthly = rollingAverageData(entries, 30, key).filter(point => point.value !== null);
  const allValues = [...weekly, ...monthly].map(point => point.value);

  if (entries.length === 0 || allValues.length === 0) {
    drawEmpty(context);
    return;
  }

  const padding = { top: 18, right: 10, bottom: 34, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const { minValue, maxValue } = getAxisScale(allValues, key);
  const dates = entries.map(entry => entry.date);

  const xForDate = date => dates.length === 1
    ? padding.left + chartWidth / 2
    : padding.left + (dates.indexOf(date) / (dates.length - 1)) * chartWidth;

  const yForValue = value => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  drawGrid(context, width, height, padding, chartHeight, maxValue, minValue);

  // Zero line for deficit graphs
  if (key === "deficit" && minValue <= 0 && maxValue >= 0) {
    const zeroY = padding.top + chartHeight - ((0 - minValue) / (maxValue - minValue)) * chartHeight;
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.setLineDash([6,6]);
    context.beginPath();
    context.moveTo(padding.left, zeroY);
    context.lineTo(width - padding.right, zeroY);
    context.stroke();
    context.setLineDash([]);
  }
  drawLine(context, monthly, xForDate, yForValue, "#8e8e93", 2);
  drawLine(context, weekly, xForDate, yForValue, "#0a84ff", 3);
  drawLegend(context, height, padding);
}
function drawBarChart(canvasId, entries, key) {
  const setup = setupCanvas(canvasId);
  if (!setup) return;
  const { context, width, height } = setup;
  const data = dailyData(entries, key);

  if (entries.length === 0 || data.length === 0) {
    drawEmpty(context);
    return;
  }

  const padding = { top: 18, right: 10, bottom: 42, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const allValues = data.map(point => point.value);
  let { minValue, maxValue } = getAxisScale(allValues, key);

  if (key !== "weight" && minValue > 0) minValue = 0;

  drawGrid(context, width, height, padding, chartHeight, maxValue, minValue);

  // Zero line for deficit graphs
  if (key === "deficit" && minValue <= 0 && maxValue >= 0) {
    const zeroY = padding.top + chartHeight - ((0 - minValue) / (maxValue - minValue)) * chartHeight;
    context.strokeStyle = "#ffffff";
    context.lineWidth = 2;
    context.setLineDash([6,6]);
    context.beginPath();
    context.moveTo(padding.left, zeroY);
    context.lineTo(width - padding.right, zeroY);
    context.stroke();
    context.setLineDash([]);
  }

  let startDate;
  let endDate;

  if (graphRangeMode === "weekly") {
    const today = new Date();
    endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
  } else {
    startDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    endDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
  }

  const totalDays = Math.max(1, Math.round((endDate - startDate) / 86400000));
  const visibleDays = totalDays + 1;
  const slotWidth = chartWidth / visibleDays;
  const barWidth = graphRangeMode === "weekly"
    ? Math.max(20, slotWidth * 0.78)
    : Math.max(4, Math.min(14, slotWidth * 0.72));

  data.forEach(point => {
    const dayOffset = Math.round((dateFromString(point.date) - startDate) / 86400000);
    const x = padding.left + (dayOffset + 0.5) * slotWidth - barWidth / 2;
    const baselineValue = key === "weight" ? minValue : 0;
    const baselineY = padding.top + chartHeight - ((baselineValue - minValue) / (maxValue - minValue)) * chartHeight;
    const y = padding.top + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;

    context.fillStyle = "#0a84ff";
    context.fillRect(x, Math.min(y, baselineY), barWidth, Math.max(2, Math.abs(baselineY - y)));
  });

  drawBarXAxis(context, startDate, visibleDays, padding, chartWidth, chartHeight);
}
function drawBarXAxis(context, startDate, visibleDays, padding, chartWidth, chartHeight) {
  context.fillStyle = "#a1a1a6";
  context.font = "11px system-ui";
  context.textAlign = "center";

  const labelY = padding.top + chartHeight + 22;
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (graphRangeMode === "weekly") {
    for (let i = 0; i < visibleDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const x = padding.left + (i + 0.5) * (chartWidth / visibleDays);
      context.fillText(weekdays[date.getDay()], x, labelY);
    }
  } else {
    for (let i = 0; i < visibleDays; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const isFirstDay = i === 0;
      const isWeekStart = date.getDay() === 0;

      if (isFirstDay || isWeekStart) {
        const x = padding.left + (i + 0.5) * (chartWidth / visibleDays);
        context.fillText(String(date.getDate()), x, labelY);
      }
    }
  }

  context.textAlign = "left";
}

function drawGrid(context, width, height, padding, chartHeight, maxValue, minValue) {
  context.strokeStyle = "#3a3a3c";
  context.lineWidth = 1;
  context.fillStyle = "#a1a1a6";
  context.font = "11px system-ui";
  context.textAlign = "right";

  const lines = 5;
  for (let i = 0; i < lines; i++) {
    const ratio = i / (lines - 1);
    const y = padding.top + ratio * chartHeight;
    const value = maxValue - ratio * (maxValue - minValue);

    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillText(displayNumber(value), padding.left - 8, y + 4);
  }

  context.textAlign = "left";
}
function drawLegend(context, height, padding) {
  // legend removed
}
function drawLine(context, points, xForDate, yForValue, color, lineWidth) { if (points.length === 0) return; context.strokeStyle = color; context.lineWidth = lineWidth; context.lineCap = "round"; context.lineJoin = "round"; context.beginPath(); points.forEach((point, index) => { const x = xForDate(point.date); const y = yForValue(point.value); if (index === 0) context.moveTo(x, y); else context.lineTo(x, y); }); context.stroke(); }

function monthEntriesWithBests(entries, year, monthIndex) { let bestRun = 0, bestPushups = 0, cumulativeAbs = 0; const result = new Map(); const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); const entryMap = new Map(entries.map(entry => [entry.date, entry])); for (let day = 1; day <= daysInMonth; day++) { const dateString = dateStringFromParts(year, monthIndex, day); const entry = entryMap.get(dateString); bestRun = Math.max(bestRun, typeof entry?.run === "number" ? entry.run : 0); bestPushups = Math.max(bestPushups, typeof entry?.pushups === "number" ? entry.pushups : 0); cumulativeAbs += entry?.abs ? 1 : 0; result.set(dateString, { entry, bestRun, bestPushups, cumulativeAbs }); } return result; }
function performanceGoalClass(actual, start, goal, day, daysInMonth) { if (start === null || start === undefined || goal === null || goal === undefined) return ""; if (goal <= start) return ""; const expected = start + ((goal - start) * ((day - 1) / Math.max(1, daysInMonth - 1))); const allowedGap = Math.max((goal - start) * 0.08, 1); const difference = actual - expected; if (difference >= allowedGap * 2) return "goal-green-strong"; if (difference >= 0) return "goal-green"; if (difference >= -allowedGap) return "goal-neutral"; if (difference >= -allowedGap * 2) return "goal-red"; return "goal-red-strong"; }
function countGoalClass(actual, goal, day, daysInMonth) { if (goal === null || goal === undefined || goal <= 0) return ""; const expected = goal * (day / daysInMonth); const difference = actual - expected; const allowedGap = Math.max(goal * 0.08, 1); if (difference >= allowedGap * 2) return "goal-green-strong"; if (difference >= 0) return "goal-green"; if (difference >= -allowedGap) return "goal-neutral"; if (difference >= -allowedGap * 2) return "goal-red"; return "goal-red-strong"; }
function renderCalendar() { const entries = loadEntries(); const year = calendarMonth.getFullYear(); const monthIndex = calendarMonth.getMonth(); const monthName = calendarMonth.toLocaleString("default", { month:"long", year:"numeric" }); const firstDay = new Date(year, monthIndex, 1).getDay(); const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); const goals = getGoalsForMonth(calendarMonth); const monthData = monthEntriesWithBests(entries, year, monthIndex); const finalTotals = monthData.get(dateStringFromParts(year, monthIndex, daysInMonth)) || { bestRun:0, bestPushups:0, cumulativeAbs:0 }; calendarMonthTitle.textContent = monthName; calendarMonthPicker.value = monthKeyFromDate(calendarMonth); calendarGrid.innerHTML = ""; for (let i = 0; i < firstDay; i++) { const emptyCell = document.createElement("div"); emptyCell.className = "calendar-day empty"; calendarGrid.appendChild(emptyCell); } for (let day = 1; day <= daysInMonth; day++) { const dateString = dateStringFromParts(year, monthIndex, day); const dayData = monthData.get(dateString); const entry = dayData?.entry; const cell = document.createElement("div"); cell.className = "calendar-day"; const pushups = entry?.pushups ?? null; const run = entry?.run ?? null; const walk = entry?.walk ?? null; const abs = Boolean(entry?.abs); const runClass = run === null ? "" : performanceGoalClass(run, goals.runStart, goals.runGoal, day, daysInMonth); const pushupClass = pushups === null ? "" : performanceGoalClass(pushups, goals.pushupStart, goals.pushupGoal, day, daysInMonth); const absClass = countGoalClass(dayData.cumulativeAbs, goals.absGoal, day, daysInMonth); cell.innerHTML = `<div class="day-number">${day}</div><div class="day-values"><div class="day-value ${pushups !== null ? "has-value" : ""} ${pushupClass}">P: ${pushups !== null ? pushups : "—"}</div><div class="day-value ${run !== null ? "has-value" : ""} ${runClass}">R: ${run !== null ? run : "—"}</div><div class="day-value ${walk !== null ? "has-value" : ""}">W: ${walk !== null ? walk : "—"}</div><div class="day-value ${abs ? "abs-done" : ""} ${absClass}">Abs: ${abs ? "✓" : "—"}</div></div>`; calendarGrid.appendChild(cell); } calendarGoalSummary.innerHTML = `<div class="goal-summary-row"><span>Best run</span><span>${finalTotals.bestRun.toFixed(1)} / ${goals.runGoal ?? "—"} km</span></div><div class="goal-summary-row"><span>Best pushups</span><span>${finalTotals.bestPushups} / ${goals.pushupGoal ?? "—"}</span></div><div class="goal-summary-row"><span>Ab workouts</span><span>${finalTotals.cumulativeAbs} / ${goals.absGoal ?? "—"}</span></div>`; }

function exportData() { const backup = { app:"Spencer's Fitness Tracker", version:6, exportedAt:new Date().toISOString(), entries:loadEntries(), goals:loadGoals() }; const blob = new Blob([JSON.stringify(backup, null, 2)], { type:"application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `fitness-tracker-backup-${todayString()}.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); backupMessage.textContent = "Exported"; setTimeout(() => backupMessage.textContent = "", 1500); }
function importData(file) { const reader = new FileReader(); reader.onload = event => { try { const parsed = JSON.parse(event.target.result); const importedEntries = Array.isArray(parsed) ? parsed : parsed.entries; if (!Array.isArray(importedEntries)) throw new Error("Invalid backup format"); const cleanedEntries = importedEntries.filter(entry => typeof entry.date === "string").map(entry => { const calories = typeof entry.calories === "number" ? entry.calories : null; return { date:entry.date, weight:typeof entry.weight === "number" ? entry.weight : null, calories, deficit:calories === null ? null : TDEE - calories, run:typeof entry.run === "number" ? entry.run : null, walk:typeof entry.walk === "number" ? entry.walk : null, pushups:typeof entry.pushups === "number" ? entry.pushups : null, abs:Boolean(entry.abs) }; }).sort((a,b) => a.date.localeCompare(b.date)); saveEntries(cleanedEntries); if (parsed.goals && typeof parsed.goals === "object") saveGoals(parsed.goals); loadEntryForDate(); loadGoalsForCalendarMonth(); refreshAllViews(); backupMessage.textContent = "Imported"; setTimeout(() => backupMessage.textContent = "", 1500); } catch { backupMessage.textContent = "Import failed"; setTimeout(() => backupMessage.textContent = "", 1800); } }; reader.readAsText(file); }
function refreshAllViews() { renderCalorieTracking(); renderHistory(); renderGraphs(); renderCalendar(); renderEntryCalendar(); }
function showScreen(screenName) { const showingEntry = screenName === "entry"; const showingHistory = screenName === "history"; const showingGraphs = screenName === "graphs"; const showingCalendar = screenName === "calendar"; entryScreen.classList.toggle("active", showingEntry); historyScreen.classList.toggle("active", showingHistory); graphsScreen.classList.toggle("active", showingGraphs); calendarScreen.classList.toggle("active", showingCalendar); entryTab.classList.toggle("active", showingEntry); historyTab.classList.toggle("active", showingHistory); graphsTab.classList.toggle("active", showingGraphs); calendarTab.classList.toggle("active", showingCalendar); if (showingEntry) renderEntryCalendar(); if (showingHistory) renderHistory(); if (showingGraphs) renderGraphs(); if (showingCalendar) { loadGoalsForCalendarMonth(); renderCalendar(); } }

inputs.date.value = todayString();
setEntryCalendarMonthFromDateString(inputs.date.value);
loadEntryForDate();
loadGoalsForCalendarMonth();
refreshAllViews();
inputs.calories.addEventListener("input", updateDeficitPreview);
saveButton.addEventListener("click", saveCurrentEntry);
clearButton.addEventListener("click", clearForm);
entryTab.addEventListener("click", () => showScreen("entry"));
historyTab.addEventListener("click", () => showScreen("history"));
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
window.addEventListener("resize", renderGraphs);
