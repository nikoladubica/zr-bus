import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { LinesLocationsService } from './lines-locations.service';
import { CreateLinesLocationDto } from './dto/create-lines-location.dto';
import { ReorderLinesLocationDto } from './dto/reorder-lines-location.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

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

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    create(@Body() dto: CreateLinesLocationDto) {
        return this.service.create(dto);
    }

    @Patch('reorder')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    reorder(@Body() dto: ReorderLinesLocationDto) {
        return this.service.reorder(dto.items);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    remove(@Param('id') id: number) {
        return this.service.remove(id);
    }
}
