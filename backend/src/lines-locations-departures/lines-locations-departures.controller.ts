import { Controller, Get, Param } from '@nestjs/common';
import { LinesLocationsDeparturesService } from './lines-locations-departures.service';

@Controller('lines-locations-departures')
export class LinesLocationsDeparturesController {
    constructor(private readonly service: LinesLocationsDeparturesService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }
}
