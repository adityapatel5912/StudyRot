"""
Database client wrapper for Supabase with automated fallback to in-memory store
when Supabase credentials are not supplied in the environment.
Includes:
- Full SharedFeedStore with Supabase & InMemory backends (24h TTL / 30-day persistence)
- User review states & error pattern tracking (FSRS-6 storage)
- Profile management and exam date storage
"""

import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, FRONTEND_URL
from utils.codes import generate_short_code

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

_MEM_SHARED_FEEDS: Dict[str, Dict[str, Any]] = {}
_MEM_REVIEW_STATES: Dict[str, Dict[str, Any]] = {}  # (user_id, card_id) -> state dict
_MEM_ERROR_PATTERNS: List[Dict[str, Any]] = []


# ==========================================
# SHARED FEED STORE (Feature 1)
# ==========================================

class SupabaseSharedFeedStore:
    def __init__(self, client):
        self.client = client
        self._fallback_in_memory = InMemorySharedFeedStore()

    async def create(
        self,
        subject: str,
        grade: int,
        topic: str,
        vibe: str,
        posts: List[Dict[str, Any]],
        ip: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Inserts a new shared feed with collision checking (max 5 attempts), falls back to in-memory if table missing."""
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=30)

        for _ in range(5):
            code = generate_short_code()
            # Assign id to each post
            for idx, p in enumerate(posts):
                p["id"] = f"{code}-{idx}"

            record = {
                "short_code": code,
                "subject": subject,
                "grade": grade,
                "topic": topic,
                "vibe": vibe,
                "posts": posts,
                "created_at": now.isoformat(),
                "expires_at": expires_at.isoformat(),
                "view_count": 0,
                "created_ip": ip or None,
            }
            try:
                res = self.client.table("shared_feeds").insert(record).execute()
                if res.data and len(res.data) > 0:
                    feed_url = f"{FRONTEND_URL}/s/{code}"
                    return {
                        "short_code": code,
                        "feed_url": feed_url,
                        "expires_at": expires_at.isoformat(),
                        "posts": posts,
                    }
            except Exception as e:
                err_str = str(e)
                logger.warning("Supabase shared feed insert attempt error: %s", err_str)
                # If table does not exist or relation missing, fall back to in-memory immediately
                if "PGRST205" in err_str or "relation" in err_str.lower() or "not find" in err_str.lower():
                    logger.info("Falling back to in-memory shared feed store for table public.shared_feeds")
                    return await self._fallback_in_memory.create(subject, grade, topic, vibe, posts, ip)
                continue

        # If all 5 Supabase attempts failed, fallback to in-memory store
        return await self._fallback_in_memory.create(subject, grade, topic, vibe, posts, ip)

    async def get(self, short_code: str) -> Optional[Dict[str, Any]]:
        """Fetches shared feed and increments view_count fire-and-forget."""
        now_iso = datetime.now(timezone.utc).isoformat()
        try:
            res = (
                self.client.table("shared_feeds")
                .select("*")
                .eq("short_code", short_code)
                .gt("expires_at", now_iso)
                .execute()
            )
            if res.data and len(res.data) > 0:
                feed = res.data[0]
                try:
                    new_views = (feed.get("view_count") or 0) + 1
                    self.client.table("shared_feeds").update({"view_count": new_views}).eq("short_code", short_code).execute()
                    feed["view_count"] = new_views
                except Exception as err:
                    logger.debug("Failed to increment view_count: %s", err)
                return feed
        except Exception as e:
            logger.warning("Supabase get shared feed error: %s", e)

        # Fall back to in-memory check
        return await self._fallback_in_memory.get(short_code)

    async def cleanup_expired(self) -> int:
        """Deletes rows where expires_at < NOW()."""
        deleted_count = 0
        now_iso = datetime.now(timezone.utc).isoformat()
        try:
            res = self.client.table("shared_feeds").delete().lt("expires_at", now_iso).execute()
            deleted_count = len(res.data) if res.data else 0
            logger.info("Supabase cleanup_expired removed %d expired feeds", deleted_count)
        except Exception as e:
            logger.warning("Supabase cleanup_expired error: %s", e)

        mem_deleted = await self._fallback_in_memory.cleanup_expired()
        return deleted_count + mem_deleted


class InMemorySharedFeedStore:
    def __init__(self):
        self._last_clean = time.time()

    async def create(
        self,
        subject: str,
        grade: int,
        topic: str,
        vibe: str,
        posts: List[Dict[str, Any]],
        ip: Optional[str] = None,
    ) -> Dict[str, Any]:
        await self._maybe_clean()
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=30)

        for _ in range(5):
            code = generate_short_code()
            if code not in _MEM_SHARED_FEEDS:
                for idx, p in enumerate(posts):
                    p["id"] = f"{code}-{idx}"
                record = {
                    "short_code": code,
                    "subject": subject,
                    "grade": grade,
                    "topic": topic,
                    "vibe": vibe,
                    "posts": posts,
                    "created_at": now.isoformat(),
                    "expires_at": expires_at.isoformat(),
                    "view_count": 0,
                    "created_ip": ip or None,
                }
                _MEM_SHARED_FEEDS[code] = record
                feed_url = f"{FRONTEND_URL}/s/{code}"
                return {
                    "short_code": code,
                    "feed_url": feed_url,
                    "expires_at": expires_at.isoformat(),
                    "posts": posts,
                }

        raise RuntimeError("CODE_GENERATION_FAILED")

    async def get(self, short_code: str) -> Optional[Dict[str, Any]]:
        await self._maybe_clean()
        record = _MEM_SHARED_FEEDS.get(short_code)
        if not record:
            return None

        exp_dt = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > exp_dt:
            _MEM_SHARED_FEEDS.pop(short_code, None)
            return None

        record["view_count"] = (record.get("view_count") or 0) + 1
        return record

    async def cleanup_expired(self) -> int:
        now = datetime.now(timezone.utc)
        to_delete = []
        for code, rec in _MEM_SHARED_FEEDS.items():
            try:
                exp_dt = datetime.fromisoformat(rec["expires_at"].replace("Z", "+00:00"))
                if now > exp_dt:
                    to_delete.append(code)
            except Exception:
                to_delete.append(code)
        for code in to_delete:
            _MEM_SHARED_FEEDS.pop(code, None)
        logger.info("InMemorySharedFeedStore removed %d expired feeds", len(to_delete))
        return len(to_delete)

    async def _maybe_clean(self):
        if time.time() - self._last_clean > 600:  # 10 minutes
            self._last_clean = time.time()
            await self.cleanup_expired()


# Pick SharedFeedStore backend on startup
if _supabase_client and SUPABASE_SERVICE_ROLE_KEY:
    shared_feed_store = SupabaseSharedFeedStore(_supabase_client)
    logger.info("SharedFeedStore: Active backend -> SupabaseSharedFeedStore")
else:
    shared_feed_store = InMemorySharedFeedStore()
    logger.info("SharedFeedStore: Active backend -> InMemorySharedFeedStore")


# ==========================================
# DATABASE SERVICE
# ==========================================

class DatabaseService:
    @staticmethod
    def get_client():
        return _supabase_client

    @staticmethod
    async def upsert_profile(user_id: str, email: Optional[str] = None, exam_date: Optional[str] = None) -> Dict[str, Any]:
        now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        record = {"user_id": user_id, "email": email or "", "created_at": now}
        if exam_date:
            record["exam_date"] = exam_date
        if _supabase_client:
            try:
                res = _supabase_client.table("profiles").upsert(record).execute()
                return res.data[0] if res.data else record
            except Exception as e:
                logger.warning("Supabase upsert_profile error: %s", e)
        if user_id in _MEM_PROFILES:
            _MEM_PROFILES[user_id].update(record)
        else:
            _MEM_PROFILES[user_id] = record
        return _MEM_PROFILES[user_id]

    @staticmethod
    async def set_user_exam_date(user_id: str, exam_date: str) -> bool:
        if _supabase_client:
            try:
                _supabase_client.table("profiles").update({"exam_date": exam_date}).eq("user_id", user_id).execute()
                return True
            except Exception as e:
                logger.warning("Supabase set_user_exam_date error: %s", e)
        prof = _MEM_PROFILES.setdefault(user_id, {"user_id": user_id})
        prof["exam_date"] = exam_date
        return True

    @staticmethod
    async def get_user_exam_date(user_id: str) -> Optional[str]:
        if _supabase_client:
            try:
                res = _supabase_client.table("profiles").select("exam_date").eq("user_id", user_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0].get("exam_date")
            except Exception as e:
                logger.warning("Supabase get_user_exam_date error: %s", e)
        return _MEM_PROFILES.get(user_id, {}).get("exam_date")

    @staticmethod
    async def save_user_keys(user_id: str, encrypted_groq: str, encrypted_tavily: str) -> bool:
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
        if _supabase_client:
            try:
                res = _supabase_client.table("comments").select("*").eq("post_id", post_id).order("created_at", desc=False).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning("Supabase get_comments error: %s", e)
        return _MEM_COMMENTS.get(post_id, [])

    # Review States (Feature 2)
    @staticmethod
    async def upsert_review_state(
        user_id: str,
        card_id: str,
        subject: str,
        grade: int,
        topic: str,
        stability: float,
        difficulty: float,
        last_reviewed: str,
        next_review: str,
        review_count: int,
    ) -> Dict[str, Any]:
        record = {
            "user_id": user_id,
            "card_id": card_id,
            "subject": subject,
            "grade": grade,
            "topic": topic,
            "stability": stability,
            "difficulty": difficulty,
            "last_reviewed": last_reviewed,
            "next_review": next_review,
            "review_count": review_count,
        }
        if _supabase_client:
            try:
                res = _supabase_client.table("user_review_states").upsert(record, on_conflict="user_id, card_id").execute()
                return res.data[0] if res.data else record
            except Exception as e:
                logger.warning("Supabase upsert_review_state error: %s", e)

        key = f"{user_id}:{card_id}"
        _MEM_REVIEW_STATES[key] = record
        return record

    @staticmethod
    async def get_user_review_states(user_id: str) -> List[Dict[str, Any]]:
        if _supabase_client:
            try:
                res = _supabase_client.table("user_review_states").select("*").eq("user_id", user_id).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning("Supabase get_user_review_states error: %s", e)
        return [v for k, v in _MEM_REVIEW_STATES.items() if k.startswith(f"{user_id}:")]

    # Error Patterns (Feature 2)
    @staticmethod
    async def record_error_pattern(user_id: str, card_id: str, error_type: str) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        record = {
            "user_id": user_id,
            "card_id": card_id,
            "error_type": error_type,
            "created_at": now_iso,
        }
        if _supabase_client:
            try:
                res = _supabase_client.table("user_error_patterns").insert(record).execute()
                return res.data[0] if res.data else record
            except Exception as e:
                logger.warning("Supabase record_error_pattern error: %s", e)

        _MEM_ERROR_PATTERNS.append(record)
        return record

    @staticmethod
    async def get_user_error_patterns(user_id: str) -> List[Dict[str, Any]]:
        if _supabase_client:
            try:
                res = _supabase_client.table("user_error_patterns").select("*").eq("user_id", user_id).order("created_at", desc=False).execute()
                if res.data:
                    return res.data
            except Exception as e:
                logger.warning("Supabase get_user_error_patterns error: %s", e)
        return [r for r in _MEM_ERROR_PATTERNS if r.get("user_id") == user_id]


db = DatabaseService()
