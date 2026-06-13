import { DataSource } from 'typeorm';
import { DATA_SOURCE, SURVEY_SESSION_REPOSITORY, SURVEY_STOP_REPOSITORY } from 'src/utils/constants';
import { SurveySession } from './survey-session.entity';
import { SurveyStop } from './survey-stop.entity';

export const surveyProviders = [
    {
        provide: SURVEY_SESSION_REPOSITORY,
        useFactory: (ds: DataSource) => ds.getRepository(SurveySession),
        inject: [DATA_SOURCE],
    },
    {
        provide: SURVEY_STOP_REPOSITORY,
        useFactory: (ds: DataSource) => ds.getRepository(SurveyStop),
        inject: [DATA_SOURCE],
    },
];
