"""
Memory Integration for Ron AI API
Middleware to add memory capabilities to chat endpoints
"""

from backend.ron_memory import RonMemory
from backend.database import RonAIDatabase
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class MemoryIntegration:
    def __init__(self, db: RonAIDatabase):
        self.db = db
        self.ron_memory = RonMemory(db) if db else None
        self.enabled = db is not None
    
    async def enhance_chat_request(self, user_id: str, message: str) -> tuple[str, str]:
        """
        Enhance a chat request with memory context
        Returns: (enhanced_prompt, session_id)
        """
        if not self.enabled:
            return message, str(uuid.uuid4())
        
        try:
            # Generate session ID
            session_id = f"{user_id}_{int(datetime.utcnow().timestamp())}"
            
            # Build memory context
            memory_context = await self.ron_memory.build_context_prompt(user_id, message)
            
            # Enhance the prompt with memory
            enhanced_prompt = f"{memory_context}User Message: {message}"
            
            logger.info(f"Enhanced chat request for user {user_id} with memory context")
            return enhanced_prompt, session_id
            
        except Exception as e:
            logger.error(f"Error enhancing chat request: {e}")
            return message, str(uuid.uuid4())
    
    async def remember_conversation(self, user_id: str, session_id: str, 
                                  user_message: str, ron_response: str, 
                                  context: dict = None) -> bool:
        """Remember a conversation exchange"""
        if not self.enabled:
            return False
        
        try:
            success = await self.ron_memory.remember_conversation(
                user_id=user_id,
                session_id=session_id,
                user_message=user_message,
                ron_response=ron_response,
                context=context
            )
            
            if success:
                logger.info(f"Remembered conversation for user {user_id}")
            else:
                logger.warning(f"Failed to remember conversation for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error remembering conversation: {e}")
            return False
    
    async def get_user_summary(self, user_id: str) -> dict:
        """Get a summary of what Ron knows about the user"""
        if not self.enabled:
            return {}
        
        try:
            return await self.ron_memory.get_user_context_summary(user_id)
        except Exception as e:
            logger.error(f"Error getting user summary: {e}")
            return {}
    
    async def get_conversation_history(self, user_id: str, limit: int = 10) -> list:
        """Get recent conversation history for a user"""
        if not self.enabled:
            return []
        
        try:
            sessions = await self.db.get_recent_sessions(user_id, limit)
            history = []
            
            for session_id in sessions:
                messages = await self.db.get_chat_history(session_id, limit=20)
                history.extend(messages)
            
            # Sort by timestamp and return most recent
            history.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
            return history[:limit * 2]  # Return more messages since we're combining sessions
            
        except Exception as e:
            logger.error(f"Error getting conversation history: {e}")
            return []

# Helper function to create memory integration instance
def create_memory_integration(db: RonAIDatabase = None) -> MemoryIntegration:
    """Create a memory integration instance"""
    return MemoryIntegration(db)
