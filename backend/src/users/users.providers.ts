import { DataSource } from 'typeorm';
import { User } from './users.entity';
import { USERS_REPOSITORY, DATA_SOURCE } from 'src/utils/constants';

export const usersProviders = [
    {
        provide: USERS_REPOSITORY,
        useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
        inject: [DATA_SOURCE],
    },
];
