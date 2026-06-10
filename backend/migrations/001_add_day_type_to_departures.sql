-- Add day_type column to lines_locations_departures
ALTER TABLE lines_locations_departures
    ADD COLUMN day_type ENUM('workday', 'saturday', 'sunday') NOT NULL DEFAULT 'workday';

-- Fix departure column type from TIMESTAMP to TIME
ALTER TABLE lines_locations_departures
    MODIFY COLUMN departure TIME NOT NULL;

-- Backfill: all existing rows get 'workday' (already the DEFAULT, but explicit for clarity)
UPDATE lines_locations_departures SET day_type = 'workday' WHERE day_type IS NULL;
