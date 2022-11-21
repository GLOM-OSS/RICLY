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

export interface Classroom {
  classroom_id: string;
  classroom_name: string;
  classroom_code: string;
  coordinator_email: string;
}

export interface Subject {
  classrooms: {
    classroom_id: string;
    classroom_name: string;
    classroom_code: string;
  }[];
  teacher_email: string;
  subject_name: string;
  subject_id: string;
  subject_code: string;
}
export interface Student {
  email: string;
  fullname: string;
  student_id: string;
  classroom_code: string;
}
