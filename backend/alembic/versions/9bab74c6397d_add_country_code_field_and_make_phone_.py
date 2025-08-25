"""Add country_code field and make phone_email mandatory

Revision ID: 9bab74c6397d
Revises: 
Create Date: 2025-08-25 19:39:16.812477

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9bab74c6397d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add country_code column to users table
    op.add_column('users', sa.Column('country_code', sa.String(length=4), nullable=True))
    
    # Update existing users with default country code (assuming US for migration)
    op.execute("UPDATE users SET country_code = 'US' WHERE country_code IS NULL")
    
    # Make country_code non-nullable
    op.alter_column('users', 'country_code', nullable=False)
    
    # Make email non-nullable (if not already)
    op.alter_column('users', 'email', nullable=False)
    
    # Make phone non-nullable (if not already)
    op.alter_column('users', 'phone', nullable=False)
    
    # Add unique constraint for phone + country_code combination
    op.create_unique_constraint('unique_phone_per_country', 'users', ['phone', 'country_code'])
    
    # Drop old unique constraint on phone if it exists
    try:
        op.drop_constraint('users_phone_key', 'users', type_='unique')
    except:
        pass  # Constraint might not exist


def downgrade() -> None:
    # Remove unique constraint
    op.drop_constraint('unique_phone_per_country', 'users', type_='unique')
    
    # Make phone and email nullable again
    op.alter_column('users', 'phone', nullable=True)
    op.alter_column('users', 'email', nullable=True)
    
    # Remove country_code column
    op.drop_column('users', 'country_code')
    
    # Re-add phone unique constraint if needed
    op.create_unique_constraint('users_phone_key', 'users', ['phone'])
