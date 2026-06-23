import { LinesLocations } from 'src/lines-locations/lines-locations.entity';
import {
    Entity,
    Column,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

export type DayType = 'workday' | 'weekend' | 'saturday' | 'sunday' | 'everyday';

@Entity('lines_locations_departures')
export class LinesLocationsDepartures {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'time' })
    departure: string;

    @Column({
        type: 'enum',
        enum: ['workday', 'weekend', 'saturday', 'sunday', 'everyday'],
        default: 'workday',
    })
    day_type: DayType;

    @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
    price: number | null;

    @ManyToOne(() => LinesLocations)
    @JoinColumn({ name: 'lines_locations_id' })
    linesLocations: LinesLocations;
}
