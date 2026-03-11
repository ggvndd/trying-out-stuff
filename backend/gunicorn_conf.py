import multiprocessing

# Gunicorn config file for production deployments
# Run with: gunicorn -c gunicorn_conf.py main:app

# The socket to bind
bind = "0.0.0.0:8000"

# Gunicorn relies on the operating system for load balancing when using the pre-fork worker model.
# A common formula is (2 x $num_cores) + 1. 
workers = multiprocessing.cpu_count() * 2 + 1

# The worker class for ASGI apps (Uvicorn)
worker_class = "uvicorn.workers.UvicornWorker"

# Maximum number of pending connections
backlog = 2048

# Workers silent for more than this many seconds are killed and restarted
timeout = 120

# Max requests a worker will process before restarting (helps with memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Logging formatting to play nicely with structlog
accesslog = "-"
errorlog = "-"
loglevel = "info"
