"""
API Endpoints for Ron's Memory System
Add these to your main API file
"""

from fastapi import HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List, Any

# Pydantic models for memory endpoints
class MemoryQuery(BaseModel):
    user_id: str
    query: str
    limit: Optional[int] = 5

class ConversationMemory(BaseModel):
    user_id: str
    session_id: str
    user_message: str
    ron_response: str
    context: Optional[Dict] = None

class UserSummaryRequest(BaseModel):
    user_id: str

# Memory endpoint functions (add these to your main API)
async def get_user_memory_summary(request: UserSummaryRequest):
    """Get what Ron remembers about a user"""
    if not MEMORY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Memory system not available")
    
    try:
        summary = await memory_integration.get_user_summary(request.user_id)
        return {
            "success": True,
            "user_id": request.user_id,
            "memory_summary": summary
        }
    except Exception as e:
        logger.error(f"Error getting user memory summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def recall_memories(request: MemoryQuery):
    """Recall relevant memories for a query"""
    if not MEMORY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Memory system not available")
    
    try:
        memories = await memory_integration.ron_memory.recall_relevant_memories(
            request.user_id, request.query, request.limit
        )
        return {
            "success": True,
            "user_id": request.user_id,
            "query": request.query,
            "relevant_memories": memories
        }
    except Exception as e:
        logger.error(f"Error recalling memories: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def save_conversation_memory(request: ConversationMemory):
    """Save a conversation to Ron's memory"""
    if not MEMORY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Memory system not available")
    
    try:
        success = await memory_integration.remember_conversation(
            request.user_id,
            request.session_id,
            request.user_message,
            request.ron_response,
            request.context
        )
        return {
            "success": success,
            "message": "Conversation saved to memory" if success else "Failed to save conversation"
        }
    except Exception as e:
        logger.error(f"Error saving conversation memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_conversation_history(user_id: str, limit: int = 10):
    """Get conversation history for a user"""
    if not MEMORY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Memory system not available")
    
    try:
        history = await memory_integration.get_conversation_history(user_id, limit)
        return {
            "success": True,
            "user_id": user_id,
            "conversation_history": history
        }
    except Exception as e:
        logger.error(f"Error getting conversation history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced chat function that uses memory
async def enhanced_chat_with_memory(user_id: str, message: str, claude_completions):
    """Enhanced chat function that incorporates Ron's memory"""
    if not MEMORY_AVAILABLE:
        # Fallback to regular chat without memory
        return await regular_chat_function(message, claude_completions)
    
    try:
        # Enhance the message with memory context
        enhanced_prompt, session_id = await memory_integration.enhance_chat_request(user_id, message)
        
        # Get Claude's response (you'll need to adapt this to your existing Claude integration)
        response = await claude_completions.complete(enhanced_prompt)
        
        # Remember this conversation
        await memory_integration.remember_conversation(
            user_id=user_id,
            session_id=session_id,
            user_message=message,
            ron_response=response,
            context={"enhanced": True, "timestamp": time.time()}
        )
        
        return {
            "success": True,
            "response": response,
            "session_id": session_id,
            "memory_enhanced": True
        }
        
    except Exception as e:
        logger.error(f"Error in enhanced chat with memory: {e}")
        # Fallback to regular chat
        return await regular_chat_function(message, claude_completions)

# Add these route definitions to your main API file:
"""
# Memory endpoints - add these to your main API
@app.post("/memory/user-summary")
async def api_get_user_memory_summary(request: UserSummaryRequest):
    return await get_user_memory_summary(request)

@app.post("/memory/recall")
async def api_recall_memories(request: MemoryQuery):
    return await recall_memories(request)

@app.post("/memory/save-conversation")
async def api_save_conversation_memory(request: ConversationMemory):
    return await save_conversation_memory(request)

@app.get("/memory/history/{user_id}")
async def api_get_conversation_history(user_id: str, limit: int = 10):
    return await get_conversation_history(user_id, limit)

@app.post("/chat/enhanced")
async def api_enhanced_chat_with_memory(request: ChatRequest):
    # Adapt this to your existing chat request model
    return await enhanced_chat_with_memory(request.user_id, request.message, claude_completions)
"""
