FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=/app/backend/api:/app/backend FLAMESEEK_PIPELINE_PYTHON=/usr/local/bin/python
ENV FLAMESEEK_LIVE_MERGING_ENABLED=true FLAMESEEK_FULL_HARMONIZATION_ENABLED=false FLAMESEEK_WARM_EVENTS=false
ENV OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 MKL_NUM_THREADS=1
ENV FLAMESEEK_GROUPING_WORKER=thread
WORKDIR /app/backend
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN useradd --uid 10001 --create-home appuser
COPY --chown=appuser:appuser . .
RUN mkdir -p data dataset outputs api/cache .runlogs && chown -R appuser:appuser /app/backend
USER appuser
WORKDIR /app/backend/api
EXPOSE 8000
HEALTHCHECK --start-period=60s CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health',timeout=5)"
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
