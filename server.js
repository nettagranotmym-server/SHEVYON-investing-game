const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASS = "8114";

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // מגיש את קבצי הפרונטאנד (HTML/CSS/JS)

// ===== MEMORY STORAGE =====
let runs = [];
let progress = [];
let openYear = 2020;
let takenTeams = {}; // { teamId: teamName }

// ===== HEALTH CHECK =====
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", openYear });
});

// ===== RUNS (תוצאות סופיות) =====
app.post("/api/runs", (req, res) => {
  const run = req.body;
  if (!run || !run.teamId) return res.status(400).json({ error: "Invalid run data" });
  runs = runs.filter(r => r.teamId !== run.teamId); // שומרים רק הריצה האחרונה לכל קבוצה
  runs.push({ ...run, ts: Date.now() });
  res.json({ ok: true });
});

app.get("/api/runs", (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(401).json({ error: "Unauthorized" });
  res.json(runs);
});

app.delete("/api/runs", (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(401).json({ error: "Unauthorized" });
  runs = [];
  progress = [];
  openYear = 2020;
  takenTeams = {};
  res.json({ ok: true });
});

// ===== TEAM CLAIMING =====
app.get("/api/teams", (req, res) => {
  res.json(takenTeams);
});

app.post("/api/teams", (req, res) => {
  const { teamId, teamName } = req.body;
  if (!teamId) return res.status(400).json({ error: "Invalid teamId" });
  if (takenTeams[teamId]) return res.status(409).json({ error: "Team already taken" });
  takenTeams[teamId] = teamName || "unknown";
  res.json({ ok: true });
});

// ===== PROGRESS (מצב ביניים) =====
app.post("/api/progress", (req, res) => {
  const p = req.body;
  if (!p || !p.teamId) return res.status(400).json({ error: "Invalid progress data" });
  progress = progress.filter(x => x.teamId !== p.teamId);
  progress.push({ ...p, ts: Date.now() });
  res.json({ ok: true });
});

app.get("/api/progress", (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(401).json({ error: "Unauthorized" });
  res.json(progress);
});

// ===== YEAR CONTROL (שליטה מרכזית בשנים) =====
app.get("/api/year", (req, res) => {
  res.json({ openYear });
});

app.post("/api/year", (req, res) => {
  if (req.query.pass !== ADMIN_PASS) return res.status(401).json({ error: "Unauthorized" });
  const { year } = req.body;
  if (typeof year !== "number") return res.status(400).json({ error: "Invalid year" });
  openYear = year;
  res.json({ ok: true, openYear });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`SHEvyon server running on port ${PORT}`);
});