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

    // async findAll(): Promise<LinesRoutes[]> {
    //     return this.linesRoutesRepository.find({
    //         relations: {
    //             lines: true,
    //         },
    //     });
    // }

    // async findByLineId(searchID: number): Promise<LinesRoutes[]> {
    //     return this.linesRoutesRepository.find({
    //         where: {
    //             lines: {
    //                 id: searchID,
    //             },
    //         },
    //         relations: {
    //             lines: true,
    //         },
    //     });
    // }

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
                    },
                })),
            );
    }
}
