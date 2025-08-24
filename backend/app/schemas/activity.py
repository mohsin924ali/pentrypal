"""
Activity log related Pydantic schemas
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class ActivityLogResponse(BaseModel):
    id: str
    user_id: str
    entity_type: str
    entity_id: Optional[str]
    action: str
    meta_data: Dict[str, Any]
    created_at: datetime
    
    class Config:
        from_attributes = True
