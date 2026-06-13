import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../users/users.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dataSource = new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '3306'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User],
    synchronize: false,
});

async function seedAdmin() {
    await dataSource.initialize();

    const username = process.env.SEED_USERNAME ?? 'admin';
    const password = process.env.SEED_PASSWORD;

    if (!password) {
        console.error('Set SEED_PASSWORD env var before running this script.');
        process.exit(1);
    }

    const repo = dataSource.getRepository(User);
    const existing = await repo.findOne({ where: { username } });
    if (existing) {
        console.log(`User "${username}" already exists — skipping.`);
        await dataSource.destroy();
        return;
    }

    const password_hash = await bcrypt.hash(password, 12);
    await repo.save(repo.create({ username, password_hash, role: 'admin' }));
    console.log(`Admin user "${username}" created.`);
    await dataSource.destroy();
}

seedAdmin().catch((err) => { console.error(err); process.exit(1); });
