import { DataSource } from 'typeorm';
import { DATA_SOURCE, LINES_REPOSITORY } from 'src/utils/constants';
import { Lines } from 'src/lines/lines.entity';

export const sitemapProviders = [
    {
        provide: LINES_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(Lines),
        inject: [DATA_SOURCE],
    },
];
