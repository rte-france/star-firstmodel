FROM node:8

ENV CLIENT_SRC ./src/
ENV CLIENT_CONFIG ./tsconfig.json
ENV CLIENT_CLI ./angular-cli.json

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .

EXPOSE 4200
EXPOSE 49153
