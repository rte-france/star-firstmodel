FROM node:11 AS builder
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install && \
	npm install -g grunt-cli
COPY . /usr/src/app
RUN grunt build

FROM node:11
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app ./
COPY ./Gruntfile.js ./
RUN npm install -g grunt-cli
EXPOSE 3000
ENTRYPOINT ["grunt", "prod"]
