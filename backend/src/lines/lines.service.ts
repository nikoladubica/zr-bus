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

    async findAll(category?: string): Promise<Lines[]> {
        if (category === 'city' || category === 'intercity') {
            return this.linesRepository.find({ where: { category } });
        }
        return this.linesRepository.find();
    }

    async findIntercity(from: string, to: string): Promise<Lines[]> {
        const toTitle = (slug: string) =>
            slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const fromCity = toTitle(from);
        const toCity = toTitle(to);

        const lines = await this.linesRepository.find({
            where: { category: 'intercity' },
            relations: { linesLocations: { locations: true } },
            order: { direction: 'ASC' },
        });

        return lines.filter((line) => {
            const cities = new Set(
                line.linesLocations.map((ll) => ll.locations?.city).filter(Boolean),
            );
            return cities.has(fromCity) && cities.has(toCity);
        });
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
