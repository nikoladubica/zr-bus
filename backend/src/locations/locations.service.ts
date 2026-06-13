import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Locations } from './locations.entity';
import { LOCATIONS_REPOSITORY } from 'src/utils/constants';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
    constructor(
        @Inject(LOCATIONS_REPOSITORY)
        private locationsRepository: Repository<Locations>,
    ) {}

    async findAll(): Promise<Locations[]> {
        return this.locationsRepository.find();
    }

    async create(dto: CreateLocationDto): Promise<Locations> {
        const location = this.locationsRepository.create(dto);
        return this.locationsRepository.save(location);
    }

    async update(id: number, dto: UpdateLocationDto): Promise<Locations> {
        await this.locationsRepository.update(id, dto);
        return this.locationsRepository.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        await this.locationsRepository.delete(id);
    }
}
