FROM node:24-alpine3.22 AS base

# Firebase's emulators require Java. Keep their downloads in this stable layer.
RUN apk add --no-cache python3 py3-pip openjdk21-jre bash && \
    npm install -g firebase-tools && \
    firebase setup:emulators:firestore && \
    firebase setup:emulators:storage && \
    firebase setup:emulators:ui

WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY functions/package.json functions/package-lock.json functions/
RUN --mount=type=cache,target=/root/.npm npm ci --prefix functions

FROM dependencies AS app
COPY . .
RUN npm run version:generate && npm run build:docker && npm --prefix functions run build

CMD ["npm", "run", "emulator"]
