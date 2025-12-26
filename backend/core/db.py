"""Database connection pool management."""

import asyncpg
from typing import Optional

from core.config import settings


class Database:
    """Manages database connection pool."""

    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None

    async def connect(self):
        """Create connection pool."""
        if not self.pool:
            self.pool = await asyncpg.create_pool(settings.database_url)

    async def close(self):
        """Close connection pool."""
        if self.pool:
            await self.pool.close()
            self.pool = None


# Global database instance
db = Database()
