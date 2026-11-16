# FlameSeek deployment

Three application folders:

- frontend/: React/Cesium source, assets, Dockerfile and API proxy.
- backend/: api/ (FastAPI), pipeline/, forecast/, config/, params/ and runtime dependencies.
- database/: verified published SQLite snapshots, all 29 public CSVs, metadata and writable cache.

Test files, test directories, local secrets, logs, node_modules and research archives are excluded.
Your original project is unchanged. SQLite is file-based; no separate database server is needed.

## Run

1. Install Docker with the Compose plugin.
2. Copy backend/.env.example to backend/.env and set FIRMS_MAP_KEY.
3. On Linux, give UID 10001 write access to database/data, database/outputs and database/cache:
   sudo chown -R 10001:10001 database/data database/outputs database/cache
4. Run: docker compose up --build -d
5. Open http://localhost:8080 and check http://localhost:8080/health.

Only the frontend port is published; its proxy forwards API requests to the backend.
For public hosting, put this port behind your host's HTTPS reverse proxy. This package
does not configure a domain or create paid hosting resources. Render does not run this
Compose file directly; the earlier Render configuration remains in the original project.

Keep database/ on durable storage when hosting. Git ignores it, so copying only the
Git repository will not transfer these files. The manifest lists each published data
file's SHA-256 checksum. There is no FIRMS key inside this package.

Live FIRMS requests work when the backend has a valid key and outbound network access.
Predictions fetch history/weather as needed and may be withheld under existing validation
rules. First analyses may take longer because rebuildable caches are not included.

Daily ingestion is intentionally not scheduled: the compact dataset excludes its full
canonical archive. Continue ingestion in the original project and copy updated published
snapshots during maintenance, or deploy the full ingestion archive separately.
