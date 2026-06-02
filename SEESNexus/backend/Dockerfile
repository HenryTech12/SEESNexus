FROM python:3.11-slim AS builder

# Install build dependencies (including Rust) to build wheels
RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    python3-dev \
    rustc \
    cargo \
    pkg-config \
    libssl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and build wheels in a separate directory
COPY requirements.txt ./
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip wheel --no-cache-dir -r requirements.txt -w /wheels

FROM python:3.11-slim

# Runtime system dependencies (no Rust here)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    libpq5 \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built wheels from builder and install packages from them
COPY --from=builder /wheels /wheels
COPY requirements.txt ./
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --no-index --find-links /wheels -r requirements.txt

# Copy app source
COPY . .

EXPOSE 8000

# Create non-root user and set permissions, then switch to it
RUN useradd -m app || adduser --disabled-password --gecos "" app && chown -R app:app /app
USER app

# Use PORT env var when available; default to 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
