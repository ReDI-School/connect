FROM node:18-bullseye As builder

WORKDIR /app

COPY yarn.lock package.json ./
RUN yarn
COPY . .
RUN yarn nx run nestjs-api:build

FROM node:18-bullseye As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

# RUN yarn global add pm2
COPY package.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3333
CMD ["node", "dist/apps/nestjs-api/main"]
# CMD ["pm2", "start", "--name", "nestjs-api", "--update-env", "--max-memory-restart", "500M", "dist/apps/nestjs-api/main.js"]