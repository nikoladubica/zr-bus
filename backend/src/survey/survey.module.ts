import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { surveyProviders } from './survey.providers';
import { SurveyService } from './survey.service';
import { SurveyController } from './survey.controller';

@Module({
    imports: [DatabaseModule],
    providers: [...surveyProviders, SurveyService],
    controllers: [SurveyController],
})
export class SurveyModule {}
