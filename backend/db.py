"""
Database client wrapper for Supabase with automated fallback to in-memory store
when Supabase credentials are not supplied in the environment.
"""

import time
import logging
from typing import Optional, List, Dict, Any
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

logger = logging.getLogger("studyrot.db")

_supabase_client = None

if SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY):
    try:
        from supabase import create_client, Client
        key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
        _supabase_client = create_client(SUPABASE_URL, key)
        logger.info("Supabase client initialized successfully against %s", SUPABASE_URL)
    except Exception as e:
        logger.warning("Failed to initialize Supabase client: %s; falling back to in-memory store", e)
        _supabase_client = None
else:
    logger.info("Supabase credentials not configured; using graceful in-memory storage fallback")

# In-memory storage structures for local/development mode
_MEM_PROFILES: Dict[str, Dict[str, Any]] = {}
_MEM_KEYS: Dict[str, Dict[str, Any]] = {}
_MEM_FEEDS: Dict[str, List[Dict[str, Any]]] = {}
_MEM_LIKES: Dict[str, set] = {}  # post_id -> set of user_ids
_MEM_COMMENTS: Dict[str, List[Dict[str, Any]]] = {}  # post_id -> list of comments
_MEM_SAVES: Dict[str, set] = {}  # user_id -> set of post_ids


class DatabaseService:
    @staticmethod
    def get_client():
        return _supabase_client

    @staticmethod
    async def upsert_profile(user_id: str, email: Optional[str] = None) -> Dict[str, Any]:
        """Upserts a user profile."""
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        record = {"user_id": user_id, "email": email or "", "created_at": now}
        if _supabase_client:
            try:
                res = _supabase_client.table("profiles").upsert(record).execute()
                return res.data[0] if res.data else record
            except Exception as e:
                logger.warning("Supabase upsert_profile error: %s", e)
        _MEM_PROFILES[user_id] = record
        return record

    @staticmethod
    async def save_user_keys(user_id: str, encrypted_groq: str, encrypted_tavily: str) -> bool:
        """Saves encrypted API keys for a user."""
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        record = {
            "user_id": user_id,
            "encrypted_groq": encrypted_groq,
            "encrypted_tavily": encrypted_tavily,
            "updated_at": now,
        }
        if _supabase_client:
            try:
                _supabase_client.table("user_keys").upsert(record).execute()
                return True
            except Exception as e:
                logger.warning("Supabase save_user_keys error: %s", e)
        _MEM_KEYS[user_id] = record
        return True

    @staticmethod
    async def get_user_keys(user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves encrypted API keys for a user."""
        if _supabase_client:
            try:
                res = _supabase_client.table("user_keys").select("*").eq("user_id", user_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                logger.warning("Supabase get_user_keys error: %s", e)
        return _MEM_KEYS.get(user_id)

    @staticmethod
    async def save_feed(user_id: str, feed_data: Dict[str, Any], title: str, subject: str, grade: int, vibe: str = "Instagram") -> str:
        """Saves a generated feed."""
        feed_id = f"feed_{int(time.time() * 1000)}"
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        record = {
            "id": feed_id,
            "user_id": user_id,
            "title": title,
            "subject": subject,
            "grade": grade,
            "vibe": vibe,
            "posts": feed_data.get("posts", []),
            "created_at": now,
        }
        if _supabase_client:
            try:
                _supabase_client.table("feeds").insert(record).execute()
                return feed_id
            except Exception as e:
                logger.warning("Supabase save_feed error: %s", e)
        user_list = _MEM_FEEDS.setdefault(user_id, [])
        user_list.insert(0, record)
        return feed_id

    @staticmethod
    async def get_user_feeds(user_id: str) -> List[Dict[str, Any]]:
        """Lists feeds owned by user."""
        if _supabase_client:
            try:
                res = _supabase_client.table("feeds").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning("Supabase get_user_feeds error: %s", e)
        return _MEM_FEEDS.get(user_id, [])

    @staticmethod
    async def delete_feed(user_id: str, feed_id: str) -> bool:
        """Deletes a feed owned by user."""
        if _supabase_client:
            try:
                _supabase_client.table("feeds").delete().eq("id", feed_id).eq("user_id", user_id).execute()
                return True
            except Exception as e:
                logger.warning("Supabase delete_feed error: %s", e)
        current = _MEM_FEEDS.get(user_id, [])
        _MEM_FEEDS[user_id] = [f for f in current if f.get("id") != feed_id]
        return True

    @staticmethod
    async def toggle_like(user_id: str, post_id: str) -> Dict[str, Any]:
        """Toggles like state on a post."""
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        if _supabase_client:
            try:
                existing = _supabase_client.table("likes").select("*").eq("user_id", user_id).eq("post_id", post_id).execute()
                if existing.data and len(existing.data) > 0:
                    _supabase_client.table("likes").delete().eq("user_id", user_id).eq("post_id", post_id).execute()
                    liked = False
                else:
                    _supabase_client.table("likes").insert({"user_id": user_id, "post_id": post_id, "created_at": now}).execute()
                    liked = True
                count_res = _supabase_client.table("likes").select("id", count="exact").eq("post_id", post_id).execute()
                return {"liked": liked, "likes_count": count_res.count or (1 if liked else 0)}
            except Exception as e:
                logger.warning("Supabase toggle_like error: %s", e)
        
        post_likes = _MEM_LIKES.setdefault(post_id, set())
        if user_id in post_likes:
            post_likes.remove(user_id)
            liked = False
        else:
            post_likes.add(user_id)
            liked = True
        return {"liked": liked, "likes_count": len(post_likes)}

    @staticmethod
    async def add_comment(user_id: str, post_id: str, body: str) -> Dict[str, Any]:
        """Creates a comment on a post."""
        comment_id = f"c_{int(time.time() * 1000)}"
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        record = {
            "id": comment_id,
            "post_id": post_id,
            "user_id": user_id,
            "body": body,
            "created_at": now,
        }
        if _supabase_client:
            try:
                res = _supabase_client.table("comments").insert(record).execute()
                return res.data[0] if res.data else record
            except Exception as e:
                logger.warning("Supabase add_comment error: %s", e)
        
        comments_list = _MEM_COMMENTS.setdefault(post_id, [])
        comments_list.append(record)
        return record

    @staticmethod
    async def get_comments(post_id: str) -> List[Dict[str, Any]]:
        """Fetches comments for a post."""
        if _supabase_client:
            try:
                res = _supabase_client.table("comments").select("*").eq("post_id", post_id).order("created_at", desc=False).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning("Supabase get_comments error: %s", e)
        return _MEM_COMMENTS.get(post_id, [])


db = DatabaseService()
