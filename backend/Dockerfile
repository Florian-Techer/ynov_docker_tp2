FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./

FROM base AS deps
RUN npm install

FROM base AS dev
ENV NODE_ENV=development
ENV NPM_CONFIG_CACHE=/home/node/.npm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p /home/node/.npm && chown -R node:node /app /home/node/.npm
USER node
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS prod-deps
RUN npm install --omit=dev

FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
