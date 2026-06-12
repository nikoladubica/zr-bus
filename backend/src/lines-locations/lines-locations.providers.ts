import { DataSource } from 'typeorm';
import { LinesLocations } from './lines-locations.entity';
import { LINES_LOCATIONS_REPOSITORY, DATA_SOURCE } from 'src/utils/constants';

export const linesLocationsProvider = [
    {
        provide: LINES_LOCATIONS_REPOSITORY,
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(LinesLocations),
        inject: [DATA_SOURCE],
    },
];
