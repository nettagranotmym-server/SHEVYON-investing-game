const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== MEMORY STORAGE (פשוט למשחק) =====
let runs = []; // כל הריצות של הקבוצות
let currentYearIndex = 0; // שליטה מרכזית

// ===== HEALTH =====
app.get("/", (req, res) => {
  res.json({ status: "SHEvyon server running" });
});

// ===== SAVE RUN =====
// הקבוצות שולחות תוצאה בסוף משחק
app.post("/api/runs", (req, res) => {
  const run = req.body;

  if (!run || !run.teamId) {
    return res.status(400).json({ error: "Invalid run data" });
  }

  runs.push({
    ...run,
    ts: Date.now()
  });

  res.json({ ok: true });
});

// ===== GET ALL RUNS (ADMIN) =====
app.get("/api/runs", (req, res) => {
  const pass = req.query.pass;

  if (pass !== "8114") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json(runs);
});

// ===== CLEAR RUNS (ADMIN) =====
app.delete("/api/runs", (req, res) => {
  const pass = req.query.pass;

  if (pass !== "8114") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  runs = [];
  res.json({ ok: true });
});

// ===== CENTRAL YEAR CONTROL =====
app.get("/api/year", (req, res) => {
  res.json({ yearIndex: currentYearIndex });
});

app.post("/api/year", (req, res) => {
  const pass = req.query.pass;

  if (pass !== "8114") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { yearIndex } = req.body;

  if (typeof yearIndex !== "number") {
    return res.status(400).json({ error: "Invalid yearIndex" });
  }

  currentYearIndex = yearIndex;
  res.json({ ok: true });
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});