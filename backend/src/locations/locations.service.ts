import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Locations } from './locations.entity';
import { LOCATIONS_REPOSITORY } from 'src/utils/constants';

@Injectable()
export class LocationsService {
    constructor(
        @Inject(LOCATIONS_REPOSITORY)
        private locationsRepository: Repository<Locations>,
    ) {}

    async findAll(): Promise<Locations[]> {
        return this.locationsRepository.find();
    }
}
