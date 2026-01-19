import { LinesLocations } from 'src/lines-locations/lines-locations.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('locations')
export class Locations {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    lat_name: string;

    @Column({ length: 255 })
    cyr_name: string;

    @Column({ type: 'double', nullable: true })
    lat: number | null;

    @Column({ type: 'double', nullable: true })
    lng: number | null;

    @OneToMany(() => LinesLocations, (ll) => ll.locations)
    linesLocations: LinesLocations[];
}
