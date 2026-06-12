import { LinesLocations } from 'src/lines-locations/lines-locations.entity';
import { LinesRoutes } from 'src/lines-routes/lines-routes.entity';
import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('lines')
export class Lines {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 11 })
    number: string;

    @Column({ length: 255 })
    lat_name: string;

    @Column({ length: 255 })
    cyr_name: string;

    @Column({ length: 11 })
    hex_color: string;

    @Column({ length: 11, nullable: true })
    direction: string | null;

    @OneToMany(() => LinesLocations, (ll) => ll.lines)
    linesLocations: LinesLocations[];

    @OneToMany(() => LinesRoutes, (ll) => ll.lines)
    linesRoutes: LinesRoutes[];
}
