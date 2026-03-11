import logging
import sys
import structlog

def setup_logging():
    """ Configure structured JSON logging for production """
    
    # Configure the standard Python logging to stream to stdout fast
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=logging.INFO,
    )

    # Configure structlog pipelines
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars, # Support for X-Request-ID
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt="iso"),
            # Exception formatting
            structlog.processors.dict_tracebacks,
            # Render to fast JSON using standard JSON stringifier (or orjson)
            structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
