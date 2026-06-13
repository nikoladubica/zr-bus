export class BulkCreateDeparturesDto {
    lines_locations_id: number;
    departures: string[];
    day_type?: 'workday' | 'saturday' | 'sunday';
}
