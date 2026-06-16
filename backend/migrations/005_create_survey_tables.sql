CREATE TABLE IF NOT EXISTS survey_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    line_id INT NOT NULL,
    user_id INT NOT NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME NULL,
    raw_track GEOMETRY NULL,
    CONSTRAINT fk_survey_sessions_line FOREIGN KEY (line_id) REFERENCES `lines`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS survey_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    marked_at DATETIME NOT NULL,
    coords GEOMETRY NOT NULL,
    candidate_name_lat VARCHAR(255) NOT NULL,
    candidate_name_cyr VARCHAR(255) NOT NULL,
    existing_location_id INT NULL,
    CONSTRAINT fk_survey_stops_session FOREIGN KEY (session_id) REFERENCES survey_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
