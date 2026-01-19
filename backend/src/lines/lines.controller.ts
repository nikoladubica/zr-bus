import { Controller, Get, Param } from '@nestjs/common';
import { LinesService } from './lines.service';

@Controller('lines')
export class LinesController {
    constructor(private readonly service: LinesService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }
}
