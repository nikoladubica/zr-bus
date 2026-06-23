-- 006_intercity_columns.sql
-- Adds category/operator to lines, city to locations, price to departures.
-- Seeds placeholder Novi Sad ↔ Zrenjanin corridor.

ALTER TABLE `lines`
  ADD COLUMN `category` ENUM('city','intercity') NOT NULL DEFAULT 'city' AFTER `direction`,
  ADD COLUMN `operator` VARCHAR(255) NULL AFTER `category`;

UPDATE `lines` SET `operator` = 'NetBus' WHERE `category` = 'city';

ALTER TABLE `locations`
  ADD COLUMN `city` VARCHAR(255) NOT NULL DEFAULT 'Zrenjanin' AFTER `cyr_name`;

ALTER TABLE `lines_locations_departures`
  ADD COLUMN `price` DECIMAL(6,2) NULL;

-- ── PLACEHOLDER: Novi Sad ↔ Zrenjanin corridor ─────────────────────────────
-- REPLACE these with real schedule data from the operator when available.

INSERT INTO `locations` (`lat_name`, `cyr_name`, `city`, `lat`, `lng`) VALUES
  ('AS Novi Sad', 'АС Нови Сад', 'Novi Sad', 45.2517, 19.8369),
  ('AS Zrenjanin', 'АС Зрењанин', 'Zrenjanin', 45.3817, 20.3917);

INSERT INTO `lines` (`number`, `lat_name`, `cyr_name`, `hex_color`, `direction`, `category`, `operator`) VALUES
  ('NS', 'Novi Sad – Zrenjanin', 'Нови Сад – Зрењанин', '#1A73E8', 'A', 'intercity', 'Gea Tours'),
  ('NS', 'Zrenjanin – Novi Sad', 'Зрењанин – Нови Сад', '#1A73E8', 'B', 'intercity', 'Gea Tours');

SET @ns_a = (SELECT `id` FROM `lines` WHERE `number` = 'NS' AND `direction` = 'A' AND `category` = 'intercity' ORDER BY `id` DESC LIMIT 1);
SET @ns_b = (SELECT `id` FROM `lines` WHERE `number` = 'NS' AND `direction` = 'B' AND `category` = 'intercity' ORDER BY `id` DESC LIMIT 1);
SET @loc_ns = (SELECT `id` FROM `locations` WHERE `lat_name` = 'AS Novi Sad' AND `city` = 'Novi Sad' ORDER BY `id` DESC LIMIT 1);
SET @loc_zr_ic = (SELECT `id` FROM `locations` WHERE `lat_name` = 'AS Zrenjanin' AND `city` = 'Zrenjanin' ORDER BY `id` DESC LIMIT 1);

INSERT INTO `lines_locations` (`stop_number`, `line_id`, `location_id`) VALUES
  (1, @ns_a, @loc_ns),
  (2, @ns_a, @loc_zr_ic),
  (1, @ns_b, @loc_zr_ic),
  (2, @ns_b, @loc_ns);

-- PLACEHOLDER departure times — replace with real schedule
SET @ll_ns_a_dep = (SELECT `id` FROM `lines_locations` WHERE `line_id` = @ns_a AND `stop_number` = 1);
SET @ll_ns_b_dep = (SELECT `id` FROM `lines_locations` WHERE `line_id` = @ns_b AND `stop_number` = 1);

INSERT INTO `lines_locations_departures` (`departure`, `day_type`, `lines_locations_id`) VALUES
  ('06:00:00', 'workday', @ll_ns_a_dep),
  ('08:30:00', 'workday', @ll_ns_a_dep),
  ('11:00:00', 'workday', @ll_ns_a_dep),
  ('14:00:00', 'workday', @ll_ns_a_dep),
  ('17:00:00', 'workday', @ll_ns_a_dep),
  ('19:30:00', 'workday', @ll_ns_a_dep),
  ('07:00:00', 'workday', @ll_ns_b_dep),
  ('09:30:00', 'workday', @ll_ns_b_dep),
  ('12:00:00', 'workday', @ll_ns_b_dep),
  ('15:00:00', 'workday', @ll_ns_b_dep),
  ('18:00:00', 'workday', @ll_ns_b_dep),
  ('20:30:00', 'workday', @ll_ns_b_dep);
