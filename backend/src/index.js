import express from "express";
import pg from "pg";
import fs from "fs";

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 3000;

const readSecret = (filePath) => {
  if (!filePath) return null;
  try {
    return fs.readFileSync(filePath, "utf8").trim();
  } catch {
    return null;
  }
};

const buildDatabaseUrl = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const user = process.env.POSTGRES_USER;
  const db = process.env.POSTGRES_DB;
  const host = process.env.DB_HOST || "db";
  const port = process.env.DB_PORT || "5432";
  const password = readSecret(process.env.POSTGRES_PASSWORD_FILE);

  if (!user || !db || !password) return null;
  return `postgres://${user}:${password}@${host}:${port}/${db}`;
};

const databaseUrl = buildDatabaseUrl();

// Connexion DB
const pool = new Pool({
  connectionString: databaseUrl
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
});
