import { DataSource } from 'typeorm';
import { LinesRoutes } from './lines-routes.entity';
import { DATA_SOURCE, LINES_ROUTES_REPOSITORY } from 'src/utils/constants';

export const linesRoutesProvider = [
    {
        provide: LINES_ROUTES_REPOSITORY,
        useFactory: (dataSource: DataSource) =>
            dataSource.getRepository(LinesRoutes),
        inject: [DATA_SOURCE],
    },
];
