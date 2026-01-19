import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { linesLocationsDeparturesProvider } from './lines-locations-departures.providers';
import { LinesLocationsDeparturesService } from './lines-locations-departures.service';
import { LinesLocationsDeparturesController } from './lines-locations-departures.controller';

@Module({
    imports: [DatabaseModule],
    providers: [
        ...linesLocationsDeparturesProvider,
        LinesLocationsDeparturesService,
    ],
    controllers: [LinesLocationsDeparturesController],
})
export class LinesLocationsDeparturesModule {}
