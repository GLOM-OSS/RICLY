export interface Hall {
    hall_id: string;
    hall_code: string;
    hall_capacity: number;
}

export interface Building {
    building_id: string;
    building_code: string;
    Halls: Hall[]
}