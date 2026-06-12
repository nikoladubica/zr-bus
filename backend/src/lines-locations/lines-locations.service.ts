import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinesLocations } from './lines-locations.entity';
import { LINES_LOCATIONS_REPOSITORY } from 'src/utils/constants';

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
}
