import boto3
import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from botocore.exceptions import ClientError

class RonAIDatabase:
    def __init__(self, region_name: str = 'us-east-1'):
        self.dynamodb = boto3.resource('dynamodb', region_name=region_name)
        self.chat_table = self.dynamodb.Table('ron-ai-chat-sessions')
        self.user_table = self.dynamodb.Table('ron-ai-user-profiles')
    
    # Chat Session Methods
    async def save_message(self, session_id: str, message_type: str, content: str, 
                          metadata: Optional[Dict] = None) -> bool:
        """Save a chat message to DynamoDB"""
        try:
            timestamp = int(time.time() * 1000)  # milliseconds
            
            item = {
                'session_id': session_id,
                'timestamp': timestamp,
                'message_type': message_type,  # 'user' or 'assistant'
                'content': content,
                'created_at': datetime.utcnow().isoformat(),
            }
            
            if metadata:
                item['metadata'] = metadata
            
            self.chat_table.put_item(Item=item)
            return True
            
        except ClientError as e:
            print(f"Error saving message: {e}")
            return False
    
    async def get_chat_history(self, session_id: str, limit: int = 50) -> List[Dict]:
        """Retrieve chat history for a session"""
        try:
            response = self.chat_table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key('session_id').eq(session_id),
                ScanIndexForward=True,  # Sort by timestamp ascending
                Limit=limit
            )
            return response.get('Items', [])
            
        except ClientError as e:
            print(f"Error retrieving chat history: {e}")
            return []
    
    async def get_recent_sessions(self, user_id: str, limit: int = 10) -> List[str]:
        """Get recent session IDs for a user"""
        # This would require a GSI on user_id if we want to query by user
        # For now, we'll implement a simple approach
        try:
            # This is a simplified version - in production you'd want a GSI
            response = self.chat_table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('session_id').contains(user_id),
                Limit=limit
            )
            
            sessions = set()
            for item in response.get('Items', []):
                sessions.add(item['session_id'])
            
            return list(sessions)
            
        except ClientError as e:
            print(f"Error retrieving recent sessions: {e}")
            return []
    
    # User Profile Methods
    async def create_user_profile(self, user_id: str, profile_data: Dict) -> bool:
        """Create or update a user profile"""
        try:
            item = {
                'user_id': user_id,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat(),
                **profile_data
            }
            
            self.user_table.put_item(Item=item)
            return True
            
        except ClientError as e:
            print(f"Error creating user profile: {e}")
            return False
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Retrieve a user profile"""
        try:
            response = self.user_table.get_item(Key={'user_id': user_id})
            return response.get('Item')
            
        except ClientError as e:
            print(f"Error retrieving user profile: {e}")
            return None
    
    async def update_user_profile(self, user_id: str, updates: Dict) -> bool:
        """Update specific fields in a user profile"""
        try:
            # Build update expression
            update_expression = "SET updated_at = :updated_at"
            expression_values = {':updated_at': datetime.utcnow().isoformat()}
            
            for key, value in updates.items():
                update_expression += f", {key} = :{key}"
                expression_values[f":{key}"] = value
            
            self.user_table.update_item(
                Key={'user_id': user_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values
            )
            return True
            
        except ClientError as e:
            print(f"Error updating user profile: {e}")
            return False
    
    # Healthcare-specific methods
    async def save_medication_list(self, user_id: str, medications: List[Dict]) -> bool:
        """Save user's medication list"""
        return await self.update_user_profile(user_id, {'medications': medications})
    
    async def save_healthcare_providers(self, user_id: str, providers: List[Dict]) -> bool:
        """Save user's healthcare providers"""
        return await self.update_user_profile(user_id, {'healthcare_providers': providers})
    
    async def save_appointment_history(self, user_id: str, appointments: List[Dict]) -> bool:
        """Save user's appointment history"""
        return await self.update_user_profile(user_id, {'appointment_history': appointments})
    
    async def get_user_medications(self, user_id: str) -> List[Dict]:
        """Get user's current medications"""
        profile = await self.get_user_profile(user_id)
        return profile.get('medications', []) if profile else []
    
    async def get_user_providers(self, user_id: str) -> List[Dict]:
        """Get user's healthcare providers"""
        profile = await self.get_user_profile(user_id)
        return profile.get('healthcare_providers', []) if profile else []

# Example usage and testing
if __name__ == "__main__":
    import asyncio
    
    async def test_database():
        db = RonAIDatabase()
        
        # Test user profile creation
        user_id = "test_user_123"
        profile_data = {
            'name': 'John Doe',
            'age': 35,
            'medical_conditions': ['hypertension', 'diabetes'],
            'allergies': ['penicillin'],
            'emergency_contact': {
                'name': 'Jane Doe',
                'phone': '555-0123'
            }
        }
        
        success = await db.create_user_profile(user_id, profile_data)
        print(f"Profile created: {success}")
        
        # Test message saving
        session_id = f"{user_id}_session_1"
        await db.save_message(session_id, 'user', 'Hello, I need help with my medications')
        await db.save_message(session_id, 'assistant', 'I can help you with that. What specific questions do you have about your medications?')
        
        # Test retrieval
        history = await db.get_chat_history(session_id)
        print(f"Chat history: {len(history)} messages")
        
        profile = await db.get_user_profile(user_id)
        print(f"Retrieved profile: {profile['name'] if profile else 'Not found'}")
    
    # Uncomment to test
    # asyncio.run(test_database())
