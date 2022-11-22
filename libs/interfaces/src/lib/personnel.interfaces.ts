export interface Availability {
  availability_id: string;
  availability_date: Date;
  start_time: Date;
  ends_time: Date;
  is_used: boolean;
}

export interface CreateAvailability {
  start_time: Date;
  ends_time: Date;
  availabilities: Date[];
}

export interface TimeTable {
  start_date: Date;
  end_date: Date;
  created_at: Date;
  is_published: Date;
}
