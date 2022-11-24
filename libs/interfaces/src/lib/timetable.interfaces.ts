export interface Availability {
  availability_id: string;
  availability_date: Date;
  start_time: Date;
  end_time: Date;
  is_used: boolean;
}

export interface CreateAvailability {
  start_time: Date;
  end_time: Date;
  availabilities: Date[];
}

export interface TimeTable {
  start_date: Date;
  end_date: Date;
  created_at: Date;
  is_published: Date;
}

export interface Break {
  break_id: string;
  start_time: Date;
  end_time: Date;
}

export interface Weekday {
  weekday_id: string;
  weekday: number;
  start_time: Date;
  end_time: Date;
}

export interface CreateTimetable {
  classroom_id: string;
  start_at: Date;
  end_at: Date;
  break: Omit<Break, 'break_id'>;
  course_duration_in_minutes: number;
}

export interface Program {
  program_id: string;
  start_date: Date;
  end_date: Date;
  hall_name: string; //important. Please add it on the ui
  subject_name: string;
  fullname: string;
}

export interface ProgramTimeTable extends Break {
  programs: Program[];
}
