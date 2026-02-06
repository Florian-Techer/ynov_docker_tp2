import express from "express";
import pg from "pg";

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 3000;

// Connexion DB (volontairement fragile selon DATABASE_URL fournie)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get("/api/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT 1 as ok");
    res.json({ status: "ok", db: r.rows[0].ok });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

app.get("/api/message", async (req, res) => {
  res.json({ message: "Hello from API" });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
  console.log(`DATABASE_URL=${process.env.DATABASE_URL}`);
});
