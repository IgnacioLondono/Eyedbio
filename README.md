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

Si Cloudflare da **502** porque `cloudflared` no alcanza la IP LAN del host:

**Rápido:** une tu túnel existente a la red de Eyed.bio y apunta el hostname a nginx:

```bash
docker network connect eyed-bio-net cloudflare3-cloudflared-2-1
```

En Zero Trust → Public Hostname → Service: `http://eyed-bio-nginx:9090`.

**Opcional en este repo:** segundo compose `docker/compose/docker-compose.tunnel.yml` + `CLOUDFLARE_TUNNEL_TOKEN`, Service: `http://nginx:9090`.
