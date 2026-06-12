import { Controller, Get, Param } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
    constructor(private readonly service: LocationsService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }
}
