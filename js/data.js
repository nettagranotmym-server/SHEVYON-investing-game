// ===== CONFIG =====
const TOTAL = 100000;
const TIMER_SEC = 90;
const COMMISSION_RATE = 0.02;

// ===== OPTIONAL REMOTE (נשתמש בזה בהמשך כשתחברי Render) =====
const REMOTE_API_BASE = "http://localhost:3000";

// ===== STORAGE =====
const STORAGE_KEY = "shevyon_game_results_v1";

// ===== TEAMS =====
const TEAMS = [
  { id: 1, n: "צוות 1", e: "🔴" }, { id: 2, n: "צוות 2", e: "🟠" }, { id: 3, n: "צוות 3", e: "🟡" },
  { id: 4, n: "צוות 4", e: "🟢" }, { id: 5, n: "צוות 5", e: "🔵" }, { id: 6, n: "צוות 6", e: "🟣" },
  { id: 7, n: "צוות 7", e: "⚪" }, { id: 8, n: "צוות 8", e: "🩷" }, { id: 9, n: "צוות 9", e: "🩵" },
  { id: 10, n: "צוות 10", e: "💛" }, { id: 11, n: "צוות 11", e: "💚" }, { id: 12, n: "צוות 12", e: "💜" },
  { id: 13, n: "צוות 13", e: "🧡" }, { id: 14, n: "צוות 14", e: "💙" }, { id: 15, n: "צוות 15", e: "❤️" }
];

// ===== ASSETS (אג"ח + 3 חברות) =====
const ASSETS = [
  { key: "bond",   name: 'אג"ח',        icon: "🧾", color: "var(--blue)",   bg: "rgba(59,130,246,.15)" },
  { key: "cloud",  name: "CloudSpark",  icon: "☁️", color: "var(--purple)", bg: "rgba(168,85,247,.15)" },
  { key: "medi",   name: "MediPulse",   icon: "💊", color: "var(--green)",  bg: "rgba(34,197,94,.15)" },
  { key: "shield", name: "ShieldWorks", icon: "🛡️", color: "var(--orange)", bg: "rgba(249,115,22,.15)" }
];

// ===== INTRO (זה נשאר למשחק עצמו) =====
const INTRO = {
  icon: "💼",
  title: "בניית התיק שלכן",
  desc: "עכשיו בונות תיק, בחרו חלוקה בין אג\"ח לבין שלוש החברות, כך שהסכום יהיה 100%."
};

// ===== YEARS =====
const YEARS = [
  {
    year: 2020, icon: "🦠",
    title: "2020, מגפת הקורונה",
    desc: "העולם נכנס לסגרים, עבודה מרחוק מזנקת, מרוץ לפתרונות רפואיים, אי ודאות גבוהה. האם תשנו את התיק?",
    returns: { bond: 0.03, cloud: 0.40, medi: 0.25, shield: 0.02 },
    lesson: "הקורונה האיצה ענן ורפואה. מי שהייתה שם הרוויחה."
  },
  {
    year: 2021, icon: "💰",
    title: "2021, כסף זול וריביות אפסיות",
    desc: "נזילות גבוהה, שווקים עולים, סיכון חוזר לאופנה. האם תשנו את התיק?",
    returns: { bond: -0.02, cloud: 0.35, medi: 0.10, shield: 0.08 },
    lesson: "שנה חזקה למניות, אג\"ח פחות. פיזור עדיין עוזר."
  },
  {
    year: 2022, icon: "⚔️",
    title: "2022, מלחמה ועליית ריבית",
    desc: "אינפלציה, עליית ריבית, לחץ על צמיחה. ביטחון מתחזק. האם תשנו את התיק?",
    returns: { bond: 0.04, cloud: -0.30, medi: -0.05, shield: 0.35 },
    lesson: "שנה קשה לצמיחה, ביטחון בלט, אג\"ח סיפק יציבות."
  },
  {
    year: 2023, icon: "🤖",
    title: "2023, פריצת דרך ב AI ואי יציבות גיאופוליטית",
    desc: "חברות ענן נהנות מביקוש ל AI, ובמקביל ביטחון חוזר לכותרות. האם תשנו את התיק?",
    returns: { bond: 0.04, cloud: 0.55, medi: 0.02, shield: 0.28 },
    lesson: "ענן הוביל, ביטחון תרם, מי שפיזרה נהנתה מתנודתיות."
  },
  {
    year: 2024, icon: "📊",
    title: "2024, שווקים מתייצבים וחזרה לצמיחה",
    desc: "השווקים נרגעים יחסית, ענן ממשיך חזק, רפואה מתאוששת, ביטחון נשאר חשוב. האם תשנו את התיק?",
    returns: { bond: 0.05, cloud: 0.28, medi: 0.12, shield: 0.15 },
    lesson: "שנה טובה יחסית לרוב האפיקים. לאורך זמן, התמדה ופיזור עושים עבודה."
  }
];

// ===== HELPERS =====
function fmt(n) {
  return "₪" + Math.round(n).toLocaleString("he-IL");
}

function readAllRuns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllRuns(runs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

function saveRun(run) {
  const runs = readAllRuns();
  runs.push(run);
  writeAllRuns(runs);
}
// ===== ADMIN CONTROL (LocalStorage) =====
const ADMIN_OPEN_YEAR_KEY = "shevyon_admin_open_year"; // מספר שנה, למשל 2021
const TEAM_PROGRESS_KEY = "shevyon_team_progress_v1";  // סטטוס ביניים לכל קבוצה

function getAdminOpenYear() {
  const v = parseInt(localStorage.getItem(ADMIN_OPEN_YEAR_KEY) || "", 10);
  return Number.isFinite(v) ? v : 2020; // ברירת מחדל: פתוח רק 2020
}

function setAdminOpenYear(year) {
  localStorage.setItem(ADMIN_OPEN_YEAR_KEY, String(year));
}

function readAllProgress() {
  try {
    const raw = localStorage.getItem(TEAM_PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllProgress(arr) {
  localStorage.setItem(TEAM_PROGRESS_KEY, JSON.stringify(arr));
}

// שומר מצב ביניים לפי teamId, תמיד נשמרת הרשומה האחרונה של אותה קבוצה
function upsertTeamProgress(progress) {
  const all = readAllProgress();
  const idx = all.findIndex(x => x.teamId === progress.teamId);
  if (idx >= 0) all[idx] = progress;
  else all.push(progress);
  writeAllProgress(all);
}