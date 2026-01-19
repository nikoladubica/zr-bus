import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { linesLocationsProvider } from './lines-locations.providers';
import { LinesLocationsService } from './lines-locations.service';
import { LinesLocationsController } from './lines-locations.controller';

@Module({
    imports: [DatabaseModule],
    providers: [...linesLocationsProvider, LinesLocationsService],
    controllers: [LinesLocationsController],
})
export class LinesLocationsModule {}
