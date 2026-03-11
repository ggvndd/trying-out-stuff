from slowapi import Limiter
from slowapi.util import get_remote_address

# Default rate limiter uses the client's IP address.
# In production with CDNs/LoadBalancers, configure this to use `X-Forwarded-For`.
limiter = Limiter(key_func=get_remote_address)
