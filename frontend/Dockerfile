# ---------- Stage 1: Build ----------

FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies

COPY package*.json ./
RUN npm ci

# Copy source code

COPY . .

# Build the app

RUN npm run build

# ---------- Stage 2: Production ----------

FROM node:20-alpine

WORKDIR /app

# Install lightweight static server

RUN npm install -g serve

# Copy only build output

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build"]