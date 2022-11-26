import { http } from '@ricly/axios';
import { Break, Classroom, Weekday } from '@ricly/interfaces';

export async function importClassrooms(file: File) {
  const formData = new FormData();
  formData.append('classrooms', file);
  const { data } = await http.post(`/classrooms/imports`, formData);
  return data;
}

export async function getClassrooms() {
  const { data } = await http.get<Classroom[]>('/classrooms/all');
  return data;
}

export async function deleteClassrooms(classroomIds: string[]) {
  const { data } = await http.delete(`/classrooms/delete`, {
    params: { classrooms: classroomIds },
  });
  return data;
}

export async function getClassroomWeekdays(classroom_id: string) {
  const { data } = await http.get<Weekday[]>(
    `/classrooms/${classroom_id}/weekdays`
  );
  return data;
}

export async function getClassroomBreak(classroom_id: string) {
  const { data } = await http.get<Break>(`/classrooms/${classroom_id}/break`);
  return data;
}
