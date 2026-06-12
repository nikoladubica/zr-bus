-- Resume from 002: departure_new column already exists, UPDATE failed due to NULL TIME() results.
-- Use COALESCE so any un-parseable departure value falls back to '00:00:00'.

UPDATE lines_locations_departures
    SET departure_new = COALESCE(TIME(departure), '00:00:00');

ALTER TABLE lines_locations_departures
    DROP COLUMN departure;

ALTER TABLE lines_locations_departures
    RENAME COLUMN departure_new TO departure;
