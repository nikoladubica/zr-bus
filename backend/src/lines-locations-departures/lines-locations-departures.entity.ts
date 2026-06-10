import { LinesLocations } from 'src/lines-locations/lines-locations.entity';
import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

export type DayType = 'workday' | 'saturday' | 'sunday';

@Entity('lines_locations_departures')
export class LinesLocationsDepartures {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'time' })
    departure: string;

    @Column({
        type: 'enum',
        enum: ['workday', 'saturday', 'sunday'],
        default: 'workday',
    })
    day_type: DayType;

    @ManyToOne(() => LinesLocations)
    @JoinColumn({ name: 'lines_locations_id' })
    linesLocations: LinesLocations;
}
