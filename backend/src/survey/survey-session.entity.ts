import { Lines } from 'src/lines/lines.entity';
import { SurveyStop } from './survey-stop.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('survey_sessions')
export class SurveySession {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Lines)
    @JoinColumn({ name: 'line_id' })
    line: Lines;

    @Column({ type: 'int' })
    user_id: number;

    @Column({ type: 'datetime' })
    started_at: Date;

    @Column({ type: 'datetime', nullable: true })
    ended_at: Date | null;

    @Column({ type: 'geometry', spatialFeatureType: 'LineString', srid: 4326, nullable: true })
    raw_track: string | null;

    @OneToMany(() => SurveyStop, (s) => s.session)
    stops: SurveyStop[];
}
