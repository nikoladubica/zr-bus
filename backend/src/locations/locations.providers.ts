import { DataSource } from 'typeorm';
import { Locations } from './locations.entity';
import { LOCATIONS_REPOSITORY, DATA_SOURCE } from 'src/utils/constants';

export const locationsProvider = [
    {
        provide: LOCATIONS_REPOSITORY,
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(Locations),
        inject: [DATA_SOURCE],
    },
];
