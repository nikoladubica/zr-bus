-- ZR Bus — initial schema
-- Run this on a fresh MariaDB database before starting the app.
-- Requires MariaDB 10.5+ (SRID support on geometry columns, ST_AsGeoJSON).

CREATE DATABASE IF NOT EXISTS `zr_bus`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `zr_bus`;

-- ─── lines ────────────────────────────────────────────────────────────────────
CREATE TABLE `lines` (
    `id`        INT          NOT NULL AUTO_INCREMENT,
    `number`    VARCHAR(11)  NOT NULL,
    `lat_name`  VARCHAR(255) NOT NULL,
    `cyr_name`  VARCHAR(255) NOT NULL,
    `hex_color` VARCHAR(11)  NOT NULL,
    `direction` VARCHAR(11)  DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── locations ────────────────────────────────────────────────────────────────
CREATE TABLE `locations` (
    `id`       INT          NOT NULL AUTO_INCREMENT,
    `lat_name` VARCHAR(255) NOT NULL,
    `cyr_name` VARCHAR(255) NOT NULL,
    `lat`      DOUBLE       DEFAULT NULL,
    `lng`      DOUBLE       DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── lines_locations ──────────────────────────────────────────────────────────
CREATE TABLE `lines_locations` (
    `id`          INT NOT NULL AUTO_INCREMENT,
    `stop_number` INT NOT NULL,
    `line_id`     INT DEFAULT NULL,
    `location_id` INT DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_ll_line`     (`line_id`),
    KEY `FK_ll_location` (`location_id`),
    CONSTRAINT `FK_ll_line`
        FOREIGN KEY (`line_id`)     REFERENCES `lines`     (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_ll_location`
        FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── lines_routes ─────────────────────────────────────────────────────────────
-- route is a LINESTRING stored with SRID 4326 (WGS-84).
-- Queries use ST_AsGeoJSON; a spatial index is added for future proximity queries.
CREATE TABLE `lines_routes` (
    `id`      INT        NOT NULL AUTO_INCREMENT,
    `route`   LINESTRING NOT NULL,
    `line_id` INT        DEFAULT NULL,
    PRIMARY KEY (`id`),
    SPATIAL KEY `IDX_lr_route` (`route`),
    KEY `FK_lr_line` (`line_id`),
    CONSTRAINT `FK_lr_line`
        FOREIGN KEY (`line_id`) REFERENCES `lines` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── lines_locations_departures ───────────────────────────────────────────────
CREATE TABLE `lines_locations_departures` (
    `id`                  INT                                       NOT NULL AUTO_INCREMENT,
    `departure`           TIME                                      NOT NULL,
    `day_type`            ENUM('workday', 'saturday', 'sunday')     NOT NULL DEFAULT 'workday',
    `lines_locations_id`  INT                                       DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_dep_ll` (`lines_locations_id`),
    CONSTRAINT `FK_dep_ll`
        FOREIGN KEY (`lines_locations_id`) REFERENCES `lines_locations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
