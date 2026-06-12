import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Lines } from './lines.entity';
import { LINES_REPOSITORY } from 'src/utils/constants';

@Injectable()
export class LinesService {
    constructor(
        @Inject(LINES_REPOSITORY)
        private linesRepository: Repository<Lines>,
    ) {}

    async findAll(): Promise<Lines[]> {
        return this.linesRepository.find();
    }
}
