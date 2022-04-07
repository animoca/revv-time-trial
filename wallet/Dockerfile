FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/app

RUN apk add --no-cache --update bash python3 build-base libtool autoconf automake

COPY backend-common_library /usr/src/backend-common_library

COPY wallet/.babelrc .

COPY wallet/package.json ./

COPY wallet/yarn.lock .

RUN yarn

# # Bundle app source
COPY wallet/src src

RUN yarn run build

ENV PORT=8082

EXPOSE 8082

COPY wallet/config config

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

CMD [ "sh", "-c", "/wait; node ./dist/server.js"]
