"""
Ron's Memory System - Persistent AI Memory using DynamoDB
Allows Ron to remember conversations, learn preferences, and maintain context
"""

import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from backend.database import RonAIDatabase
import hashlib
import re

class RonMemory:
    def __init__(self, db: RonAIDatabase):
        self.db = db
        
    async def remember_conversation(self, user_id: str, session_id: str, 
                                  user_message: str, ron_response: str, 
                                  context: Optional[Dict] = None) -> bool:
        """Store a conversation exchange in Ron's memory"""
        
        # Extract key information from the conversation
        memory_data = {
            'user_message': user_message,
            'ron_response': ron_response,
            'context': context or {},
            'extracted_info': await self._extract_key_information(user_message, ron_response),
            'sentiment': await self._analyze_sentiment(user_message),
            'topics': await self._extract_topics(user_message + " " + ron_response)
        }
        
        # Save to chat sessions table
        success1 = await self.db.save_message(session_id, 'user', user_message, 
                                            {'memory_data': memory_data})
        success2 = await self.db.save_message(session_id, 'assistant', ron_response, 
                                            {'memory_data': memory_data})
        
        # Update user's memory profile
        await self._update_user_memory_profile(user_id, memory_data)
        
        return success1 and success2
    
    async def recall_relevant_memories(self, user_id: str, current_query: str, 
                                     limit: int = 5) -> List[Dict]:
        """Retrieve relevant memories based on current query"""
        
        # Get user's memory profile
        user_profile = await self.db.get_user_profile(user_id)
        if not user_profile:
            return []
        
        # Extract topics from current query
        current_topics = await self._extract_topics(current_query)
        
        # Get recent chat history
        recent_sessions = await self.db.get_recent_sessions(user_id, limit=10)
        relevant_memories = []
        
        for session_id in recent_sessions:
            history = await self.db.get_chat_history(session_id, limit=20)
            
            for message in history:
                if message.get('metadata', {}).get('memory_data'):
                    memory = message['metadata']['memory_data']
                    
                    # Calculate relevance score
                    relevance = await self._calculate_relevance(memory, current_topics, current_query)
                    
                    if relevance > 0.3:  # Threshold for relevance
                        relevant_memories.append({
                            'memory': memory,
                            'relevance': relevance,
                            'timestamp': message.get('timestamp'),
                            'session_id': session_id
                        })
        
        # Sort by relevance and return top results
        relevant_memories.sort(key=lambda x: x['relevance'], reverse=True)
        return relevant_memories[:limit]
    
    async def get_user_context_summary(self, user_id: str) -> Dict:
        """Get a summary of what Ron knows about the user"""
        
        user_profile = await self.db.get_user_profile(user_id)
        if not user_profile:
            return {}
        
        memory_profile = user_profile.get('memory_profile', {})
        
        return {
            'preferences': memory_profile.get('preferences', {}),
            'health_info': memory_profile.get('health_info', {}),
            'communication_style': memory_profile.get('communication_style', {}),
            'frequent_topics': memory_profile.get('frequent_topics', []),
            'last_interaction': memory_profile.get('last_interaction'),
            'total_conversations': memory_profile.get('conversation_count', 0)
        }
    
    async def build_context_prompt(self, user_id: str, current_query: str) -> str:
        """Build a context prompt for Ron based on memories"""
        
        # Get relevant memories
        memories = await self.recall_relevant_memories(user_id, current_query)
        user_context = await self.get_user_context_summary(user_id)
        
        if not memories and not user_context:
            return ""
        
        context_prompt = "\n--- RON'S MEMORY CONTEXT ---\n"
        
        # Add user context summary
        if user_context:
            context_prompt += f"User Profile Summary:\n"
            if user_context.get('preferences'):
                context_prompt += f"- Preferences: {json.dumps(user_context['preferences'], indent=2)}\n"
            if user_context.get('health_info'):
                context_prompt += f"- Health Info: {json.dumps(user_context['health_info'], indent=2)}\n"
            if user_context.get('communication_style'):
                context_prompt += f"- Communication Style: {json.dumps(user_context['communication_style'], indent=2)}\n"
            if user_context.get('frequent_topics'):
                context_prompt += f"- Frequent Topics: {', '.join(user_context['frequent_topics'])}\n"
            context_prompt += f"- Total Conversations: {user_context.get('total_conversations', 0)}\n\n"
        
        # Add relevant memories
        if memories:
            context_prompt += "Relevant Previous Conversations:\n"
            for i, memory_item in enumerate(memories[:3], 1):  # Top 3 most relevant
                memory = memory_item['memory']
                context_prompt += f"{i}. Previous Exchange (Relevance: {memory_item['relevance']:.2f}):\n"
                context_prompt += f"   User: {memory['user_message'][:200]}...\n"
                context_prompt += f"   Ron: {memory['ron_response'][:200]}...\n"
                if memory.get('extracted_info'):
                    context_prompt += f"   Key Info: {json.dumps(memory['extracted_info'])}\n"
                context_prompt += "\n"
        
        context_prompt += "--- END MEMORY CONTEXT ---\n\n"
        context_prompt += "Use this context to provide personalized, contextually aware responses. "
        context_prompt += "Reference previous conversations when relevant, but don't explicitly mention 'I remember' unless natural.\n\n"
        
        return context_prompt
    
    async def _extract_key_information(self, user_message: str, ron_response: str) -> Dict:
        """Extract key information from conversation"""
        
        info = {}
        
        # Health-related keywords
        health_keywords = ['medication', 'doctor', 'appointment', 'symptom', 'pain', 'treatment', 
                          'diagnosis', 'hospital', 'clinic', 'prescription', 'allergy', 'condition']
        
        # Preference keywords
        preference_keywords = ['prefer', 'like', 'dislike', 'favorite', 'hate', 'love', 'want', 'need']
        
        combined_text = (user_message + " " + ron_response).lower()
        
        # Extract health mentions
        health_mentions = [word for word in health_keywords if word in combined_text]
        if health_mentions:
            info['health_topics'] = health_mentions
        
        # Extract preferences
        preference_mentions = [word for word in preference_keywords if word in combined_text]
        if preference_mentions:
            info['preferences_mentioned'] = preference_mentions
        
        # Extract names (simple regex)
        names = re.findall(r'\b[A-Z][a-z]+ [A-Z][a-z]+\b', user_message + " " + ron_response)
        if names:
            info['names_mentioned'] = names
        
        # Extract dates/times
        dates = re.findall(r'\b\d{1,2}/\d{1,2}/\d{4}\b|\b\d{1,2}-\d{1,2}-\d{4}\b', combined_text)
        if dates:
            info['dates_mentioned'] = dates
        
        return info
    
    async def _analyze_sentiment(self, message: str) -> str:
        """Simple sentiment analysis"""
        
        positive_words = ['good', 'great', 'excellent', 'happy', 'pleased', 'satisfied', 'love', 'like']
        negative_words = ['bad', 'terrible', 'awful', 'sad', 'angry', 'frustrated', 'hate', 'dislike']
        
        message_lower = message.lower()
        
        positive_count = sum(1 for word in positive_words if word in message_lower)
        negative_count = sum(1 for word in negative_words if word in message_lower)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    async def _extract_topics(self, text: str) -> List[str]:
        """Extract main topics from text"""
        
        # Healthcare topics
        healthcare_topics = {
            'medications': ['medication', 'medicine', 'drug', 'prescription', 'pill'],
            'appointments': ['appointment', 'visit', 'meeting', 'schedule'],
            'symptoms': ['symptom', 'pain', 'ache', 'hurt', 'feel'],
            'doctors': ['doctor', 'physician', 'specialist', 'provider'],
            'insurance': ['insurance', 'coverage', 'claim', 'copay'],
            'mental_health': ['anxiety', 'depression', 'stress', 'mental', 'therapy'],
            'nutrition': ['diet', 'food', 'nutrition', 'eating', 'weight'],
            'exercise': ['exercise', 'workout', 'fitness', 'activity', 'gym']
        }
        
        text_lower = text.lower()
        found_topics = []
        
        for topic, keywords in healthcare_topics.items():
            if any(keyword in text_lower for keyword in keywords):
                found_topics.append(topic)
        
        return found_topics
    
    async def _calculate_relevance(self, memory: Dict, current_topics: List[str], 
                                 current_query: str) -> float:
        """Calculate how relevant a memory is to the current query"""
        
        relevance_score = 0.0
        
        # Topic overlap
        memory_topics = memory.get('topics', [])
        topic_overlap = len(set(current_topics) & set(memory_topics))
        relevance_score += topic_overlap * 0.3
        
        # Keyword similarity (simple)
        memory_text = (memory.get('user_message', '') + " " + memory.get('ron_response', '')).lower()
        current_words = set(current_query.lower().split())
        memory_words = set(memory_text.split())
        
        word_overlap = len(current_words & memory_words)
        relevance_score += min(word_overlap * 0.1, 0.5)  # Cap at 0.5
        
        # Recency bonus (more recent = more relevant)
        # This would need timestamp comparison - simplified for now
        relevance_score += 0.1
        
        return min(relevance_score, 1.0)  # Cap at 1.0
    
    async def _update_user_memory_profile(self, user_id: str, memory_data: Dict):
        """Update the user's memory profile with new information"""
        
        user_profile = await self.db.get_user_profile(user_id)
        
        if not user_profile:
            # Create new profile
            memory_profile = {
                'conversation_count': 1,
                'last_interaction': datetime.utcnow().isoformat(),
                'preferences': {},
                'health_info': {},
                'communication_style': {},
                'frequent_topics': memory_data.get('topics', [])
            }
            await self.db.create_user_profile(user_id, {'memory_profile': memory_profile})
        else:
            # Update existing profile
            memory_profile = user_profile.get('memory_profile', {})
            
            # Update conversation count
            memory_profile['conversation_count'] = memory_profile.get('conversation_count', 0) + 1
            memory_profile['last_interaction'] = datetime.utcnow().isoformat()
            
            # Update frequent topics
            current_topics = memory_profile.get('frequent_topics', [])
            new_topics = memory_data.get('topics', [])
            
            # Simple frequency tracking
            for topic in new_topics:
                if topic not in current_topics:
                    current_topics.append(topic)
            
            memory_profile['frequent_topics'] = current_topics[:10]  # Keep top 10
            
            # Update extracted info
            extracted_info = memory_data.get('extracted_info', {})
            if extracted_info.get('health_topics'):
                health_info = memory_profile.get('health_info', {})
                for topic in extracted_info['health_topics']:
                    health_info[topic] = health_info.get(topic, 0) + 1
                memory_profile['health_info'] = health_info
            
            await self.db.update_user_profile(user_id, {'memory_profile': memory_profile})

# Example usage
async def example_usage():
    from backend.database import RonAIDatabase
    
    db = RonAIDatabase()
    ron_memory = RonMemory(db)
    
    user_id = "user_123"
    session_id = f"{user_id}_session_1"
    
    # Remember a conversation
    await ron_memory.remember_conversation(
        user_id=user_id,
        session_id=session_id,
        user_message="I need help managing my diabetes medication",
        ron_response="I can help you with diabetes medication management. What specific questions do you have?",
        context={"topic": "diabetes", "urgency": "medium"}
    )
    
    # Later, recall relevant memories
    memories = await ron_memory.recall_relevant_memories(user_id, "Tell me about my medications")
    
    # Build context for Ron
    context_prompt = await ron_memory.build_context_prompt(user_id, "What should I know about insulin?")
    
    print("Context for Ron:")
    print(context_prompt)

if __name__ == "__main__":
    import asyncio
    asyncio.run(example_usage())
