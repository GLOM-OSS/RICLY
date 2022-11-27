import { http } from '@ricly/axios';
import {
  CreateTimetable,
  ProgramTimeTable,
  TimeTable,
} from '@ricly/interfaces';

export async function getTimetables() {
  const { data } = await http.get<TimeTable[]>(`/timetables/all`);
  return data;
}

export async function generateNewTimetable(newTimetable: CreateTimetable) {
  const {
    data: { timestamp },
  } = await http.post<{ timestamp: number }>(`/timetables/new`, newTimetable);
  return timestamp;
}

export async function getTimetablePrograms(
  timestamp: number,
  classroom_id?: string
) {
  const { data } = await http.get<ProgramTimeTable>(
    `/timetables/${timestamp}`,
    {
      params: { classroom_id, timestamp },
    }
  );
  return data;
}
