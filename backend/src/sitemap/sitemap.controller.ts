import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { SitemapService } from './sitemap.service';

@Controller()
export class SitemapController {
    constructor(private readonly service: SitemapService) {}

    @Get('sitemap.xml')
    async getSitemap(@Res() res: Response) {
        const xml = await this.service.buildXml();
        res.setHeader('Content-Type', 'application/xml');
        res.send(xml);
    }
}
