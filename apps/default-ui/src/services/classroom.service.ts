import { http } from '@ricly/axios';
import { Classroom } from '@ricly/interfaces';

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
