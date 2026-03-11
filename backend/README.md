# High-Performance FastAPI Boilerplate

An enterprise-ready, fully optimized FastAPI template built for maximum throughput and minimum latency.

This template goes beyond a basic `FastAPI` application by implementing advanced architectural patterns. It features `uvloop`, `ORJSONResponse`, Motor connection pooling, Redis caching, explicit Background Tasks, `structlog` for async logging, and `GZipMiddleware` out-of-the-box.

---

## 📑 Table of Contents
- [Features \& Optimizations](#-features--optimizations)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Architecture](#-architecture)
- [Running in Production](#-running-in-production)

---

## ⚡ Features & Optimizations

This boilerplate implements patterns designed for extreme maximum throughput, minimum latency, and production safety.

### 1. Extreme Speed (`uvloop` & `orjson`)
* **`uvloop`**: The standard Python `asyncio` event loop is replaced entirely with `uvloop` at the start of `main.py`. `uvloop` is written in Cython and built on top of `libuv` (the same engine powering Node.js). This makes asynchronous I/O operations in Python 2-4x faster, allowing FastAPI to compete with Go and Node.js on raw throughput.
* **`ORJSONResponse`**: FastAPI uses the standard library `json` module by default. This template globally configures the entire application to use `orjson` (`default_response_class=ORJSONResponse`). `orjson` is the fastest Python JSON library available natively implemented in Rust, significantly speeding up payload serialization and reducing memory allocation overhead per request.

### 2. Network Throughput & Connection Pooling
* **MongoDB (`Motor`)**: Database connections in Python often suffer from TCP handshake overhead if not pooled properly. We natively configure `AsyncIOMotorClient` with strict connection pooling (`minPoolSize=20` and `maxPoolSize=200`). Keeping idle connections continuously open to the database prevents the application from spending precious milliseconds re-authenticating for every new DB query.
* **Redis (`Valkey/Redis`)**: Caching operations use `redis.ConnectionPool` to ensure safe, concurrent connection reuse.

### 3. Payload Compression (`GZipMiddleware`)
Modern UIs often fetch large arrays of data. This template relies on global middleware compression. Any payload over 1,000 bytes is automatically intercepted and GZipped before touching the network.
* **Benefit**: This drastically reduces the bandwidth footprint of your APIs, saving on egress costs and greatly accelerating perceived load times for users on slower connections.

### 4. Asynchronous Structured Logging (`structlog`)
A hidden bottleneck in many high-traffic Python applications is logging. The standard `logging` module writes synchronously. If your app writes thousands of logs a second to `stdout` or a file, it will physically block the async event loop, causing requests to queue up.
* **The Solution**: `structlog` emits hyper-fast, non-blocking JSON structured logs. Furthermore, the boilerplate automatically binds contextual data—like an `X-Request-ID` and client IP—to the logger. Every subsequent log message within that request's lifecycle automatically includes this ID, making tracing in centralized logging systems trivial.

### 5. Endpoint Response Caching (`fastapi-cache2`)
Some heavy, data-intensive endpoints don't change often. 
* **Usage**: By adding `@cache(expire=60)` to an endpoint, the entire FastAPI routing logic, database queries, and serialization are bypassed. The raw HTTP response is fetched directly from Redis, effectively making that endpoint act as a static edge request.

### 6. Explicit Background Tasks
We heavily emphasize decoupling long-running, non-blocking operations from the critical HTTP Request -> Response path.
* **Usage**: Tasks like sending verification emails, pushing analytics to Kafka, or generating PDFs are offloaded using `fastapi.BackgroundTasks`. The client receives a `200 OK` instantly while the heavy lifting finishes quietly in the background.

---

## 🚀 Getting Started

### Prerequisites
* **Python** 3.10+
* **MongoDB** instance (local or Atlas)
* **Redis** server instance (local or cloud)

### Installation

1. **Navigate to the project directory.**
2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your connection strings.

### Running Locally

Use Uvicorn with auto-reload for local development:
```bash
uvicorn main:app --reload
```
The Swagger UI will be automatically generated and available at: `http://127.0.0.1:8000/api/v1/docs`

---

## 🏗️ Architecture

The folder structure is designed for clean separation of concerns:

- `main.py`: The entrypoint. Binds middlewares, defines lifespan context (startup/shutdown parallel tasks), and registers routers.
- `app/core/`: Application-level singletons safely managed. Config parsing via Pydantic, MongoDB/Redis connection managers, Rate limiters, and a global HTTPX client.
- `app/routers/`: FastAPI endpoint definitions. Depends fully on dependency injection (`Depends()`) to fetch singletons and services.
- `app/services/`: Pure business logic and database transaction logic. Decoupled from transport/HTTP formatting.
- `app/models/`: Pydantic V2 definitions for input validation and specific output formatting schemas.

---

## 🛡️ Running in Production

> **Warning**
> Do **NOT** run with `uvicorn main:app --reload` in production.

To utilize all CPU cores on a production server, use **Gunicorn** configured with the `UvicornWorker` class. A configuration file (`gunicorn_conf.py`) is already provided.

```bash
gunicorn -c gunicorn_conf.py main:app
```

This will automatically calculate the optimal number of worker processes `(2 * CPU cores + 1)` and maintain process health for high availability.

### Using Docker (Highly Recommended)

A production-ready, multi-stage `Dockerfile` is included. It securely runs the application as a non-root user and executes `gunicorn` to automatically scale workers across your container's allocated CPU limits.

1. **Build the image**:
   ```bash
   docker build -t orionex-fastapi:latest .
   ```
2. **Run the container**:
   ```bash
   docker run -d -p 8000:8000 --env-file .env orionex-fastapi:latest
   ```
