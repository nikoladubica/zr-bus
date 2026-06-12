import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

// Table Modules
import { LinesModule } from './lines/lines.module';
import { LocationsModule } from './locations/locations.module';
import { LinesLocationsModule } from './lines-locations/lines-locations.module';
import { LinesLocationsDeparturesModule } from './lines-locations-departures/lines-locations-departures.module';
import { LinesRoutesModule } from './lines-routes/lines-routes.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        LinesModule,
        LocationsModule,
        LinesLocationsModule,
        LinesLocationsDeparturesModule,
        LinesRoutesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
