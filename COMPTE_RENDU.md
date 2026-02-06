# Compte rendu TP2 Docker - TECHER Florian

## Partie 1

- Le frontend ne peux pas appeler l'api car ils ne sont pas sur le même reseau
- LA base de données ne reponds pas immédiatement car il faut créer le fichier .env pour y définir les variables d'environemmment, de plus le volume local n'est pas definis
- Les services qui ne comminique pas correctement entre eux sont nginx avec le back et front, nginx ne peut pas joindre le frontend ni le backend. Le nom du service du front n'est pas bopn c'est frontend. Le port du backend est incorrect. Le backend ne peut pas joindre la base qui est en local.


## Partie 2

- Ajout du network frontend dans le service backend pour qu'il puisse communiquer
- Modification du nom du service ( front => frontend ) dans la conf nginx, ainsi que le port du backend ( 5000 => 3000 )
- Modification de la variable d'env VITE_API_BASE_URL=/api car nous passons par le nginx. En mettant VITE_API_BASE_URL=/api, le navigateur appelle /api sur le même hôte/port, on evite donc les problèmes de CORS


## Partie 3

``` 
FROM node:20-alpine AS deps # stage1
WORKDIR /app
COPY package.json package-lock.json ./ 
RUN npm ci --omit=dev # installation reproductible, plus rapide que npm i --omit=dev exclut les dépendances de développement
FROM node:20-alpine AS runner # stage2
ENV NODE_ENV=production 
WORKDIR /app 
COPY --from=deps /app/node_modules ./node_modules # Copie uniquement les dépendances déjà installées, pas besoin de relancer npm ci
COPY --chown=node:node . . # --chown=node:node évite les problèmes de permissions
USER node # Le conteneur ne tourne pas en root
EXPOSE 3000 
CMD ["npm", "run", "start"] 
```

## Partie 4

- Création d'un dossier ./secret avec un fichier postgres_password.txt qui contient le mdp
- Mofication du docker-compose pour le secrets

```
secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
```
```
environment:
    POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
secrets:
      - postgres_password
```

- Modification du backend pour lire le secret et construire DATABASE-URL

```
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
```


## Partie 5

-  Ajout d’un healthcheck utilisant `pg_isready` pour valider que la DB accepte les connexions.
Paramètres : interval: 5s, timeout: 5s, retries: 10, start_period: 10s.
Objectif : marquer le service db comme healthy seulement quand la DB est réellement prête.
- Ajout d’un healthcheck HTTP sur /api/health via `wget`.
Paramètres : interval: 5s, timeout: 3s, retries: 10, start_period: 10s.
Objectif : vérifier que l’API est opérationnelle (et que la DB répond).
- Le backend dépend de db avec condition: service_healthy → l’API attend que la DB soit prête. \
Frontend dépend de backend avec condition: service_healthy → évite un front qui tourne sans API. \
Nginx dépend de backend (healthy) et frontend (started) → évite les erreurs au démarrage.


Même si la base de donnée démarre lentement, l'app se lance. Les services attendent l’état healthy avant d’être considérés prêts pour éviter les erreurs de connexion au démarrage.


## Partie 6

- Ajout de volume pour le cache
- Modification des dockerfile pour build les images avec du cache et stages dev
- Modification du docker-compose avec la variavle d'env `CHOKIDAR_USEPOLLING: "true"` \
Ajout de `target: dev`


## BONUS

- COPY . . est dangereux car ça copie tout le contexte build : secrets, fichiers inutiles, node_modules, .env
- Depends_on ne suffit car ça ne garantit que l’ordre de démarrage ce n'est pas parce que le container est démarré que le service est prêt. par exemple la base de donnée peut démarrer mais ne pas accepter les connexions. Il faut des healthchecks conditionelle
- Une image Node officielle peut être mauvaise car elle est plus lourde, avec plus de possibilité d'attaque comme plus de chose sont installée avec. De plus l’app tourne en root ce qui n'est pas très sécurisé