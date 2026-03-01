FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# Copy project
COPY . /app/

# Ensure entrypoint is executable
RUN chmod +x /app/entrypoint.sh

ENV PORT=8080

# Expose the port (conventional for Railway / Docker)
EXPOSE 8080

CMD ["/app/entrypoint.sh"]
