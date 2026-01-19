import { LinesLocations } from 'src/lines-locations/lines-locations.entity';
import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('lines_locations_departures')
export class LinesLocationsDepartures {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp' })
    departure: Date;

    @ManyToOne(() => LinesLocations)
    @JoinColumn({ name: 'lines_locations_id' })
    linesLocations: LinesLocations;
}
