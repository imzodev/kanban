# Kanban Board (Next.js + Prisma + SQLite)

Aplicación Kanban simple construida con Next.js 15, React 19, Tailwind CSS 4 y Prisma sobre SQLite. Usa Bun como gestor de paquetes.

## Inicio rápido

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Abre http://localhost:3000 (o el puerto que el dev server elija, p.ej. 3001).

El tablero se renderiza en `app/page.tsx`. La UI permite crear columnas, crear tareas, mover tareas entre columnas y eliminar tareas.

## Configuración de base de datos

Prisma usa SQLite por defecto. Asegúrate de tener la variable de entorno en `.env`:

```env
DATABASE_URL="file:./prisma/dev.db"
```

## Migraciones y cliente Prisma

Genera la base de datos y el cliente:

```bash
bunx prisma migrate dev --name init
bunx prisma generate
# (opcional) UI para explorar datos
bunx prisma studio
```

## Endpoints API

- Boards
  - `GET /api/boards` — lista tableros (con columnas y tareas)
  - `POST /api/boards` — crea tablero `{ name }`
  - `GET /api/boards/:id` — detalle de tablero
  - `PATCH /api/boards/:id` — actualiza `{ name }`
  - `DELETE /api/boards/:id` — elimina tablero

- Columns
  - `GET /api/columns?boardId=1` — lista columnas de un tablero
  - `POST /api/columns` — crea columna `{ boardId, name, order? }`
  - `PATCH /api/columns/:id` — actualiza `{ name?, order?, boardId? }`
  - `DELETE /api/columns/:id` — elimina columna

- Tasks
  - `GET /api/tasks?columnId=1` — lista tareas de una columna
  - `POST /api/tasks` — crea tarea `{ columnId, title, description?, order? }`
  - `PATCH /api/tasks/:id` — actualiza `{ title?, description?, order?, columnId? }`
  - `DELETE /api/tasks/:id` — elimina tarea

## Scripts útiles

```bash
# desarrollo
bun run dev

# build & producción
bun run build
bun run start

# lint
bun run lint
```

## Stack

- Next.js 15, App Router (`app/`)
- React 19
- Tailwind CSS 4
- Prisma ORM
- SQLite
- Bun

## Notas de desarrollo

- En el primer render, si no hay tableros, la app crea uno por defecto con 3 columnas (“To Do”, “In Progress”, “Done”).
- El color de acento de la UI es índigo (claro/oscuro).
- El cliente Prisma se inicializa en `lib/prisma.ts` (patrón singleton en desarrollo).

## Despliegue

Para desplegar, asegúrate de incluir el archivo SQLite o de ejecutar migraciones en el entorno destino, y configura `DATABASE_URL`. Consulta la documentación de tu plataforma de despliegue para definir variables de entorno y directorios persistentes.
