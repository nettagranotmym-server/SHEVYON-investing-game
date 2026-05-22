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

// ===== LESSON CARD - תובנה בלבד =====
function renderLessonCard(openYear) {
  const card = document.getElementById("lessonCard");
  if (!card) return;

  if (openYear === -1) {
    card.style.display = "block";
    card.innerHTML = `
      <div class="lesson-year">🎯 שנת ניסיון פתוחה</div>
      <div class="lesson-text" style="font-size:16px;">הקבוצות משחקות כעת את שנת הניסיון. לאחר שכולן סיימו — לחצי איפוס ואז פתחי 2020 למשחק האמיתי.</div>
    `;
    return;
  }

  if (openYear <= 0) { card.style.display = "none"; return; }

  const yr = YEARS.find(y => y.year === openYear);
  if (!yr) { card.style.display = "none"; return; }

  // מציגים רק את התובנה (אחרי \n\n💡)
  const lessonParts = yr.lesson.split("\n\n");
  const insightOnly = lessonParts.length > 1 ? lessonParts[1] : yr.lesson;

  card.style.display = "block";
  card.innerHTML = `
    <div class="lesson-year">${yr.icon} ${yr.year}</div>
    <div class="lesson-text" style="font-size:18px; line-height:1.8; color:var(--txt);">${insightOnly.replace(/\n/g, "<br>")}</div>
  `;
}

// ===== YEAR CONTROL =====
async function renderYearControl() {
  const openYear = await serverGetOpenYear();
  const st = document.getElementById("yearStatus");
  if (st) st.textContent = openYear === -1 ? "פתוח: ניסיון" : openYear === 0 ? "טרם נפתח" : `פתוח עד: ${openYear}`;

  renderLessonCard(openYear);

  // כפתור ניסיון
  const practiceBtn = document.getElementById("openPractice");
  if (practiceBtn) {
    practiceBtn.disabled = openYear !== 0;
    practiceBtn.textContent = openYear === -1 ? "✅ ניסיון פתוח" : "🎯 פתחי ניסיון";
    practiceBtn.onclick = async () => {
      practiceBtn.disabled = true;
      practiceBtn.textContent = "פותחת...";
      try {
        await serverSetOpenYear(-1, ADMIN_PASS);
        await renderYearControl();
      } catch (e) {
        alert("שגיאה: " + e.message);
        await renderYearControl();
      }
    };
  }

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
  const tableWrap = document.getElementById("adminTableWrap");

  // מציגים קודם את הטבלה הריקה
  const years = YEARS.map(y => y.year);
  let html = `
    <table class="admin_tbl">
      <thead>
        <tr>
          <th style="width:180px;">קבוצה</th>
          ${years.map(y => `<th>${y}</th>`).join("")}
          <th>סופי</th>
        </tr>
      </thead>
      <tbody>
        ${TEAMS.map(t => `
          <tr id="row_${t.id}">
            <td><span class="admin_badge"><span>${t.e}</span><span>${t.n}</span></span></td>
            ${years.map(() => `<td>—</td>`).join("")}
            <td>—</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  tableWrap.innerHTML = html;

  try {
    const [runs, progressArr] = await Promise.all([
      serverGetAllRuns(ADMIN_PASS),
      serverGetAllProgress(ADMIN_PASS)
    ]);

    const openYear = await serverGetOpenYear();

    const latestRuns = new Map();
    runs.forEach(r => {
      const prev = latestRuns.get(r.teamId);
      if (!prev || r.ts > prev.ts) latestRuns.set(r.teamId, r);
    });

    const progressByTeam = new Map();
    progressArr.forEach(p => progressByTeam.set(p.teamId, p));

    if (summary) {
      summary.textContent = `${runs.length} ריצות סופיות · ${progressArr.length} ביניים · פתוח עד ${openYear}`;
    }

    // עדכון כל שורה עם הנתונים האמיתיים
    TEAMS.forEach(t => {
      const prog = progressByTeam.get(t.id);
      const fin = latestRuns.get(t.id);
      const row = document.getElementById(`row_${t.id}`);
      if (!row) return;

      const byYear = new Map();
      const src = prog && Array.isArray(prog.yearTotals) ? prog : fin;
      if (src && Array.isArray(src.yearTotals)) {
        src.yearTotals.forEach(yt => byYear.set(yt.year, yt.totalAfter));
      }

      const tsText = (prog?.ts || fin?.ts)
        ? new Date(prog?.ts || fin?.ts).toLocaleTimeString("he-IL")
        : "";

      const cells = row.querySelectorAll("td");
      // שם + זמן
      cells[0].innerHTML = `
        <span class="admin_badge"><span>${t.e}</span><span>${t.n}</span></span>
        ${tsText ? `<div class="admin_muted" style="font-size:10px;">${tsText}</div>` : ""}
      `;
      // שנים
      years.forEach((y, i) => {
        const val = byYear.get(y);
        cells[i + 1].textContent = typeof val === "number" ? fmt(val) : "—";
      });
      // סופי
      cells[years.length + 1].innerHTML = fin
        ? `<span style="font-weight:900; color:var(--gold);">${fmt(fin.finalTotal)}</span>`
        : "—";
    });

  } catch (e) {
    if (summary) summary.textContent = "שגיאה בטעינת נתונים: " + e.message;
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

  
  // רענון אוטומטי כל 10 שניות
  setInterval(async () => {
    await renderAdmin();
  }, 10000);
})();