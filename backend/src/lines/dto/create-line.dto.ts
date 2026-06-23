export class CreateLineDto {
    number: string;
    lat_name: string;
    cyr_name: string;
    hex_color: string;
    direction?: string;
    category?: 'city' | 'intercity';
    operator?: string;
}
