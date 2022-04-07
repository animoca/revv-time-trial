FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/app

RUN apk add --no-cache --update bash python3 build-base libtool autoconf automake

COPY backend-common_library /usr/src/backend-common_library

COPY time-trial/.babelrc .

COPY time-trial/package.json ./

COPY time-trial/gameData /usr/src/app/gameData

COPY time-trial/yarn.lock .

RUN yarn

# # Bundle app source
COPY time-trial/src src

RUN yarn run build

ENV PORT=8084

EXPOSE 8084

COPY time-trial/config config

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD [ "sh", "-c", "/wait; node ./dist/server.js"]
