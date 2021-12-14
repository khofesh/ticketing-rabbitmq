# syntax=docker/dockerfile:1

FROM node:16-alpine3.14 as development

WORKDIR /app

COPY ["package.json", "yarn.lock", "./"]

RUN yarn install 

COPY . .

RUN yarn build globalapi

# remove development dependencies
RUN npm prune --production

FROM node:16-alpine3.14 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

RUN npm install pm2 -g

COPY --from=development /app/dist ./dist
COPY --from=development /app/node_modules ./node_modules

EXPOSE 3000
# RUN ls ./dist

CMD ["pm2-runtime",  "dist/main.js"]