import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { SitemapController } from './sitemap.controller';
import { SitemapService } from './sitemap.service';
import { sitemapProviders } from './sitemap.providers';

@Module({
    imports: [DatabaseModule],
    controllers: [SitemapController],
    providers: [SitemapService, ...sitemapProviders],
})
export class SitemapModule {}
