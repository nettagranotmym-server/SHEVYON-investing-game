let ADMIN_PASS = null; // נשמר אחרי הכנסת סיסמה

function requirePassword() {
  const pass = prompt("הכניסי סיסמה לצפייה במסך המנהלת:");
  if (pass !== "8114") {
    alert("סיסמה שגויה.");
    window.location.href = "index.html";
    return false;
  }
  ADMIN_PASS = pass;
  return true;
}

// ===== YEAR CONTROL =====
async function renderYearControl() {
  const openYear = await serverGetOpenYear();

  const st = document.getElementById("yearStatus");
  if (st) st.textContent = `כרגע פתוח עד שנה: ${openYear}`;

  [2020, 2021, 2022, 2023, 2024].forEach(y => {
    const btn = document.getElementById(`open${y}`);
    if (!btn) return;
    btn.disabled = y <= openYear;
    btn.textContent = y <= openYear ? `✅ פתוח ${y}` : `פתחי ${y}`;
    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = "שומרת...";
      try {
        await serverSetOpenYear(y, ADMIN_PASS);
        await renderYearControl();
      } catch (e) {
        alert("שגיאה בשמירה: " + e.message);
        await renderYearControl();
      }
    };
  });
}

// ===== ADMIN TABLE =====
async function renderAdmin() {
  const summary = document.getElementById("adminSummary");

  try {
    const [runs, progressArr] = await Promise.all([
      serverGetAllRuns(ADMIN_PASS),
      serverGetAllProgress(ADMIN_PASS)
    ]);

    const openYear = await serverGetOpenYear();

    // מיפוי לפי teamId
    const latestRuns = new Map();
    runs.forEach(r => {
      const prev = latestRuns.get(r.teamId);
      if (!prev || r.ts > prev.ts) latestRuns.set(r.teamId, r);
    });

    const progressByTeam = new Map();
    progressArr.forEach(p => progressByTeam.set(p.teamId, p));

    if (summary) {
      summary.textContent = `נמצאו ${runs.length} ריצות סופיות, ${progressArr.length} סטטוסים ביניים. פתוח עד ${openYear}.`;
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
      const prog = progressByTeam.get(t.id);
      const fin = latestRuns.get(t.id);

      const byYear = new Map();
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

      html += `<td style="font-weight:900; color:var(--gold); font-family:'Rubik',sans-serif;">
        ${fin ? fmt(fin.finalTotal) : "—"}
      </td></tr>`;
    });

    html += `</tbody></table></div>`;
    document.getElementById("adminTableWrap").innerHTML = html;

  } catch (e) {
    if (summary) summary.textContent = "שגיאה בטעינת נתונים מהשרת.";
    console.error(e);
  }
}

// ===== BUTTONS =====
function bindAdminButtons() {
  document.getElementById("btnRefresh").addEventListener("click", async () => {
    await renderYearControl();
    await renderAdmin();
  });

  document.getElementById("btnClear").addEventListener("click", async () => {
    const ok = confirm("לאפס את כל הנתונים? זה ימחק תוצאות סופיות וסטטוסים ביניים.");
    if (!ok) return;
    try {
      await serverClearAll(ADMIN_PASS);
      await renderYearControl();
      await renderAdmin();
    } catch (e) {
      alert("שגיאה באיפוס: " + e.message);
    }
  });
}

// ===== INIT =====
(async function initAdmin() {
  if (!requirePassword()) return;
  bindAdminButtons();
  await renderYearControl();
  await renderAdmin();
})();
