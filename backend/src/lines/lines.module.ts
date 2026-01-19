import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { linesProviders } from './lines.providers';
import { LinesService } from './lines.service';
import { LinesController } from './lines.controller';

@Module({
    imports: [DatabaseModule],
    providers: [...linesProviders, LinesService],
    controllers: [LinesController],
})
export class LinesModule {}
