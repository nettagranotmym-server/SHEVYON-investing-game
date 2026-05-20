// ===== CONFIG =====
const TOTAL = 100000;
const TIMER_SEC = 90;
const COMMISSION_RATE = 0.02;

// ===== API BASE =====
// ריק = כתובות יחסיות (עובד כי השרת מגיש גם את הפרונטאנד)
const API_BASE = "";

// ===== STORAGE (LocalStorage - גיבוי בלבד) =====
const STORAGE_KEY = "shevyon_game_results_v1";
const ADMIN_OPEN_YEAR_KEY = "shevyon_admin_open_year";
const TEAM_PROGRESS_KEY = "shevyon_team_progress_v1";

// ===== TEAMS =====
const TEAMS = [
  { id: 1, n: "דרקון הזהב",  e: "🐉" },
  { id: 2, n: "דרקון האש",   e: "🔥" },
  { id: 3, n: "דרקון הקרח",  e: "❄️" },
  { id: 4, n: "דרקון הברק",  e: "⚡" },
  { id: 5, n: "דרקון הים",   e: "🌊" },
  { id: 6, n: "דרקון היער",  e: "🌿" },
  { id: 7, n: "דרקון הכוח",  e: "💪" }
];

// ===== ASSETS =====
const ASSETS = [
  { key: "bond",   name: 'אג"ח',       icon: "🧾", color: "var(--blue)",   bg: "rgba(59,130,246,.15)" },
  { key: "cloud",  name: "CloudSpark", icon: "☁️", color: "var(--purple)", bg: "rgba(168,85,247,.15)" },
  { key: "medi",   name: "MediPulse",  icon: "💊", color: "var(--green)",  bg: "rgba(34,197,94,.15)"  },
  { key: "shield", name: "ShieldWorks",icon: "🛡️", color: "var(--orange)", bg: "rgba(249,115,22,.15)" }
];

// ===== INTRO =====
const INTRO = {
  icon: "💼",
  title: "בניית התיק שלכן",
  desc: "עכשיו בונות תיק, בחרו חלוקה בין אג\"ח לבין שלוש החברות, כך שהסכום יהיה 100%."
};

// ===== YEARS =====
const YEARS = [
  {
    year: 2020, icon: "🦠",
    title: "ינואר 2020 — שנה חדשה, שווקים רגועים",
    desc: "הכלכלה העולמית נראית יציבה, הריבית נמוכה והשווקים בשיאים. מתחילות לצוץ כתבות על וירוס מסתורי בסין — אבל רוב המומחים לא מודאגים במיוחד. חברות הטכנולוגיה ממשיכות לצמוח, וחברות התרופות עובדות על טיפולים חדשים.\n\nהאם תשנו את התיק?",
    returns: { bond: 0.03, cloud: 0.40, medi: 0.25, shield: 0.02 },
    lesson: "הקורונה פרצה לחיינו ושינתה הכל. הבורסות קרסו בחדות במרץ — ואז התאוששו בצורה מפתיעה. מי שהשקיעה בחברות ענן וטכנולוגיה נהנתה מאוד — כולם עברו לעבוד מהבית. חברות התרופות גם הרוויחו מהמרוץ לחיסון.\n\n💡 התובנה: גם בתקופות פחד ואי ודאות — מי שלא נבהלה ונשארה מושקעת, יצאה מרוויחה."
  },
  {
    year: 2021, icon: "💰",
    title: "ינואר 2021 — חיסונים מגיעים, אופטימיות באוויר",
    desc: "החיסונים לקורונה מתחילים להתפשט והציפייה היא שהעולם חוזר לשגרה. הבנקים המרכזיים ממשיכים לשמור על ריבית נמוכה מאוד כדי לעודד את הכלכלה. רוב האנליסטים צופים שנה טובה למניות — אבל יש מי שמזהירים שהשווקים עלו מהר מדי ואולי קרובה תיקון.\n\nהאם תשנו את התיק?",
    returns: { bond: -0.02, cloud: 0.35, medi: 0.10, shield: 0.08 },
    lesson: "שנה מצוינת לשוק המניות — כמעט כל מה שנגעת בו עלה. אג\"ח דווקא נפגעה קצת כי הציפיות לעליית ריבית התחילו להשפיע.\n\n💡 התובנה: כשהכסף זול ויש אופטימיות בשוק — מניות נוטות לעלות. אבל זה לא אומר שזה יימשך לנצח — ולכן פיזור תמיד חכם."
  },
  {
    year: 2022, icon: "⚔️",
    title: "ינואר 2022 — אזהרות על אינפלציה",
    desc: "המחירים בסופר, בדלק ובכל מקום עולים. הבנקים המרכזיים מאותתים שהם עומדים להעלות ריבית כדי לבלום את האינפלציה — מה שעלול להאט את הצמיחה. בנוסף, יש מתחים גיאופוליטיים גוברים בגבול רוסיה-אוקראינה. האנליסטים חלוקים — חלק אומרים להישאר במניות, חלק ממליצים על זהירות.\n\nהאם תשנו את התיק?",
    returns: { bond: 0.04, cloud: -0.30, medi: -0.05, shield: 0.35 },
    lesson: "שנה קשה מאוד לשווקים. חברות הטכנולוגיה ירדו חדות — עליית הריבית פגעה בהן קשה. לעומת זאת, חברות הביטחון זינקו בגלל המלחמה באוקראינה. אג\"ח סיפקה יציבות יחסית.\n\n💡 התובנה: אי אפשר לחזות מלחמות ומשברים — ולכן מי שהייתה מפוזרת על כמה סקטורים, ספגה פחות נזק."
  },
  {
    year: 2023, icon: "🤖",
    title: "ינואר 2023 — אחרי שנה קשה, מה עכשיו?",
    desc: "2022 הייתה שנה קשה — המניות ירדו והרבה משקיעות הפסידו. עכשיו השאלה היא: האם זה הזמן לקנות בזול, או שעוד יהיו ירידות? הריבית עדיין גבוהה ומצב הביטחון בעולם מתוח. מצד שני, מתחילים לשמוע על טכנולוגיית AI חדשה שעשויה לשנות תעשיות שלמות.\n\nהאם תשנו את התיק?",
    returns: { bond: 0.04, cloud: 0.55, medi: 0.02, shield: 0.28 },
    lesson: "שנת ה-AI! חברות ענן וטכנולוגיה זינקו בגלל הגל העצום של ביקוש לבינה מלאכותית. חברות הביטחון גם הן המשיכו לעלות בגלל אי יציבות גיאופוליטית.\n\n💡 התובנה: טרנדים גדולים כמו AI יכולים לשנות את התמונה מהר — מי שהייתה בסקטור הנכון בזמן הנכון, הרוויחה משמעותית."
  },
  {
    year: 2024, icon: "📊",
    title: "ינואר 2024 — סימנים של התייצבות",
    desc: "השווקים מתאוששים לאט, והציפייה היא שהבנקים המרכזיים יתחילו להוריד ריבית השנה. AI הפך לנושא חם ורוב חברות הטכנולוגיה הגדולות משקיעות בו בכבדות. זו השנה האחרונה שלכן — כדאי לחשוב: האם הפיזור שלכן עדיין הגיוני?\n\nהאם תשנו את התיק?",
    returns: { bond: 0.05, cloud: 0.28, medi: 0.12, shield: 0.15 },
    lesson: "שנה טובה לרוב האפיקים — מי שנשארה מושקעת בסבלנות לאורך כל 5 השנים ראתה את הפירות.\n\n💡 התובנה הגדולה: בהשקעות, סבלנות היא הכלי החזק ביותר. מי שנבהלה ב-2020 ומכרה הכל — פספסה את כל העליות שבאו אחר כך. מי שנשארה — הרוויחה."
  }
];

// ===== FORMAT =====
function fmt(n) {
  return "₪" + Math.round(n).toLocaleString("he-IL");
}

// ===== LOCALSTORAGE (גיבוי) =====
function readAllRuns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeAllRuns(runs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

function readAllProgress() {
  try {
    const raw = localStorage.getItem(TEAM_PROGRESS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function writeAllProgress(arr) {
  localStorage.setItem(TEAM_PROGRESS_KEY, JSON.stringify(arr));
}

function getAdminOpenYear() {
  const v = parseInt(localStorage.getItem(ADMIN_OPEN_YEAR_KEY) || "", 10);
  return Number.isFinite(v) ? v : 2020;
}

function setAdminOpenYear(year) {
  localStorage.setItem(ADMIN_OPEN_YEAR_KEY, String(year));
}

// ===== SERVER API FUNCTIONS =====

// שליפת השנה הפתוחה מהשרת
async function serverGetOpenYear() {
  try {
    const res = await fetch(`${API_BASE}/api/year`);
    const data = await res.json();
    return typeof data.openYear === "number" ? data.openYear : 2020;
  } catch (e) {
    console.warn("Could not fetch year from server, using localStorage fallback:", e);
    return getAdminOpenYear();
  }
}

// עדכון השנה הפתוחה בשרת (מנהלת בלבד)
async function serverSetOpenYear(year, pass) {
  const res = await fetch(`${API_BASE}/api/year?pass=${encodeURIComponent(pass)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ year })
  });
  return res.json();
}

// שליפת כל הריצות מהשרת (מנהלת)
async function serverGetAllRuns(pass) {
  const res = await fetch(`${API_BASE}/api/runs?pass=${encodeURIComponent(pass)}`);
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

// שליפת כל מצבי הביניים מהשרת (מנהלת)
async function serverGetAllProgress(pass) {
  const res = await fetch(`${API_BASE}/api/progress?pass=${encodeURIComponent(pass)}`);
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

// מחיקת כל הנתונים (מנהלת)
async function serverClearAll(pass) {
  const res = await fetch(`${API_BASE}/api/runs?pass=${encodeURIComponent(pass)}`, {
    method: "DELETE"
  });
  return res.json();
}

// ===== SAVE RUN (LocalStorage + שרת) =====
function saveRun(run) {
  // LocalStorage
  const runs = readAllRuns();
  runs.push(run);
  writeAllRuns(runs);
  // שרת (fire and forget)
  fetch(`${API_BASE}/api/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(run)
  }).catch(e => console.warn("Server saveRun failed:", e));
}

// ===== UPSERT PROGRESS (LocalStorage + שרת) =====
function upsertTeamProgress(prog) {
  // LocalStorage
  const all = readAllProgress();
  const idx = all.findIndex(x => x.teamId === prog.teamId);
  if (idx >= 0) all[idx] = prog;
  else all.push(prog);
  writeAllProgress(all);
  // שרת (fire and forget)
  fetch(`${API_BASE}/api/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prog)
  }).catch(e => console.warn("Server progress failed:", e));
}