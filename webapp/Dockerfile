FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
COPY webapp/package.json ./webapp/package.json
COPY e2e/package.json ./e2e/package.json

RUN bun install --frozen-lockfile

COPY webapp ./webapp

WORKDIR /app/webapp

EXPOSE 5199

CMD ["bun", "run", "dev"]
