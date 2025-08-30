# PentryPal Database Cleanup Script

A comprehensive database maintenance and cleanup tool for the PentryPal
application.

## Overview

The database cleanup script performs various maintenance operations to keep your
PentryPal database healthy, performant, and free of unnecessary data. It
includes safety features like dry-run mode, configurable retention periods, and
detailed logging.

## Features

- **Expired Data Cleanup**: Removes old friend requests, archives completed
  lists, cleans expired biometric keys
- **Orphaned Records Cleanup**: Removes records that no longer have valid parent
  references
- **Activity Log Management**: Archives old activity logs to prevent database
  bloat
- **Test Data Removal**: Removes test users and related data based on
  configurable patterns
- **Database Optimization**: Runs VACUUM and ANALYZE operations for better
  performance
- **Safety Features**: Dry-run mode, batch processing, foreign key validation
- **Detailed Reporting**: Shows exactly what was cleaned and current database
  sizes

## Installation & Setup

### Prerequisites

1. Python 3.8+ installed
2. Access to the PostgreSQL database
3. Required Python packages (already included in requirements.txt):
   - SQLAlchemy
   - psycopg2-binary
   - pydantic-settings

### Environment Setup

Make sure your database environment variables are properly set in the `.env`
file or environment:

```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
# OR individual components:
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pentrypal_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
```

## Usage

### Basic Usage

```bash
# Dry run (safe - shows what would be cleaned without making changes)
python database_cleanup.py --dry-run

# Actually perform cleanup (with confirmation prompt)
python database_cleanup.py

# Skip confirmation prompt (use with caution in automated scripts)
python database_cleanup.py --force
```

### Specific Operations

```bash
# Clean only expired data
python database_cleanup.py --operation expired --dry-run

# Clean only orphaned records
python database_cleanup.py --operation orphaned --dry-run

# Clean only activity logs
python database_cleanup.py --operation activity --dry-run

# Remove test data
python database_cleanup.py --operation test-data --dry-run

# Optimize database only
python database_cleanup.py --operation optimize --dry-run
```

### Custom Configuration

```bash
# Use custom configuration file
python database_cleanup.py --config-file custom_cleanup_config.json --dry-run

# Override retention period for time-based cleanup
python database_cleanup.py --days-to-keep 60 --dry-run
```

### Logging Options

```bash
# Set logging level
python database_cleanup.py --log-level DEBUG --dry-run
python database_cleanup.py --log-level WARNING --dry-run
```

## Configuration

The cleanup script can be configured using a JSON configuration file. See
`cleanup_config.json` for the template.

### Configuration Options

| Option                           | Default | Description                                             |
| -------------------------------- | ------- | ------------------------------------------------------- |
| `activity_log_retention_days`    | 90      | Days to keep activity logs                              |
| `friend_request_expiry_days`     | 30      | Days after which friend requests are considered expired |
| `completed_list_archive_days`    | 365     | Days after which completed lists are archived           |
| `inactive_user_days`             | 730     | Days after which users are considered inactive          |
| `expired_biometric_keys_days`    | 180     | Days after which unused biometric keys are removed      |
| `cleanup_orphaned_items`         | true    | Whether to clean orphaned shopping/pantry items         |
| `cleanup_orphaned_collaborators` | true    | Whether to clean orphaned collaborators                 |
| `cleanup_orphaned_preferences`   | true    | Whether to clean orphaned user preferences              |
| `test_email_patterns`            | Array   | Email patterns to identify test users                   |
| `test_name_patterns`             | Array   | Name patterns to identify test users                    |
| `max_records_per_batch`          | 1000    | Maximum records to process in a single batch            |

### Test Data Patterns

The script uses SQL LIKE patterns to identify test data:

- `%` matches any sequence of characters
- `_` matches any single character

Examples:

- `test@example.com` - matches exactly
- `%@test.com` - matches any email ending with @test.com
- `Test %` - matches names starting with "Test "

## Cleanup Operations

### 1. Expired Data Cleanup

Removes data that has exceeded its useful lifetime:

- **Friend Requests**: Pending, rejected, or cancelled requests older than
  configured days
- **Completed Lists**: Changes status from 'completed' to 'archived' for old
  completed shopping lists
- **Biometric Keys**: Removes unused biometric authentication keys
- **Inactive Users**: (Optional) Handles users who haven't been active for
  extended periods

### 2. Orphaned Records Cleanup

Removes records that reference non-existent parent records:

- Shopping items without valid shopping lists
- Pantry items without valid users
- List collaborators for deleted lists or users
- User preferences for deleted users

### 3. Activity Log Management

Manages the activity_logs table to prevent unlimited growth:

- Removes activity logs older than the retention period
- Processes in batches to handle large datasets efficiently
- Preserves recent activity for auditing and user experience

### 4. Test Data Removal

Removes test accounts and related data:

- Identifies test users based on email and name patterns
- Cascades deletion to all related data (lists, items, friendships, etc.)
- Respects foreign key constraints and deletion order

### 5. Database Optimization

Improves database performance:

- Runs VACUUM to reclaim disk space
- Runs ANALYZE to update query planner statistics
- Focuses on high-traffic tables

## Safety Features

### Dry Run Mode

Always test with `--dry-run` first to see what would be cleaned:

```bash
python database_cleanup.py --dry-run
```

This shows exactly what would be cleaned without making any changes.

### Batch Processing

Large operations are processed in batches to:

- Prevent memory exhaustion
- Allow for progress monitoring
- Enable safe interruption if needed

### Foreign Key Validation

The script respects database foreign key constraints and deletes records in the
proper order to avoid constraint violations.

### Confirmation Prompts

Unless `--force` is used, the script will prompt for confirmation before making
any changes.

## Monitoring & Reporting

### Output Information

The script provides detailed information about:

- Number of records cleaned in each category
- Current database size by table
- Total space usage
- Operation timing and success status

### Logging

Comprehensive logging includes:

- All operations performed
- Counts of records affected
- Error conditions and warnings
- Performance timing information

### Database Size Reporting

After cleanup, the script shows:

- Size of each table in MB
- Total database size
- Space potentially freed by the cleanup

## Scheduling & Automation

### Cron Job Example

For regular maintenance, you can set up a cron job:

```bash
# Run cleanup every Sunday at 2 AM
0 2 * * 0 cd /path/to/backend && python database_cleanup.py --force >> /var/log/pentrypal_cleanup.log 2>&1
```

### Docker Integration

If running in Docker, you can create a cleanup service:

```yaml
services:
  db-cleanup:
    build: .
    command: python database_cleanup.py --force
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/pentrypal_db
    depends_on:
      - db
    profiles: ['cleanup']
```

Run with: `docker-compose --profile cleanup up db-cleanup`

## Best Practices

### 1. Always Test First

```bash
# Always run dry-run first
python database_cleanup.py --dry-run

# Review the output, then run for real
python database_cleanup.py
```

### 2. Regular Schedule

- Run basic cleanup weekly
- Run full cleanup (including test data) monthly
- Run optimization quarterly or after major data imports

### 3. Monitor Results

- Check the cleanup summary for unexpected large deletions
- Monitor database size trends over time
- Keep logs of cleanup operations

### 4. Backup Strategy

- Ensure you have recent database backups before running cleanup
- Consider taking a backup immediately before major cleanup operations
- Test restore procedures regularly

### 5. Configuration Management

- Use version control for cleanup configuration files
- Test configuration changes in staging environment first
- Document any custom patterns or retention periods

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure database user has DELETE and UPDATE permissions
   - Check that the user can run VACUUM operations

2. **Foreign Key Constraint Violations**
   - The script handles proper deletion order
   - If you see constraint errors, there may be custom constraints not handled

3. **Memory Issues with Large Datasets**
   - Reduce `max_records_per_batch` in configuration
   - Run operations individually instead of all at once

4. **Long Running Operations**
   - Use `--log-level DEBUG` to see progress
   - Consider running during low-traffic periods
   - Monitor database locks and performance

### Error Recovery

If cleanup fails partway through:

1. Check the logs for specific error messages
2. The script uses transactions, so partial operations are rolled back
3. Fix the underlying issue and re-run
4. Consider running specific operations instead of all operations

## Security Considerations

### Data Sensitivity

- Be extremely careful with test data patterns
- Review what will be deleted in dry-run mode first
- Consider data retention policies and legal requirements

### Access Control

- Limit access to the cleanup script
- Use dedicated database user with minimal required permissions
- Log all cleanup operations for audit trails

### Production Usage

- Never run without dry-run in production without thorough testing
- Have rollback procedures ready
- Monitor application behavior after cleanup
- Consider maintenance windows for optimization operations

## Support

For issues or questions about the database cleanup script:

1. Check this documentation first
2. Review the script logs for error details
3. Test in a development environment
4. Create an issue in the project repository with:
   - Full command used
   - Complete error output
   - Database version and environment details
