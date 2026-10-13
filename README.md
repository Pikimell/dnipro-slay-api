# Dnipro Slay API

> Backend for a city events app: scheduled scraping of ticket sites, AI-assisted normalization, search, and saved events for mobile clients.

![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-FF9900?logo=awslambda&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white)

## Overview

Dnipro Slay collects concerts, theatre shows, stand-ups, quizzes, and other events happening in Dnipro into a single catalog. The API serves an iOS client and runs entirely on AWS Lambda.

- A **scheduled Lambda** (every 6 hours) scrapes ticket websites and stores new events.
- Raw HTML is converted into a typed `Event` (title, date, venue, prices, coordinates, category) with **OpenAI `gpt-4o-mini`**, so new sources can be added without writing a custom parser for each layout.
- Clients search, filter, and save events; popularity metrics are tracked per event.

## Features

- **Auth:** registration, login, refresh-token sessions, logout, and password reset by email code. Tokens are returned in JSON for mobile clients (`Authorization: Bearer <token>`).
- **Events:** list with pagination, full-text search, upcoming and popular feeds, event coordinates, and admin CRUD.
- **Saved events:** save, toggle, and remove events per user.
- **Ingestion pipeline:** scheduled scraper → AI normalization → deduplication by title → MongoDB.
- **API docs:** Swagger UI at `/docs`.

## Architecture

```
src/
├── handlers/      # Lambda entry points (scheduled parser)
├── parsers/       # site-specific scrapers
├── services/      # business logic: events, auth, users, OpenAI normalization
├── controllers/   # HTTP layer
├── routes/        # /auth, /events, /saved-events
├── middlewares/   # auth, error handler, request logger
├── database/      # Mongoose models and connection
└── docs/          # Swagger
```

Two Lambda functions are defined in [`serverless.yml`](serverless.yml):

| Function | Trigger | Purpose |
| :-- | :-- | :-- |
| `api` | HTTP API (`*`) | Express app via `serverless-http` |
| `parse` | `cron(0 0,6,12,18 * * ? *)` | Scrape sources and import events |

## Getting started

Requirements: Node.js 22, MongoDB, an OpenAI API key, and AWS credentials for deployment.

```bash
cp .env.example .env   # fill in MongoDB and OpenAI settings
npm install
npm run dev            # http://localhost:3000, Swagger at /docs
```

| Variable | Description |
| :-- | :-- |
| `MONGODB_USER`, `MONGODB_PASSWORD`, `MONGODB_URL`, `MONGODB_DB` | MongoDB Atlas connection |
| `TOKEN` | OpenAI API key used for event normalization |

## Scripts

| Command | Description |
| :-- | :-- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Build and run the compiled server |
| `npm run deploy` | Build and deploy both Lambdas with Serverless Framework |

## API reference

The full list of endpoints and request/response shapes is in [API_ENDPOINTS.md](API_ENDPOINTS.md) (Ukrainian).

## Author

**Volodymyr Pashchenko**, Full-stack Developer · [GitHub](https://github.com/Pikimell) · [LinkedIn](https://www.linkedin.com/in/pashchenko-v-r)
