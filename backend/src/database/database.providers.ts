import { DataSource } from 'typeorm';
import { DATA_SOURCE } from 'src/utils/constants';

export const databaseProviders = [
    {
        provide: DATA_SOURCE,
        useFactory: async () => {
            const dataSource = new DataSource({
                type: 'mariadb',
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT),
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: false,
            });

            return dataSource.initialize();
        },
    },
];
