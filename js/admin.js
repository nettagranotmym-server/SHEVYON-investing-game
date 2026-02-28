function requirePassword() {
  const pass = prompt("הכניסי סיסמה לצפייה במסך המנהלת:");
  if (pass !== "8114") {
    alert("סיסמה שגויה.");
    window.location.href = "index.html";
    return false;
  }
  return true;
}

function buildLatestByTeam(runs) {
  const map = new Map();
  runs.forEach(r => {
    const key = r.teamId;
    const prev = map.get(key);
    if (!prev || (r.ts || 0) > (prev.ts || 0)) {
      map.set(key, r);
    }
  });
  return map;
}

function buildProgressByTeam(progressArr) {
  const map = new Map();
  progressArr.forEach(p => map.set(p.teamId, p));
  return map;
}

function renderYearControl() {
  const openYear = getAdminOpenYear();
  const st = document.getElementById("yearStatus");
  if (st) st.textContent = `כרגע פתוח עד שנה: ${openYear}`;

  [2020, 2021, 2022, 2023, 2024].forEach(y => {
    const btn = document.getElementById(`open${y}`);
    if (!btn) return;
    btn.disabled = y <= openYear;
    btn.textContent = y <= openYear ? `✅ פתוח ${y}` : `פתחי ${y}`;
    btn.onclick = () => {
      setAdminOpenYear(y);
      renderYearControl();
    };
  });
}

function renderAdmin() {
  const runs = readAllRuns();               // תוצאות סופיות
  const latest = buildLatestByTeam(runs);

  const progressArr = readAllProgress();    // תוצאות ביניים
  const progressByTeam = buildProgressByTeam(progressArr);

  const summary = document.getElementById("adminSummary");
  const openYear = getAdminOpenYear();

  if (summary) {
    summary.textContent =
      `נמצאו ${runs.length} ריצות סופיות, ונמצאו ${progressArr.length} סטטוסים ביניים. פתוח עד ${openYear}.`;
  }

  const years = YEARS.map(y => y.year);

  let html = `
    <div class="admin_table_wrap">
      <table class="admin_tbl">
        <thead>
          <tr>
            <th style="width:160px;">קבוצה</th>
            ${years.map(y => `<th>${y}</th>`).join("")}
            <th>סופי</th>
          </tr>
        </thead>
        <tbody>
  `;

  TEAMS.forEach(t => {
    const prog = progressByTeam.get(t.id); // מצב ביניים
    const fin = latest.get(t.id);          // סופי

    const byYear = new Map();

    // נעדיף להציג נתוני ביניים (אם יש), אחרת נתונים סופיים (אם יש)
    const src = prog && Array.isArray(prog.yearTotals) ? prog : fin;

    if (src && Array.isArray(src.yearTotals)) {
      src.yearTotals.forEach(yt => byYear.set(yt.year, yt.totalAfter));
    }

    const tsText =
      (prog && prog.ts) ? new Date(prog.ts).toLocaleString("he-IL")
      : (fin && fin.ts) ? new Date(fin.ts).toLocaleString("he-IL")
      : "אין נתונים";

    html += `<tr>
      <td>
        <span class="admin_badge"><span>${t.e}</span><span>${t.n}</span></span>
        <div class="admin_muted" style="margin-top:2px; font-size:10px;">${tsText}</div>
      </td>`;

    years.forEach(y => {
      const val = byYear.get(y);
      html += `<td>${typeof val === "number" ? fmt(val) : "—"}</td>`;
    });

    // סופי: רק אם יש ריצה סופית
    html += `<td style="font-weight:900; color:var(--gold); font-family:'Rubik',sans-serif;">
      ${fin ? fmt(fin.finalTotal) : "—"}
    </td></tr>`;
  });

  html += `</tbody></table></div>`;
  document.getElementById("adminTableWrap").innerHTML = html;
}

function bindAdminButtons() {
  document.getElementById("btnRefresh").addEventListener("click", () => {
    renderYearControl();
    renderAdmin();
  });

  document.getElementById("btnClear").addEventListener("click", () => {
    const ok = confirm("לאפס את כל הנתונים המקומיים? זה ימחק תוצאות סופיות וגם סטטוסים ביניים.");
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TEAM_PROGRESS_KEY);
    renderYearControl();
    renderAdmin();
  });
}

(function initAdmin() {
  if (!requirePassword()) return;
  bindAdminButtons();
  renderYearControl();
  renderAdmin();
})();