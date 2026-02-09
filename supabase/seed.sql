-- Auto-generated seed file: sources SQL files from packages/database
-- Run order: setup, migrations, tables, records, views
\i 'packages/database/setup.sql'

-- Migrations
\i 'packages/database/migration_add_alerts_unique_index.sql'
\i 'packages/database/migration_add_cow_fields.sql'
\i 'packages/database/migration_add_timestamps.sql'
\i 'packages/database/migration_breeding_alerts.sql'
\i 'packages/database/migration_breeding_attempts.sql'
\i 'packages/database/migration_cows_genetics.sql'
\i 'packages/database/migration_fix_age_weight_decimal.sql'
\i 'packages/database/migration_heat_events.sql'
\i 'packages/database/migration_pregnancy_checks.sql'

-- Tables and data
\i 'packages/database/milk_production_table.sql'
\i 'packages/database/health_records_enhanced.sql'
\i 'packages/database/health_records_final.sql'

-- Views
\i 'packages/database/v_active_breeding_windows.sql'
\i 'packages/database/v_breeding_success_rates.sql'
\i 'packages/database/v_expected_heats.sql'
\i 'packages/database/v_pending_pregnancy_checks.sql'

-- End of generated seed file
