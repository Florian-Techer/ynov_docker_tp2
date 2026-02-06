import React, { useEffect, useState } from "react";

// Objectif final : passer par Nginx (même origine) -> /api/...
const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export default function App() {
  const [health, setHealth] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/health`).then(r => r.json()),
      fetch(`${API_BASE}/api/message`).then(r => r.json())
    ]).then(([h, m]) => {
      setHealth(h);
      setMessage(m);
    }).catch(e => setError(e.message));
  }, []);

  return (
    <div style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>M2 Docker Evaluation</h1>
      <p>Objectif : rendre la stack fonctionnelle derrière Nginx sur http://localhost:8080</p>

      <h2>API Health</h2>
      {error && <pre style={{ color: "crimson" }}>{error}</pre>}
      <pre>{health ? JSON.stringify(health, null, 2) : "Loading..."}</pre>

      <h2>API Message</h2>
      <pre>{message ? JSON.stringify(message, null, 2) : "Loading..."}</pre>

      <hr />
      <p style={{ opacity: 0.7 }}>
        Indice: attention à localhost dans un navigateur vs dans un conteneur.
      </p>
    </div>
  );
}
