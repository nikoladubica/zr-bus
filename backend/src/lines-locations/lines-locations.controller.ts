import { Controller, Get, Param } from '@nestjs/common';
import { LinesLocationsService } from './lines-locations.service';

@Controller('lines-locations')
export class LinesLocationsController {
    constructor(private readonly service: LinesLocationsService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':lineId')
    findByLineId(@Param('lineId') lineId: number) {
        return this.service.findByLineId(lineId);
    }
}
