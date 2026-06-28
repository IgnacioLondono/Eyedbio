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
