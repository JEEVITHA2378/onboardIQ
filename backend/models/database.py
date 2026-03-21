"""
OnboardIQ+ — Database Client (Supabase)
Initializes the Supabase client with graceful fallback for local development.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# In-memory storage fallback when Supabase is not configured
_memory_store = {
    "sessions": {},
    "simulation_results": {},
    "profiles": {},
    "sessions_history": {},
}

_supabase_client = None


def get_supabase():
    """Get the Supabase client, or None if not configured."""
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    url = os.getenv("SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY", os.getenv("SUPABASE_KEY", ""))

    if url and key and not url.startswith("https://your-"):
        try:
            from supabase import create_client
            _supabase_client = create_client(url, key)
            print("✅ Supabase client initialized")
            return _supabase_client
        except Exception as e:
            print(f"⚠️  Supabase init failed: {e}. Using in-memory storage.")
            return None
    else:
        print("ℹ️  Supabase not configured. Using in-memory storage.")
        return None


def save_to_store(table: str, data: dict):
    """Save data to Supabase or in-memory fallback."""
    client = get_supabase()
    if client:
        try:
            result = client.table(table).insert(data).execute()
            return result.data[0] if result.data else data
        except Exception as e:
            print(f"⚠️  Supabase insert error on {table}: {e}")
            # Fall through to memory store

    record_id = data.get("id", data.get("session_id", str(id(data))))
    if table not in _memory_store:
        _memory_store[table] = {}
    _memory_store[table][record_id] = data
    return data


def update_store(table: str, record_id: str, data: dict):
    """Update data in Supabase or in-memory fallback."""
    client = get_supabase()
    if client:
        try:
            result = client.table(table).update(data).eq("id", record_id).execute()
            return result.data[0] if result.data else data
        except Exception as e:
            print(f"⚠️  Supabase update error on {table}: {e}")

    if table in _memory_store and record_id in _memory_store[table]:
        _memory_store[table][record_id].update(data)
        return _memory_store[table][record_id]
    return data


def get_from_store(table: str, record_id: str, id_col: str = "id"):
    """Get a record from Supabase or in-memory fallback."""
    client = get_supabase()
    if client:
        try:
            result = client.table(table).select("*").eq(id_col, record_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"⚠️  Supabase select error on {table}: {e}")

    if table in _memory_store:
        return _memory_store[table].get(record_id)
    return None


def query_store(table: str, filters: dict = None, order_by: str = None, desc: bool = True):
    """Query records from Supabase or in-memory fallback."""
    client = get_supabase()
    if client:
        try:
            query = client.table(table).select("*")
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            if order_by:
                query = query.order(order_by, desc=desc)
            result = query.execute()
            return result.data if result.data else []
        except Exception as e:
            print(f"⚠️  Supabase query error on {table}: {e}")

    if table not in _memory_store:
        return []
    records = list(_memory_store[table].values())
    if filters:
        for key, value in filters.items():
            records = [r for r in records if r.get(key) == value]
    return records
