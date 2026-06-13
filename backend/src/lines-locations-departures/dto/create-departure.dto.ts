export class CreateDepartureDto {
    lines_locations_id: number;
    departure: string;
    day_type?: 'workday' | 'saturday' | 'sunday';
}
