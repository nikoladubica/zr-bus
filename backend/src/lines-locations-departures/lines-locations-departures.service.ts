import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinesLocationsDepartures } from './lines-locations-departures.entity';
import { LINES_LOCATIONS_DEPARTURES_REPOSITORY } from 'src/utils/constants';
import { CreateDepartureDto } from './dto/create-departure.dto';
import { UpdateDepartureDto } from './dto/update-departure.dto';
import { BulkCreateDeparturesDto } from './dto/bulk-create-departures.dto';

@Injectable()
export class LinesLocationsDeparturesService {
    constructor(
        @Inject(LINES_LOCATIONS_DEPARTURES_REPOSITORY)
        private linesLocationsDeparturesRepository: Repository<LinesLocationsDepartures>,
    ) {}

    async findAll(): Promise<LinesLocationsDepartures[]> {
        return this.linesLocationsDeparturesRepository.find({
            relations: {
                linesLocations: {
                    lines: true,
                    locations: true,
                },
            },
        });
    }

    async findByLineLocationId(id: number): Promise<LinesLocationsDepartures[]> {
        return this.linesLocationsDeparturesRepository.find({
            relations: {
                linesLocations: {
                    lines: true,
                    locations: true,
                },
            },
            where: {
                linesLocations: {
                    id: id,
                },
            },
        });
    }

    async create(dto: CreateDepartureDto): Promise<LinesLocationsDepartures> {
        const entity = this.linesLocationsDeparturesRepository.create({
            departure: dto.departure,
            day_type: dto.day_type ?? 'workday',
            linesLocations: { id: dto.lines_locations_id } as any,
        });
        return this.linesLocationsDeparturesRepository.save(entity);
    }

    async bulkCreate(dto: BulkCreateDeparturesDto): Promise<LinesLocationsDepartures[]> {
        const entities = dto.departures.map((dep) =>
            this.linesLocationsDeparturesRepository.create({
                departure: dep,
                day_type: dto.day_type ?? 'workday',
                linesLocations: { id: dto.lines_locations_id } as any,
            }),
        );
        return this.linesLocationsDeparturesRepository.save(entities);
    }

    async update(id: number, dto: UpdateDepartureDto): Promise<LinesLocationsDepartures> {
        await this.linesLocationsDeparturesRepository.update(id, dto);
        return this.linesLocationsDeparturesRepository.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        await this.linesLocationsDeparturesRepository.delete(id);
    }

    async removeByLinesLocationId(linesLocationId: number): Promise<void> {
        await this.linesLocationsDeparturesRepository.delete({
            linesLocations: { id: linesLocationId },
        });
    }
}
