FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
COPY webapp/package.json ./webapp/package.json
COPY packages/e2e/package.json ./packages/e2e/package.json

RUN bun install --frozen-lockfile

COPY webapp ./webapp

WORKDIR /app/webapp

EXPOSE 5173

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
