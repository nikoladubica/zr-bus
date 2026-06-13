import { SurveySession } from './survey-session.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('survey_stops')
export class SurveyStop {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => SurveySession, (s) => s.stops)
    @JoinColumn({ name: 'session_id' })
    session: SurveySession;

    @Column({ type: 'datetime' })
    marked_at: Date;

    @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
    coords: string;

    @Column({ length: 255 })
    candidate_name_lat: string;

    @Column({ length: 255 })
    candidate_name_cyr: string;

    @Column({ type: 'int', nullable: true })
    existing_location_id: number | null;
}
