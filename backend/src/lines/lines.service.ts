import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Lines } from './lines.entity';
import { LINES_REPOSITORY } from 'src/utils/constants';
import { CreateLineDto } from './dto/create-line.dto';
import { UpdateLineDto } from './dto/update-line.dto';

@Injectable()
export class LinesService {
    constructor(
        @Inject(LINES_REPOSITORY)
        private linesRepository: Repository<Lines>,
    ) {}

    async findAll(): Promise<Lines[]> {
        return this.linesRepository.find();
    }

    async create(dto: CreateLineDto): Promise<Lines> {
        const line = this.linesRepository.create(dto);
        return this.linesRepository.save(line);
    }

    async update(id: number, dto: UpdateLineDto): Promise<Lines> {
        await this.linesRepository.update(id, dto);
        return this.linesRepository.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        await this.linesRepository.delete(id);
    }
}
