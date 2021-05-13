# https://dev.to/alex_barashkov/using-docker-for-nodejs-in-development-and-production-3cgp

FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN npm install -g yarn
RUN yarn install

COPY ./ ./

ENV PORT=8800

EXPOSE 8800

CMD ["yarn", "start:prod"]
