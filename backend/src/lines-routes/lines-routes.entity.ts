import { Lines } from 'src/lines/lines.entity';
import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('lines_routes')
export class LinesRoutes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'geometry',
        spatialFeatureType: 'LineString',
        srid: 4326,
        nullable: false,
    })
    route: string;

    @ManyToOne(() => Lines, (lines) => lines.linesRoutes)
    @JoinColumn({ name: 'line_id' })
    lines: Lines;
}
