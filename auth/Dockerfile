FROM node:16-alpine3.14 as  development

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install

COPY . .

# build

RUN npm run build

# remove development dependencies
RUN npm prune --production

FROM node:16-alpine3.14 as  production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

RUN npm install pm2 -g

COPY --from=development /app/dist ./dist
COPY --from=development /app/node_modules ./node_modules

EXPOSE 3000

CMD [ "pm2-runtime", "dist/index.js" ]