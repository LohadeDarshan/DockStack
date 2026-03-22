# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies (use npm ci if lock file exists, else npm install)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Optional: run tests/build scripts here if needed
# RUN npm run build

# ---------- Stage 2: Production ----------
FROM node:20-alpine

WORKDIR /app

# Copy only package files to install production dependencies
COPY package*.json ./

# Install only production dependencies
RUN if [ -f package-lock.json ]; then npm ci --only=production; else npm install --only=production; fi

# Copy everything from builder stage
COPY --from=builder /app ./

EXPOSE 5000

CMD ["npm", "start"]