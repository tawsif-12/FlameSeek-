# FlameSeek deployment

Vercel production requests use relative API URLs. `frontend/vercel.json` forwards
API and snapshot routes to `https://flameseek.onrender.com` before the SPA fallback.
This keeps browser requests on the website's domain. `VITE_API_BASE_URL` is used
only in development; update the rewrite destinations to change the production backend.
Cold downloads return a short 202 response and the browser polls while NASA data
loads, rather than holding one gateway request open. Temporary live-map
network/gateway errors are retried at most three times. Permanent failures
show their error in the sidebar instead of hiding it inside Data details.

Historical snapshots currently remain local. An empty cloud catalog means history
is unavailable there; the live NASA map does not need those SQLite files.

## Outage recovery

The map retries failed loads every 30 seconds, refreshes healthy data every five
minutes, and retries immediately when the browser reconnects. The homepage
refreshes every minute. Refresh failures retain eligible observations for the
same area and time range. Successful worldwide observations are saved in browser
Cache Storage (with an in-memory fallback if storage is disabled). During an
outage these are explicitly labelled saved data, retain their original timestamp,
expire after six hours, and exclude detections outside the requested time range.
No sample data is used to hide an outage. First-time visitors without a saved
snapshot must wait for a working backend and NASA response.

These changes recover from interruptions; they do not guarantee provider uptime.
An always-on backend and persistent shared cache require suitable hosting/storage.
No paid resources or historical database uploads are enabled by this change.

The Docker deployment enables live footprint-based event grouping (procedure Steps
1-4). Real satellite observations are published immediately while a single grouping
worker runs in a background thread, sharing the API runtime rather than starting
a duplicate Python process; failures retain those observations. Numeric workers
use one thread to limit memory use. Grouped points are estimates, not confirmed fires.

The additional full harmonization workflow (grid/calibration/diurnal/Monte Carlo)
is separately opt-in with `FLAMESEEK_FULL_HARMONIZATION_ENABLED=true`; it is not
required for live event grouping. Startup event precomputation remains disabled.
`FLAMESEEK_LIVE_MERGING_ENABLED=false` explicitly disables grouping if set in Render;
remove that override or set it to `true` to use the Docker default. Historical
snapshots still require a separate data transfer.

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
