import { Controller, Get, Param } from '@nestjs/common';
import { LinesRoutesService } from './lines-routes.service';

@Controller('lines-routes')
export class LinesRoutesController {
    constructor(private readonly service: LinesRoutesService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':lineId')
    findByLineId(@Param('lineId') lineId: number) {
        return this.service.findByLineId(lineId);
    }
}
