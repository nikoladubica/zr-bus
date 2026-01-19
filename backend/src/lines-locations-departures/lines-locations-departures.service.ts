import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinesLocationsDepartures } from './lines-locations-departures.entity';
import { LINES_LOCATIONS_DEPARTURES_REPOSITORY } from 'src/utils/constants';

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
                    // lines: true,
                    // locations: true,
                }
            }
        });
    }
}
