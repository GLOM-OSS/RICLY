import { http } from '@ricly/axios';
import { Teacher } from '@ricly/interfaces';

export async function importTeachers(file: File) {
  const formData = new FormData();
  formData.append('teachers', file);
  const { data } = await http.post(`/teachers/imports`, formData);
  return data;
}

export async function getTeachers() {
  const { data } = await http.get<Teacher[]>('/teachers/all');
  return data;
}

export async function deleteTeachers(teacherIds: string[]) {
  const { data } = await http.delete(`/teachers/delete`, {
    params: { teachers: teacherIds },
  });
  return data;
}
