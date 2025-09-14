#!/usr/bin/env python3
"""
Initialize database with default data
Run this from the backend directory root
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.category import ItemCategory


def create_default_categories(db: Session):
    """Create default system categories"""
    default_categories = [
        {"name": "Fruits & Vegetables", "color": "#FFA07A", "icon": "🍎", "is_system": True},
        {"name": "Vegetables", "color": "#90EE90", "icon": "🥕", "is_system": True},
        {"name": "Meat & Seafood", "color": "#FFB6C1", "icon": "🥩", "is_system": True},
        {"name": "Dairy & Alternatives", "color": "#FFE4B5", "icon": "🥛", "is_system": True},
        {"name": "Grains & Bakery", "color": "#DEB887", "icon": "🍞", "is_system": True},
        {"name": "Beans & Legumes", "color": "#8FBC8F", "icon": "🫘", "is_system": True},
        {"name": "Spices & Herbs", "color": "#FF6347", "icon": "🌶️", "is_system": True},
        {"name": "Canned & Condiments", "color": "#D3D3D3", "icon": "🥫", "is_system": True},
        {"name": "Pantry Staples", "color": "#DAA520", "icon": "🏺", "is_system": True},
        {"name": "Frozen Foods", "color": "#E0F6FF", "icon": "🧊", "is_system": True},
        {"name": "Beverages", "color": "#87CEEB", "icon": "🥤", "is_system": True},
        {"name": "Snacks & Confectionery", "color": "#F0E68C", "icon": "🍿", "is_system": True},
        {"name": "Household Items", "color": "#DCDCDC", "icon": "🧽", "is_system": True},
        {"name": "Personal Care", "color": "#E6E6FA", "icon": "🧴", "is_system": True},
        {"name": "Other", "color": "#F5F5F5", "icon": "📦", "is_system": True},
    ]
    
    for category_data in default_categories:
        # Check if category already exists
        existing = db.query(ItemCategory).filter(
            ItemCategory.name == category_data["name"]
        ).first()
        
        if not existing:
            category = ItemCategory(**category_data)
            db.add(category)
            print(f"Created category: {category_data['name']}")
        else:
            print(f"Category already exists: {category_data['name']}")
    
    db.commit()


def init_db():
    """Initialize database with default data"""
    try:
        print("Creating database tables...")
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")
        
        # Create default data
        print("Creating default categories...")
        db = SessionLocal()
        try:
            create_default_categories(db)
            print("Database initialized successfully!")
        except Exception as e:
            print(f"Error creating default data: {e}")
            db.rollback()
            raise
        finally:
            db.close()
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)


if __name__ == "__main__":
    init_db()
