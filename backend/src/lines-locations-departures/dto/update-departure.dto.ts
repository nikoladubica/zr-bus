export class UpdateDepartureDto {
    departure?: string;
    day_type?: 'workday' | 'weekend' | 'saturday' | 'sunday' | 'everyday';
}
