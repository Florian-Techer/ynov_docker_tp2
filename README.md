# TP ÉVALUATION — Advanced Docker Debugging & Architecture (5h)
Master 2 — Développement Web

## Ce que vous recevez
Ce dépôt contient une stack volontairement incomplète / fragile. Votre objectif est de la rendre :
- fonctionnelle
- reproductible
- plus sûre (secrets)
- plus robuste (healthchecks)
- plus rapide à builder (Dockerfile)

## Stack
- `nginx` (reverse proxy)
- `frontend` (React + Vite)
- `backend` (Node.js + Express)
- `db` (PostgreSQL)

## Lancement
À l'état actuel, le projet est volontairement "cassé" (ou partiellement fonctionnel).

Commandes utiles :
```bash
docker compose up -d --build
docker compose ps
docker compose logs -f --tail=200
```

Accès :
- Nginx (entrée) : http://localhost:8080
- Frontend direct (si exposé) : http://localhost:5173
- API direct (si exposée) : http://localhost:3000

## Objectif final attendu (cible)
- http://localhost:8080 charge le frontend
- le frontend appelle l'API via Nginx (pas via localhost interne)
- l'API répond sur `/api/health` et `/api/message`
- PostgreSQL persiste ses données via volume
- mots de passe retirés du YAML : utilisation de `secrets` + variables `_FILE`
- healthcheck PostgreSQL + API, et orchestration correcte
- Dockerfile backend optimisé (cache, multi-stage si vous le souhaitez, non-root)

## Contraintes
- Pas d'installation locale de Node/Postgres requise : tout via Docker
- Docker Compose obligatoire
- Vous pouvez modifier les fichiers fournis (compose, Dockerfile, nginx, code)

## Indications
- Plusieurs problèmes sont indépendants : traitez-les un par un.
- Vérifiez les réseaux Docker, les URLs côté navigateur, les variables d'environnement.
- `depends_on` ne suffit pas si la DB n'est pas prête : healthcheck et conditions.

Bon courage.
