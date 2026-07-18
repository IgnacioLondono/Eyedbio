# Eyed.bio

Plataforma link-in-bio (Next.js + PostgreSQL + Docker).

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run dev:db    # PostgreSQL en Docker
npm run db:setup  # migraciones + seed
npm run dev       # http://localhost:9090
```

## Estructura del repositorio

```
├── config/env/          # Ejemplos de variables (Portainer, admin)
├── docker/
│   ├── compose/         # docker-compose.yml, .dev.yml, .ghcr.yml
│   ├── nginx/           # Proxy reverso
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── healthcheck.js
├── docs/                # AGENTS.md (reglas para IA)
├── prisma/              # Schema y migraciones
├── public/              # Assets estáticos
├── scripts/             # Utilidades (hooks, reorganización)
└── src/
    ├── app/             # Rutas Next.js + API
    ├── components/      # UI por dominio (auth, dashboard, profile…)
    ├── hooks/
    ├── lib/             # Lógica (auth, profile, media, config…)
    └── types/
```

## Docker (producción)

```bash
docker compose -f docker/compose/docker-compose.yml up -d --build
```

Variables de entorno: ver `.env.example` y `config/env/portainer.env.example`.

Imagen GHCR (sin compilar en servidor):

```bash
docker compose -f docker/compose/docker-compose.ghcr.yml up -d
```

### Cloudflare Tunnel (opcional)

Si Cloudflare da **502** porque `cloudflared` no alcanza la IP LAN del host, levanta el conector **en la misma red** que nginx:

```bash
# En el .env / Portainer:
# COMPOSE_PROFILES=tunnel
# CLOUDFLARE_TUNNEL_TOKEN=eyJ...

docker compose -f docker/compose/docker-compose.ghcr.yml --profile tunnel up -d
```

En Zero Trust → Public Hostname de `eyedbio` → Service: `http://nginx:9090` (no `192.168.x.x`).
