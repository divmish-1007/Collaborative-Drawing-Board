# Collaborative Drawing Board

A real-time collaborative drawing platform built using Next.js, TypeScript, WebSockets, Redis, BullMQ, Prisma, and Turborepo.

This project explores the architectural challenges behind collaborative systems such as realtime synchronization, operation replay, asynchronous event processing, room-based communication, and shared canvas rendering.

Unlike traditional CRUD applications, the system is designed around an operation-driven synchronization model where user interactions are converted into operations, synchronized across connected users, persisted asynchronously, and replayed to reconstruct collaborative state.

---

# Features

## Real-Time Collaboration

- Multiple users can join shared rooms and draw simultaneously.
- Persistent WebSocket connections synchronize canvas updates in real time.
- Room-scoped broadcasting minimizes unnecessary event propagation.
- Connected users receive synchronized drawing operations instantly.

## Collaborative Drawing Engine

- Operation-driven synchronization architecture.
- Centralized shape state management.
- Deterministic canvas redraw pipeline.
- Optimistic UI updates.
- Real-time preview rendering during drawing interactions.

## Drawing Tools

- Rectangle drawing (`R` key)
- Circle drawing (`C` key)
- Undo support (`Ctrl + Z`)
- Toolbar-driven shape selection system (in progress)

## Authentication & Room Management

- JWT-based authentication.
- Signup and signin flows.
- Protected collaborative sessions.
- Dynamic room creation and joining.
- Slug-based room discovery.

## Asynchronous Persistence Pipeline

- Redis-backed BullMQ queues.
- Dedicated background workers.
- Decoupled realtime communication and persistence.
- Non-blocking database writes for improved responsiveness.

## Historical Room Hydration

- Persisted drawing operations are replayed to reconstruct room state.
- Newly joined users receive historical collaborative state.
- REST APIs hydrate collaborative sessions from persisted operations.

## Monorepo Architecture

The project is structured using Turborepo with independently organized services:

- Frontend application
- HTTP backend
- WebSocket backend
- Worker services
- Shared packages
- Shared validation schemas
- Shared Prisma client

---

# Architecture Overview

## High-Level System Flow

```txt
Client
  ↓
Next.js Frontend
  ↓
WebSocket Server
  ↓
Room-Based Event Broadcasting
  ↓
Redis + BullMQ Queue
  ↓
Background Worker
  ↓
Prisma ORM
  ↓
Database Persistence
```

---

# Frontend Architecture

## Routing Structure

```txt
app/
  signin/
  signup/
  dashboard/
  canvas/[roomId]/
```

## Collaborative Session Flow

```txt
Landing Page
  ↓
Authentication
  ↓
Dashboard
  ↓
Create / Join Room
  ↓
canvas/[roomId]
  ↓
WebSocket Connection
  ↓
Realtime Collaboration
```

---

# Canvas Rendering Architecture

The drawing engine is intentionally separated from React UI components.

```txt
Canvas Page
  ↓
RoomCanvas
  ↓
Canvas Component
  ↓
initDraw() Engine
```

The `initDraw()` engine handles:

- rendering,
- mouse interactions,
- keyboard shortcuts,
- socket synchronization,
- operation replay,
- undo logic,
- and state hydration.

This separation keeps React components lightweight while isolating realtime rendering logic inside a dedicated engine layer.

---

# Operation-Based Synchronization Model

The entire system follows an operation-driven architecture.

Instead of synchronizing raw canvas pixels, the system synchronizes operations.

## Operation Flow

```txt
User Interaction
  ↓
Create Operation (ADD / DELETE)
  ↓
applyOperation()
  ↓
Update Shared Shape State
  ↓
Redraw Canvas
  ↓
Broadcast Through WebSocket
  ↓
Persist Asynchronously
```

## Why Operations Instead of Pixels?

This architecture enables:

- deterministic rendering,
- collaborative consistency,
- undo functionality,
- operation replay,
- state hydration,
- and simpler synchronization logic.

---

# Realtime Collaboration Flow

## WebSocket Lifecycle

1. User joins collaborative room.
2. Frontend establishes authenticated WebSocket connection.
3. Client emits `join_room` event.
4. WebSocket backend subscribes user to room.
5. Drawing operations are broadcast only to users inside the same room.

## Self-Event Filtering

Each client generates a unique `clientId`.

Self-originated operations are ignored on receipt to prevent:

- duplicate rendering,
- flickering,
- and redundant redraws.

---

# Asynchronous Persistence Architecture

One of the primary architectural goals of this project was decoupling realtime communication from database persistence.

## Persistence Flow

```txt
Client Operation
  ↓
WebSocket Broadcast
  ↓
BullMQ Queue
  ↓
Background Worker
  ↓
Prisma Persistence
```

## Why Redis + BullMQ?

Persisting operations directly inside WebSocket handlers would block realtime synchronization.

Using BullMQ:

- prevents database writes from slowing socket throughput,
- improves responsiveness,
- isolates persistence concerns,
- and enables scalable asynchronous processing.

---

# Worker Architecture

Background workers consume queued persistence jobs asynchronously.

Worker responsibilities:

- persist drawing operations,
- process queue jobs,
- isolate database operations,
- and handle worker failures independently from realtime communication.

The current architecture logically separates workers from the WebSocket server while running both processes concurrently during development.

---

# State Hydration & Replay

Collaborative room state is reconstructed through operation replay.

## Hydration Flow

```txt
Fetch Persisted Operations
  ↓
Replay Operations
  ↓
Rebuild Shape State
  ↓
Redraw Canvas
```

This replay-based architecture ensures newly joined users receive existing collaborative state.

---

# Undo System

Undo functionality is operation-based.

Instead of storing expensive canvas snapshots, the system stores inverse operations.

## Undo Flow

```txt
ADD Shape
  ↓
Store Inverse DELETE Operation
  ↓
Ctrl + Z
  ↓
Apply DELETE
  ↓
Broadcast Synchronization
```

This keeps collaborative state deterministic across all connected clients.

---

# Tech Stack

## Frontend

- Next.js
- TypeScript
- HTML Canvas
- Tailwind CSS

## Backend

- Node.js
- Express.js
- WebSockets (`ws`)
- Prisma ORM

## Realtime & Queues

- Redis
- BullMQ

## Authentication & Validation

- JWT Authentication
- bcrypt
- Zod

## Tooling

- Turborepo
- pnpm Workspaces
- Git
- Docker
- Concurrently

---

# Project Structure

```txt
apps/
  excalidraw-frontend/
  http-backend/
  ws-backend/

packages/
  common/
  backend-common/
```

---

# Engineering Challenges Solved

## Realtime Synchronization

Implemented room-scoped collaborative synchronization using persistent WebSocket connections.

## Operation-Driven Rendering

Built a centralized operation pipeline to maintain deterministic collaborative state.

## Async Event Processing

Separated realtime communication from database persistence using Redis queues and worker services.

## State Hydration

Implemented replay-based collaborative state reconstruction for late-joining users.

## Lifecycle Management

Implemented cleanup for:

- WebSocket listeners,
- keyboard events,
- mouse events,
- and canvas lifecycle handlers.

---

# Current Limitations

The project intentionally prioritizes synchronization architecture and realtime collaboration design over production completeness.

Current limitations include:

- in-memory room membership management,
- full canvas redraw on every update,
- replay-based hydration without snapshots,
- localStorage token persistence,
- and single-instance WebSocket coordination.

---

# Future Improvements

Planned architectural improvements:

- Redis Pub/Sub for horizontal WebSocket scaling
- Snapshot-based room hydration
- Partial canvas redraw optimization
- Dirty rectangle rendering
- Presence indicators
- Cursor synchronization
- Shape resizing and selection
- HTTP-only cookie authentication
- Socket reconnection handling
- Retry/backoff queue strategies
- Distributed room coordination
- Operational Transformation (OT) / CRDT exploration
- Monitoring and observability
- Kubernetes deployment

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/divmish-1007/Collaborative-Drawing-Board.git
cd draw-app
```

## Install Dependencies

```bash
pnpm install
```

## Start Redis

```bash
docker run -p 6379:6379 redis
```

## Start Frontend

```bash
cd apps/excalidraw-frontend
pnpm dev
```

## Start HTTP Backend

```bash
cd apps/http-backend
pnpm dev
```

## Start WebSocket Backend + Worker

The WebSocket server and worker currently run concurrently during development.

```bash
cd apps/ws-backend
pnpm dev
```

This internally runs:

```bash
concurrently "node dist/index.js" "node dist/worker/chatWorker.js"
```

---

# Why This Project Matters

This project was built to explore the architectural challenges behind realtime collaborative systems.

It demonstrates:

- realtime communication,
- operation-driven synchronization,
- asynchronous event processing,
- room-based collaboration,
- collaborative rendering pipelines,
- event replay architecture,
- and multi-service backend coordination.

Rather than focusing only on UI interactions, the project emphasizes synchronization consistency, distributed system fundamentals, and scalable architectural patterns.

---

# Author

Divakar Mishra
