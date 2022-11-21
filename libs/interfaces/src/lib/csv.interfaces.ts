export interface Hall {
  hall_id: string;
  hall_code: string;
  hall_capacity: number;
}

export interface Building {
  building_id: string;
  building_code: string;
  Halls: Hall[];
}

export interface Teacher {
  fullname: string;
  email: string;
  phone_number: string;
  teacher_id: string;
  hours_per_week: number;
  teacher_type: 'PART_TIME' | 'PERMAMENT' | 'MISSIONARY';
}
