### Builder: build frontend with Node
FROM node:18-bullseye-slim AS frontend-builder
WORKDIR /app/frontend

# Copy frontend sources
COPY ../frontend/package.json ./
COPY ../frontend/package-lock.json* ./
COPY ../frontend/ ./

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

# Install npm deps and build
RUN npm ci --prefer-offline --no-audit --progress=false || npm install --no-audit --no-fund
RUN npm run build


### Final image: Python app + built frontend
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# system deps for Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# Copy backend code
COPY . /app/

# Copy built frontend into the image so Django can serve it
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure entrypoint is executable
RUN chmod +x /app/entrypoint.sh

ENV PORT=8080

# Expose the port (conventional for Railway / Docker)
EXPOSE 8080

CMD ["/app/entrypoint.sh"]
