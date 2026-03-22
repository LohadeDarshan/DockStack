# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies: use npm ci if lock file exists, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy the rest of the source code
COPY . .

# Build the app
RUN npm run build

# ---------- Stage 2: Production ----------
FROM node:20-alpine

WORKDIR /app

# Install lightweight static server globally
RUN npm install -g serve

# Copy only the build output from builder stage
COPY --from=builder /app/build ./build

EXPOSE 3000

# Serve the build folder
CMD ["serve", "-s", "build"]