import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinesLocations } from './lines-locations.entity';
import { LINES_LOCATIONS_REPOSITORY } from 'src/utils/constants';
import { CreateLinesLocationDto } from './dto/create-lines-location.dto';

@Injectable()
export class LinesLocationsService {
    constructor(
        @Inject(LINES_LOCATIONS_REPOSITORY)
        private linesLocationsRepository: Repository<LinesLocations>,
    ) {}

    async findAll(): Promise<LinesLocations[]> {
        return this.linesLocationsRepository.find({
            relations: {
                lines: true,
                locations: true,
            },
        });
    }

    async findByLineId(searchID: number): Promise<LinesLocations[]> {
        return this.linesLocationsRepository.find({
            relations: {
                lines: true,
                locations: true,
            },
            where: {
                lines: {
                    id: searchID,
                },
            },
        });
    }

    async create(dto: CreateLinesLocationDto): Promise<LinesLocations> {
        const entity = this.linesLocationsRepository.create({
            stop_number: dto.stop_number,
            lines: { id: dto.line_id } as any,
            locations: { id: dto.location_id } as any,
        });
        return this.linesLocationsRepository.save(entity);
    }

    async reorder(items: { id: number; stop_number: number }[]): Promise<void> {
        await Promise.all(
            items.map(({ id, stop_number }) =>
                this.linesLocationsRepository.update(id, { stop_number }),
            ),
        );
    }

    async remove(id: number): Promise<void> {
        await this.linesLocationsRepository.delete(id);
    }
}
