import { http } from '@ricly/axios';
import { CreateTimetable, TimeTable } from '@ricly/interfaces';

export async function getTimetables() {
  const { data } = await http.get<TimeTable[]>(`/timetables/all`);
  return data;
}

export async function generateNewTimetable(newTimetable: CreateTimetable) {
  const { data } = await http.post<number>(`/timetables/new`, newTimetable);
  return data;
}
