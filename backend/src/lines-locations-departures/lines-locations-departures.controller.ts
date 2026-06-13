import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { LinesLocationsDeparturesService } from './lines-locations-departures.service';
import { CreateDepartureDto } from './dto/create-departure.dto';
import { UpdateDepartureDto } from './dto/update-departure.dto';
import { BulkCreateDeparturesDto } from './dto/bulk-create-departures.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('lines-locations-departures')
export class LinesLocationsDeparturesController {
    constructor(private readonly service: LinesLocationsDeparturesService) {}

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Post('bulk')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    bulkCreate(@Body() dto: BulkCreateDeparturesDto) {
        return this.service.bulkCreate(dto);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    create(@Body() dto: CreateDepartureDto) {
        return this.service.create(dto);
    }

    @Delete('by-lines-location/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    removeByLinesLocationId(@Param('id') id: number) {
        return this.service.removeByLinesLocationId(id);
    }

    @Get(':lineLocationId')
    findByLineLocationId(@Param('lineLocationId') lineLocationId: number) {
        return this.service.findByLineLocationId(lineLocationId);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    update(@Param('id') id: number, @Body() dto: UpdateDepartureDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    remove(@Param('id') id: number) {
        return this.service.remove(id);
    }
}
