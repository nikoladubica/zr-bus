export class BulkCreateDeparturesDto {
    lines_locations_id: number;
    departures: string[];
    day_type?: 'workday' | 'weekend' | 'saturday' | 'sunday' | 'everyday';
}
