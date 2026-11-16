# FlameSeek deployment

Vercel production requests use relative API URLs. `frontend/vercel.json` forwards
API and snapshot routes to `https://flameseek.onrender.com` before the SPA fallback.
This keeps browser requests on the website's domain. `VITE_API_BASE_URL` is used
only in development; update the rewrite destinations to change the production backend.
Temporary live-map network/gateway errors are retried once. Permanent failures
show their error in the sidebar instead of hiding it inside Data details.

Historical snapshots currently remain local. An empty cloud catalog means history
is unavailable there; the live NASA map does not need those SQLite files.

The Docker deployment defaults to individual NASA satellite observations on the
live map, without automatic worldwide footprint matching or event precomputation
at startup. These points are observations, not confirmed or merged fire events.
Prediction and on-demand analysis code remains available. To enable the heavier
live merging workflow on a host with sufficient resources, set
`FLAMESEEK_LIVE_MERGING_ENABLED=true`. Optional startup event precomputation uses
`FLAMESEEK_WARM_EVENTS=true`. Neither setting installs the historical database;
that still requires a separate data transfer.

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
