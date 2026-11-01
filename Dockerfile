# Local, production-like build of the portfolio
# Postgres container in docker-compose.yml. 
FROM node:26-alpine

# The Prisma CLI's schema engine
RUN apk add --no-cache openssl

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# prisma.config.ts requires DATABASE_URL 
ENV DATABASE_URL=postgresql://portfolio:portfolio@db:5432/portfolio

COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# Inlined into the client bundle at build time
ARG NEXT_PUBLIC_BASE_URL=http://localhost:3000
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push && npm start"]
