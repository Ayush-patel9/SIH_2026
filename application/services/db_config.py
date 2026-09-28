import os
import logging
from urllib.parse import urlparse, parse_qs
import psycopg2
import psycopg2.extras
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("db_config")

DATABASE_URL = os.getenv("DATABASE_URL", "")

connection_pool = None

def init_connection_pool():
    """Initialize PostgreSQL connection pool for Neon serverless database."""
    global connection_pool
    if not DATABASE_URL:
        logger.warning("DATABASE_URL not set in environment. Running in disconnected DB mode.")
        return

    try:
        # Parse connection string and normalize parameters for psycopg2
        # Neon connection strings contain sslmode=require and channel_binding
        parsed = urlparse(DATABASE_URL)
        dbname = parsed.path.lstrip('/')
        user = parsed.username
        password = parsed.password
        host = parsed.hostname
        port = parsed.port or 5432

        # Extract query parameters (like sslmode)
        query_params = parse_qs(parsed.query)
        sslmode = query_params.get('sslmode', ['require'])[0]

        connection_pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
            sslmode=sslmode
        )
        logger.info(f"✓ Neon PostgreSQL connection pool initialized successfully for {host}/{dbname}")
    except Exception as e:
        logger.error(f"✗ Failed to initialize Neon PostgreSQL connection pool: {e}")
        # Try direct connection string fallback
        try:
            # Strip channel_binding if psycopg2 libpq doesn't support it directly
            clean_url = DATABASE_URL.replace("&channel_binding=require", "").replace("channel_binding=require", "")
            connection_pool = psycopg2.pool.SimpleConnectionPool(1, 10, clean_url)
            logger.info("✓ Neon PostgreSQL connection pool initialized with clean URL fallback")
        except Exception as fallback_err:
            logger.error(f"✗ Direct fallback also failed: {fallback_err}")
            connection_pool = None

def get_connection():
    """Get a database connection from the pool with fallback to direct connection."""
    global connection_pool
    if connection_pool is None:
        init_connection_pool()

    if connection_pool:
        try:
            return connection_pool.getconn()
        except Exception as e:
            logger.warning(f"Connection pool exhausted or error: {e}. Falling back to direct connection.")

    clean_url = DATABASE_URL.replace("&channel_binding=require", "").replace("channel_binding=require", "")
    return psycopg2.connect(clean_url)

def release_connection(conn):
    """Return a connection to the pool or close it."""
    global connection_pool
    if conn is None:
        return
    try:
        if connection_pool:
            connection_pool.putconn(conn)
        else:
            conn.close()
    except Exception as e:
        logger.warning(f"Error releasing connection: {e}")
        try:
            conn.close()
        except Exception:
            pass

def get_cursor(conn, dict_cursor=True):
    """Return a dictionary cursor (default) or tuple cursor."""
    if dict_cursor:
        return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    return conn.cursor()

def close_connection_pool():
    """Close all open connections in the pool."""
    global connection_pool
    if connection_pool:
        connection_pool.closeall()
        logger.info("Neon connection pool closed.")
