// ===== CONFIG =====
const CONTROLLED_BY_ADMIN = true; // המנהלת שולטת בפתיחת שנים

// ===== STATE =====
let S = {
  team: null,
  alloc: { bond: 25, cloud: 25, medi: 25, shield: 25 },
  origAlloc: null,
  prevAlloc: null,
  portfolio: { bond: 25000, cloud: 25000, medi: 25000, shield: 25000 },
  total: TOTAL,
  year: -1,
  changes: 0,
  totalCommissions: 0,
  yearHistory: [],
  timer: null,
  timeLeft: TIMER_SEC,
  phase: "alloc",
  touchedThisYear: false,
  _pollInterval: null // לשמירת interval של ההמתנה
};

// ===== DOM HELPERS =====
function show(id) {
  document.querySelectorAll(".sc").forEach(s => s.classList.remove("on"));
  document.getElementById(id).classList.add("on");
  window.scrollTo(0, 0);
}

// ===== TEAMS UI =====
function renderTeams() {
  const grid = document.getElementById("teamGrid");
  grid.innerHTML = TEAMS.map(t =>
    `<button class="tb" data-id="${t.id}"><span class="te">${t.e}</span>${t.n}</button>`
  ).join("");

  grid.querySelectorAll(".tb").forEach(btn => {
    btn.addEventListener("click", () => selTeam(parseInt(btn.dataset.id)));
  });
}

function selTeam(id) {
  S.team = TEAMS.find(t => t.id === id) || null;
  document.querySelectorAll(".tb").forEach(b => b.classList.remove("sel"));
  const chosen = document.querySelector(`.tb[data-id="${id}"]`);
  if (chosen) chosen.classList.add("sel");
  document.getElementById("startBtn").classList.add("en");
}

function bindButtons() {
  document.getElementById("goToTeamsBtn").addEventListener("click", () => show("scrWelcome"));
  document.getElementById("startBtn").addEventListener("click", startGame);
  document.getElementById("restartBtn").addEventListener("click", restart);
}

// ===== START =====
function startGame() {
  if (!S.team) return;

  S.alloc = { bond: 25, cloud: 25, medi: 25, shield: 25 };
  S.origAlloc = null;
  S.prevAlloc = null;
  S.portfolio = { bond: 25000, cloud: 25000, medi: 25000, shield: 25000 };
  S.total = TOTAL;
  S.year = -1;
  S.changes = 0;
  S.totalCommissions = 0;
  S.yearHistory = [];
  S.touchedThisYear = false;
  S._pollInterval = null;

  show("scrGame");
  document.getElementById("gTeam").innerHTML = `<span>${S.team.e}</span> ${S.team.n}`;
  document.getElementById("gBal").textContent = fmt(S.total);

  showAllocScreen();
}

// ===== TIMER =====
function startTimer() {
  clearInterval(S.timer);
  S.timeLeft = TIMER_SEC;
  updTimer();

  S.timer = setInterval(() => {
    S.timeLeft -= 1;
    updTimer();
    if (S.timeLeft <= 0) {
      clearInterval(S.timer);
      autoConfirm();
    }
  }, 1000);
}

function updTimer() {
  const m = Math.floor(S.timeLeft / 60);
  const s = S.timeLeft % 60;
  const tEl = document.getElementById("gTime");
  const bEl = document.getElementById("gBar");

  tEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
  bEl.style.width = `${(S.timeLeft / TIMER_SEC) * 100}%`;

  const d = S.timeLeft <= 15;
  tEl.classList.toggle("dng", d);
  bEl.classList.toggle("dng", d);
}

function autoConfirm() {
  if (S.phase === "alloc") confirmAlloc(false);
}

// ===== ALLOCATION SCREEN =====
function showAllocScreen() {
  S.phase = "alloc";
  S.touchedThisYear = false;

  const isIntro = S.year === -1;
  const yr = isIntro ? null : YEARS[S.year];

  if (isIntro) {
    document.getElementById("gStep").textContent = "הכנת התיק";
    document.getElementById("gTitle").textContent = `${INTRO.icon} בניית תיק ההשקעות`;
  } else {
    document.getElementById("gStep").textContent = `שנה ${S.year + 1} מתוך 5`;
    document.getElementById("gTitle").textContent = `${yr.icon} ${yr.year}`;
  }

  let html = "";

  if (isIntro) {
    html += `
      <div class="evc">
        <div class="evi">${INTRO.icon}</div>
        <div class="evt">${INTRO.title}</div>
        <div class="evd">${INTRO.desc}</div>
      </div>
    `;
  } else {
    html += `
      <div class="evc">
        <div class="evi">${yr.icon}</div>
        <div class="evt">${yr.title}</div>
        <div class="evd">${yr.desc}</div>
      </div>
    `;
  }

  html += `<div class="alc">
    <div class="alc-t">${isIntro ? "📊 החליטו על האלוקציה שלכן" : "📊 רוצות לשנות את התיק?"}</div>
  `;

  ASSETS.forEach(a => {
    html += `
      <div class="sr">
        <div class="sh">
          <div class="sl">
            <span class="sli" style="background:${a.bg};color:${a.color}">${a.icon}</span>
            ${a.name}
          </div>
          <div>
            <span class="sv" id="pct_${a.key}">${S.alloc[a.key]}%</span>
            <span class="sm" id="amt_${a.key}">${fmt(S.total * S.alloc[a.key] / 100)}</span>
          </div>
        </div>
        <input type="range" id="sl_${a.key}" min="0" max="100" value="${S.alloc[a.key]}" step="5" />
      </div>
    `;
  });

  html += `
      <div class="aw" id="allocWarn">⚠️ הסכום חייב להסתכם ב 100%</div>
      <button class="cbtn" id="allocBtn">${isIntro ? "יאללה, מתחילות! 🚀" : "אישור ➡️"}</button>
    </div>
  `;

  document.getElementById("gContent").innerHTML = html;

  ASSETS.forEach(a => {
    document.getElementById(`sl_${a.key}`).addEventListener("input", () => {
      S.touchedThisYear = true;
      updSliders();
    });
  });

  document.getElementById("allocBtn").addEventListener("click", () => confirmAlloc(true));

  startTimer();
  checkTotal();
}

function updSliders() {
  ASSETS.forEach(a => {
    const v = parseInt(document.getElementById(`sl_${a.key}`).value);
    S.alloc[a.key] = v;
    document.getElementById(`pct_${a.key}`).textContent = v + "%";
    document.getElementById(`amt_${a.key}`).textContent = fmt(S.total * v / 100);
  });
  checkTotal();
}

function checkTotal() {
  const sum = ASSETS.reduce((s, a) => s + S.alloc[a.key], 0);
  const warn = document.getElementById("allocWarn");
  const btn = document.getElementById("allocBtn");

  if (sum !== 100) {
    warn.classList.add("sh2");
    warn.textContent = sum > 100
      ? `⚠️ חרגתן! ${sum}% , צריך להוריד ${sum - 100}%`
      : `⚠️ חסר! רק ${sum}% , צריך להוסיף עוד ${100 - sum}%`;
    btn.disabled = true;
  } else {
    warn.classList.remove("sh2");
    btn.disabled = false;
  }
}

function confirmAlloc() {
  const sum = ASSETS.reduce((s, a) => s + S.alloc[a.key], 0);
  if (sum !== 100) return;

  clearInterval(S.timer);

  if (S.year === -1) {
    S.origAlloc = { ...S.alloc };
    S.prevAlloc = { ...S.alloc };
    ASSETS.forEach(a => {
      S.portfolio[a.key] = S.total * S.alloc[a.key] / 100;
    });
    S.year = 0;
    applyYear(false, 0, true);
    return;
  }

  if (!S.touchedThisYear) {
    S.prevAlloc = { ...S.alloc };
    applyYear(false, 0, false);
    return;
  }

  let amountMoved = 0;
  let changed = false;

  if (S.prevAlloc) {
    ASSETS.forEach(a => {
      const oldAmt = S.total * S.prevAlloc[a.key] / 100;
      const newAmt = S.total * S.alloc[a.key] / 100;
      amountMoved += Math.abs(newAmt - oldAmt);
    });
    amountMoved = amountMoved / 2;
    changed = amountMoved > 0;
  }

  const commission = changed ? Math.round(amountMoved * COMMISSION_RATE) : 0;

  if (commission > 0) {
    S.changes += 1;
    S.totalCommissions += commission;
    S.total -= commission;
  }

  S.prevAlloc = { ...S.alloc };
  applyYear(changed, commission, true);
}

// ===== APPLY YEAR =====
function applyYear(changed, commission, doRebalance = true) {
  const yr = YEARS[S.year];

  if (doRebalance) {
    ASSETS.forEach(a => {
      S.portfolio[a.key] = S.total * S.alloc[a.key] / 100;
    });
  }

  const details = [];
  let newTotal = 0;

  ASSETS.forEach(a => {
    const before = S.portfolio[a.key];
    const ret = yr.returns[a.key];
    const after = before * (1 + ret);
    S.portfolio[a.key] = after;
    newTotal += after;
    details.push({ ...a, before, after, ret });
  });

  const oldTotal = S.total;
  S.total = newTotal;

  ASSETS.forEach(a => {
    S.alloc[a.key] = S.total > 0 ? Math.round((S.portfolio[a.key] / S.total) * 100) : 25;
  });

  const allocSum = ASSETS.reduce((s, a) => s + S.alloc[a.key], 0);
  if (allocSum !== 100 && S.total > 0) {
    S.alloc[ASSETS[0].key] += (100 - allocSum);
  }

  S.yearHistory.push({
    year: yr.year,
    changed,
    commission,
    totalBefore: oldTotal,
    totalAfter: S.total
  });

  upsertTeamProgress({
    ts: Date.now(),
    teamId: S.team.id,
    teamName: S.team.n,
    teamEmoji: S.team.e,
    currentYear: yr.year,
    totalNow: S.total,
    yearTotals: S.yearHistory.map(y => ({ year: y.year, totalAfter: y.totalAfter }))
  });

  showYearResult(yr, details, oldTotal, commission);
}

// ===== YEAR RESULT =====
function showYearResult(yr, details, oldTotal, commission) {
  S.phase = "result";
  const change = ((S.total - oldTotal) / oldTotal) * 100;
  const isPos = change >= 0;

  document.getElementById("gBal").textContent = fmt(S.total);

  let commissionHtml = "";
  if (commission > 0) {
    commissionHtml = `<div style="background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.3); border-radius:8px; padding:8px; margin-bottom:10px; text-align:center; font-size:12px;">
      <span style="color:var(--red)">💸 עמלות קנייה או מכירה: <strong style="font-family:'Rubik',sans-serif;">-${fmt(commission)}</strong></span>
    </div>`;
  }

  let html = `<div class="yrc">
    <div class="yr-i">${isPos ? "📈" : "📉"}</div>
    <div class="yr-ch ${isPos ? "pos" : "neg"}">${isPos ? "+" : ""}${change.toFixed(1)}%</div>
    ${commissionHtml}
    <div class="yr-ex">${yr.lesson}</div>
    <div class="yr-bd">
  `;

  details.forEach(d => {
    const rPos = d.ret >= 0;
    html += `<div class="yr-ar">
      <span>${d.icon} ${d.name}</span>
      <span>
        <span style="color:${rPos ? "var(--green)" : "var(--red)"}; font-family:'Rubik',sans-serif; font-weight:700;">
          ${rPos ? "+" : ""}${(d.ret * 100).toFixed(0)}%
        </span>
        <span style="color:var(--txt3); margin-right:6px;">${fmt(d.after)}</span>
      </span>
    </div>`;
  });

  const isLastYear = S.year >= 4;

  html += `</div>
    <div class="yr-bal">
      <div class="yr-bl">שווי התיק</div>
      <div class="yr-bv">${fmt(S.total)}</div>
    </div>
    <button class="nbtn" id="nextBtn">
      ${isLastYear ? "לתוצאות הסופיות 🏆" : "לשנה הבאה ➡️"}
    </button>
  </div>`;

  document.getElementById("gContent").innerHTML = html;

  document.getElementById("nextBtn").addEventListener("click", () => nextYear());
}

// ===== NEXT YEAR (בדיקת שרת) =====
async function nextYear() {
  // עצירת polling קודם אם היה
  if (S._pollInterval) {
    clearInterval(S._pollInterval);
    S._pollInterval = null;
  }

  const nextIndex = S.year + 1;

  // סוף המשחק
  if (nextIndex >= 5) {
    S.year = nextIndex;
    showResults();
    return;
  }

  const nextYearValue = YEARS[nextIndex].year;

  // בדיקה מול השרת אם השנה פתוחה
  const openYear = await serverGetOpenYear();

  if (nextYearValue > openYear) {
    // השנה עדיין סגורה — מציגים מסך המתנה
    showWaitingForAdmin(nextYearValue, nextIndex);
    return;
  }

  // השנה פתוחה — ממשיכים
  S.year = nextIndex;
  document.getElementById("gBal").textContent = fmt(S.total);
  showAllocScreen();
}

// ===== WAITING SCREEN =====
function showWaitingForAdmin(yearValue, yearIndex) {
  document.getElementById("gContent").innerHTML = `
    <div class="evc" style="text-align:center; padding:24px 16px;">
      <div class="evi">⏳</div>
      <div class="evt">ממתינות לפתיחת ${yearValue}</div>
      <div class="evd">
        המנהלת תפתח את השנה הבאה בקרוב.<br>
        הדף יתעדכן אוטומטית, אין צורך לרענן.
      </div>
      <div style="margin-top:16px; font-size:11px; color:var(--txt3);" id="waitDots">בודקות...</div>
    </div>
  `;

  let dots = 0;
  S._pollInterval = setInterval(async () => {
    dots = (dots + 1) % 4;
    const el = document.getElementById("waitDots");
    if (el) el.textContent = "בודקות" + ".".repeat(dots + 1);

    const openYear = await serverGetOpenYear();
    if (yearValue <= openYear) {
      clearInterval(S._pollInterval);
      S._pollInterval = null;
      S.year = yearIndex;
      document.getElementById("gBal").textContent = fmt(S.total);
      showAllocScreen();
    }
  }, 3000); // בודקות כל 3 שניות
}

// ===== RESULTS =====
function showResults() {
  show("scrResults");

  const finalTotal = S.total;
  const totalReturn = ((finalTotal - TOTAL) / TOTAL) * 100;
  const isPos = totalReturn >= 0;

  document.getElementById("rTeam").textContent = `${S.team.e} ${S.team.n}`;
  document.getElementById("rAmount").textContent = fmt(finalTotal);

  const rr = document.getElementById("rReturn");
  rr.textContent = `${isPos ? "+" : ""}${totalReturn.toFixed(0)}% תשואה כוללת`;
  rr.className = `fr ${isPos ? "pos" : "neg"}`;

  const bc = document.getElementById("bonusCard");
  if (S.totalCommissions > 0) {
    const changesText = S.changes === 1 ? "שיניתן את התיק פעם אחת" : `שיניתן את התיק ${S.changes} פעמים`;
    bc.style.background = "linear-gradient(135deg,rgba(239,68,68,.1),rgba(239,68,68,.05))";
    bc.style.borderColor = "rgba(239,68,68,.3)";
    bc.innerHTML = `
      <div class="bonus-title" style="color:var(--red)">💸 עמלות קנייה ומכירה</div>
      <div class="bonus-text">${changesText} במהלך 5 שנים.</div>
      <div class="bonus-val" style="color:var(--red)">-${fmt(S.totalCommissions)}</div>
      <div class="bonus-text">בשוק האמיתי כל שינוי בתיק עולה כסף.<br>עמלות, מיסים ותזמון, כל אלה מכרסמים בתשואה.</div>
    `;
  } else {
    bc.style.background = "linear-gradient(135deg,rgba(34,197,94,.1),rgba(34,197,94,.05))";
    bc.style.borderColor = "rgba(34,197,94,.3)";
    bc.innerHTML = `
      <div class="bonus-title" style="color:var(--green)">🎯 אפס עמלות</div>
      <div class="bonus-text">לא שיניתן את התיק בכלל, חסכתן את כל העמלות.</div>
      <div class="bonus-text">סבלנות והתמדה יכולות לעזור לאורך זמן.</div>
    `;
  }

  let dhtml = `<div class="det-t">מסע ההשקעה שלכן:</div>`;
  S.yearHistory.forEach(yh => {
    const ch = ((yh.totalAfter - yh.totalBefore) / yh.totalBefore) * 100;
    const p = ch >= 0;
    const commNote = yh.commission > 0 ? ` <span style="color:var(--red); font-size:10px;">(עמלה: -${fmt(yh.commission)})</span>` : "";
    dhtml += `<div class="det-r">
      <span>📅 ${yh.year} ${yh.changed ? "🔄" : "🔒"}</span>
      <span style="font-family:'Rubik',sans-serif; font-weight:700; color:${p ? "var(--green)" : "var(--red)"}">
        ${p ? "+" : ""}${ch.toFixed(1)}%${commNote}
      </span>
    </div>`;
  });

  if (S.totalCommissions > 0) {
    dhtml += `<div class="det-r" style="border-color:var(--red)">
      <span>💸 סה"כ עמלות</span>
      <span style="font-family:'Rubik',sans-serif; font-weight:700; color:var(--red)">-${fmt(S.totalCommissions)}</span>
    </div>`;
  }

  dhtml += `<div class="det-r" style="border-color:var(--gold)">
    <span style="font-weight:700">💰 סה"כ סופי</span>
    <span style="font-family:'Rubik',sans-serif; font-weight:900; color:var(--gold)">${fmt(finalTotal)}</span>
  </div>`;

  document.getElementById("rDetails").innerHTML = dhtml;

  saveRun({
    ts: Date.now(),
    teamId: S.team.id,
    teamName: S.team.n,
    teamEmoji: S.team.e,
    finalTotal,
    totalCommissions: S.totalCommissions,
    changes: S.changes,
    yearTotals: S.yearHistory.map(y => ({ year: y.year, totalAfter: y.totalAfter }))
  });
}

// ===== RESTART =====
function restart() {
  if (S._pollInterval) {
    clearInterval(S._pollInterval);
  }
  S = {
    team: null,
    alloc: { bond: 25, cloud: 25, medi: 25, shield: 25 },
    origAlloc: null,
    prevAlloc: null,
    portfolio: { bond: 25000, cloud: 25000, medi: 25000, shield: 25000 },
    total: TOTAL,
    year: -1,
    changes: 0,
    totalCommissions: 0,
    yearHistory: [],
    timer: null,
    timeLeft: TIMER_SEC,
    phase: "alloc",
    touchedThisYear: false,
    _pollInterval: null
  };

  document.querySelectorAll(".tb").forEach(b => b.classList.remove("sel"));
  document.getElementById("startBtn").classList.remove("en");
  show("scrIntro");
}

// ===== INIT =====
(function init() {
  renderTeams();
  bindButtons();
  show("scrIntro");
})();