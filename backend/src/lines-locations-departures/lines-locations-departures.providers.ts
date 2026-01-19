import { DataSource } from 'typeorm';
import { LinesLocationsDepartures } from './lines-locations-departures.entity';
import {
    LINES_LOCATIONS_DEPARTURES_REPOSITORY,
    DATA_SOURCE,
} from 'src/utils/constants';

export const linesLocationsDeparturesProvider = [
    {
        provide: LINES_LOCATIONS_DEPARTURES_REPOSITORY,
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(LinesLocationsDepartures),
        inject: [DATA_SOURCE],
    },
];
