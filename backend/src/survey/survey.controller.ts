import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { SurveyService } from './survey.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SubmitSurveyDto } from './dto/submit-survey.dto';

@Controller('survey')
export class SurveyController {
    constructor(private readonly service: SurveyService) {}

    @Get('sessions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    findAll() {
        return this.service.findAllSessions();
    }

    @Post('sessions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    create(@Body() dto: CreateSessionDto, @Request() req) {
        return this.service.createSession(dto.line_id, req.user.id);
    }

    @Get('sessions/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    findOne(@Param('id') id: number) {
        return this.service.findSession(id);
    }

    @Patch('sessions/:id/submit')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    submit(@Param('id') id: number, @Body() dto: SubmitSurveyDto) {
        return this.service.submitSurvey(id, dto);
    }

    @Post('sessions/:id/use-as-route')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    useAsRoute(@Param('id') id: number, @Body() body: { simplify_tolerance?: number }) {
        return this.service.useAsRoute(id, body.simplify_tolerance);
    }

    @Post('sessions/:id/merge-stops')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    mergeStops(@Param('id') id: number) {
        return this.service.mergeStops(id);
    }

    @Delete('sessions/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    delete(@Param('id') id: number) {
        return this.service.deleteSession(id);
    }
}
