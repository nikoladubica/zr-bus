import { Lines } from 'src/lines/lines.entity';
import { Locations } from 'src/locations/locations.entity';
import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('lines_locations')
export class LinesLocations {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    stop_number: number;

    @ManyToOne(() => Lines, (lines) => lines.linesLocations)
    @JoinColumn({ name: 'line_id' })
    lines: Lines;

    @ManyToOne(() => Locations)
    @JoinColumn({ name: 'location_id' })
    locations: Locations;
}
