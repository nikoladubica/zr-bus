import { DataSource } from 'typeorm';
import { Lines } from './lines.entity';
import { LINES_REPOSITORY, DATA_SOURCE } from 'src/utils/constants';

export const linesProviders = [
    {
        provide: LINES_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Lines),
        inject: [DATA_SOURCE],
    },
];
