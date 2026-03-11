import httpx
import structlog

logger = structlog.get_logger()

class HTTPClientWrapper:
    """
    Global AsyncClient to pool HTTP connections.
    Avoids opening/closing sockets linearly during third-party requests.
    """
    client: httpx.AsyncClient = None

    def start(self):
        # Configure reasonable timeouts for production usage
        self.client = httpx.AsyncClient(timeout=60.0)
        logger.info("Global HTTPx Client initialized")

    async def stop(self):
        if self.client:
            await self.client.aclose()
            logger.info("Global HTTPx Client closed")

http_client = HTTPClientWrapper()
