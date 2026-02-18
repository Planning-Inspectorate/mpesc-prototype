FROM node:22-alpine AS base

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

COPY app ./app

RUN npm ci

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT npm run start