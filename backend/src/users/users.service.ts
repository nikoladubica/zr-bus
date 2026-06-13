import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { USERS_REPOSITORY } from 'src/utils/constants';

@Injectable()
export class UsersService {
    constructor(
        @Inject(USERS_REPOSITORY)
        private usersRepository: Repository<User>,
    ) {}

    async findByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { username } });
    }
}
