import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { locationsProvider } from './locations.providers';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';

@Module({
    imports: [DatabaseModule],
    providers: [...locationsProvider, LocationsService],
    controllers: [LocationsController],
})
export class LocationsModule {}
