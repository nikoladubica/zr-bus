export class SubmitStopDto {
    lat: number;
    lng: number;
    candidate_name_lat: string;
    candidate_name_cyr: string;
    existing_location_id?: number;
}

export class SubmitSurveyDto {
    points: [number, number][]; // [lat, lng] pairs
    stops: SubmitStopDto[];
}
