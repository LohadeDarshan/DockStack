# ---------- Stage 1: Build ----------

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# ---------- Stage 2: Production ----------

FROM node:20-alpine

WORKDIR /app

# Install only production dependencies

COPY package*.json ./
RUN npm ci --only=production

# Copy app source

COPY --from=builder /app ./

EXPOSE 5000

CMD ["npm", "start"]