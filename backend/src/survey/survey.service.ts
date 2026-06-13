import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { DATA_SOURCE, SURVEY_SESSION_REPOSITORY, SURVEY_STOP_REPOSITORY } from 'src/utils/constants';
import { SurveySession } from './survey-session.entity';
import { SurveyStop } from './survey-stop.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitSurveyDto } from './dto/submit-survey.dto';

@Injectable()
export class SurveyService {
    constructor(
        @Inject(SURVEY_SESSION_REPOSITORY)
        private sessionRepository: Repository<SurveySession>,
        @Inject(SURVEY_STOP_REPOSITORY)
        private stopRepository: Repository<SurveyStop>,
        @Inject(DATA_SOURCE)
        private dataSource: DataSource,
    ) {}

    async createSession(lineId: number, userId: number): Promise<SurveySession> {
        const session = this.sessionRepository.create({
            line: { id: lineId } as any,
            user_id: userId,
            started_at: new Date(),
            ended_at: null,
            raw_track: null,
        });
        return this.sessionRepository.save(session);
    }

    async submitSurvey(sessionId: number, dto: SubmitSurveyDto): Promise<void> {
        if (dto.points.length >= 2) {
            const trackGeoJson = JSON.stringify({
                type: 'LineString',
                coordinates: dto.points.map(([lat, lng]) => [lng, lat]),
            });
            await this.dataSource.query(
                'UPDATE survey_sessions SET raw_track = ST_GeomFromGeoJSON(?), ended_at = NOW() WHERE id = ?',
                [trackGeoJson, sessionId],
            );
        } else {
            await this.dataSource.query(
                'UPDATE survey_sessions SET ended_at = NOW() WHERE id = ?',
                [sessionId],
            );
        }

        for (const stop of dto.stops) {
            const pointGeoJson = JSON.stringify({
                type: 'Point',
                coordinates: [stop.lng, stop.lat],
            });
            await this.dataSource.query(
                `INSERT INTO survey_stops (session_id, marked_at, coords, candidate_name_lat, candidate_name_cyr, existing_location_id)
                 VALUES (?, NOW(), ST_GeomFromGeoJSON(?), ?, ?, ?)`,
                [sessionId, pointGeoJson, stop.candidate_name_lat, stop.candidate_name_cyr, stop.existing_location_id ?? null],
            );
        }
    }

    async findSession(sessionId: number): Promise<object> {
        const rows = await this.dataSource.query(
            `SELECT
                s.id, s.user_id, s.started_at, s.ended_at,
                s.line_id,
                ST_AsGeoJSON(s.raw_track) AS raw_track,
                l.number AS line_number,
                l.lat_name AS line_lat_name,
                l.hex_color AS line_hex_color
            FROM survey_sessions s
            LEFT JOIN lines l ON l.id = s.line_id
            WHERE s.id = ?`,
            [sessionId],
        );

        if (!rows.length) return null;
        const session = rows[0];

        const stops = await this.dataSource.query(
            `SELECT id, marked_at, candidate_name_lat, candidate_name_cyr, existing_location_id,
                    ST_X(coords) AS lng, ST_Y(coords) AS lat
             FROM survey_stops
             WHERE session_id = ?
             ORDER BY marked_at ASC`,
            [sessionId],
        );

        return {
            ...session,
            raw_track: session.raw_track ? JSON.parse(session.raw_track) : null,
            stops,
        };
    }

    async findAllSessions(): Promise<object[]> {
        return this.dataSource.query(
            `SELECT s.id, s.user_id, s.started_at, s.ended_at,
                    l.number AS line_number, l.lat_name AS line_lat_name, l.id AS line_id
             FROM survey_sessions s
             LEFT JOIN lines l ON l.id = s.line_id
             ORDER BY s.started_at DESC`,
        );
    }

    async useAsRoute(sessionId: number, simplifyTolerance?: number): Promise<void> {
        const rows = await this.dataSource.query(
            'SELECT line_id, raw_track IS NOT NULL AS has_track FROM survey_sessions WHERE id = ?',
            [sessionId],
        );
        if (!rows.length || !rows[0].has_track) throw new Error('Session not found or track not captured');
        const lineId = rows[0].line_id;

        const geomExpr = simplifyTolerance
            ? `ST_Simplify(raw_track, ${simplifyTolerance})`
            : 'raw_track';

        const existing = await this.dataSource.query(
            'SELECT id FROM lines_routes WHERE line_id = ?',
            [lineId],
        );
        if (existing.length) {
            await this.dataSource.query(
                `UPDATE lines_routes SET route = (SELECT ${geomExpr} FROM survey_sessions WHERE id = ?) WHERE line_id = ?`,
                [sessionId, lineId],
            );
        } else {
            await this.dataSource.query(
                `INSERT INTO lines_routes (route, line_id) SELECT ${geomExpr}, line_id FROM survey_sessions WHERE id = ?`,
                [sessionId],
            );
        }
    }

    async mergeStops(sessionId: number): Promise<void> {
        const stops = await this.dataSource.query(
            `SELECT id, candidate_name_lat, candidate_name_cyr, existing_location_id,
                    ST_X(coords) AS lng, ST_Y(coords) AS lat
             FROM survey_stops WHERE session_id = ?`,
            [sessionId],
        );

        for (const stop of stops) {
            if (stop.existing_location_id) {
                await this.dataSource.query(
                    'UPDATE locations SET lat = ?, lng = ? WHERE id = ?',
                    [stop.lat, stop.lng, stop.existing_location_id],
                );
            } else {
                await this.dataSource.query(
                    'INSERT INTO locations (lat_name, cyr_name, lat, lng) VALUES (?, ?, ?, ?)',
                    [stop.candidate_name_lat, stop.candidate_name_cyr, stop.lat, stop.lng],
                );
            }
        }
    }

    async deleteSession(sessionId: number): Promise<void> {
        await this.sessionRepository.delete(sessionId);
    }
}
