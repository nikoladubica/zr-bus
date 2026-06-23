import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { LinesService } from './lines.service';
import { CreateLineDto } from './dto/create-line.dto';
import { UpdateLineDto } from './dto/update-line.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('lines')
export class LinesController {
    constructor(private readonly service: LinesService) {}

    @Get()
    findAll(@Query('category') category?: string) {
        return this.service.findAll(category);
    }

    @Get('intercity')
    findIntercity(@Query('from') from: string, @Query('to') to: string) {
        return this.service.findIntercity(from ?? '', to ?? '');
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    create(@Body() dto: CreateLineDto) {
        return this.service.create(dto);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    update(@Param('id') id: number, @Body() dto: UpdateLineDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    remove(@Param('id') id: number) {
        return this.service.remove(id);
    }
}
