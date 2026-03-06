FROM oven/bun:1

WORKDIR /app

COPY webapp/package.json ./webapp/package.json
COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY webapp ./webapp

WORKDIR /app/webapp

EXPOSE 5173

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
