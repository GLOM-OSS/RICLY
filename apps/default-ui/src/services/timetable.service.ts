import { http } from '@ricly/axios';
import { TimeTable } from '@ricly/interfaces';

export async function getTimetables() {
  const { data } = await http.get<TimeTable[]>(`/timetables/all`, {});
  return data;
}


