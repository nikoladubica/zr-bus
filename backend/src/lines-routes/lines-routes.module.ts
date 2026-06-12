import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { linesRoutesProvider } from './lines-routes.providers';
import { LinesRoutesService } from './lines-routes.service';
import { LinesRoutesController } from './lines-routes.controller';

@Module({
    imports: [DatabaseModule],
    providers: [...linesRoutesProvider, LinesRoutesService],
    controllers: [LinesRoutesController],
})
export class LinesRoutesModule {}
