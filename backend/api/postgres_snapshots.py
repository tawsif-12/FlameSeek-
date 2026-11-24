"""PostgreSQL snapshot reader for Aiven."""
import json
import re
from urllib.parse import urlparse, unquote

import pg8000.dbapi

class Row(dict):
    def __getitem__(self, key):
        return list(self.values())[key] if isinstance(key, int) else super().__getitem__(key)

class Result:
    def __init__(self, cursor):
        self.cursor = cursor
        self.names = [d[0] for d in cursor.description] if cursor.description else []
    def _row(self, row):
        return Row(zip(self.names, row)) if row is not None else None
    def fetchone(self): return self._row(self.cursor.fetchone())
    def fetchall(self): return [self._row(row) for row in self.cursor.fetchall()]
    def __iter__(self):
        return (self._row(row) for row in self.cursor)

class Connection:
    postgres = True
    def __init__(self, url, window=None):
        u = urlparse(url)
        if u.scheme not in ('postgres','postgresql') or not u.hostname or not u.username:
            raise ValueError('Invalid PostgreSQL connection URL')
        self.raw = pg8000.dbapi.connect(user=unquote(u.username), password=unquote(u.password or ''),
            host=u.hostname, port=u.port or 5432, database=u.path.lstrip('/'), ssl_context=True, timeout=15)
        self.raw.autocommit = True
        self.identity = ('postgres', u.hostname, u.path, window)
        if window:
            if not re.fullmatch(r'[a-z0-9_]+', window): raise ValueError('Invalid snapshot window')
            self.raw.cursor().execute('SET search_path TO "snapshot_' + window + '"')
    def execute(self, sql, params=()):
        cur = self.raw.cursor()
        cur.execute(sql.replace('?', '%s'), tuple(params))
        return Result(cur)
    def close(self): self.raw.close()

def read_manifest(url):
    con = Connection(url)
    try:
        row = con.execute('SELECT payload::text AS payload FROM flameseek.manifest WHERE id=1').fetchone()
        if not row: raise ValueError('Snapshot manifest is missing')
        manifest = json.loads(row['payload'])
        schemas = {r['nspname'] for r in con.execute("SELECT nspname FROM pg_namespace WHERE nspname LIKE 'snapshot_%'")}
        manifest['windows'] = {name: meta for name, meta in manifest['windows'].items() if 'snapshot_' + name in schemas}
        if manifest['default_window'] not in manifest['windows'] and manifest['windows']:
            manifest['default_window'] = next(iter(manifest['windows']))
        return manifest
    finally: con.close()
