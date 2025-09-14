#!/usr/bin/env python3
"""
PentryPal Database Cleanup Script
================================

Comprehensive database cleanup script for PentryPal application.
This script performs various cleanup operations to maintain database performance
and remove unnecessary data.

Usage:
    python database_cleanup.py [options]

Options:
    --dry-run           Show what would be cleaned without making changes
    --config-file       Path to custom configuration file
    --log-level         Set logging level (DEBUG, INFO, WARNING, ERROR)
    --operation         Specify specific cleanup operation
    --days-to-keep      Number of days to keep for time-based cleanup
    --force             Skip confirmation prompts (use with caution)

Operations:
    all                 Run all cleanup operations (default)
    expired             Clean expired/old data
    orphaned            Clean orphaned records
    activity            Archive old activity logs
    test-data           Remove test data
    optimize            Optimize database
"""

import argparse
import logging
import sys
import os
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import json

from sqlalchemy import create_engine, text, func, and_, or_
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError

# Add the app directory to the path so we can import models
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from db.database import Base
from models.user import User, UserPreferences
from models.security import SecuritySettings
from models.shopping_list import ShoppingList, ShoppingItem, ListCollaborator
from models.pantry import PantryItem
from models.social import Friendship, FriendRequest
from models.category import ItemCategory
from models.activity import ActivityLog
from models.security import BiometricKey
from core.config import settings


@dataclass
class CleanupStats:
    """Track cleanup operation statistics"""
    users_cleaned: int = 0
    shopping_lists_cleaned: int = 0
    shopping_items_cleaned: int = 0
    pantry_items_cleaned: int = 0
    activity_logs_cleaned: int = 0
    friend_requests_cleaned: int = 0
    friendships_cleaned: int = 0
    biometric_keys_cleaned: int = 0
    orphaned_records_cleaned: int = 0
    total_space_freed: float = 0.0


@dataclass
class CleanupConfig:
    """Configuration for cleanup operations"""
    # Time-based cleanup settings (in days)
    activity_log_retention_days: int = 90
    friend_request_expiry_days: int = 30
    completed_list_archive_days: int = 365
    inactive_user_days: int = 730  # 2 years
    expired_biometric_keys_days: int = 180
    
    # Orphaned records cleanup
    cleanup_orphaned_items: bool = True
    cleanup_orphaned_collaborators: bool = True
    cleanup_orphaned_preferences: bool = True
    
    # Test data cleanup patterns
    test_email_patterns: List[str] = None
    test_name_patterns: List[str] = None
    
    # Safety settings
    max_records_per_batch: int = 1000
    enable_foreign_key_checks: bool = True
    create_backup: bool = True
    
    def __post_init__(self):
        if self.test_email_patterns is None:
            self.test_email_patterns = [
                'test@example.com',
                '%@test.com',
                'test_%@%',
                '%+test@%'
            ]
        
        if self.test_name_patterns is None:
            self.test_name_patterns = [
                'Test User%',
                'test%',
                'Test %',
                'Demo %'
            ]


class DatabaseCleaner:
    """Main database cleanup class"""
    
    def __init__(self, config: CleanupConfig, dry_run: bool = False):
        self.config = config
        self.dry_run = dry_run
        self.stats = CleanupStats()
        self.logger = self._setup_logging()
        
        # Initialize database connection
        self.engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            pool_size=5,
            max_overflow=10
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db: Session = SessionLocal()
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration"""
        logger = logging.getLogger('database_cleanup')
        logger.setLevel(logging.INFO)
        
        # Create console handler
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
        return logger
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.db:
            self.db.close()
    
    def run_cleanup(self, operations: List[str] = None) -> CleanupStats:
        """Run specified cleanup operations"""
        if operations is None:
            operations = ['all']
        
        self.logger.info(f"Starting database cleanup - Dry run: {self.dry_run}")
        
        try:
            if 'all' in operations or 'expired' in operations:
                self.cleanup_expired_data()
            
            if 'all' in operations or 'orphaned' in operations:
                self.cleanup_orphaned_records()
            
            if 'all' in operations or 'activity' in operations:
                self.cleanup_activity_logs()
            
            if 'all' in operations or 'test-data' in operations:
                self.cleanup_test_data()
            
            if 'all' in operations or 'optimize' in operations:
                self.optimize_database()
            
            if not self.dry_run:
                self.db.commit()
                self.logger.info("All cleanup operations committed successfully")
            else:
                self.db.rollback()
                self.logger.info("Dry run completed - no changes made")
            
            return self.stats
            
        except Exception as e:
            self.logger.error(f"Cleanup failed: {str(e)}")
            self.db.rollback()
            raise
    
    def cleanup_expired_data(self):
        """Clean up expired and old data"""
        self.logger.info("=== Cleaning expired data ===")
        
        # Clean expired friend requests
        self._cleanup_expired_friend_requests()
        
        # Clean old completed shopping lists
        self._cleanup_old_completed_lists()
        
        # Clean expired biometric keys
        self._cleanup_expired_biometric_keys()
        
        # Clean inactive users (optional - be very careful with this)
        # self._cleanup_inactive_users()
    
    def _cleanup_expired_friend_requests(self):
        """Remove old friend requests"""
        cutoff_date = datetime.utcnow() - timedelta(days=self.config.friend_request_expiry_days)
        
        query = self.db.query(FriendRequest).filter(
            and_(
                FriendRequest.created_at < cutoff_date,
                FriendRequest.status.in_(['pending', 'rejected', 'cancelled'])
            )
        )
        
        count = query.count()
        if count > 0:
            self.logger.info(f"Found {count} expired friend requests to clean")
            
            if not self.dry_run:
                deleted = query.delete(synchronize_session=False)
                self.stats.friend_requests_cleaned += deleted
                self.logger.info(f"Cleaned {deleted} expired friend requests")
            else:
                self.stats.friend_requests_cleaned += count
                self.logger.info(f"Would clean {count} expired friend requests")
    
    def _cleanup_old_completed_lists(self):
        """Archive/clean old completed shopping lists"""
        cutoff_date = datetime.utcnow() - timedelta(days=self.config.completed_list_archive_days)
        
        query = self.db.query(ShoppingList).filter(
            and_(
                ShoppingList.status == 'completed',
                ShoppingList.updated_at < cutoff_date
            )
        )
        
        count = query.count()
        if count > 0:
            self.logger.info(f"Found {count} old completed lists to archive")
            
            if not self.dry_run:
                # Update status to archived instead of deleting
                updated = query.update(
                    {'status': 'archived'},
                    synchronize_session=False
                )
                self.stats.shopping_lists_cleaned += updated
                self.logger.info(f"Archived {updated} old completed lists")
            else:
                self.stats.shopping_lists_cleaned += count
                self.logger.info(f"Would archive {count} old completed lists")
    
    def _cleanup_expired_biometric_keys(self):
        """Remove old unused biometric keys"""
        cutoff_date = datetime.utcnow() - timedelta(days=self.config.expired_biometric_keys_days)
        
        query = self.db.query(BiometricKey).filter(
            or_(
                BiometricKey.last_used_at < cutoff_date,
                and_(
                    BiometricKey.last_used_at.is_(None),
                    BiometricKey.created_at < cutoff_date
                )
            )
        )
        
        count = query.count()
        if count > 0:
            self.logger.info(f"Found {count} expired biometric keys to clean")
            
            if not self.dry_run:
                deleted = query.delete(synchronize_session=False)
                self.stats.biometric_keys_cleaned += deleted
                self.logger.info(f"Cleaned {deleted} expired biometric keys")
            else:
                self.stats.biometric_keys_cleaned += count
                self.logger.info(f"Would clean {count} expired biometric keys")
    
    def cleanup_orphaned_records(self):
        """Clean up orphaned records"""
        self.logger.info("=== Cleaning orphaned records ===")
        
        if self.config.cleanup_orphaned_items:
            self._cleanup_orphaned_shopping_items()
            self._cleanup_orphaned_pantry_items()
        
        if self.config.cleanup_orphaned_collaborators:
            self._cleanup_orphaned_collaborators()
        
        if self.config.cleanup_orphaned_preferences:
            self._cleanup_orphaned_user_preferences()
    
    def _cleanup_orphaned_shopping_items(self):
        """Remove shopping items with no parent list"""
        subquery = self.db.query(ShoppingList.id).subquery()
        
        query = self.db.query(ShoppingItem).filter(
            ~ShoppingItem.list_id.in_(subquery)
        )
        
        count = query.count()
        if count > 0:
            self.logger.info(f"Found {count} orphaned shopping items")
            
            if not self.dry_run:
                deleted = query.delete(synchronize_session=False)
                self.stats.shopping_items_cleaned += deleted
                self.stats.orphaned_records_cleaned += deleted
                self.logger.info(f"Cleaned {deleted} orphaned shopping items")
            else:
                self.stats.shopping_items_cleaned += count
                self.stats.orphaned_records_cleaned += count
                self.logger.info(f"Would clean {count} orphaned shopping items")
    
    def _cleanup_orphaned_pantry_items(self):
        """Remove pantry items with no parent user"""
        subquery = self.db.query(User.id).subquery()
        
        query = self.db.query(PantryItem).filter(
            ~PantryItem.user_id.in_(subquery)
        )
        
        count = query.count()
        if count > 0:
            self.logger.info(f"Found {count} orphaned pantry items")
            
            if not self.dry_run:
                deleted = query.delete(synchronize_session=False)
                self.stats.pantry_items_cleaned += deleted
                self.stats.orphaned_records_cleaned += deleted
                self.logger.info(f"Cleaned {deleted} orphaned pantry items")
            else:
                self.stats.pantry_items_cleaned += count
                self.stats.orphaned_records_cleaned += count
                self.logger.info(f"Would clean {count} orphaned pantry items")
    
    def _cleanup_orphaned_collaborators(self):
        """Remove collaborators for non-existent lists or users"""
        # Collaborators with non-existent lists
        list_subquery = self.db.query(ShoppingList.id).subquery()
        user_subquery = self.db.query(User.id).subquery()
        
        query = self.db.query(ListCollaborator).filter(
            or_(
                ~ListCollaborator.list_id.in_(list_subquery),
                ~ListCollaborator.user_id.in_(user_subquery)
            )
        )
        
        count = query.count()
        if count > 0:
            self.logger.info(f"Found {count} orphaned collaborators")
            
            if not self.dry_run:
                deleted = query.delete(synchronize_session=False)
                self.stats.orphaned_records_cleaned += deleted
                self.logger.info(f"Cleaned {deleted} orphaned collaborators")
            else:
                self.stats.orphaned_records_cleaned += count
                self.logger.info(f"Would clean {count} orphaned collaborators")
    
    def _cleanup_orphaned_user_preferences(self):
        """Remove preferences for non-existent users"""
        subquery = self.db.query(User.id).subquery()
        
        query = self.db.query(UserPreferences).filter(
            ~UserPreferences.user_id.in_(subquery)
        )
        
        count = query.count()
        if count > 0:
            self.logger.info(f"Found {count} orphaned user preferences")
            
            if not self.dry_run:
                deleted = query.delete(synchronize_session=False)
                self.stats.orphaned_records_cleaned += deleted
                self.logger.info(f"Cleaned {deleted} orphaned user preferences")
            else:
                self.stats.orphaned_records_cleaned += count
                self.logger.info(f"Would clean {count} orphaned user preferences")
    
    def cleanup_activity_logs(self):
        """Clean up old activity logs"""
        self.logger.info("=== Cleaning activity logs ===")
        
        cutoff_date = datetime.utcnow() - timedelta(days=self.config.activity_log_retention_days)
        
        query = self.db.query(ActivityLog).filter(
            ActivityLog.created_at < cutoff_date
        )
        
        count = query.count()
        if count > 0:
            self.logger.info(f"Found {count} old activity logs to clean")
            
            if not self.dry_run:
                # Process in batches to avoid memory issues
                total_deleted = 0
                batch_size = self.config.max_records_per_batch
                
                while True:
                    batch_query = query.limit(batch_size)
                    batch_count = batch_query.count()
                    
                    if batch_count == 0:
                        break
                    
                    deleted = batch_query.delete(synchronize_session=False)
                    total_deleted += deleted
                    
                    if batch_count < batch_size:
                        break
                
                self.stats.activity_logs_cleaned += total_deleted
                self.logger.info(f"Cleaned {total_deleted} old activity logs")
            else:
                self.stats.activity_logs_cleaned += count
                self.logger.info(f"Would clean {count} old activity logs")
    
    def cleanup_test_data(self):
        """Remove test data based on patterns"""
        self.logger.info("=== Cleaning test data ===")
        
        # Find test users
        test_user_filters = []
        for pattern in self.config.test_email_patterns:
            test_user_filters.append(User.email.like(pattern))
        
        for pattern in self.config.test_name_patterns:
            test_user_filters.append(User.name.like(pattern))
        
        if test_user_filters:
            query = self.db.query(User).filter(or_(*test_user_filters))
            count = query.count()
            
            if count > 0:
                self.logger.info(f"Found {count} test users to clean")
                
                if not self.dry_run:
                    # Get test user IDs first
                    test_user_ids = [user.id for user in query.all()]
                    
                    # Clean related data first (due to foreign key constraints)
                    self._cleanup_test_user_data(test_user_ids)
                    
                    # Finally delete test users
                    deleted = query.delete(synchronize_session=False)
                    self.stats.users_cleaned += deleted
                    self.logger.info(f"Cleaned {deleted} test users and related data")
                else:
                    self.stats.users_cleaned += count
                    self.logger.info(f"Would clean {count} test users and related data")
    
    def _cleanup_test_user_data(self, user_ids: List[str]):
        """Clean data related to test users"""
        # Clean activity logs
        self.db.query(ActivityLog).filter(
            ActivityLog.user_id.in_(user_ids)
        ).delete(synchronize_session=False)
        
        # Clean pantry items
        self.db.query(PantryItem).filter(
            PantryItem.user_id.in_(user_ids)
        ).delete(synchronize_session=False)
        
        # Clean friendships
        self.db.query(Friendship).filter(
            or_(
                Friendship.user1_id.in_(user_ids),
                Friendship.user2_id.in_(user_ids)
            )
        ).delete(synchronize_session=False)
        
        # Clean friend requests
        self.db.query(FriendRequest).filter(
            or_(
                FriendRequest.from_user_id.in_(user_ids),
                FriendRequest.to_user_id.in_(user_ids)
            )
        ).delete(synchronize_session=False)
    
    def optimize_database(self):
        """Optimize database performance"""
        self.logger.info("=== Optimizing database ===")
        
        if not self.dry_run:
            try:
                # Run VACUUM ANALYZE on main tables
                tables = [
                    'users', 'shopping_lists', 'shopping_items', 
                    'pantry_items', 'activity_logs', 'friendships'
                ]
                
                for table in tables:
                    self.logger.info(f"Optimizing table: {table}")
                    self.db.execute(text(f"VACUUM ANALYZE {table}"))
                    
                self.db.commit()
                self.logger.info("Database optimization completed")
                
            except SQLAlchemyError as e:
                self.logger.warning(f"Database optimization failed: {str(e)}")
        else:
            self.logger.info("Would optimize database tables")
    
    def get_database_size(self) -> Dict[str, float]:
        """Get current database size statistics"""
        try:
            result = self.db.execute(text("""
                SELECT 
                    schemaname,
                    tablename,
                    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
                FROM pg_tables 
                WHERE schemaname = 'public'
                ORDER BY size_bytes DESC
            """))
            
            sizes = {}
            total_size = 0
            
            for row in result:
                size_mb = row.size_bytes / (1024 * 1024)
                sizes[row.tablename] = size_mb
                total_size += size_mb
            
            sizes['total'] = total_size
            return sizes
            
        except SQLAlchemyError as e:
            self.logger.warning(f"Could not get database size: {str(e)}")
            return {}
    
    def print_summary(self):
        """Print cleanup summary"""
        print("\n" + "="*60)
        print("DATABASE CLEANUP SUMMARY")
        print("="*60)
        print(f"Dry Run: {'Yes' if self.dry_run else 'No'}")
        print(f"Users cleaned: {self.stats.users_cleaned}")
        print(f"Shopping lists cleaned: {self.stats.shopping_lists_cleaned}")
        print(f"Shopping items cleaned: {self.stats.shopping_items_cleaned}")
        print(f"Pantry items cleaned: {self.stats.pantry_items_cleaned}")
        print(f"Activity logs cleaned: {self.stats.activity_logs_cleaned}")
        print(f"Friend requests cleaned: {self.stats.friend_requests_cleaned}")
        print(f"Friendships cleaned: {self.stats.friendships_cleaned}")
        print(f"Biometric keys cleaned: {self.stats.biometric_keys_cleaned}")
        print(f"Orphaned records cleaned: {self.stats.orphaned_records_cleaned}")
        print("="*60)
        
        # Show database sizes
        sizes = self.get_database_size()
        if sizes:
            print("\nDATABASE SIZE BY TABLE:")
            print("-"*40)
            for table, size in sorted(sizes.items(), key=lambda x: x[1], reverse=True):
                if table != 'total':
                    print(f"{table:<25}: {size:>10.2f} MB")
            print("-"*40)
            print(f"{'TOTAL':<25}: {sizes.get('total', 0):>10.2f} MB")


def load_config(config_file: Optional[str] = None) -> CleanupConfig:
    """Load cleanup configuration from file or use defaults"""
    config = CleanupConfig()
    
    if config_file and os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                config_dict = json.load(f)
                
            # Update config with loaded values
            for key, value in config_dict.items():
                if hasattr(config, key):
                    setattr(config, key, value)
                    
        except Exception as e:
            logging.warning(f"Could not load config file {config_file}: {e}")
    
    return config


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="PentryPal Database Cleanup Script",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be cleaned without making changes'
    )
    
    parser.add_argument(
        '--config-file',
        type=str,
        help='Path to custom configuration file'
    )
    
    parser.add_argument(
        '--log-level',
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        default='INFO',
        help='Set logging level'
    )
    
    parser.add_argument(
        '--operation',
        choices=['all', 'expired', 'orphaned', 'activity', 'test-data', 'optimize'],
        default='all',
        help='Specify specific cleanup operation'
    )
    
    parser.add_argument(
        '--days-to-keep',
        type=int,
        help='Override default retention days for time-based cleanup'
    )
    
    parser.add_argument(
        '--force',
        action='store_true',
        help='Skip confirmation prompts (use with caution)'
    )
    
    args = parser.parse_args()
    
    # Setup logging
    logging.basicConfig(level=getattr(logging, args.log_level))
    
    # Load configuration
    config = load_config(args.config_file)
    
    # Override retention days if specified
    if args.days_to_keep:
        config.activity_log_retention_days = args.days_to_keep
        config.friend_request_expiry_days = args.days_to_keep
        config.completed_list_archive_days = args.days_to_keep
    
    # Confirmation prompt
    if not args.dry_run and not args.force:
        print(f"\nThis will perform database cleanup operations.")
        print(f"Operation: {args.operation}")
        print(f"Database: {settings.DATABASE_URL}")
        response = input("\nDo you want to continue? (y/N): ")
        
        if response.lower() not in ['y', 'yes']:
            print("Operation cancelled.")
            return
    
    # Run cleanup
    try:
        with DatabaseCleaner(config, dry_run=args.dry_run) as cleaner:
            operations = [args.operation] if args.operation != 'all' else ['all']
            stats = cleaner.run_cleanup(operations)
            cleaner.print_summary()
            
    except Exception as e:
        logging.error(f"Cleanup failed: {str(e)}")
        sys.exit(1)
    
    print(f"\nCleanup {'simulation' if args.dry_run else 'completed'} successfully!")


if __name__ == '__main__':
    main()
