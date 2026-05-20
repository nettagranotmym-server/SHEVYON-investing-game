<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SHEvyon, מנהלת קבוצות</title>

  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&family=Rubik:wght@400;500;700;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/styles.css" />
</head>

<body class="admin-page">
  <div class="bgp"></div>

  <div class="admin-wrap">

    <!-- HEADER -->
    <div class="admin-header">
      <div class="admin-header-title">🗂️ לוח תוצאות — SHEvyon</div>
      <div class="admin-header-actions">
        <span id="adminSummary" style="font-size:12px; color:var(--txt3);"></span>
        <button class="kbtn" id="btnRefresh" style="margin:0; padding:8px 16px; font-size:13px;">🔄 רענון</button>
        <button class="kbtn" id="btnClear" style="margin:0; padding:8px 16px; font-size:13px; border-color:var(--red); color:var(--red);">🗑️ איפוס</button>
        <a href="index.html" style="color:var(--gold); font-weight:800; text-decoration:none; font-size:14px;">← חזרה</a>
      </div>
    </div>

    <!-- LESSON CARD - מציג את הלקח של השנה הנוכחית -->
    <div class="admin-lesson-card" id="lessonCard"></div>

    <!-- RESULTS TABLE -->
    <div class="admin-table-wrap">
      <div id="adminTableWrap"></div>
    </div>

    <!-- YEAR CONTROL -->
    <div class="admin-year-bar">
      <div class="admin-year-label">שליטה בשנים:</div>
      <div id="yearStatus" style="font-size:12px; color:var(--txt2); margin-left:12px;"></div>
      <div class="admin-year-btns">
        <button class="kbtn year-btn" id="open2020" style="margin:0;">פתחי 2020</button>
        <button class="kbtn year-btn" id="open2021" style="margin:0;">פתחי 2021</button>
        <button class="kbtn year-btn" id="open2022" style="margin:0;">פתחי 2022</button>
        <button class="kbtn year-btn" id="open2023" style="margin:0;">פתחי 2023</button>
        <button class="kbtn year-btn" id="open2024" style="margin:0;">פתחי 2024</button>
      </div>
    </div>

  </div>

  <script src="js/data.js"></script>
  <script src="js/admin.js"></script>
</body>
</html>