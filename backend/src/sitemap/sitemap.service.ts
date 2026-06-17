import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Lines } from 'src/lines/lines.entity';
import { LINES_REPOSITORY } from 'src/utils/constants';

@Injectable()
export class SitemapService {
    constructor(
        @Inject(LINES_REPOSITORY)
        private linesRepository: Repository<Lines>,
    ) {}

    async buildXml(): Promise<string> {
        const siteUrl = process.env.SITE_URL ?? 'https://zrbus.ddns.net';
        const today = new Date().toISOString().slice(0, 10);

        const lines = await this.linesRepository.find();

        const staticUrls = [
            `${siteUrl}/`,
            `${siteUrl}/o-nama`,
            `${siteUrl}/red-voznje`,
        ];

        const lineUrls = lines.map((line) => `${siteUrl}/red-voznje/${line.id}`);

        const allUrls = [...staticUrls, ...lineUrls];

        const urlEntries = allUrls
            .map(
                (url) =>
                    `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
            )
            .join('\n');

        return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>`;
    }
}
