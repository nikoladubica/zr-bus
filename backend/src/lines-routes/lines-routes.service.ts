import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LinesRoutes } from './lines-routes.entity';
import { LINES_ROUTES_REPOSITORY } from 'src/utils/constants';

@Injectable()
export class LinesRoutesService {
    constructor(
        @Inject(LINES_ROUTES_REPOSITORY)
        private linesRoutesRepository: Repository<LinesRoutes>,
    ) {}

    async findAll() {
        return this.linesRoutesRepository
            .createQueryBuilder('ll')
            .innerJoin('ll.lines', 'lines')
            .select([
                'll.id AS id',
                'ST_AsGeoJSON(ll.route) AS route',
                'lines.id AS line_id',
                'lines.number AS number',
                'lines.lat_name AS lat_name',
                'lines.cyr_name AS cyr_name',
                'lines.hex_color AS hex_color',
                'lines.direction AS direction',
                'lines.category AS category',
                'lines.operator AS operator',
            ])
            .getRawMany()
            .then((rows) =>
                rows.map((r) => ({
                    id: r.id,
                    route: JSON.parse(r.route),
                    line: {
                        id: r.line_id,
                        number: r.number,
                        lat_name: r.lat_name,
                        cyr_name: r.cyr_name,
                        hex_color: r.hex_color,
                        direction: r.direction,
                        category: r.category,
                        operator: r.operator,
                    },
                })),
            );
    }

    async findByLineId(lineId: number) {
        return this.linesRoutesRepository
            .createQueryBuilder('ll')
            .innerJoin('ll.lines', 'lines')
            .where('lines.id = :id', { id: lineId })
            .select([
                'll.id AS id',
                'ST_AsGeoJSON(ll.route) AS route',
                'lines.id AS line_id',
                'lines.number AS number',
                'lines.lat_name AS lat_name',
                'lines.cyr_name AS cyr_name',
                'lines.hex_color AS hex_color',
                'lines.direction AS direction',
                'lines.category AS category',
                'lines.operator AS operator',
            ])
            .getRawMany()
            .then((rows) =>
                rows.map((r) => ({
                    id: r.id,
                    route: JSON.parse(r.route),
                    line: {
                        id: r.line_id,
                        number: r.number,
                        lat_name: r.lat_name,
                        cyr_name: r.cyr_name,
                        hex_color: r.hex_color,
                        direction: r.direction,
                        category: r.category,
                        operator: r.operator,
                    },
                })),
            );
    }
}
