# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY application/frontend/package*.json ./
RUN npm ci || npm install

COPY application/frontend/ ./
RUN npm run build

# Stage 2: Python Backend Runtime
FROM python:3.11-slim AS backend-runtime
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code, interface schemas, pipeline datasets, and test configs
COPY pipeline/ ./pipeline/
COPY application/ ./application/
COPY interface/ ./interface/
COPY scripts/ ./scripts/
COPY tests/ ./tests/
COPY API_CONTRACT_SCHEMA.md .
COPY full_parallel_plan.md .
COPY pytest.ini .

# Copy compiled frontend build to public static directory
COPY --from=frontend-builder /app/frontend/dist ./application/frontend/dist

# Expose standard API and MCP ports
EXPOSE 8000
EXPOSE 8001

# Healthcheck targeting verified health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Default command: Start FastAPI server
CMD ["uvicorn", "application.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
