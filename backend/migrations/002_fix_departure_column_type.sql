-- Fix: TIMESTAMP → TIME for the departure column
-- MODIFY COLUMN direct conversion fails in strict mode; use a column swap instead.

-- Step 1: add a proper TIME column
ALTER TABLE lines_locations_departures
    ADD COLUMN departure_new TIME NOT NULL DEFAULT '00:00:00';

-- Step 2: copy the time portion from the existing TIMESTAMP values
UPDATE lines_locations_departures
    SET departure_new = TIME(departure);

-- Step 3: drop the old TIMESTAMP column
ALTER TABLE lines_locations_departures
    DROP COLUMN departure;

-- Step 4: rename the new column into place
ALTER TABLE lines_locations_departures
    RENAME COLUMN departure_new TO departure;
